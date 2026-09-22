import { cn } from "@/lib/utils";
import styles from "./Spinner.module.css";

export function Spinner({
  size = "sm",
  className,
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      className={cn(styles.spinner, styles[size], className)}
      role="status"
      aria-label="Loading"
    />
  );
}
