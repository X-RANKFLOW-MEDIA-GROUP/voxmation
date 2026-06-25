# BrandingContext - Quick Start

## 5-Minute Setup

### 1. It's Already Integrated!
BrandingProvider is already added to `src/App.tsx`. Just start using it.

### 2. Use the Hook

```tsx
import { useBranding } from '@/contexts/BrandingContext';

export const MyComponent = () => {
  const { branding } = useBranding();
  
  return <h1>{branding?.company_name}</h1>;
};
```

### 3. Common Uses

#### Display Logo
```tsx
<img src={branding?.logo_url} alt="Logo" />
```

#### Use Brand Colors
```tsx
<div style={{ color: 'var(--primary)' }}>
  Branded text
</div>
```

#### Show Contact Info
```tsx
<a href={`mailto:${branding?.support_email}`}>
  {branding?.support_email}
</a>
```

#### Conditional Branding
```tsx
if (!branding?.show_branding) {
  return null; // Hide this component
}
```

## Component Templates

### Branded Header
```tsx
export const Header = () => {
  const { branding } = useBranding();
  
  return (
    <header className="p-4 border-b">
      {branding?.logo_url && <img src={branding.logo_url} alt="Logo" />}
      <h1 className="text-primary">{branding?.company_name}</h1>
    </header>
  );
};
```

### Branded Button
```tsx
export const Button = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{ backgroundColor: 'var(--primary)' }}
      className="px-4 py-2 rounded text-white"
    >
      {children}
    </button>
  );
};
```

### Branded Footer
```tsx
export const Footer = () => {
  const { branding } = useBranding();
  
  return (
    <footer style={{ backgroundColor: 'var(--secondary)' }} className="p-8">
      <p>&copy; {branding?.company_name}</p>
      <a href={`mailto:${branding?.support_email}`}>
        {branding?.support_email}
      </a>
    </footer>
  );
};
```

## Available CSS Variables

```tsx
const { getCSSVariable } = useBranding();

getCSSVariable('--primary')           // Brand primary color
getCSSVariable('--secondary')         // Brand secondary color
getCSSVariable('--accent')            // Brand accent color
getCSSVariable('--primary-foreground') // Text on primary
```

## Data Available from Branding

```tsx
const { branding } = useBranding();

branding?.primary_color      // e.g., "214 66% 14%"
branding?.secondary_color    // e.g., "214 50% 34%"
branding?.accent_color       // e.g., "26 100% 56%"
branding?.logo_url           // e.g., "https://..."
branding?.logo_dark_url      // For dark theme
branding?.favicon_url        // Favicon
branding?.company_name       // Display name
branding?.font_family        // Custom font
branding?.support_email      // Support email
branding?.support_phone      // Support phone
branding?.support_url        // Support URL
branding?.custom_css         // Injected CSS
branding?.show_branding      // Show/hide branding
branding?.theme              // 'light' | 'dark' | 'auto'
```

## State Management

```tsx
const {
  branding,        // Current branding config
  isLoading,       // Loading state
  error,           // Error object if failed
  refreshBranding, // Refresh branding from account
  getCSSVariable,  // Get computed CSS variable
  applyBranding,   // Apply branding manually
} = useBranding();
```

## Real-World Example

```tsx
import { useBranding } from '@/contexts/BrandingContext';

export const Dashboard = () => {
  const { branding, isLoading } = useBranding();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <header style={{ borderBottomColor: 'var(--primary)' }}>
        {branding?.logo_url && (
          <img src={branding.logo_url} alt="Logo" className="h-8" />
        )}
        <h1 className="text-2xl font-bold text-primary">
          {branding?.company_name || 'Dashboard'}
        </h1>
      </header>

      <main className="p-8">
        <h2>Welcome back!</h2>
      </main>

      <footer className="mt-auto p-4 bg-secondary text-center">
        <p>
          {branding?.support_email && (
            <a href={`mailto:${branding.support_email}`}>
              Contact Support
            </a>
          )}
        </p>
      </footer>
    </div>
  );
};
```

## Setting Up Account Branding

In your database, the account branding looks like:

```json
{
  "primary_color": "214 66% 14%",
  "secondary_color": "214 50% 34%",
  "accent_color": "26 100% 56%",
  "logo_url": "https://example.com/logo.png",
  "logo_dark_url": "https://example.com/logo-dark.png",
  "favicon_url": "https://example.com/favicon.ico",
  "company_name": "Acme Corp",
  "font_family": "'Inter', sans-serif",
  "support_email": "support@acme.com",
  "support_phone": "+1-800-ACME",
  "support_url": "https://support.acme.com",
  "custom_css": "body { font-family: 'Inter', sans-serif; }",
  "show_branding": true,
  "theme": "auto"
}
```

## Troubleshooting

### Colors not showing?
```tsx
// Check if colors are being applied
const { getCSSVariable } = useBranding();
console.log(getCSSVariable('--primary')); // Should not be empty
```

### Branding not loading?
```tsx
const { isLoading, error } = useBranding();
if (error) console.error(error);
```

### Need to refresh?
```tsx
const { refreshBranding } = useBranding();
await refreshBranding(); // Reload from account
```

## See Full Guide

See `BRANDING_CONTEXT_GUIDE.md` for detailed documentation and advanced patterns.
