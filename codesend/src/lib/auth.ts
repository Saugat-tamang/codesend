import { ROUTES } from "@/lib/constants";

/** Where to send someone right after a successful login/registration. */
export const DEFAULT_AUTHENTICATED_REDIRECT = ROUTES.dashboard;

/** Where to send someone who hits a protected route while logged out. */
export const DEFAULT_UNAUTHENTICATED_REDIRECT = ROUTES.login;

/**
 * Session state is derived from calling GET /auth/me (see auth.service.ts),
 * not read from a client-side cookie — the session cookie is httpOnly, so
 * JS never touches it directly. If you switch to bearer tokens, this is
 * the file to add getToken()/setToken()/clearToken() helpers to.
 */
