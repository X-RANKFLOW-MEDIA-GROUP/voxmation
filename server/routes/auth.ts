import { Router, Request, Response } from "express";
import { supabase } from "../supabase";
import jwt from "jsonwebtoken";

const router = Router();

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 *
 * Request body:
 * {
 *   email: string
 *   password: string
 * }
 *
 * Response:
 * {
 *   success: boolean
 *   token: string (JWT)
 *   accessToken?: string
 *   user?: { id, email, ... }
 *   accountId?: string
 *   message?: string
 * }
 */
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: "Missing email or password",
      message: "Email and password are required",
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]{1,64}@[^\s@]{1,255}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: "Invalid email format",
      message: "Please provide a valid email address",
    });
  }

  try {
    // Authenticate with Supabase
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: "Authentication service unavailable",
        message: "Please try again later",
      });
    }

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Handle authentication errors
    if (authError) {
      console.error("Supabase auth error:", authError);

      // Map common Supabase errors to user-friendly messages
      let message = "Invalid email or password";
      if (authError.message?.includes("Invalid login credentials")) {
        message = "Invalid email or password";
      } else if (authError.message?.includes("Email not confirmed")) {
        message = "Please verify your email address before logging in";
      } else if (authError.message?.includes("User not found")) {
        message = "No account found with this email";
      }

      return res.status(401).json({
        success: false,
        error: authError.code || "AUTHENTICATION_FAILED",
        message,
      });
    }

    if (!data.session || !data.user) {
      return res.status(401).json({
        success: false,
        error: "No session created",
        message: "Authentication failed. Please try again.",
      });
    }

    // Get user's account information
    const { data: accountData, error: accountError } = await supabase
      .from("account_members")
      .select("account_id, accounts!inner(id, name, type)")
      .eq("user_id", data.user.id)
      .limit(1)
      .single();

    if (accountError || !accountData) {
      console.error("Account lookup error:", accountError);
      // User authenticated but has no account - might be first login
      // Continue with user token only
    }

    // Create a JWT token with custom claims
    const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
    const customToken = jwt.sign(
      {
        sub: data.user.id,
        email: data.user.email,
        accountId: accountData?.account_id || null,
        iat: Math.floor(Date.now() / 1000),
      },
      jwtSecret,
      { expiresIn: "24h" }
    );

    // Return success response with token
    return res.status(200).json({
      success: true,
      token: customToken,
      accessToken: data.session.access_token, // Supabase token
      user: {
        id: data.user.id,
        email: data.user.email,
        user_metadata: data.user.user_metadata || {},
      },
      accountId: accountData?.account_id || null,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    return res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: `An error occurred during login: ${message}`,
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (invalidate token)
 */
router.post("/logout", async (req: Request, res: Response) => {
  try {
    // Logout from Supabase
    if (supabase) {
      await supabase.auth.signOut();
    }

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      success: false,
      error: "LOGOUT_FAILED",
      message: "An error occurred during logout",
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh authentication token
 */
router.post("/refresh", async (req: Request, res: Response) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({
      success: false,
      error: "Missing refresh token",
      message: "Refresh token is required",
    });
  }

  try {
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: "Authentication service unavailable",
      });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    } as any);

    if (error || !data.session) {
      return res.status(401).json({
        success: false,
        error: "Token refresh failed",
        message: "Please log in again",
      });
    }

    // Create new JWT token
    const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
    const customToken = jwt.sign(
      {
        sub: data.user?.id,
        email: data.user?.email,
        iat: Math.floor(Date.now() / 1000),
      },
      jwtSecret,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      success: true,
      token: customToken,
      accessToken: data.session.access_token,
      message: "Token refreshed",
    });
  } catch (error) {
    console.error("Token refresh error:", error);

    return res.status(500).json({
      success: false,
      error: "REFRESH_FAILED",
      message: "An error occurred while refreshing token",
    });
  }
});

/**
 * POST /api/auth/register
 * Register new user
 *
 * Request body:
 * {
 *   email: string
 *   password: string
 *   fullName?: string
 *   companyName?: string
 * }
 */
router.post("/register", async (req: Request, res: Response) => {
  const { email, password, fullName, companyName } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: "Missing email or password",
      message: "Email and password are required",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: "Password too short",
      message: "Password must be at least 6 characters long",
    });
  }

  try {
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: "Authentication service unavailable",
      });
    }

    // Sign up user with Supabase
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || "",
          company_name: companyName || "",
        },
      },
    });

    if (signUpError) {
      console.error("Signup error:", signUpError);

      let message = "Registration failed";
      if (signUpError.message?.includes("already registered")) {
        message = "Email already registered";
      } else if (signUpError.message?.includes("invalid")) {
        message = "Invalid email format";
      }

      return res.status(400).json({
        success: false,
        error: signUpError.code || "SIGNUP_FAILED",
        message,
      });
    }

    if (!data.user) {
      return res.status(400).json({
        success: false,
        error: "User not created",
        message: "An error occurred during registration",
      });
    }

    return res.status(201).json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      message: "Registration successful. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "An error occurred during registration",
    });
  }
});

export default router;
