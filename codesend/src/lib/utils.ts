import { ApiError } from "@/lib/api";

type ClassValue = string | number | null | undefined | false;

/** Joins truthy class names together. Swap for clsx/tailwind-merge if the project already uses them. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Turns any thrown value into a safe, user-facing message. */
export function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}
