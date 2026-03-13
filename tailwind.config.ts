import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        // Brand Colors
        brand: {
          primary: "hsl(var(--color-brand-primary))",
          secondary: "hsl(var(--color-brand-secondary))",
          accent: "hsl(var(--color-brand-accent))",
        },
        // Background Colors
        bg: {
          body: "hsl(var(--color-bg-body))",
          surface: "hsl(var(--color-bg-surface))",
          subtle: "hsl(var(--color-bg-subtle))",
        },
        // Text Colors
        text: {
          primary: "hsl(var(--color-text-primary))",
          secondary: "hsl(var(--color-text-secondary))",
          inverse: "hsl(var(--color-text-inverse))",
        },
        // Border Colors
        border: {
          subtle: "hsl(var(--color-border-subtle))",
          strong: "hsl(var(--color-border-strong))",
        },
        // Action Colors
        action: {
          primary: "hsl(var(--color-action-primary))",
          "primary-hover": "hsl(var(--color-action-primary-hover))",
          secondary: "hsl(var(--color-action-secondary))",
          "secondary-hover": "hsl(var(--color-action-secondary-hover))",
        },
        // Feedback Colors
        feedback: {
          success: "hsl(var(--color-feedback-success))",
          error: "hsl(var(--color-feedback-error))",
          warning: "hsl(var(--color-feedback-warning))",
        },
        // Legacy support
        silver: "hsl(var(--color-text-secondary))",
        "silver-bright": "hsl(var(--color-border-strong))",
        teal: "hsl(var(--color-brand-accent))",
        warning: "hsl(var(--color-brand-accent))",
        "demo-accent": "hsl(var(--color-brand-secondary))",
        "demo-purple": "hsl(var(--color-brand-primary))",
        "demo-green": "hsl(var(--color-feedback-success))",
        // shadcn compatibility
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        ring: "hsl(var(--ring))",
        input: "hsl(var(--input))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
