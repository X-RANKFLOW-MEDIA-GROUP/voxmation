# BrandingContext Implementation Guide

## Overview

The `BrandingContext` system provides a centralized way to manage account-specific branding throughout your application. It loads branding configuration from the account data, injects CSS variables, applies custom CSS, and provides hooks for components to access and use branding information.

## Features

### 1. Automatic Branding Loading
- Loads branding from the authenticated account
- Syncs with account changes automatically
- Graceful fallback to default/platform branding

### 2. CSS Variable Injection
- Injects brand colors as CSS custom properties
- Supports HSL, hex, and RGB color formats
- Maps colors to both specific and generic CSS variables
- Updates theme preference (light/dark/auto)

### 3. Custom CSS Support
- Injects custom CSS rules for brand-specific styling
- Maintains style isolation with unique style element ID
- Automatically removes old styles when updating

### 4. Dynamic Assets
- Logo URL support with dark mode variant
- Favicon management
- Company name configuration

### 5. Contact Information
- Support email, phone, and URL management
- Easy integration into footer and support components

## Architecture

```
App.tsx
  └── AuthProvider
      └── BrandingProvider
          ├── Loads branding from account
          ├── Injects CSS variables
          ├── Applies custom CSS
          └── Provides useBranding hook
```

## Setup

### 1. Ensure BrandingProvider is in App.tsx

The `App.tsx` has already been updated to include the BrandingProvider:

```tsx
<AuthProvider>
  <BrandingProvider>
    {/* Your routes and other providers */}
  </BrandingProvider>
</AuthProvider>
```

### 2. Update Account Schema

Ensure your Supabase `accounts` table includes the branding fields:

```sql
ALTER TABLE accounts ADD COLUMN branding JSONB DEFAULT NULL;

-- Example structure:
-- {
--   "primary_color": "214 66% 14%",
--   "secondary_color": "214 50% 34%",
--   "accent_color": "26 100% 56%",
--   "logo_url": "https://example.com/logo.png",
--   "logo_dark_url": "https://example.com/logo-dark.png",
--   "favicon_url": "https://example.com/favicon.ico",
--   "company_name": "Acme Corp",
--   "font_family": "'Inter', sans-serif",
--   "support_email": "support@acme.com",
--   "support_phone": "+1-800-ACME",
--   "support_url": "https://support.acme.com",
--   "custom_css": "body { ... }",
--   "show_branding": true,
--   "theme": "auto"
-- }
```

## Usage

### Basic: Access Branding Data

```tsx
import { useBranding } from '@/contexts/BrandingContext';

export const MyComponent = () => {
  const { branding, isLoading, error } = useBranding();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{branding?.company_name || 'My App'}</h1>
      {branding?.logo_url && (
        <img src={branding.logo_url} alt="Logo" />
      )}
    </div>
  );
};
```

### Using CSS Variables

All branding colors are automatically injected as CSS variables:

```tsx
export const BrandedButton = () => {
  const { getCSSVariable } = useBranding();

  const primaryColor = getCSSVariable('--primary');
  const accentColor = getCSSVariable('--accent');

  return (
    <button
      style={{ backgroundColor: primaryColor }}
      className="px-4 py-2 rounded"
    >
      Click me
    </button>
  );
};
```

### In Tailwind CSS

Since CSS variables are injected, you can use them in Tailwind:

```tsx
export const BrandedCard = () => {
  return (
    <div className="p-4 rounded border" style={{ borderColor: 'var(--primary)' }}>
      Branded card content
    </div>
  );
};
```

Or use Tailwind's arbitrary values:

```tsx
export const BrandedText = () => {
  return (
    <p style={{ color: 'var(--primary-foreground)' }} className="font-semibold">
      Branded text
    </p>
  );
};
```

### Contact Information Component

```tsx
export const SupportInfo = () => {
  const { branding } = useBranding();

  return (
    <div>
      {branding?.support_email && (
        <a href={`mailto:${branding.support_email}`}>
          {branding.support_email}
        </a>
      )}
      {branding?.support_phone && (
        <a href={`tel:${branding.support_phone}`}>
          {branding.support_phone}
        </a>
      )}
    </div>
  );
};
```

### Conditional Rendering Based on Branding

```tsx
export const BrandedHeader = () => {
  const { branding } = useBranding();

  // Only show if branding is enabled
  if (!branding?.show_branding) {
    return null;
  }

  return (
    <header>
      {branding.logo_url && (
        <img src={branding.logo_url} alt="Logo" className="h-8" />
      )}
      <h1>{branding.company_name}</h1>
    </header>
  );
};
```

### Managing Brand State

```tsx
export const BrandingDebugger = () => {
  const {
    branding,
    isLoading,
    error,
    refreshBranding,
    getCSSVariable,
  } = useBranding();

  return (
    <div className="p-4 space-y-4">
      <button
        onClick={refreshBranding}
        className="px-4 py-2 bg-primary text-white rounded"
      >
        Refresh Branding
      </button>

      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}

      {branding && (
        <pre className="bg-gray-100 p-2 rounded overflow-auto">
          {JSON.stringify(branding, null, 2)}
        </pre>
      )}

      <p>Primary CSS Variable: {getCSSVariable('--primary')}</p>
    </div>
  );
};
```

## Color Format Support

The BrandingContext supports multiple color formats:

### HSL (Recommended)
```
primary_color: "214 66% 14%"
```

### Hex
```
primary_color: "#2c1c1f"
```

### RGB
```
primary_color: "rgb(44, 28, 31)"
```

### CSS Variables
```
primary_color: "var(--custom-color)"
```

## CSS Variable Mapping

When you set brand colors, they're mapped to these CSS variables:

| Branding Field | Primary Variable | Secondary Variables |
|---|---|---|
| `primary_color` | `--primary` | `--color-brand-primary` |
| `secondary_color` | `--secondary` | `--color-brand-secondary` |
| `accent_color` | `--accent` | `--color-brand-accent` |

You can access any CSS variable with `getCSSVariable()`:

```tsx
getCSSVariable('--primary')
getCSSVariable('--color-brand-accent')
getCSSVariable('--font-family')
```

## Custom CSS Injection

For complex branding needs, you can inject custom CSS:

```tsx
// In your account's branding.custom_css:
`
  .branded-button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50px;
    padding: 10px 20px;
    color: white;
    font-weight: bold;
    transition: transform 0.2s;
  }

  .branded-button:hover {
    transform: scale(1.05);
  }

  .branded-card {
    border: 2px solid #667eea;
    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.1);
  }
`
```

Then use in your components:

```tsx
<button className="branded-button">Click me</button>
<div className="branded-card">Card content</div>
```

## Theme Support

The BrandingContext supports theme preferences:

```tsx
// In account branding
theme: 'light' | 'dark' | 'auto'
```

- `'light'`: Removes the `dark` class from the document root
- `'dark'`: Adds the `dark` class to the document root
- `'auto'`: No automatic class changes (uses system preference or default)

## Error Handling

The BrandingContext includes comprehensive error handling:

```tsx
export const BrandingStatus = () => {
  const { isLoading, error } = useBranding();

  if (isLoading) {
    return <div>Loading branding...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="font-semibold">Branding Error</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  return null;
};
```

## Best Practices

### 1. Always Check `show_branding` Flag

```tsx
if (!branding?.show_branding) {
  return null;
}
```

### 2. Provide Fallbacks

```tsx
<h1>{branding?.company_name || 'Default Company'}</h1>
```

### 3. Use `getCSSVariable()` for Dynamic Styling

```tsx
const { getCSSVariable } = useBranding();
const color = getCSSVariable('--primary');
```

### 4. Handle Loading States

```tsx
const { isLoading } = useBranding();
if (isLoading) return <Skeleton />;
```

### 5. Refresh When Needed

```tsx
const { refreshBranding } = useBranding();

const updateAccount = async () => {
  // Update account...
  await refreshBranding();
};
```

## Common Patterns

### Branded Logo Component

```tsx
export const Logo = () => {
  const { branding } = useBranding();

  const isDark = branding?.theme === 'dark';
  const logoUrl = isDark
    ? branding?.logo_dark_url || branding?.logo_url
    : branding?.logo_url;

  if (!logoUrl) return null;

  return (
    <img
      src={logoUrl}
      alt={branding?.company_name || 'Logo'}
      className="h-8 w-auto"
    />
  );
};
```

### Branded Navigation

```tsx
export const Navigation = () => {
  const { branding } = useBranding();

  return (
    <nav
      style={{
        borderBottomColor: `var(--primary)`,
      }}
      className="border-b"
    >
      <div className="flex items-center gap-4 p-4">
        <Logo />
        <span className="font-semibold text-primary">
          {branding?.company_name}
        </span>
      </div>
    </nav>
  );
};
```

### Branded Footer

```tsx
export const Footer = () => {
  const { branding } = useBranding();

  if (!branding?.show_branding) {
    return null;
  }

  return (
    <footer
      style={{
        backgroundColor: `var(--secondary)`,
      }}
      className="mt-auto py-8"
    >
      <div className="container mx-auto px-4">
        <p className="text-center font-semibold text-primary">
          &copy; {new Date().getFullYear()} {branding.company_name}
        </p>
        {branding.support_email && (
          <p className="text-center text-sm mt-2">
            <a
              href={`mailto:${branding.support_email}`}
              className="hover:underline"
            >
              {branding.support_email}
            </a>
          </p>
        )}
      </div>
    </footer>
  );
};
```

## Troubleshooting

### CSS Variables Not Applying

1. Ensure BrandingProvider is wrapping your components
2. Check that account.branding is populated
3. Verify color format is valid (HSL, hex, or rgb)
4. Check browser DevTools for style element injection

### Custom CSS Not Working

1. Ensure custom_css field is valid CSS
2. Check for CSS specificity issues
3. Verify style element with ID `branding-custom-css` exists in DOM

### Branding Not Loading

1. Check that user is authenticated
2. Verify account has branding data
3. Check browser console for errors
4. Try calling `refreshBranding()` manually

## API Reference

### `useBranding()`

Returns the branding context object:

```tsx
interface BrandingContextType {
  branding: BrandingConfig | null;
  isLoading: boolean;
  error: Error | null;
  refreshBranding: () => Promise<void>;
  getCSSVariable: (name: string) => string;
  applyBranding: (config: BrandingConfig) => void;
}
```

### `BrandingConfig`

```tsx
interface BrandingConfig {
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  logo_url?: string;
  logo_dark_url?: string;
  favicon_url?: string;
  company_name?: string;
  font_family?: string;
  support_email?: string;
  support_phone?: string;
  support_url?: string;
  custom_css?: string;
  show_branding?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}
```

## Integration Checklist

- [ ] BrandingProvider added to App.tsx
- [ ] Account interface updated with branding fields
- [ ] Supabase accounts table includes branding column
- [ ] Components using useBranding hook
- [ ] CSS variables applied to components
- [ ] Custom CSS injection tested
- [ ] Logo and favicon display working
- [ ] Theme switching implemented
- [ ] Error handling in place
- [ ] Documentation updated

## Next Steps

1. Update your components to use `useBranding()`
2. Test branding changes with different accounts
3. Add branding management UI to admin panel
4. Create branded components for frequently used elements
5. Document your custom branding options for customers
