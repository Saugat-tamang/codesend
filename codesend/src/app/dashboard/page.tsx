"use client";

import { useAuth } from "@/hooks/useAuth";

// Placeholder — replace with the real dashboard home
// (recent shares, quick upload, usage, etc).
export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <main style={{ padding: 40, color: "var(--text)" }}>
      <p>Welcome back{user ? `, ${user.name}` : ""}.</p>
    </main>
  );
}
