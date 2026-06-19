import nodemailer from "nodemailer";

// Create transporter
const createTransporter = () => {
  // SendGrid configuration
  if (process.env.EMAIL_SERVICE === "sendgrid" && process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      secure: false,
      auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }

  // Gmail example - requires "App Password" (not regular password)
  // Docs: https://support.google.com/accounts/answer/185833
  if (process.env.EMAIL_SERVICE === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  // Generic SMTP server
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: SendEmailOptions): Promise<boolean> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "noreply@voxmation.com",
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${options.to}:`, info.messageId);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to ${options.to}:`, error);
    return false;
  }
};

// Candidate confirmation email template
export const getCandidateConfirmationEmail = (candidateName: string, jobTitle: string, applicationId: string) => {
  return {
    subject: `Application Received - ${jobTitle} Position at Voxmation`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .section { margin: 20px 0; }
            .highlight { background: #e8f1ff; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; }
            .footer { color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
            a { color: #667eea; text-decoration: none; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Application Received! 🎉</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${candidateName}</strong>,</p>

              <p>Thank you for applying to the <strong>${jobTitle}</strong> position at Voxmation! We're excited to have your application.</p>

              <div class="highlight">
                <strong>Application ID:</strong> ${applicationId}
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">Save this ID for your records</p>
              </div>

              <div class="section">
                <h3>What Happens Next?</h3>
                <p>Our hiring team reviews all applications on a rolling basis. Here's our typical timeline:</p>
                <ul>
                  <li><strong>Days 1-2:</strong> Initial application review</li>
                  <li><strong>Days 3-5:</strong> Qualified candidates are contacted for phone screening</li>
                  <li><strong>Days 6-10:</strong> Final interviews for top candidates</li>
                </ul>
              </div>

              <div class="section">
                <h3>Questions?</h3>
                <p>If you have any questions, feel free to reply to this email or contact us at <a href="mailto:careers@voxmation.com">careers@voxmation.com</a></p>
              </div>

              <p>Best regards,<br>The Voxmation Team</p>

              <div class="footer">
                <p>© 2024 Voxmation. All rights reserved.</p>
                <p>This is an automated email. Please do not reply with attachments.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Application Received!

Hi ${candidateName},

Thank you for applying to the ${jobTitle} position at Voxmation! We're excited to have your application.

Application ID: ${applicationId}
Save this ID for your records.

What Happens Next?
Our hiring team reviews all applications on a rolling basis. Here's our typical timeline:
- Days 1-2: Initial application review
- Days 3-5: Qualified candidates are contacted for phone screening
- Days 6-10: Final interviews for top candidates

Questions?
If you have any questions, feel free to reply to this email or contact us at careers@voxmation.com

Best regards,
The Voxmation Team
    `,
  };
};

// Admin notification email template
export const getAdminNotificationEmail = (
  candidateName: string,
  email: string,
  phone: string,
  jobTitle: string,
  yearsExp: string,
  applicationId: string
) => {
  return {
    subject: `New Application: ${candidateName} - ${jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1a1a2e; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .info-box { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #667eea; }
            .label { font-weight: bold; color: #667eea; }
            .action-btn { display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
            .action-btn:hover { background: #764ba2; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📨 New Job Application</h2>
              <p style="margin: 10px 0 0 0; font-size: 14px;">New candidate application received</p>
            </div>
            <div class="content">
              <h3>${candidateName}</h3>
              <p><strong>${jobTitle}</strong></p>

              <div class="info-box">
                <p><span class="label">Email:</span> <a href="mailto:${email}">${email}</a></p>
                <p><span class="label">Phone:</span> <a href="tel:${phone}">${phone}</a></p>
                <p><span class="label">Experience:</span> ${yearsExp}</p>
                <p><span class="label">Application ID:</span> ${applicationId}</p>
                <p><span class="label">Submitted:</span> ${new Date().toLocaleString()}</p>
              </div>

              <p>
                <a href="${process.env.APP_URL || "http://localhost:5000"}/admin/applications" class="action-btn">
                  Review Application
                </a>
              </p>

              <p style="margin-top: 30px; color: #666; font-size: 12px;">
                This is an automated notification. Visit the admin dashboard to review full application details and manage candidate status.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
New Job Application

${candidateName}
${jobTitle}

Email: ${email}
Phone: ${phone}
Experience: ${yearsExp}
Application ID: ${applicationId}
Submitted: ${new Date().toLocaleString()}

Review Application:
${process.env.APP_URL || "http://localhost:5000"}/admin/applications

This is an automated notification.
    `,
  };
};
