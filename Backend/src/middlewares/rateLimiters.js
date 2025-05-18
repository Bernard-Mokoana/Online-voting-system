import { rateLimit } from "express-rate-limit";

// Rate limit for registration
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 register requests per windowMs
  message:
    "Too many accounts created from this IP, please try again after an hour",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit for login
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message:
    "Too many login attempts from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit for refresh token
export const refreshTokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 refresh token requests per windowMs
  message: "Too many token refresh attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});
