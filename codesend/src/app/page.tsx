import { Button } from "@/components/ui/Button";
import { Code2 } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0D0E11] text-[#E7E9EE]">
      {/* Nav */}
      <header className="sticky top-0 z-30 backdrop-blur bg-[#0D0E11]/85 border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#3457D5] flex items-center justify-center">
                <Code2 size={13} className="text-white" />
              </div>
              <span className="font-bold text-[14px]">CodeSend</span>
              <span className="text-[10px] font-mono text-[#6A7080] bg-white/5 px-1.5 py-0.5 rounded">v1.0</span>
            </div>
            <nav className="hidden md:flex items-center gap-5 text-[13px] text-[#9198A1]">
              <span className="text-white font-medium">Quick Share</span>
              <span>My Shares</span>
              <span>Features</span>
              <span>Docs</span>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
                <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary">Sign up</Button>
            </Link>
          </div>
        </div>
      </header>
    </main>
  );
}