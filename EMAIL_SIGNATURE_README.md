# Voxmation Email Signature - Setup & Customization Guide

## 📧 Files Included

- **email-signature.html** - Full HTML with embedded CSS (for testing/preview)
- **email-signature-inline.html** - Email client optimized version (use this for email signatures)
- **email-signature.css** - Standalone CSS file for reference
- **email-signature-template.html** - Customizable template with placeholders

## 🚀 Quick Start

### Option 1: Gmail Setup
1. Open **email-signature-inline.html**
2. Select all content from the `<table>` tag to the closing `</table>` tag
3. Copy the code
4. Go to Gmail → Settings → General → Signature
5. Click in the signature box and paste the code
6. Save changes

### Option 2: Outlook Setup
1. Open **email-signature-inline.html**
2. Copy the entire table HTML
3. Go to Outlook → File → Options → Mail → Signatures
4. Create a new signature
5. Use the HTML editor or paste directly
6. Save and set as default

### Option 3: Other Email Clients
- Most email clients support HTML signatures
- Use the **email-signature-inline.html** version
- Check your email client's signature import/setup instructions

## 🎨 Customization

### Replace Placeholders

#### Profile Information
```html
BRUNO SANTOS
Sales Development Representative
+1 844-687-7999 Ext 1005
bruno@voxmation.com
www.voxmation.com
```

#### Images
Replace these Cloudinary URLs with your actual images:

```html
<!-- Logo -->
https://res.cloudinary.com/your-cloudinary/image/upload/v1/voxmation-logo.png

<!-- Profile Photo -->
https://res.cloudinary.com/your-cloudinary/image/upload/v1/bruno-santos.jpg
```

### Color Customization

In **email-signature.css**, modify these color variables:

```css
:root {
    --primary-dark: #0a1628;           /* Dark blue background */
    --primary-dark-light: #0f1f3c;     /* Lighter blue */
    --primary-accent: #ff9d00;         /* Orange accent */
    --accent-orange: #ff8c42;          /* Orange button */
    --accent-orange-dark: #ff7c1c;     /* Orange hover */
}
```

### CTA Button Customization

Change the button URL and text:

```html
<a href="https://www.voxmation.com/trial" target="_blank" class="cta-button">
    🚀 GET YOUR 7 DAYS TRIAL
</a>
```

## 📋 Template Variables

Create variations for different team members:

```html
<!-- Name -->
<div class="name">TEAM MEMBER NAME</div>

<!-- Title -->
<div class="title">Job Title Here</div>

<!-- Phone -->
<a href="tel:+1234567890">+1 234-567-8900 Ext XXXX</a>

<!-- Email -->
<a href="mailto:email@voxmation.com">email@voxmation.com</a>

<!-- Profile Image -->
<img src="https://cloudinary-url/profile-image.jpg" alt="Name" class="profile-image" />
```

## ✅ Email Client Compatibility

Tested and optimized for:
- ✅ Gmail (Web, Mobile)
- ✅ Outlook (Desktop, Web, Mobile)
- ✅ Apple Mail
- ✅ Thunderbird
- ✅ iPhone/iPad Mail
- ✅ Android Gmail

## 🎯 Best Practices

1. **Use Email-Optimized Version**: Always use `email-signature-inline.html` for email clients
2. **Test Before Deploy**: Send a test email to yourself from multiple devices
3. **Keep It Simple**: Avoid complex animations or heavy JavaScript
4. **Image Hosting**: Use Cloudinary or similar CDN for reliable image hosting
5. **File Size**: Keep total signature under 25KB
6. **Responsive**: Design adapts to mobile and desktop screens
7. **Accessibility**: Includes alt text for images and semantic HTML

## 🖼️ Image Setup (Cloudinary)

### Upload to Cloudinary:
1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Upload your logo (PNG with transparency recommended)
3. Upload your profile photo (JPG or PNG)
4. Copy the public URLs and replace placeholders

### Image Specifications:
- **Logo**: 100x100px or smaller, PNG with transparency
- **Profile Photo**: 140x140px, JPG or PNG
- Optimize images before uploading (compress size)

## 🔗 Links Customization

- **Phone**: `href="tel:+1844687799"` - Standard tel: format
- **Email**: `href="mailto:bruno@voxmation.com"` - Standard mailto: format
- **Website**: `href="https://www.voxmation.com"` - Full URL required
- **CTA**: Update the trial URL to your actual signup page

## 📱 Mobile Responsiveness

The signature automatically adapts to:
- Mobile phones (max-width: 600px)
- Tablets (max-width: 480px)
- Desktop (full width)

Layout changes:
- Switches from horizontal to vertical on mobile
- Logo and profile image scale responsively
- Text sizes adjust for readability

## 🐛 Troubleshooting

### Images Not Showing
- Verify Cloudinary URLs are public and accessible
- Check image file formats (PNG, JPG, GIF)
- Ensure URLs use HTTPS

### Formatting Looks Off
- Different email clients render HTML differently
- Test in multiple email programs
- Some clients strip certain CSS properties
- Use inline CSS only (the inline version does this)

### Button Not Clickable
- Ensure `href` attributes are properly formatted
- Test in different email clients
- Some clients may not render buttons as expected

### Colors Look Wrong
- Email clients may override colors
- Use inline styles as primary method
- Test in actual email client before deployment

## 📧 Deployment Steps

1. **Test Locally**: Open HTML in browser first
2. **Test in Email**: Send test email to yourself
3. **Verify Across Devices**: Check on phone, tablet, desktop
4. **Set as Default**: In email client, set signature as default
5. **Monitor Usage**: Ensure signature appears in all outgoing emails

## 🔄 Updates & Maintenance

To update all team members' signatures:
- Create variations using the template
- Store template in shared location
- Update color scheme/branding centrally
- Provide setup instructions to team

## 📞 Support

For issues or customizations:
- Test in multiple email clients
- Check email client documentation
- Review email signature best practices
- Ensure all URLs are accessible

---

**Last Updated**: 2026-07-01  
**Voxmation Email Signature v1.0**
