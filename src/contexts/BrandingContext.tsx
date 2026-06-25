import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useAuth } from "./AuthContext";

/**
 * Branding configuration for account customization
 * Loaded from account.branding field and enhanced with custom CSS injection
 */
export interface BrandingConfig {
  // Core branding
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;

  // Logo and identity
  logo_url?: string;
  logo_dark_url?: string;
  favicon_url?: string;
  company_name?: string;

  // Typography
  font_family?: string;

  // Contact information
  support_email?: string;
  support_phone?: string;
  support_url?: string;

  // Custom CSS
  custom_css?: string;

  // Feature toggles
  show_branding?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

interface BrandingContextType {
  branding: BrandingConfig | null;
  isLoading: boolean;
  error: Error | null;
  refreshBranding: () => Promise<void>;
  getCSSVariable: (name: string) => string;
  applyBranding: (config: BrandingConfig) => void;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const useBranding = (): BrandingContextType => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error("useBranding must be used within BrandingProvider");
  }
  return context;
};

/**
 * Parse CSS color value to HSL format if needed
 */
const normalizeColor = (color: string | undefined): string => {
  if (!color) return "";

  // If it's already a valid CSS color, return it
  if (color.startsWith("#") || color.startsWith("rgb") || color.startsWith("hsl") || color.startsWith("var(")) {
    return color;
  }

  // If it looks like HSL values (e.g., "214 66% 14%"), format as HSL
  if (/^\d+\s+\d+%?\s+\d+%?$/.test(color.trim())) {
    return `hsl(${color})`;
  }

  return color;
};

/**
 * Injects CSS variables into the document root
 */
const injectCSSVariables = (branding: BrandingConfig): void => {
  const root = document.documentElement;

  // Map branding colors to CSS variables
  const colorMap: Record<string, string | undefined> = {
    "--color-brand-primary": normalizeColor(branding.primary_color),
    "--color-brand-secondary": normalizeColor(branding.secondary_color),
    "--color-brand-accent": normalizeColor(branding.accent_color),
    "--primary": normalizeColor(branding.primary_color),
    "--secondary": normalizeColor(branding.secondary_color),
    "--accent": normalizeColor(branding.accent_color),
  };

  // Apply all color variables
  Object.entries(colorMap).forEach(([varName, varValue]) => {
    if (varValue) {
      root.style.setProperty(varName, varValue);
    }
  });

  // Apply font family if specified
  if (branding.font_family) {
    root.style.setProperty("--font-family", branding.font_family);
  }

  // Apply theme preference
  if (branding.theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (branding.theme === 'light') {
    document.documentElement.classList.remove('dark');
  }
};

/**
 * Injects custom CSS into the document
 */
const injectCustomCSS = (customCSS: string | undefined): void => {
  if (!customCSS) return;

  // Remove old custom branding style if it exists
  const oldStyle = document.getElementById('branding-custom-css');
  if (oldStyle) {
    oldStyle.remove();
  }

  // Create and inject new style element
  const style = document.createElement('style');
  style.id = 'branding-custom-css';
  style.textContent = customCSS;
  document.head.appendChild(style);
};

/**
 * Updates favicon if URL is provided
 */
const setFavicon = (faviconUrl: string | undefined): void => {
  if (!faviconUrl) return;

  let link = document.querySelector("link[rel='icon']") as HTMLLinkElement;

  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }

  link.href = faviconUrl;
};

/**
 * Updates document title with company name
 */
const setDocumentTitle = (companyName: string | undefined, suffix: string = ""): void => {
  if (companyName) {
    document.title = suffix ? `${companyName} - ${suffix}` : companyName;
  }
};

export const BrandingProvider = ({ children }: { children: ReactNode }) => {
  const { account, loading: authLoading } = useAuth();
  const [branding, setBranding] = useState<BrandingConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Load branding from account data
   */
  const loadBranding = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use account branding if available
      if (account?.branding) {
        const brandingConfig: BrandingConfig = {
          primary_color: account.branding.primary_color,
          secondary_color: account.branding.secondary_color,
          accent_color: account.branding.accent_color,
          logo_url: account.branding.logo_url,
          logo_dark_url: account.branding.logo_dark_url,
          favicon_url: account.branding.favicon_url,
          company_name: account.branding.company_name || account.name,
          font_family: account.branding.font_family,
          support_email: account.branding.support_email,
          support_phone: account.branding.support_phone,
          support_url: account.branding.support_url,
          custom_css: account.branding.custom_css,
          show_branding: account.branding.show_branding !== false,
          theme: account.branding.theme || 'auto',
        };

        setBranding(brandingConfig);
        applyBranding(brandingConfig);
      } else {
        // Fall back to default/platform branding
        setBranding(null);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load branding');
      setError(error);
      console.error('Error loading branding:', error);
    } finally {
      setIsLoading(false);
    }
  }, [account]);

  /**
   * Apply branding to the DOM
   */
  const applyBranding = useCallback((config: BrandingConfig): void => {
    injectCSSVariables(config);
    injectCustomCSS(config.custom_css);
    setFavicon(config.favicon_url);
    setDocumentTitle(config.company_name);
  }, []);

  /**
   * Refresh branding data
   */
  const refreshBranding = useCallback(async () => {
    await loadBranding();
  }, [loadBranding]);

  /**
   * Get computed CSS variable value
   */
  const getCSSVariable = useCallback((name: string): string => {
    const varName = name.startsWith('--') ? name : `--${name}`;
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  }, []);

  // Load branding when account changes and auth finishes loading
  useEffect(() => {
    if (!authLoading) {
      loadBranding();
    }
  }, [account, authLoading, loadBranding]);

  const value: BrandingContextType = {
    branding,
    isLoading,
    error,
    refreshBranding,
    getCSSVariable,
    applyBranding,
  };

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
};
