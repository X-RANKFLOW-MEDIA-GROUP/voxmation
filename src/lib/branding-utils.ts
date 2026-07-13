/**
 * Branding utility functions for common operations
 */

import type { BrandingConfig } from '@/contexts/BrandingContext';

/**
 * Convert HSL string to RGB
 * Input: "214 66% 14%"
 * Output: { r: 44, g: 28, b: 31 }
 */
export const hslToRgb = (hslString: string): { r: number; g: number; b: number } | null => {
  const match = hslString.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  if (!match) return null;

  const h = parseInt(match[1], 10);
  const s = parseInt(match[2], 10) / 100;
  const l = parseInt(match[3], 10) / 100;

  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };

  const r = parseInt(f(0), 16);
  const g = parseInt(f(8), 16);
  const b = parseInt(f(4), 16);

  return { r, g, b };
};

/**
 * Convert RGB object to hex string
 * Input: { r: 44, g: 28, b: 31 }
 * Output: "#2c1c1f"
 */
export const rgbToHex = (rgb: { r: number; g: number; b: number }): string => {
  return `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`;
};

/**
 * Convert any color format to hex
 */
export const colorToHex = (color: string): string | null => {
  if (color.startsWith('#')) return color;

  if (color.startsWith('rgb')) {
    const match = color.match(/\d+/g);
    if (match && match.length >= 3) {
      const r = parseInt(match[0], 10);
      const g = parseInt(match[1], 10);
      const b = parseInt(match[2], 10);
      return rgbToHex({ r, g, b });
    }
    return null;
  }

  if (/^\d+\s+\d+%\s+\d+%$/.test(color.trim())) {
    const rgb = hslToRgb(color);
    if (rgb) return rgbToHex(rgb);
  }

  return null;
};

/**
 * Calculate luminance of a color (for determining text color)
 * Returns a value between 0 (dark) and 1 (light)
 */
export const getLuminance = (hexColor: string): number => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Using relative luminance formula from WCAG
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Determine if text should be light or dark based on background color
 */
export const getContrastColor = (
  backgroundColor: string,
  lightColor: string = '#ffffff',
  darkColor: string = '#000000'
): string => {
  const hexColor = colorToHex(backgroundColor);
  if (!hexColor) return darkColor;

  const luminance = getLuminance(hexColor);
  return luminance > 0.5 ? darkColor : lightColor;
};

/**
 * Blend two colors together
 */
export const blendColors = (
  color1: string,
  color2: string,
  ratio: number = 0.5
): string | null => {
  const hex1 = colorToHex(color1);
  const hex2 = colorToHex(color2);

  if (!hex1 || !hex2) return null;

  const r1 = parseInt(hex1.substring(1, 3), 16);
  const g1 = parseInt(hex1.substring(3, 5), 16);
  const b1 = parseInt(hex1.substring(5, 7), 16);

  const r2 = parseInt(hex2.substring(1, 3), 16);
  const g2 = parseInt(hex2.substring(3, 5), 16);
  const b2 = parseInt(hex2.substring(5, 7), 16);

  const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
  const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
  const b = Math.round(b1 * (1 - ratio) + b2 * ratio);

  return rgbToHex({ r, g, b });
};

/**
 * Lighten or darken a color
 */
export const adjustBrightness = (color: string, percent: number): string | null => {
  const white = '#ffffff';
  const black = '#000000';

  if (percent > 0) {
    return blendColors(color, white, percent / 100);
  } else if (percent < 0) {
    return blendColors(color, black, Math.abs(percent) / 100);
  }

  return colorToHex(color);
};

/**
 * Generate a color palette from a base color
 */
export const generateColorPalette = (
  baseColor: string
): {
  base: string;
  light: string;
  lighter: string;
  dark: string;
  darker: string;
} | null => {
  const base = colorToHex(baseColor);
  if (!base) return null;

  return {
    base,
    light: adjustBrightness(base, 20) || base,
    lighter: adjustBrightness(base, 40) || base,
    dark: adjustBrightness(base, -20) || base,
    darker: adjustBrightness(base, -40) || base,
  };
};

/**
 * Validate branding configuration
 */
export const validateBranding = (branding: Partial<BrandingConfig>): string[] => {
  const errors: string[] = [];

  if (branding.primary_color && !colorToHex(branding.primary_color)) {
    errors.push('Invalid primary color format');
  }

  if (branding.secondary_color && !colorToHex(branding.secondary_color)) {
    errors.push('Invalid secondary color format');
  }

  if (branding.accent_color && !colorToHex(branding.accent_color)) {
    errors.push('Invalid accent color format');
  }

  if (branding.logo_url && !isValidUrl(branding.logo_url)) {
    errors.push('Invalid logo URL');
  }

  if (branding.logo_dark_url && !isValidUrl(branding.logo_dark_url)) {
    errors.push('Invalid logo dark URL');
  }

  if (branding.favicon_url && !isValidUrl(branding.favicon_url)) {
    errors.push('Invalid favicon URL');
  }

  if (branding.support_email && !isValidEmail(branding.support_email)) {
    errors.push('Invalid support email');
  }

  if (branding.support_phone && !isValidPhone(branding.support_phone)) {
    errors.push('Invalid support phone');
  }

  if (branding.support_url && !isValidUrl(branding.support_url)) {
    errors.push('Invalid support URL');
  }

  if (branding.theme && !['light', 'dark', 'auto'].includes(branding.theme)) {
    errors.push('Invalid theme (must be light, dark, or auto)');
  }

  return errors;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]{1,64}@[^\s@]{1,255}$/.test(email);
};

/**
 * Validate phone number (basic)
 */
export const isValidPhone = (phone: string): boolean => {
  return /^[+]?[\d\s\-().]+$/.test(phone) && phone.length >= 10;
};

/**
 * Validate URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Create a CSS string from branding config
 */
export const createBrandingCSS = (branding: BrandingConfig): string => {
  const css: string[] = [];

  if (branding.primary_color) {
    css.push(`--primary: ${branding.primary_color};`);
  }

  if (branding.secondary_color) {
    css.push(`--secondary: ${branding.secondary_color};`);
  }

  if (branding.accent_color) {
    css.push(`--accent: ${branding.accent_color};`);
  }

  if (branding.font_family) {
    css.push(`--font-family: ${branding.font_family};`);
  }

  return css.length > 0 ? `:root { ${css.join(' ')} }` : '';
};

/**
 * Export branding as JSON for backup/sharing
 */
export const exportBranding = (branding: BrandingConfig): string => {
  return JSON.stringify(branding, null, 2);
};

/**
 * Import branding from JSON string
 */
export const importBranding = (jsonString: string): BrandingConfig | null => {
  try {
    const config = JSON.parse(jsonString);
    const errors = validateBranding(config);

    if (errors.length > 0) {
      console.warn('Branding validation warnings:', errors);
    }

    return config as BrandingConfig;
  } catch (error) {
    console.error('Failed to parse branding JSON:', error);
    return null;
  }
};

/**
 * Get contrasting accent color for text on primary color
 */
export const getPrimaryForegroundColor = (primaryColor: string): string => {
  return getContrastColor(primaryColor, '#ffffff', '#000000');
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone;
};

/**
 * Generate CSS variable object from branding for use in Tailwind config
 */
export const generateTailwindColors = (branding: BrandingConfig): Record<string, string> => {
  const colors: Record<string, string> = {};

  if (branding.primary_color) {
    colors['primary'] = `var(--primary, ${branding.primary_color})`;
  }

  if (branding.secondary_color) {
    colors['secondary'] = `var(--secondary, ${branding.secondary_color})`;
  }

  if (branding.accent_color) {
    colors['accent'] = `var(--accent, ${branding.accent_color})`;
  }

  return colors;
};
