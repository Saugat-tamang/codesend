import { apiFetch } from "@/lib/api";
import type {
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  User,
  VerifyEmailPayload,
} from "@/types/auth";

export const authService = {
  login: (payload: LoginPayload) =>
    apiFetch<{ user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  register: (payload: RegisterPayload) =>
    apiFetch<{ user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  logout: () => apiFetch<void>("/auth/logout", { method: "POST" }),

  /** Resolves the current session from the httpOnly cookie, or 401s. */
  me: () => apiFetch<{ user: User }>("/auth/me", { method: "GET" }),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    apiFetch<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  resetPassword: (payload: ResetPasswordPayload) =>
    apiFetch<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  verifyEmail: (payload: VerifyEmailPayload) =>
    apiFetch<{ message: string }>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  resendVerificationEmail: (payload: ForgotPasswordPayload) =>
    apiFetch<{ message: string }>("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
