"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { authService } from "@/services/auth.service";
import { ROUTES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils";
import styles from "@/components/auth/AuthForm.module.css";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Spinner size="md" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <>
        <h1 className={styles.title}>Link no longer valid</h1>
        <p className={styles.subtitle}>
          This password reset link is missing or has expired. Request a new
          one to continue.
        </p>
        <Button
          fullWidth
          size="lg"
          onClick={() => router.push(ROUTES.forgotPassword)}
        >
          Request a new link
        </Button>
      </>
    );
  }

  if (done) {
    return (
      <>
        <h1 className={styles.title}>Password updated</h1>
        <p className={styles.subtitle}>
          Your password has been reset. You can log in with it now.
        </p>
        <Button fullWidth size="lg" onClick={() => router.push(ROUTES.login)}>
          Go to log in
        </Button>
      </>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setError(null);

    if (!password || password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (confirmPassword !== password) {
      setError("Passwords don't match.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({ token: token as string, password });
      setDone(true);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <h1 className={styles.title}>Set a new password</h1>
      <p className={styles.subtitle}>Choose a new password for your account.</p>

      {formError && <div className={styles.formError}>{formError}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <Input
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={error ?? undefined}
          />
        </div>

        <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
          Reset password
        </Button>
      </form>

      <p className={styles.backLine}>
        <Link href={ROUTES.login}>Back to log in</Link>
      </p>
    </>
  );
}
