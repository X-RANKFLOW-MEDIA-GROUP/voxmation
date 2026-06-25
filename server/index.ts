import express from "express";
import cors from "cors";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import {
  sendEmail,
  getCandidateConfirmationEmail,
  getAdminNotificationEmail,
} from "./email";
import crmRoutes from "./routes/crm";
import authRoutes from "./routes/auth";
import { whitelabelMiddleware } from "./middleware/whitelabel";
import brandingRoutes from "./routes/branding";
import billingRoutes from "./routes/billing";
import campaignRoutes from "./routes/campaigns";
import automationRoutes from "./routes/automations";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// White Label Middleware - Detect account by subdomain or custom domain
app.use(whitelabelMiddleware);

// Multer configuration for file uploads
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

// In-memory storage for applications
interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  fullName: string;
  email: string;
  phone: string;
  resumeUrl?: string;
  resumeFileName?: string;
  answers: {
    yearsExperience: string;
    greatestAchievement: string;
    whyInterested: string;
    additionalInfo: string;
  };
  status: "new" | "reviewed" | "shortlisted" | "rejected" | "hired";
  appliedAt: string;
  notes?: string;
}

const applications: Map<string, JobApplication> = new Map();

app.post("/api/tts", async (req, res) => {
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  if (!ELEVENLABS_API_KEY) {
    return res.status(500).json({ error: "ELEVENLABS_API_KEY not configured" });
  }

  const { text, voiceId } = req.body;
  if (!text || !voiceId) {
    return res.status(400).json({ error: "Missing text or voiceId" });
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ElevenLabs API error [${response.status}]: ${errorText}`);
      return res.status(response.status).json({ error: `ElevenLabs error: ${response.status}` });
    }

    const audioBuffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error("TTS error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: msg });
  }
});

// Job Applications Endpoints
app.post("/api/jobs/apply", upload.single("resume"), async (req, res) => {
  try {
    const {
      jobId,
      jobTitle,
      fullName,
      email,
      phone,
      yearsExperience,
      greatestAchievement,
      whyInterested,
      additionalInfo,
    } = req.body;

    if (!jobId || !fullName || !email || !phone) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const applicationId = uuidv4();
    const resumeUrl = req.file ? `/api/resumes/${req.file.filename}` : undefined;

    const application: JobApplication = {
      id: applicationId,
      jobId,
      jobTitle,
      fullName,
      email,
      phone,
      resumeUrl,
      resumeFileName: req.file?.originalname,
      answers: {
        yearsExperience,
        greatestAchievement,
        whyInterested,
        additionalInfo,
      },
      status: "new",
      appliedAt: new Date().toISOString(),
    };

    applications.set(applicationId, application);

    // Send confirmation email to candidate
    const candidateEmailTemplate = getCandidateConfirmationEmail(
      fullName,
      jobTitle,
      applicationId
    );
    const candidateEmailSent = await sendEmail({
      to: email,
      subject: candidateEmailTemplate.subject,
      html: candidateEmailTemplate.html,
      text: candidateEmailTemplate.text,
    });

    // Send admin notification
    const adminEmail = process.env.ADMIN_EMAIL || "careers@voxmation.com";
    const adminEmailTemplate = getAdminNotificationEmail(
      fullName,
      email,
      phone,
      jobTitle,
      yearsExperience,
      applicationId
    );
    const adminEmailSent = await sendEmail({
      to: adminEmail,
      subject: adminEmailTemplate.subject,
      html: adminEmailTemplate.html,
      text: adminEmailTemplate.text,
    });

    res.json({
      success: true,
      applicationId,
      message: candidateEmailSent
        ? "Application submitted successfully. Check your email for confirmation."
        : "Application submitted, but there was an issue sending the confirmation email. Our team will still review your application.",
    });
  } catch (error) {
    console.error("Application submission error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ message: `Failed to submit application: ${msg}` });
  }
});

// Get all applications (admin only)
app.get("/api/jobs/applications", (_req, res) => {
  try {
    const allApplications = Array.from(applications.values()).sort(
      (a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
    );
    res.json(allApplications);
  } catch (error) {
    console.error("Fetch applications error:", error);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
});

// Update application status
app.patch("/api/jobs/applications/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const application = applications.get(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = status;
    if (notes) {
      application.notes = notes;
    }

    applications.set(id, application);

    res.json({
      success: true,
      message: `Application status updated to ${status}`,
    });
  } catch (error) {
    console.error("Update application error:", error);
    res.status(500).json({ message: "Failed to update application" });
  }
});

// Serve resume files
app.get("/api/resumes/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(uploadsDir, filename);

    // Security check: ensure file is in uploads directory
    if (!filepath.startsWith(uploadsDir)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ message: "File not found" });
    }

    res.download(filepath);
  } catch (error) {
    console.error("Resume download error:", error);
    res.status(500).json({ message: "Failed to download resume" });
  }
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/crm", crmRoutes);
app.use("/api/branding", brandingRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/campaigns", campaignRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
