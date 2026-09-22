"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { DEFAULT_AUTHENTICATED_REDIRECT } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils";
import styles from "./AuthForm.module.css";

interface FieldErrors {
  email?: string;
  password?: string;
}

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!email.trim()) next.email = "Enter your email.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login({ email, password });
      router.push(DEFAULT_AUTHENTICATED_REDIRECT);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <h1 className={styles.title}>Log in</h1>
      <p className={styles.subtitle}>
        Welcome back — enter your details to continue.
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
            error={errors.email}
          />
        </div>

        <div className={styles.field}>
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            labelAction={
              <Link
                href={ROUTES.forgotPassword}
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  textDecoration: "none",
                }}
              >
                Forgot password?
              </Link>
            }
          />
        </div>

        <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
          Log in
        </Button>
      </form>

      <div className={styles.divider}>or</div>

      <Button
        type="button"
        variant="secondary"
        fullWidth
        size="lg"
        onClick={() => {
          // TODO: wire to your OAuth provider
        }}
      >
        Continue with GitHub
      </Button>

      <p className={styles.switchLine}>
        Don&apos;t have an account? <Link href={ROUTES.register}>Sign up</Link>
      </p>
    </>
  );
}
