# SMTP Email Configuration Guide

This guide shows how to set up email sending for job applications and admin notifications.

## Quick Start (Gmail - Free Option)

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com
2. Click "Security" in left sidebar
3. Enable "2-Step Verification"

### Step 2: Create App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Google will generate a 16-character password
4. Copy this password

### Step 3: Configure .env
```bash
cp .env.example .env
```

Edit `.env` and add:
```
EMAIL_SERVICE=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
ADMIN_EMAIL=careers@voxmation.com
APP_URL=http://localhost:5000
```

### Step 4: Test
```bash
npm run dev
```

Visit `/jobs/outbound-sales-rep/apply` and submit a test application.

---

## Alternative: SendGrid (Recommended for Production)

### Why SendGrid?
- ✅ Professional email service
- ✅ Higher deliverability
- ✅ Email tracking & analytics
- ✅ Free tier: 100 emails/day
- ✅ No app passwords needed

### Setup

1. **Create SendGrid Account**
   - https://sendgrid.com/pricing/
   - Sign up for free plan

2. **Get API Key**
   - Go to Settings → API Keys
   - Create new API key
   - Copy the key

3. **Configure .env**
```
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
ADMIN_EMAIL=careers@voxmation.com
APP_URL=https://yourdomain.com
```

4. **Update server/email.ts** (add after gmail check):
```typescript
if (process.env.EMAIL_SERVICE === "sendgrid") {
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
```

---

## Alternative: AWS SES

### Why AWS SES?
- ✅ Lowest cost at scale
- ✅ Highest volume support
- ✅ Advanced features (templates, bounce handling)
- ✅ First 62,000 emails free/month (if receiving)

### Setup

1. **AWS Account**
   - Create AWS account if you don't have one
   - Go to SES service
   - Verify sending email address or domain

2. **Create IAM Credentials**
   - Go to IAM → Users
   - Create new user with SES permissions
   - Create access key

3. **Configure .env**
```
EMAIL_SERVICE=aws-ses
AWS_SES_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

4. **Update server/email.ts** (add AWS SDK):
```bash
npm install aws-sdk
```

Then in server/email.ts:
```typescript
if (process.env.EMAIL_SERVICE === "aws-ses") {
  const AWS = require("aws-sdk");
  AWS.config.update({
    region: process.env.AWS_SES_REGION,
    credentials: new AWS.Credentials({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }),
  });
  return nodemailer.createTransport({
    SES: new AWS.SES({ apiVersion: "2010-12-01" }),
  });
}
```

---

## Testing Email Sending

### Manual Test
```bash
# Create a small test script
node -e "
const { sendEmail, getCandidateConfirmationEmail } = require('./dist/server/email');
const template = getCandidateConfirmationEmail('John Doe', 'Sales Rep', 'test-123');
sendEmail({
  to: 'your-email@example.com',
  subject: template.subject,
  html: template.html
}).then(r => console.log('Sent:', r));
"
```

### Check Email Headers
Check "Show Original" in Gmail to verify:
- From address
- SPF/DKIM authenticity
- Delivery path

---

## Troubleshooting

### Emails Not Sending?
1. Check `.env` file is in root directory
2. Verify SMTP credentials are correct
3. Check application logs: `npm run dev`
4. Test with simple curl:
```bash
curl -X POST http://localhost:3001/api/jobs/apply \
  -H "Content-Type: multipart/form-data" \
  -F "jobId=outbound-sales-rep" \
  -F "jobTitle=Outbound Sales Representative" \
  -F "fullName=John Doe" \
  -F "email=john@example.com" \
  -F "phone=555-1234" \
  -F "yearsExperience=3" \
  -F "greatestAchievement=Closed $500k deal" \
  -F "whyInterested=Love outbound sales" \
  -F "additionalInfo=Available immediately"
```

### Gmail App Password Issues?
- Make sure 2FA is enabled
- Don't use regular Gmail password
- Check password is 16 characters
- Remove spaces: `xxxxxxxxxxxx` not `xxxx xxxx xxxx xxxx`

### SendGrid Emails Marked as Spam?
- Add SPF record: `v=spf1 sendgrid.net ~all`
- Add DKIM in SendGrid settings
- Use branded sender domain
- Verify sending email address

### Rate Limiting?
- Gmail: 500 emails/day
- SendGrid: Limited by plan
- AWS SES: 1-48 emails/second (higher if verified)

---

## Environment Variables Reference

```bash
# Email Service Selection (gmail, sendgrid, aws-ses, or smtp)
EMAIL_SERVICE=gmail

# Gmail Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# Generic SMTP Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=username
SMTP_PASSWORD=password
SMTP_FROM_EMAIL=noreply@example.com

# SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx

# AWS SES
AWS_SES_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# Common
ADMIN_EMAIL=careers@voxmation.com
APP_URL=http://localhost:5000
```

---

## Security Best Practices

1. **Never commit .env to git**
   - Already in .gitignore? Verify!
   - Use `.env.example` for documentation only

2. **Use environment variables in production**
   - Don't hardcode credentials
   - Use secrets management (GitHub Secrets, AWS Secrets Manager, etc.)

3. **Rotate API keys regularly**
   - Update .env
   - Invalidate old keys in email service

4. **Monitor email bounces**
   - Invalid emails waste quota
   - Set up bounce handling
   - Unsubscribe management

5. **Rate limit applications**
   - Prevent spam submissions
   - Consider adding reCAPTCHA

---

## Support

For issues:
1. Check application logs: `npm run dev`
2. Test SMTP connection: `telnet smtp.example.com 587`
3. Verify credentials in .env
4. Check email service documentation
5. Contact support@yourservice.com

---

## Next Steps

1. ✅ Choose email service (Gmail recommended for testing)
2. ✅ Create .env file with credentials
3. ✅ Test by submitting application at `/jobs/outbound-sales-rep/apply`
4. ✅ Check admin dashboard at `/admin/applications`
5. ✅ Verify emails arrive in inbox
6. ✅ Move to SendGrid/AWS for production
