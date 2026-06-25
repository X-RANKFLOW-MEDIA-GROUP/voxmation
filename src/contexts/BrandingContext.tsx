import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface Branding {
  primary_color?: string;
  secondary_color?: string;
  logo_url?: string;
  company_name?: string;
  custom_css?: string;
  support_email?: string;
  support_phone?: string;
}

const BrandingContext = createContext<Branding | null>(null);

export const useBranding = () => {
  const context = useContext(BrandingContext);
  return context || {};
};

export const BrandingProvider = ({ children }: { children: ReactNode }) => {
  const [branding, setBranding] = useState<Branding | null>(null);

  useEffect(() => {
    const loadBranding = async () => {
      try {
        const response = await fetch("/api/branding");
        if (response.ok) {
          const data = await response.json();
          setBranding(data);

          // Inject CSS variables
          const root = document.documentElement;

          if (data.primary_color) {
            root.style.setProperty("--primary", data.primary_color);
          }
          if (data.secondary_color) {
            root.style.setProperty("--secondary", data.secondary_color);
          }

          // Inject custom CSS
          if (data.custom_css) {
            const style = document.createElement("style");
            style.textContent = data.custom_css;
            document.head.appendChild(style);
          }

          // Set page title
          if (data.company_name) {
            document.title = `${data.company_name} - Dashboard`;
          }
        }
      } catch (error) {
        console.error("Error loading branding:", error);
      }
    };

    loadBranding();
  }, []);

  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  );
};
