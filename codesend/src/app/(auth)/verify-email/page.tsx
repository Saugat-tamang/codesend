"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { authService } from "@/services/auth.service";
import { ROUTES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils";
import styles from "@/components/auth/AuthForm.module.css";

type Status = "idle" | "verifying" | "success" | "error";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Spinner size="md" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<Status>(token ? "verifying" : "idle");
  const [message, setMessage] = useState<string | null>(null);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">(
    "idle"
  );

  useEffect(() => {
    if (!token) return;
    authService
      .verifyEmail({ token })
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setMessage(getErrorMessage(err));
      });
  }, [token]);

  async function handleResend() {
    if (!email) return;
    setResendState("sending");
    try {
      await authService.resendVerificationEmail({ email });
      setResendState("sent");
    } catch {
      setResendState("idle");
    }
  }

  if (status === "verifying") {
    return (
      <>
        <h1 className={styles.title}>Verifying your email</h1>
        <p className={styles.subtitle}>This will only take a second.</p>
        <Spinner size="md" />
      </>
    );
  }

  if (status === "success") {
    return (
      <>
        <h1 className={styles.title}>Email verified</h1>
        <p className={styles.subtitle}>
          Your email is confirmed. You&apos;re all set.
        </p>
        <Link href={ROUTES.dashboard}>
          <Button fullWidth size="lg">
            Go to dashboard
          </Button>
        </Link>
      </>
    );
  }

  if (status === "error") {
    return (
      <>
        <h1 className={styles.title}>Couldn&apos;t verify that link</h1>
        <p className={styles.subtitle}>
          {message ?? "This verification link is invalid or has expired."}
        </p>
        <Link href={ROUTES.login}>
          <Button variant="secondary" fullWidth size="lg">
            Back to log in
          </Button>
        </Link>
      </>
    );
  }

  // idle — no token in the URL, just registered
  return (
    <>
      <h1 className={styles.title}>Check your email</h1>
      <p className={styles.subtitle}>
        We sent a verification link{email ? ` to ${email}` : ""}. Click it to
        activate your account.
      </p>

      {resendState === "sent" ? (
        <div className={styles.successBox}>Verification email sent again.</div>
      ) : (
        <Button
          variant="secondary"
          fullWidth
          size="lg"
          isLoading={resendState === "sending"}
          disabled={!email}
          onClick={handleResend}
        >
          Resend email
        </Button>
      )}

      <p className={styles.backLine}>
        <Link href={ROUTES.login}>Back to log in</Link>
      </p>
    </>
  );
}
