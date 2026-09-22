// src/components/ShareRow.tsx
import { Card } from "./Card";
import { Badge } from "./Badge";

export function ShareRow({
  name,
  meta,
  status,
}: {
  name: string;
  meta: string;
  status: "active" | "expiring" | "expired";
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-sm">{name}</div>
          <div className="text-xs text-[var(--color-text-muted)]">{meta}</div>
        </div>
        <Badge status={status} />
      </div>
    </Card>
  );
}