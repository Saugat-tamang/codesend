"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authService } from "@/services/auth.service";
import { ROUTES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils";
import styles from "./AuthForm.module.css";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setError(null);

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  if (sent) {
    return (
      <>
        <h1 className={styles.title}>Check your email</h1>
        <p className={styles.subtitle}>
          If an account exists for {email}, we&apos;ve sent a link to reset
          your password.
        </p>
        <p className={styles.backLine}>
          <Link href={ROUTES.login}>Back to log in</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className={styles.title}>Reset your password</h1>
      <p className={styles.subtitle}>
        Enter your email and we&apos;ll send you a link to reset it.
      </p>

      {formError && <div className={styles.formError}>{formError}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error ?? undefined}
          />
        </div>

        <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
          Send reset link
        </Button>
      </form>

      <p className={styles.backLine}>
        <Link href={ROUTES.login}>Back to log in</Link>
      </p>
    </>
  );
}
