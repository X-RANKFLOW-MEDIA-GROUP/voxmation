import rateLimit from "express-rate-limit";

// Rate limiter for job applications
export const applicationRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || "3600000"), // 1 hour
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "5"), // 5 requests per window
  keyGenerator: (req, _res) => {
    // Use forwarded IP if behind proxy
    return (
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.ip ||
      "unknown"
    );
  },
  message: {
    error: "Too many applications submitted. Please try again later.",
    retryAfter: "Check back in 1 hour.",
  },
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  skip: (_req, _res) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === "development";
  },
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message:
        "Too many applications submitted from this IP. Please try again later.",
      error: "RATE_LIMIT_EXCEEDED",
    });
  },
});

// Rate limiter for admin login attempts
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts
  keyGenerator: (req, _res) => {
    return req.body?.email || req.ip || "unknown";
  },
  message: {
    error: "Too many login attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many login attempts. Please try again in 15 minutes.",
      error: "LOGIN_RATE_LIMIT_EXCEEDED",
    });
  },
});
