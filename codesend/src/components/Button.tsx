export function Button({children, variant = "primary", onClick}: {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "ghost";
    onClick?: () => void;
}) {
    const styles = {
        primary: "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]",
        secondary: "bg-[var(--color-surface)] border border-[var(--color-border-strong)] hover:bg-[var(--color-surface-2)]",
        ghost: "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]",
    };

    return (
        <button onClick={onClick} className={`px-4 py-2.5 rounded-md text-sm font-semibold transition-colors ${styles[variant]}`}>{children}</button>
    );
}