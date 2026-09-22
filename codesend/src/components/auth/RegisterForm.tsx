"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils";
import styles from "./AuthForm.module.css";

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!name.trim()) next.name = "Enter your name.";
    if (!email.trim()) next.email = "Enter your email.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email.";
    if (!password) next.password = "Enter a password.";
    else if (password.length < 8) next.password = "Use at least 8 characters.";
    if (confirmPassword !== password)
      next.confirmPassword = "Passwords don't match.";
    if (!agreed) next.terms = "Accept the terms to continue.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setIsLoading(true);
    try {
      await register({ name, email, password });
      router.push(`${ROUTES.verifyEmail}?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <h1 className={styles.title}>Create your account</h1>
      <p className={styles.subtitle}>
        Start sharing code and files in a couple of minutes.
      </p>

      {formError && <div className={styles.formError}>{formError}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <Input
            label="Name"
            type="text"
            autoComplete="name"
            placeholder="Ada Lovelace"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />
        </div>

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
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
        </div>

        <div className={styles.field}>
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
          />
        </div>

        <div className={styles.checkboxRow}>
          <input
            id="terms"
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <label htmlFor="terms">
            I agree to the <Link href="/terms">Terms of Service</Link> and{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </label>
        </div>
        {errors.terms && (
          <p
            style={{
              color: "var(--danger)",
              fontSize: 12.5,
              margin: "0 0 16px",
            }}
          >
            {errors.terms}
          </p>
        )}

        <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
          Create account
        </Button>
      </form>

      <p className={styles.switchLine}>
        Already have an account? <Link href={ROUTES.login}>Log in</Link>
      </p>
    </>
  );
}
