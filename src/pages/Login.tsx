import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Branding configuration from API
 */
interface BrandingConfig {
  primary_color?: string;
  secondary_color?: string;
  tertiary_color?: string;
  logo_url?: string;
  logo_dark_url?: string;
  favicon_url?: string;
  company_name?: string;
  company_description?: string;
  footer_text?: string;
  support_email?: string;
  support_phone?: string;
}

/**
 * Login form schema with validation
 */
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login = () => {
  const navigate = useNavigate();
  const [branding, setBranding] = useState<BrandingConfig>({});
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  /**
   * Load branding configuration automatically from API
   * Detects white label settings by hostname/subdomain
   */
  useEffect(() => {
    const loadBranding = async () => {
      try {
        const response = await fetch("/api/branding", {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setBranding(data);

          // Apply theme colors to CSS variables
          if (data.primary_color) {
            document.documentElement.style.setProperty(
              "--primary",
              data.primary_color
            );
          }
          if (data.secondary_color) {
            document.documentElement.style.setProperty(
              "--secondary",
              data.secondary_color
            );
          }

          // Update favicon if provided
          if (data.favicon_url) {
            const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
            if (link) {
              link.href = data.favicon_url;
            }
          }

          // Update page title
          if (data.company_name) {
            document.title = `Sign in to ${data.company_name}`;
          }
        }
      } catch (err) {
        console.warn("Failed to load branding configuration, using defaults");
      }
    };

    loadBranding();
  }, []);

  /**
   * Handle login form submission
   * POST to /api/auth/login with email and password
   */
  const onSubmit = async (values: LoginFormValues) => {
    setGeneralError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error messages from API
        setGeneralError(
          data.message ||
          data.error ||
          "Login failed. Please check your credentials."
        );
        setIsLoading(false);
        return;
      }

      // Extract token from response (supports multiple token field names)
      const token = data.token || data.access_token || data.accessToken;

      if (!token) {
        setGeneralError("No authentication token received");
        setIsLoading(false);
        return;
      }

      // Store token in localStorage
      localStorage.setItem("auth_token", token);

      // Optionally store user info if provided
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Store account ID if provided (for white label support)
      if (data.accountId || data.account_id) {
        localStorage.setItem("account_id", data.accountId || data.account_id);
      }

      // Redirect to portal dashboard
      navigate("/portal/dashboard", { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      setGeneralError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again."
      );
      setIsLoading(false);
    }
  };

  // Determine primary color for buttons and accents
  const primaryColor = branding.primary_color || "#37ca37";
  const secondaryColor = branding.secondary_color || "#188bf6";
  const backgroundColor = branding.primary_color
    ? `${branding.primary_color}15`
    : undefined;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor }}
    >
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center space-y-4 pb-6">
          {/* Company Logo */}
          {branding.logo_url && (
            <div className="flex justify-center mb-2">
              <img
                src={branding.logo_url}
                alt={branding.company_name || "Company Logo"}
                className="h-14 object-contain"
                onError={(e) => {
                  // Hide image if it fails to load
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}

          {/* Title and Description */}
          <div>
            <CardTitle className="text-3xl font-bold">
              {branding.company_name || "Voxmation"}
            </CardTitle>
            {branding.company_description ? (
              <CardDescription className="text-base mt-2">
                {branding.company_description}
              </CardDescription>
            ) : (
              <CardDescription className="text-base mt-2">
                Sign in to your account
              </CardDescription>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* General Error Alert */}
              {generalError && (
                <Alert variant="destructive" className="border-red-300">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{generalError}</AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        disabled={isLoading}
                        className="h-10 border border-gray-300"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Password Field with Toggle */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-sm font-semibold">
                        Password
                      </FormLabel>
                      <a
                        href="/forgot-password"
                        className="text-xs hover:underline"
                        style={{ color: primaryColor }}
                      >
                        Forgot password?
                      </a>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          disabled={isLoading}
                          className="h-10 border border-gray-300 pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-10 font-semibold text-white"
                disabled={isLoading}
                style={{
                  backgroundColor: primaryColor,
                }}
              >
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>

              {/* Signup Link */}
              <div className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <a
                  href="/signup"
                  className="font-semibold hover:underline"
                  style={{ color: primaryColor }}
                >
                  Create one
                </a>
              </div>

              {/* Support Contact */}
              {branding.support_email && (
                <div className="text-center text-xs text-gray-500 pt-2 border-t">
                  Need help?{" "}
                  <a
                    href={`mailto:${branding.support_email}`}
                    className="hover:underline"
                    style={{ color: primaryColor }}
                  >
                    Contact support
                  </a>
                </div>
              )}
            </form>
          </Form>
        </CardContent>

        {/* Footer */}
        {branding.footer_text && (
          <div className="border-t bg-gray-50 px-6 py-3 text-center text-xs text-gray-600">
            {branding.footer_text}
          </div>
        )}
      </Card>
    </div>
  );
};
