import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BrandingConfig {
  primary_color?: string;
  secondary_color?: string;
  logo_url?: string;
  company_name?: string;
}

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [branding, setBranding] = useState<BrandingConfig>({});
  const navigate = useNavigate();

  // Load branding from headers
  React.useEffect(() => {
    const loadBranding = async () => {
      try {
        const response = await fetch("/api/branding");
        if (response.ok) {
          const data = await response.json();
          setBranding(data);
          // Apply custom colors
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
        }
      } catch (err) {
        console.log("Using default branding");
      }
    };

    loadBranding();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Login with Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message || "Login failed");
        setLoading(false);
        return;
      }

      if (!data.session) {
        setError("No session created");
        setLoading(false);
        return;
      }

      // Store token
      localStorage.setItem("sb-token", data.session.access_token);

      // Get user account
      const { data: accountData, error: accountError } = await supabase
        .from("account_members")
        .select("account_id, accounts!inner(*)")
        .eq("user_id", data.user?.id)
        .limit(1)
        .single();

      if (accountError || !accountData) {
        setError("Account not found");
        setLoading(false);
        return;
      }

      // Store account info
      localStorage.setItem("current_account_id", accountData.account_id);

      // Redirect to dashboard
      navigate("/portal/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: branding.primary_color
          ? `${branding.primary_color}15`
          : undefined,
      }}
    >
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          {branding.logo_url && (
            <img
              src={branding.logo_url}
              alt={branding.company_name || "Company Logo"}
              className="h-12 mx-auto"
            />
          )}
          <div>
            <CardTitle className="text-2xl">
              {branding.company_name || "Voxmation"}
            </CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              style={{
                backgroundColor: branding.primary_color,
              }}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <a href="/signup" className="underline hover:text-foreground">
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
