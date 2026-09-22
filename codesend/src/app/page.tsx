import { Button } from "@/components/Button";
import { ShareRow } from "@/components/ShareRow";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] p-10">
      <h1 className="text-2xl font-bold mb-1">Good morning, Saugat</h1>
      <p className="text-[var(--color-text-muted)] mb-6">What do you want to send?</p>

      <div className="flex gap-3 mb-8">
        <Button variant="primary">Send code</Button>
        <Button variant="secondary">Send files</Button>
      </div>

      <div className="flex flex-col gap-2">
        <ShareRow name="login.py" meta="Python" status="active" />
        <ShareRow name="api.zip" meta="4.1 MB" status="expiring" />
        <ShareRow name="config.json" meta="JSON" status="expired" />
      </div>
    </main>
  );
}