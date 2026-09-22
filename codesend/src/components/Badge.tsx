// src/components/Badge.tsx
export function Badge({ status }: { status: "active" | "expiring" | "expired" }) {
  const config = {
    active: { label: "Active", bg: "bg-[var(--color-success-soft)]", text: "text-[var(--color-success)]" },
    expiring: { label: "Expiring soon", bg: "bg-[var(--color-warn-soft)]", text: "text-[var(--color-warn)]" },
    expired: { label: "Expired", bg: "bg-[var(--color-surface-2)]", text: "text-[var(--color-text-faint)]" },
  };

  const c = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.text.replace("text-", "bg-")}`} />
      {c.label}
    </span>
  );
}