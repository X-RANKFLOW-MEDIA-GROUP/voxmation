import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, CheckCircle, AlertCircle } from "lucide-react";

interface JobApplicationFormProps {
  jobId: string;
  jobTitle: string;
  onSubmitSuccess?: () => void;
}

export default function JobApplicationForm({
  jobId,
  jobTitle,
  onSubmitSuccess,
}: JobApplicationFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    yearsExperience: "",
    greatestAchievement: "",
    whyInterested: "",
    additionalInfo: "",
  });

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Resume file must be less than 5MB");
        return;
      }
      setResumeFile(file);
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("jobId", jobId);
      formDataToSend.append("jobTitle", jobTitle);
      formDataToSend.append("fullName", formData.fullName);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("yearsExperience", formData.yearsExperience);
      formDataToSend.append("greatestAchievement", formData.greatestAchievement);
      formDataToSend.append("whyInterested", formData.whyInterested);
      formDataToSend.append("additionalInfo", formData.additionalInfo);

      if (resumeFile) {
        formDataToSend.append("resume", resumeFile);
      }

      const response = await fetch("/api/jobs/apply", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          yearsExperience: "",
          greatestAchievement: "",
          whyInterested: "",
          additionalInfo: "",
        });
        setResumeFile(null);
        onSubmitSuccess?.();
      } else {
        setStatus("error");
        setErrorMessage(data.message || "Failed to submit application");
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  if (status === "success") {
    return (
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-8 text-center">
        <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
        <h3 className="text-2xl font-display font-bold text-silver-bright mb-2">
          Application Submitted!
        </h3>
        <p className="text-silver mb-4">
          Thank you for applying to the {jobTitle} position. We've sent a
          confirmation email to <strong>{formData.email}</strong>.
        </p>
        <p className="text-sm text-silver/70 mb-6">
          We'll review your application and contact you within 3-5 business days
          if you move forward.
        </p>
        <Button
          onClick={() => {
            setStatus("idle");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          variant="neon"
        >
          Back to Jobs
        </Button>
      </div>
    );
  }

  return (
    <div className="surface-card rounded-2xl p-8">
      <h2 className="text-2xl font-display font-bold text-silver-bright mb-2">
        Apply for {jobTitle}
      </h2>
      <p className="text-silver/70 mb-8">
        Fill out the form below to submit your application. You can upload your
        resume as a PDF or Word document.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-mono tracking-widest uppercase text-primary/70 mb-4">
            Personal Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-silver-bright mb-2">
                Full Name *
              </label>
              <Input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="John Doe"
                required
                className="bg-primary/5 border-primary/20"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-silver-bright mb-2">
                  Email Address *
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  required
                  className="bg-primary/5 border-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-silver-bright mb-2">
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  required
                  className="bg-primary/5 border-primary/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-mono tracking-widest uppercase text-primary/70 mb-4">
            Application Questions
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-silver-bright mb-2">
                How many years of sales experience do you have? *
              </label>
              <Input
                type="text"
                name="yearsExperience"
                value={formData.yearsExperience}
                onChange={handleInputChange}
                placeholder="e.g., 3 years"
                required
                className="bg-primary/5 border-primary/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-silver-bright mb-2">
                What's your greatest achievement in closing deals? *
              </label>
              <Textarea
                name="greatestAchievement"
                value={formData.greatestAchievement}
                onChange={handleInputChange}
                placeholder="Tell us about your biggest sales win..."
                required
                rows={4}
                className="bg-primary/5 border-primary/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-silver-bright mb-2">
                Why are you interested in outbound sales with Voxmation? *
              </label>
              <Textarea
                name="whyInterested"
                value={formData.whyInterested}
                onChange={handleInputChange}
                placeholder="Share your motivation and what excites you about this role..."
                required
                rows={4}
                className="bg-primary/5 border-primary/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-silver-bright mb-2">
                Anything else we should know?
              </label>
              <Textarea
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleInputChange}
                placeholder="Additional skills, certifications, or anything else relevant..."
                rows={3}
                className="bg-primary/5 border-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Resume Upload */}
        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-mono tracking-widest uppercase text-primary/70 mb-4">
            Resume Upload
          </h3>
          <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
            <Upload className="h-8 w-8 text-primary/50 mx-auto mb-2" />
            <label className="cursor-pointer block">
              <span className="text-silver-bright font-medium">
                {resumeFile ? resumeFile.name : "Click to upload resume"}
              </span>
              <p className="text-xs text-silver/70 mt-1">
                PDF or Word document, max 5MB
              </p>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Error Message */}
        {status === "error" && errorMessage && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{errorMessage}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="border-t border-border pt-6">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
          <p className="text-xs text-silver/70 mt-4 text-center">
            By submitting, you agree to our privacy policy and terms of service.
          </p>
        </div>
      </form>
    </div>
  );
}
