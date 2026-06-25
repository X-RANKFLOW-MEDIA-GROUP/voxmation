import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredAccountId?: string;
}

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 * Redirects to login if user is not authenticated
 *
 * Usage:
 * ```tsx
 * <ProtectedRoute>
 *   <DashboardPage />
 * </ProtectedRoute>
 * ```
 */
export const ProtectedRoute = ({
  children,
  requiredAccountId,
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, accountId } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check account ID if required
  if (requiredAccountId && accountId !== requiredAccountId) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
