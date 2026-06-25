# Login & Authentication Usage Examples

## Quick Start

### 1. Protected Page Example

```typescript
// src/pages/portal/Dashboard.tsx
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Dashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <h1>Welcome, {user?.email}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

// In App.tsx
<Route 
  path="/portal/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

### 2. Login with Redirect

```typescript
// src/components/LoginForm.tsx
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const LoginForm = () => {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate("/portal/dashboard");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input 
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
};
```

### 3. Header with User Info

```typescript
// src/components/Header.tsx
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="flex justify-between items-center p-4">
      <Link to="/">Logo</Link>
      
      {isAuthenticated ? (
        <div className="flex items-center gap-4">
          <span>{user?.email}</span>
          <button 
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Logout
          </button>
        </div>
      ) : (
        <Link to="/login" className="px-4 py-2 bg-blue-500 text-white rounded">
          Login
        </Link>
      )}
    </header>
  );
};
```

## Advanced Examples

### 1. API Calls with Authentication

```typescript
// src/lib/api.ts
import { useAuth } from "@/hooks/useAuth";

export const useApiRequest = () => {
  const { token, logout } = useAuth();

  const request = async (
    url: string, 
    options: RequestInit = {}
  ) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    // Handle 401 - token expired
    if (response.status === 401) {
      logout();
      throw new Error("Session expired");
    }

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  };

  return request;
};

// Usage in component
export const UserSettings = () => {
  const request = useApiRequest();
  const [loading, setLoading] = useState(false);

  const saveSettings = async (settings: any) => {
    setLoading(true);
    try {
      const result = await request("/api/user/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
      console.log("Settings saved:", result);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setLoading(false);
    }
  };

  return <button onClick={() => saveSettings({})}>Save</button>;
};
```

### 2. Register New User

```typescript
// src/pages/Register.tsx
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Register = () => {
  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    companyName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await register(
      form.email,
      form.password,
      form.fullName,
      form.companyName
    );

    if (success) {
      navigate("/login", {
        state: { 
          message: "Registration successful! Please log in." 
        },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <Input
        type="email"
        placeholder="Email"
        required
        value={form.email}
        onChange={(e) => setForm({...form, email: e.target.value})}
      />

      <Input
        type="password"
        placeholder="Password"
        required
        value={form.password}
        onChange={(e) => setForm({...form, password: e.target.value})}
      />

      <Input
        type="text"
        placeholder="Full Name"
        value={form.fullName}
        onChange={(e) => setForm({...form, fullName: e.target.value})}
      />

      <Input
        type="text"
        placeholder="Company Name"
        value={form.companyName}
        onChange={(e) => setForm({...form, companyName: e.target.value})}
      />

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
};
```

### 3. Role-Based Access Control

```typescript
// src/hooks/useRoles.ts
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

export const useRoles = () => {
  const { user, token } = useAuth();
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      try {
        const response = await fetch("/api/user/roles", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setRoles(data.roles || []);
      } catch (error) {
        console.error("Failed to fetch roles:", error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [token, user]);

  const hasRole = (role: string) => roles.includes(role);
  const isAdmin = () => hasRole("admin");
  const isManager = () => hasRole("manager") || isAdmin();

  return { roles, loading, hasRole, isAdmin, isManager };
};

// Usage
export const AdminPanel = () => {
  const { isAdmin } = useRoles();

  if (!isAdmin()) {
    return <div>Access Denied</div>;
  }

  return <div>Admin Dashboard</div>;
};
```

### 4. Conditional Rendering Based on Auth State

```typescript
// src/components/AuthGate.tsx
import { useAuth } from "@/hooks/useAuth";
import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface AuthGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  loading?: ReactNode;
}

export const AuthGate = ({ 
  children, 
  fallback = null,
  loading = <Loader2 className="animate-spin" />
}: AuthGateProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <>{loading}</>;
  }

  return isAuthenticated ? <>{children}</> : <>{fallback}</>;
};

// Usage
<AuthGate
  loading={<div>Loading...</div>}
  fallback={<div>Please log in to see this content</div>}
>
  <VipContent />
</AuthGate>
```

### 5. Persistent Login State

```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const AuthContext = createContext(null);

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Simulate checking stored token on app startup
    setTimeout(() => setIsInitialized(true), 500);
  }, []);

  if (!isInitialized) {
    return <div>Initializing...</div>;
  }

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
```

### 6. Login with Remember Me

```typescript
// src/pages/LoginWithRemember.tsx
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export const LoginWithRemember = () => {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    const success = await login(email, password);
    
    if (success && rememberMe) {
      // Store email for next time (securely!)
      localStorage.setItem("lastEmail", email);
    }
  };

  // Load remembered email on mount
  useState(() => {
    const lastEmail = localStorage.getItem("lastEmail");
    if (lastEmail) {
      setEmail(lastEmail);
    }
  }, []);

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
      {error && <div className="error">{error}</div>}
      
      <input 
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />

      <label className="flex items-center gap-2">
        <Checkbox
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
        />
        Remember me
      </label>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
};
```

### 7. Session Management with Token Refresh

```typescript
// src/hooks/useSessionManager.ts
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const TOKEN_EXPIRY_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

export const useSessionManager = () => {
  const { token, refreshToken, logout } = useAuth();

  useEffect(() => {
    if (!token) return;

    const interval = setInterval(async () => {
      // Decode JWT to check expiry
      try {
        const parts = token.split(".");
        const payload = JSON.parse(atob(parts[1]));
        const expiresAt = payload.exp * 1000;
        const now = Date.now();
        const timeUntilExpiry = expiresAt - now;

        // If less than 10 minutes until expiry, refresh
        if (timeUntilExpiry < 10 * 60 * 1000) {
          const refreshTokenStr = localStorage.getItem("refresh_token");
          if (refreshTokenStr) {
            const success = await refreshToken(refreshTokenStr);
            if (!success) {
              logout();
            }
          }
        }
      } catch (error) {
        console.error("Session check failed:", error);
      }
    }, TOKEN_EXPIRY_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [token, refreshToken, logout]);
};

// Usage in main App component
export const App = () => {
  useSessionManager();
  // ... rest of app
};
```

## White-Label Login Examples

### 1. Custom Branding Colors

```typescript
// src/pages/CustomBrandedLogin.tsx
import { Login } from "@/pages/Login";

// The Login component automatically detects branding from:
// - Subdomain: clienta.voxmation.com
// - Custom domain: crm.clienta.com
// - Branding config in database

export const BrandedLoginPage = () => {
  return <Login />;
};
```

### 2. Dynamic Branding Provider

```typescript
// src/hooks/useBranding.ts
import { useEffect, useState } from "react";

export interface Branding {
  primary_color?: string;
  secondary_color?: string;
  logo_url?: string;
  company_name?: string;
  favicon_url?: string;
}

export const useBranding = () => {
  const [branding, setBranding] = useState<Branding>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const response = await fetch("/api/branding");
        if (response.ok) {
          const data = await response.json();
          setBranding(data);

          // Apply to document
          if (data.primary_color) {
            document.documentElement.style.setProperty(
              "--primary",
              data.primary_color
            );
          }
        }
      } catch (error) {
        console.warn("Failed to load branding:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBranding();
  }, []);

  return { branding, loading };
};

// Usage
export const ThemedApp = () => {
  const { branding } = useBranding();

  return (
    <div style={{ 
      backgroundColor: branding.primary_color ? `${branding.primary_color}15` : undefined
    }}>
      {/* App content */}
    </div>
  );
};
```

## Testing

```typescript
// src/__tests__/useAuth.test.ts
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "@/hooks/useAuth";

describe("useAuth hook", () => {
  it("should login with email and password", async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const success = await result.current.login(
        "test@example.com",
        "password123"
      );
      expect(success).toBe(true);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe("test@example.com");
  });

  it("should logout", async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
  });
});
```

## Common Patterns

### Pattern 1: Auth Wrapper Component
```typescript
export const AuthRequired = ({ children, requiredRole?: string }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};
```

### Pattern 2: Loading Skeleton
```typescript
export const LoginLoadingSkeleton = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-10 w-full" />
  </div>
);
```

### Pattern 3: Error Boundary
```typescript
export const AuthErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const { error } = useAuth();

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return children;
};
```
