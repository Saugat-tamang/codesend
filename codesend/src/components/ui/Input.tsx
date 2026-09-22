"use client";

import { InputHTMLAttributes, ReactNode, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
import styles from "./Input.module.css";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  /** e.g. a "Forgot password?" link rendered to the right of the label */
  labelAction?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, labelAction, id, className, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label className={styles.label} htmlFor={inputId}>
            {label}
          </label>
          {labelAction}
        </div>
        <input
          ref={ref}
          id={inputId}
          className={cn(styles.input, error && styles.inputError, className)}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className={styles.errorText}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
