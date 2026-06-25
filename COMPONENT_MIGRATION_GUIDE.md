# Component Migration Guide - Applying Branding Context

This guide shows how to migrate existing components to use the BrandingContext.

## Pattern 1: Header/Navigation Components

### Before
```tsx
export const Header = () => {
  return (
    <header className="p-4 border-b border-gray-200">
      <h1 className="text-2xl font-bold text-blue-900">My App</h1>
    </header>
  );
};
```

### After
```tsx
import { useBranding } from '@/contexts/BrandingContext';

export const Header = () => {
  const { branding } = useBranding();

  return (
    <header
      className="p-4 border-b"
      style={{
        borderBottomColor: 'var(--primary)',
      }}
    >
      {branding?.logo_url && (
        <img
          src={branding.logo_url}
          alt={branding?.company_name || 'Logo'}
          className="h-8 mb-2"
        />
      )}
      <h1 className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
        {branding?.company_name || 'My App'}
      </h1>
    </header>
  );
};
```

## Pattern 2: Button Components

### Before
```tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button = ({ children, onClick, variant = 'primary' }: ButtonProps) => {
  const bgColor = variant === 'primary' ? 'bg-blue-900' : 'bg-gray-100';
  const textColor = variant === 'primary' ? 'text-white' : 'text-gray-900';

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded ${bgColor} ${textColor}`}
    >
      {children}
    </button>
  );
};
```

### After
```tsx
import { useBranding } from '@/contexts/BrandingContext';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button = ({ children, onClick, variant = 'primary' }: ButtonProps) => {
  const { branding } = useBranding();

  return (
    <button
      onClick={onClick}
      style={
        variant === 'primary'
          ? {
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
            }
          : {
              backgroundColor: 'var(--secondary)',
              color: 'var(--secondary-foreground)',
            }
      }
      className="px-4 py-2 rounded font-semibold hover:opacity-90"
    >
      {children}
    </button>
  );
};
```

## Pattern 3: Footer Components

### Before
```tsx
export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 border-t border-gray-200 py-8">
      <div className="container mx-auto px-4">
        <p className="text-center text-gray-600">
          &copy; {currentYear} My Company. All rights reserved.
        </p>
        <p className="text-center text-sm text-gray-600 mt-2">
          <a href="mailto:support@mycompany.com">Contact Support</a>
        </p>
      </div>
    </footer>
  );
};
```

### After
```tsx
import { useBranding } from '@/contexts/BrandingContext';

export const Footer = () => {
  const { branding } = useBranding();
  const currentYear = new Date().getFullYear();

  if (!branding?.show_branding) {
    return null;
  }

  return (
    <footer
      className="border-t py-8"
      style={{ backgroundColor: 'var(--secondary)' }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div>
            {branding?.logo_url && (
              <img
                src={branding.logo_url}
                alt="Logo"
                className="h-8 mb-2"
              />
            )}
            <p className="font-semibold text-primary">
              {branding?.company_name}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className="hover:text-primary">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-primary">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#docs" className="hover:text-primary">
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            {branding?.support_email && (
              <p className="text-sm mb-2">
                <a
                  href={`mailto:${branding.support_email}`}
                  className="hover:text-primary"
                >
                  {branding.support_email}
                </a>
              </p>
            )}
            {branding?.support_phone && (
              <p className="text-sm">
                <a
                  href={`tel:${branding.support_phone}`}
                  className="hover:text-primary"
                >
                  {branding.support_phone}
                </a>
              </p>
            )}
          </div>
        </div>

        <div
          className="border-t pt-8 text-center text-sm"
          style={{ borderColor: 'var(--border)' }}
        >
          <p>
            &copy; {currentYear} {branding?.company_name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
```

## Pattern 4: Card Components

### Before
```tsx
interface CardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export const Card = ({ title, description, icon }: CardProps) => {
  return (
    <div className="p-6 border border-gray-200 rounded-lg bg-white hover:shadow-lg">
      {icon && <div className="mb-4 text-blue-900">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};
```

### After
```tsx
import { useBranding } from '@/contexts/BrandingContext';

interface CardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export const Card = ({ title, description, icon }: CardProps) => {
  const { branding } = useBranding();

  return (
    <div
      className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--card)',
      }}
    >
      {icon && (
        <div
          className="mb-4 text-lg"
          style={{ color: 'var(--accent)' }}
        >
          {icon}
        </div>
      )}
      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: 'var(--primary)' }}
      >
        {title}
      </h3>
      <p style={{ color: 'var(--secondary-foreground)' }}>
        {description}
      </p>
    </div>
  );
};
```

## Pattern 5: Form Components

### Before
```tsx
interface InputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export const Input = ({ placeholder, value, onChange }: InputProps) => {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-900"
    />
  );
};
```

### After
```tsx
interface InputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export const Input = ({ placeholder, value, onChange }: InputProps) => {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2"
      style={{
        borderColor: 'var(--input)',
        '--tw-ring-color': 'var(--primary)',
      } as any}
    />
  );
};
```

## Pattern 6: Badge Components

### Before
```tsx
interface BadgeProps {
  children: React.ReactNode;
  type?: 'success' | 'error' | 'warning' | 'info';
}

export const Badge = ({ children, type = 'info' }: BadgeProps) => {
  const colors = {
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm ${colors[type]}`}>
      {children}
    </span>
  );
};
```

### After
```tsx
import { useBranding } from '@/contexts/BrandingContext';

interface BadgeProps {
  children: React.ReactNode;
  type?: 'primary' | 'secondary' | 'accent';
}

export const Badge = ({ children, type = 'primary' }: BadgeProps) => {
  const { getCSSVariable } = useBranding();

  const colors = {
    primary: { bg: 'var(--primary)', fg: 'var(--primary-foreground)' },
    secondary: { bg: 'var(--secondary)', fg: 'var(--secondary-foreground)' },
    accent: { bg: 'var(--accent)', fg: 'var(--accent-foreground)' },
  };

  const selected = colors[type];

  return (
    <span
      className="px-3 py-1 rounded-full text-sm font-semibold"
      style={{
        backgroundColor: selected.bg,
        color: selected.fg,
      }}
    >
      {children}
    </span>
  );
};
```

## Pattern 7: Alert Components

### Before
```tsx
interface AlertProps {
  children: React.ReactNode;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export const Alert = ({ children, type = 'info' }: AlertProps) => {
  const bgColor = {
    info: 'bg-blue-50',
    success: 'bg-green-50',
    warning: 'bg-yellow-50',
    error: 'bg-red-50',
  }[type];

  const borderColor = {
    info: 'border-blue-200',
    success: 'border-green-200',
    warning: 'border-yellow-200',
    error: 'border-red-200',
  }[type];

  return (
    <div className={`p-4 border ${bgColor} ${borderColor} rounded`}>
      {children}
    </div>
  );
};
```

### After
```tsx
import { useBranding } from '@/contexts/BrandingContext';

interface AlertProps {
  children: React.ReactNode;
  type?: 'primary' | 'accent';
}

export const Alert = ({ children, type = 'primary' }: AlertProps) => {
  const { getCSSVariable } = useBranding();

  const colors = {
    primary: 'var(--primary)',
    accent: 'var(--accent)',
  };

  const baseColor = colors[type];

  return (
    <div
      className="p-4 border rounded"
      style={{
        borderColor: baseColor,
        backgroundColor: `${baseColor}15`,
      }}
    >
      {children}
    </div>
  );
};
```

## Pattern 8: Tab Components

### Before
```tsx
interface TabsProps {
  tabs: Array<{ label: string; content: React.ReactNode }>;
}

export const Tabs = ({ tabs }: TabsProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div>
      <div className="flex border-b border-gray-200">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`px-4 py-2 font-semibold border-b-2 ${
              activeIndex === i
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4">{tabs[activeIndex].content}</div>
    </div>
  );
};
```

### After
```tsx
import { useState } from 'react';
import { useBranding } from '@/contexts/BrandingContext';

interface TabsProps {
  tabs: Array<{ label: string; content: React.ReactNode }>;
}

export const Tabs = ({ tabs }: TabsProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { getCSSVariable } = useBranding();

  const primaryColor = getCSSVariable('--primary');

  return (
    <div>
      <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className="px-4 py-2 font-semibold border-b-2 transition-colors"
            style={{
              borderColor: activeIndex === i ? 'var(--primary)' : 'transparent',
              color: activeIndex === i ? 'var(--primary)' : 'var(--secondary-foreground)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4">{tabs[activeIndex].content}</div>
    </div>
  );
};
```

## Quick Migration Checklist

- [ ] Import `useBranding` from '@/contexts/BrandingContext'
- [ ] Call `useBranding()` in your component
- [ ] Replace hardcoded colors with `var(--primary)`, `var(--secondary)`, etc.
- [ ] Update logo/company name display if applicable
- [ ] Add loading state handling if needed
- [ ] Test with different branding configurations
- [ ] Update TypeScript types if needed
- [ ] Add error boundaries if accessing nested branding properties

## CSS Variable Reference

| Variable | Purpose |
|---|---|
| `--primary` | Brand primary color |
| `--primary-foreground` | Text color on primary |
| `--secondary` | Brand secondary color |
| `--secondary-foreground` | Text color on secondary |
| `--accent` | Brand accent color |
| `--accent-foreground` | Text color on accent |
| `--border` | Border color |
| `--card` | Card background color |
| `--input` | Input background color |

## Testing Your Migration

```tsx
// Test component with mock branding
import { BrandingContext } from '@/contexts/BrandingContext';

const mockBranding = {
  primary_color: '214 66% 14%',
  secondary_color: '214 50% 34%',
  accent_color: '26 100% 56%',
  company_name: 'Test Company',
  logo_url: 'https://example.com/logo.png',
  show_branding: true,
};

test('Component uses branding correctly', () => {
  render(
    <BrandingContext.Provider value={mockBranding}>
      <YourComponent />
    </BrandingContext.Provider>
  );

  // Assert branding is applied
});
```

## Common Gotchas

### 1. CSS Variables Not Available in Tests
Mock the context in your tests

### 2. Style Conflicts
Ensure branding CSS doesn't conflict with existing Tailwind styles

### 3. Dynamic Colors
Remember CSS variable values are computed at runtime

### 4. Theme Changes
Use the `theme` property to handle dark/light modes
