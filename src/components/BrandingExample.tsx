/**
 * Example Component: Demonstrates how to use the useBranding hook
 *
 * This file shows best practices for integrating branding throughout your components.
 * Copy and adapt these patterns for your own components.
 */

import { useBranding } from '@/contexts/BrandingContext';

/**
 * Basic usage: Display company logo and name
 */
export const BrandedHeader = () => {
  const { branding } = useBranding();

  if (!branding?.show_branding) {
    return null;
  }

  return (
    <header className="flex items-center gap-4 p-4 border-b">
      {branding.logo_url && (
        <img
          src={branding.logo_url}
          alt={branding.company_name || 'Company Logo'}
          className="h-8 w-auto"
        />
      )}
      {branding.company_name && (
        <h1 className="text-xl font-bold text-primary">
          {branding.company_name}
        </h1>
      )}
    </header>
  );
};

/**
 * Advanced usage: Use CSS variables from branding
 */
export const BrandedButton = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  const { getCSSVariable } = useBranding();

  const primaryColor = getCSSVariable('--primary');

  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: primaryColor,
        color: getCSSVariable('--primary-foreground'),
      }}
      className="px-4 py-2 rounded font-semibold hover:opacity-90"
    >
      {children}
    </button>
  );
};

/**
 * Contact information component using branding
 */
export const BrandedContact = () => {
  const { branding } = useBranding();

  if (!branding?.show_branding) {
    return null;
  }

  return (
    <div className="p-4 border rounded">
      {branding.support_email && (
        <p>
          Email:{' '}
          <a href={`mailto:${branding.support_email}`} className="text-primary hover:underline">
            {branding.support_email}
          </a>
        </p>
      )}
      {branding.support_phone && (
        <p>
          Phone:{' '}
          <a href={`tel:${branding.support_phone}`} className="text-primary hover:underline">
            {branding.support_phone}
          </a>
        </p>
      )}
      {branding.support_url && (
        <p>
          <a href={branding.support_url} className="text-primary hover:underline">
            Support Portal
          </a>
        </p>
      )}
    </div>
  );
};

/**
 * Footer with branded information
 */
export const BrandedFooter = () => {
  const { branding, isLoading } = useBranding();

  if (isLoading || !branding?.show_branding) {
    return null;
  }

  return (
    <footer className="mt-auto border-t bg-secondary py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            {branding.logo_url && (
              <img
                src={branding.logo_url}
                alt={branding.company_name || 'Company Logo'}
                className="h-10 w-auto mb-4"
              />
            )}
            {branding.company_name && (
              <p className="font-semibold text-primary">
                {branding.company_name}
              </p>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-secondary-foreground hover:text-primary">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-foreground hover:text-primary">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-foreground hover:text-primary">
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            {branding.support_email && (
              <p className="text-sm mb-2">
                <a
                  href={`mailto:${branding.support_email}`}
                  className="text-secondary-foreground hover:text-primary"
                >
                  {branding.support_email}
                </a>
              </p>
            )}
            {branding.support_phone && (
              <p className="text-sm">
                <a
                  href={`tel:${branding.support_phone}`}
                  className="text-secondary-foreground hover:text-primary"
                >
                  {branding.support_phone}
                </a>
              </p>
            )}
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} {branding.company_name}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

/**
 * Error state component showing branding loading error
 */
export const BrandingError = () => {
  const { error } = useBranding();

  if (!error) {
    return null;
  }

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded">
      <p className="text-red-800 font-semibold">Branding Configuration Error</p>
      <p className="text-red-600 text-sm mt-2">{error.message}</p>
    </div>
  );
};

/**
 * Loading state for branding
 */
export const BrandingLoader = () => {
  const { isLoading } = useBranding();

  if (!isLoading) {
    return null;
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded">
      <p className="text-blue-800 font-semibold">Loading branding configuration...</p>
    </div>
  );
};
