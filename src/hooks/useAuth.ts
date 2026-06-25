import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

/**
 * User object from authentication
 */
export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
}

/**
 * Authentication state
 */
export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  accountId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

/**
 * useAuth Hook
 * Manages authentication state and provides login/logout/register methods
 *
 * Usage:
 * ```tsx
 * const { user, isAuthenticated, login, logout } = useAuth();
 *
 * if (!isAuthenticated) {
 *   return <Navigate to="/login" />;
 * }
 * ```
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    accountId: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  /**
   * Initialize auth state from localStorage
   */
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem("auth_token");
        const userJson = localStorage.getItem("user");
        const accountId = localStorage.getItem("account_id");

        if (token && userJson) {
          const user = JSON.parse(userJson);
          setState({
            user,
            token,
            accountId,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          });
        } else {
          setState((prev) => ({
            ...prev,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Failed to restore session",
        }));
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login with email and password
   */
  const login = useCallback(
    async (email: string, password: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || data.error || "Login failed"
          );
        }

        const token = data.token || data.access_token;

        // Store in localStorage
        localStorage.setItem("auth_token", token);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        if (data.accountId) {
          localStorage.setItem("account_id", data.accountId);
        }

        // Update state
        setState({
          user: data.user,
          token,
          accountId: data.accountId || null,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });

        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Login failed";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
        }));
        return false;
      }
    },
    []
  );

  /**
   * Register new user
   */
  const register = useCallback(
    async (
      email: string,
      password: string,
      fullName?: string,
      companyName?: string
    ) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            fullName,
            companyName,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || data.error || "Registration failed"
          );
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
        }));

        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Registration failed";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
        }));
        return false;
      }
    },
    []
  );

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Call logout endpoint (optional)
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.token}`,
        },
      }).catch((error) => {
        console.warn("Logout API call failed:", error);
        // Continue with local logout anyway
      });

      // Clear localStorage
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      localStorage.removeItem("account_id");

      // Clear state
      setState({
        user: null,
        token: null,
        accountId: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });

      // Redirect to login
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, [state.token, navigate]);

  /**
   * Refresh authentication token
   */
  const refreshToken = useCallback(
    async (refreshToken: string) => {
      try {
        const response = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refresh_token: refreshToken,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error("Token refresh failed");
        }

        const newToken = data.token || data.access_token;
        localStorage.setItem("auth_token", newToken);

        setState((prev) => ({
          ...prev,
          token: newToken,
        }));

        return true;
      } catch (error) {
        console.error("Token refresh error:", error);
        // Clear auth on refresh failure
        logout();
        return false;
      }
    },
    [logout]
  );

  /**
   * Get authorization header
   */
  const getAuthHeader = useCallback(() => {
    return state.token ? { Authorization: `Bearer ${state.token}` } : {};
  }, [state.token]);

  return {
    // State
    user: state.user,
    token: state.token,
    accountId: state.accountId,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    error: state.error,

    // Methods
    login,
    logout,
    register,
    refreshToken,
    getAuthHeader,
  };
};
