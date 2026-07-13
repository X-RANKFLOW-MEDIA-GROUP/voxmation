import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2 } from "lucide-react";

const DEMO_CREDENTIALS = {
  email: "admin@voxmation.com",
  password: "142522",
};

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAdminAuth();
  const navigate = useNavigate();

  const useDemoCredentials = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      navigate("/admin/applications");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-white mb-2">
            Voxmation
          </h1>
          <p className="text-slate-400 mb-3">Admin Dashboard</p>
          <div className="inline-block bg-blue-500/20 border border-blue-500/40 rounded-full px-3 py-1">
            <span className="text-xs text-blue-400 font-medium">Demo Account Available</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 backdrop-blur">
          <h2 className="text-2xl font-bold text-white mb-6">Admin Login</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@voxmation.com"
                required
                disabled={loading}
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500"
              />
            </div>

            {/* Demo Credentials Helper */}
            <div className="text-center">
              <button
                type="button"
                onClick={useDemoCredentials}
                disabled={loading}
                className="text-xs text-blue-400 hover:text-blue-300 underline disabled:opacity-50"
              >
                Use Demo Credentials
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex gap-2">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Info Box */}
          <div className="mt-8 pt-8 border-t border-slate-700">
            <p className="text-xs text-slate-400 text-center mb-3">
              Demo Credentials:
            </p>
            <div className="bg-slate-700/30 rounded p-3 text-xs text-slate-300 space-y-1 font-mono">
              <p>Email: {DEMO_CREDENTIALS.email}</p>
              <p>Password: {DEMO_CREDENTIALS.password}</p>
            </div>
            <p className="text-xs text-slate-500 text-center mt-3 italic">
              Click "Use Demo Credentials" above to auto-fill
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-slate-500 text-sm">
          <p>Admin Access Only</p>
        </div>
      </div>
    </div>
  );
}
