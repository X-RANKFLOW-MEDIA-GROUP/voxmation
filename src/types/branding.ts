/**
 * Branding configuration types
 * Shared types for branding system throughout the application
 */

/**
 * Theme preference for the application
 */
export type ThemeMode = 'light' | 'dark' | 'auto';

/**
 * Color format support
 */
export type ColorFormat = 'hsl' | 'hex' | 'rgb' | 'var';

/**
 * Main branding configuration interface
 * Stored in accounts.branding JSONB column
 */
export interface BrandingConfig {
  // Color Configuration
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;

  // Asset URLs
  logo_url?: string;
  logo_dark_url?: string;
  favicon_url?: string;

  // Brand Identity
  company_name?: string;
  font_family?: string;

  // Contact Information
  support_email?: string;
  support_phone?: string;
  support_url?: string;

  // Advanced Options
  custom_css?: string;
  show_branding?: boolean;
  theme?: ThemeMode;
}

/**
 * Branding context type definition
 */
export interface BrandingContextType {
  branding: BrandingConfig | null;
  isLoading: boolean;
  error: Error | null;
  refreshBranding: () => Promise<void>;
  getCSSVariable: (name: string) => string;
  applyBranding: (config: BrandingConfig) => void;
}

/**
 * Color palette for branding
 */
export interface ColorPalette {
  base: string;
  light: string;
  lighter: string;
  dark: string;
  darker: string;
}

/**
 * RGB color object
 */
export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/**
 * HSL color object
 */
export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

/**
 * Branding validation result
 */
export interface BrandingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Account branding interface
 * Part of the Account interface
 */
export interface AccountBranding extends BrandingConfig {
  updated_at?: string;
  created_at?: string;
}

/**
 * Tailwind color configuration
 */
export interface TailwindColorConfig {
  [key: string]: string;
}

/**
 * CSS Variable names used in branding
 */
export const CSS_VARIABLES = {
  PRIMARY: '--primary',
  PRIMARY_FOREGROUND: '--primary-foreground',
  SECONDARY: '--secondary',
  SECONDARY_FOREGROUND: '--secondary-foreground',
  ACCENT: '--accent',
  ACCENT_FOREGROUND: '--accent-foreground',
  BRAND_PRIMARY: '--color-brand-primary',
  BRAND_SECONDARY: '--color-brand-secondary',
  BRAND_ACCENT: '--color-brand-accent',
  FONT_FAMILY: '--font-family',
  BORDER: '--border',
  CARD: '--card',
  INPUT: '--input',
} as const;

/**
 * Branding event types
 */
export enum BrandingEventType {
  LOADED = 'branding:loaded',
  UPDATED = 'branding:updated',
  ERROR = 'branding:error',
  REFRESHED = 'branding:refreshed',
}

/**
 * Branding configuration defaults
 */
export const DEFAULT_BRANDING: BrandingConfig = {
  show_branding: true,
  theme: 'auto',
};

/**
 * Regex patterns for validation
 */
export const BRANDING_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  PHONE: /^[+]?[\d\s\-().]+$/,
  HEX_COLOR: /^#[0-9A-Fa-f]{6}$/,
  HSL_COLOR: /^\d+\s+\d+%\s+\d+%$/,
  RGB_COLOR: /^rgb\(\d+,\s*\d+,\s*\d+\)$/,
} as const;

/**
 * Branding configuration schema for validation
 */
export const BRANDING_SCHEMA = {
  primary_color: { type: 'string', optional: true },
  secondary_color: { type: 'string', optional: true },
  accent_color: { type: 'string', optional: true },
  logo_url: { type: 'string', optional: true, pattern: 'URL' },
  logo_dark_url: { type: 'string', optional: true, pattern: 'URL' },
  favicon_url: { type: 'string', optional: true, pattern: 'URL' },
  company_name: { type: 'string', optional: true, maxLength: 255 },
  font_family: { type: 'string', optional: true, maxLength: 255 },
  support_email: { type: 'string', optional: true, pattern: 'EMAIL' },
  support_phone: { type: 'string', optional: true, pattern: 'PHONE' },
  support_url: { type: 'string', optional: true, pattern: 'URL' },
  custom_css: { type: 'string', optional: true, maxLength: 50000 },
  show_branding: { type: 'boolean', optional: true, default: true },
  theme: {
    type: 'enum',
    optional: true,
    values: ['light', 'dark', 'auto'],
    default: 'auto',
  },
} as const;

/**
 * Branding update payload
 */
export interface BrandingUpdatePayload {
  branding: Partial<BrandingConfig>;
  accountId: string;
}

/**
 * Branding export format
 */
export interface BrandingExport {
  version: string;
  timestamp: string;
  branding: BrandingConfig;
}

/**
 * Branding preview options
 */
export interface BrandingPreviewOptions {
  components?: ('header' | 'button' | 'footer' | 'card' | 'form')[];
  darkMode?: boolean;
  containerWidth?: number;
}

/**
 * Feature flags related to branding
 */
export interface BrandingFeatureFlags {
  customBranding: boolean;
  customCSS: boolean;
  darkMode: boolean;
  fontCustomization: boolean;
  logoUpload: boolean;
}

/**
 * Helper type to extract keys from BrandingConfig
 */
export type BrandingConfigKey = keyof BrandingConfig;

/**
 * Helper type for branding hooks
 */
export type UseBrandingHook = () => BrandingContextType;

/**
 * Branding component props
 */
export interface BrandingComponentProps {
  showBranding?: boolean;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
  onLoading?: () => void;
}

/**
 * Branded component styles
 */
export interface BrandedComponentStyles {
  backgroundColor?: string;
  color?: string;
  borderColor?: string;
  fontFamily?: string;
  [key: string]: string | undefined;
}

/**
 * Branding persistence options
 */
export interface BrandingPersistenceOptions {
  localStorage?: boolean;
  sessionStorage?: boolean;
  cookie?: boolean;
  cookieOptions?: {
    domain?: string;
    path?: string;
    maxAge?: number;
  };
}

/**
 * Branding import options
 */
export interface BrandingImportOptions {
  validate?: boolean;
  merge?: boolean;
  override?: string[];
}
