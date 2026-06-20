interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendTrialEmail(
  email: string,
  businessName: string,
  apiKey: string,
  expiresAt: string
): Promise<void> {
  const formattedDate = new Date(expiresAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const emailPayload: EmailPayload = {
    to: email,
    subject: '🎉 Your Voxmation Trial is Active! - 7 Days Free',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🚀 Welcome to Voxmation!</h1>
        </div>

        <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Hello <strong>${businessName}</strong>,
          </p>

          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Your 7-day trial has been activated successfully! You have full access to Voxmation with realistic voices powered by ElevenLabs.
          </p>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">
              Your API Key
            </p>
            <div style="background: white; padding: 15px; border-radius: 4px; border: 1px solid #e5e7eb; font-family: monospace; font-size: 14px; word-break: break-all;">
              <code>${apiKey}</code>
            </div>
          </div>

          <h2 style="color: #1f2937; font-size: 18px; margin-top: 30px;">What You Can Do:</h2>
          <ul style="color: #374151; font-size: 16px; line-height: 2;">
            <li>✓ Generate AI calls with realistic voices</li>
            <li>✓ Test different industries and scenarios</li>
            <li>✓ Access all 5 ElevenLabs voices</li>
            <li>✓ Up to 1,000 test calls</li>
          </ul>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
            <p style="color: #92400e; margin: 0; font-weight: 500;">
              ⏱️ Your trial expires on <strong>${formattedDate}</strong>
            </p>
          </div>

          <p style="color: #374151; font-size: 14px; margin-top: 30px;">
            To get started, access your dashboard and navigate to "API Keys" to integrate with your application.
          </p>

          <a href="https://voxmation.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 30px 0;">
            Access Dashboard
          </a>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;">

          <p style="color: #6b7280; font-size: 14px;">
            Questions? Contact our team at <a href="mailto:support@voxmation.com" style="color: #667eea; text-decoration: none;">support@voxmation.com</a>
          </p>

          <p style="color: #9ca3af; font-size: 12px;">
            © 2026 Voxmation. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `
Welcome to Voxmation!

Your 7-day trial has been activated successfully!

YOUR API KEY:
${apiKey}

What You Can Do:
✓ Generate AI calls with realistic voices
✓ Test different industries and scenarios
✓ Access all 5 ElevenLabs voices
✓ Up to 1,000 test calls

Your trial expires on ${formattedDate}

To get started, access your dashboard and navigate to "API Keys" to integrate with your application.

Questions? Contact us at support@voxmation.com

© 2026 Voxmation
    `,
  };

  try {
    // Call your email service (Resend, SendGrid, etc.)
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailPayload),
    });

    if (!response.ok) {
      throw new Error(`Email service returned ${response.status}`);
    }
  } catch (error) {
    console.error('Error sending trial email:', error);
    // Don't throw - silently fail so signup still completes
  }
}

export async function sendTrialExpiringEmail(
  email: string,
  businessName: string,
  expiresAt: string
): Promise<void> {
  const emailPayload: EmailPayload = {
    to: email,
    subject: '⏰ Your Voxmation Trial Expires in 24 Hours',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Your Trial is Ending!</h1>
        </div>

        <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Hello <strong>${businessName}</strong>,
          </p>

          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Your 7-day trial with Voxmation expires in <strong>24 hours</strong> (${expiresAt}).
          </p>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
            <p style="color: #92400e; margin: 0; font-weight: 500;">
              This is your last chance to experience the most advanced AI on the market!
            </p>
          </div>

          <a href="https://voxmation.com/pricing" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 30px 0;">
            View Plans
          </a>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;">

          <p style="color: #6b7280; font-size: 14px;">
            Questions? Contact us at <a href="mailto:support@voxmation.com" style="color: #667eea; text-decoration: none;">support@voxmation.com</a>
          </p>
        </div>
      </div>
    `,
    text: `
Your Trial is Ending!

Your 7-day trial with Voxmation expires in 24 hours (${expiresAt}).

This is your last chance to experience the most advanced AI on the market!

View Plans: https://voxmation.com/pricing

Questions? Contact us at support@voxmation.com
    `,
  };

  try {
    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailPayload),
    });
  } catch (error) {
    console.error('Error sending expiring trial email:', error);
  }
}
