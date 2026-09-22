import { Button } from "@/components/Button";
import {
  Code2, FolderUp, Link2, Clock, ShieldCheck, Terminal,
  Eye, Download, Copy, QrCode, ArrowRight, Check, Moon,
} from "lucide-react";

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
            <Button variant="ghost">Log in</Button>
            <Button variant="primary">Sign up</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-14 pb-10">
        <div className="max-w-3xl mx-auto text-center mb-4">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {["No signup to view", "Expiring links", "80+ languages highlighted"].map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-[11px] font-medium text-[#9198A1] bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
                <span className="w-1 h-1 rounded-full bg-[#68C99A]" />
                {t}
              </span>
            ))}
          </div>

          <h1 className="text-[42px] sm:text-5xl font-bold tracking-tight mb-3 leading-[1.08]">
            Send code and files.
            <br />
            <span className="text-[#7C9CF0]">Open it anywhere.</span>
          </h1>
          <p className="text-[#9198A1] text-[15px] mb-8 max-w-md mx-auto">
            Paste it, drop it, share the link. Whoever gets it opens it straight away — no CodeSend account required.
          </p>
          <div className="flex gap-3 justify-center mb-3">
            <Button variant="primary">Start sharing free</Button>
            <Button variant="ghost">See how it works</Button>
          </div>
          <p className="text-[11px] text-[#6A7080]">Free to start · No credit card required</p>
        </div>
      </section>

      {/* Hero product panel */}
      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto rounded-xl overflow-hidden border border-white/10 shadow-2xl">
          {/* window chrome */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#131418] border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF6560]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#E3A83B]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#68C99A]" />
              </div>
              <span className="text-xs font-mono text-[#6A7080]">login.py · Python</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#6A7080]">
              <span>14 lines</span>
              <span>·</span>
              <span>398 bytes</span>
            </div>
          </div>

          <div className="grid md:grid-cols-[1fr_280px]">
            {/* Editor */}
            <div className="px-5 py-5 font-mono text-[13px] leading-7 overflow-x-auto border-b md:border-b-0 md:border-r border-white/10">
              <span className="text-[#7C9CF0]">from</span> django.http <span className="text-[#7C9CF0]">import</span> JsonResponse{"\n\n"}
              <span className="text-[#7C9CF0]">def</span> <span className="text-[#68C99A]">login</span>(request):{"\n"}
              {"    "}email = request.POST.get(<span className="text-[#E3B166]">"email"</span>){"\n"}
              {"    "}password = request.POST.get(<span className="text-[#E3B166]">"password"</span>){"\n"}
              {"    "}
              <span className="text-[#6A7080] italic"># Validate and issue a session token</span>{"\n"}
              {"    "}
              <span className="text-[#7C9CF0]">if</span> not email <span className="text-[#7C9CF0]">or</span> not password:{"\n"}
              {"        "}
              <span className="text-[#7C9CF0]">return</span> JsonResponse({"{"}<span className="text-[#E3B166]">"error"</span>: <span className="text-[#E3B166]">"Missing credentials"</span>{"}"}, status=400)
            </div>

            {/* Side panel: drop + recent */}
            <div className="bg-[#131418] px-4 py-4">
              <div className="border border-dashed border-white/15 rounded-lg py-6 text-center mb-4">
                <FolderUp size={18} className="mx-auto text-[#7C9CF0] mb-2" />
                <p className="text-[12px] font-semibold mb-0.5">Drop files to share</p>
                <p className="text-[11px] text-[#6A7080]">Any file type, up to your plan limit</p>
              </div>

              <p className="text-[10px] uppercase tracking-wide text-[#6A7080] mb-2 font-semibold">Active shares (2)</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[12px] bg-white/[0.03] rounded-md px-2.5 py-2">
                  <span className="font-mono">auth-middleware.go</span>
                  <span className="text-[#68C99A] text-[10px]">Active</span>
                </div>
                <div className="flex items-center justify-between text-[12px] bg-white/[0.03] rounded-md px-2.5 py-2">
                  <span className="font-mono">design-assets.zip</span>
                  <span className="text-[#E3A83B] text-[10px]">Expires today</span>
                </div>
              </div>
            </div>
          </div>

          {/* Link bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-[#131418] border-t border-white/10">
            <div className="flex items-center gap-2 text-[13px] font-mono text-[#7C9CF0]">
              <Link2 size={14} />
              codesend.app/s/7h2k9-quantum
            </div>
            <div className="flex items-center gap-4 text-[11px] text-[#9198A1]">
              <span className="flex items-center gap-1"><Clock size={12} /> Expires in 3d 22h</span>
              <button className="flex items-center gap-1 text-white"><Copy size={12} /> Copy link</button>
              <button className="flex items-center gap-1 text-white"><QrCode size={12} /> QR</button>
            </div>
          </div>
        </div>
      </section>

      {/* Why developers choose CodeSend */}
      <section className="px-6 py-16 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Built for how developers actually share</h2>
            <p className="text-[#9198A1] text-sm">Not a file drive with sharing bolted on — sharing is the whole product.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Eye, title: "No account to view", desc: "Recipients open the link and see it immediately — nothing to sign up for, nothing to install." },
              { icon: Code2, title: "Real syntax highlighting", desc: "Code reads the way it does in your editor, across 80+ languages, detected automatically." },
              { icon: Clock, title: "Expiry you control", desc: "Set a share to expire in hours, days, or never. The countdown is always visible, to you and the recipient." },
              { icon: Download, title: "Files and code, one flow", desc: "Drag in a zip, a folder, or a single script — same link, same simple viewer on the other end." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/[0.03] border border-white/10 rounded-xl p-5 hover:border-[#3457D5]/50 transition-colors">
                <Icon size={18} className="text-[#7C9CF0] mb-3" />
                <h3 className="font-semibold text-sm mb-1.5">{title}</h3>
                <p className="text-[13px] text-[#9198A1] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLI teaser — clearly marked as upcoming, not shipped */}
      <section className="px-6 py-16 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto rounded-xl overflow-hidden border border-white/10">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#131418] border-b border-white/10">
            <div className="flex items-center gap-2 text-xs font-mono text-[#6A7080]">
              <Terminal size={13} />
              terminal
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#E3A83B] bg-[#E3A83B]/10 px-2 py-0.5 rounded-full">
              Coming in V2
            </span>
          </div>
          <div className="px-5 py-5 font-mono text-[13px] leading-7 text-[#9198A1]">
            <span className="text-[#68C99A]">$</span> codesend send auth.log --expires 4d{"\n"}
            <span className="text-[#6A7080]">→ Uploading auth.log (18.4 KB)...</span>{"\n"}
            <span className="text-[#68C99A]">✓ Link ready: </span>
            <span className="text-[#7C9CF0]">codesend.app/s/a921d4</span>
          </div>
        </div>
        <p className="text-center text-[12px] text-[#6A7080] mt-3">
          The web app works today. A CLI for piping straight from your terminal is on the roadmap.
        </p>
      </section>

      {/* Simple, on purpose */}
      <section className="px-6 py-16 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Simple, on purpose</h2>
        </div>
        <div className="max-w-3xl mx-auto grid sm:grid-cols-3 gap-4">
          {[
            { icon: ShieldCheck, title: "Nothing to configure", desc: "No permissions to set up, no workspace to organize first." },
            { icon: Clock, title: "Expired means gone", desc: "Once a share expires, the link stops resolving. No lingering access." },
            { icon: Moon, title: "Light and dark", desc: "The app matches how you like to work, day or night." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center">
              <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                <Icon size={16} className="text-[#7C9CF0]" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{title}</h3>
              <p className="text-[13px] text-[#9198A1]">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto bg-[#3457D5] rounded-2xl px-8 py-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-3 text-white">Send your first share in under a minute</h2>
          <p className="text-white/75 mb-8 text-sm">Free to start. No credit card required.</p>
          <button className="bg-white text-[#3457D5] px-5 py-2.5 rounded-md text-sm font-semibold inline-flex items-center gap-2">
            Start sharing free <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-10">
        <div className="max-w-6xl mx-auto px-6 grid sm:grid-cols-4 gap-8 text-sm mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-[#3457D5] flex items-center justify-center">
                <Code2 size={13} className="text-white" />
              </div>
              <span className="font-bold">CodeSend</span>
            </div>
            <p className="text-[#6A7080] text-xs leading-relaxed">
              Send code and files, without unnecessary complexity.
            </p>
          </div>
          <div>
            <p className="font-semibold text-xs mb-3 text-[#9198A1]">Product</p>
            <div className="flex flex-col gap-2 text-[#6A7080] text-xs">
              <span>Quick Share</span>
              <span>My Shares</span>
              <span>Pricing</span>
            </div>
          </div>
          <div>
            <p className="font-semibold text-xs mb-3 text-[#9198A1]">Resources</p>
            <div className="flex flex-col gap-2 text-[#6A7080] text-xs">
              <span>Docs</span>
              <span>Changelog</span>
            </div>
          </div>
          <div>
            <p className="font-semibold text-xs mb-3 text-[#9198A1]">Company</p>
            <div className="flex flex-col gap-2 text-[#6A7080] text-xs">
              <span>About</span>
              <span>Contact</span>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-[#6A7080] pt-6 border-t border-white/[0.06]">
          <span>© 2026 CodeSend</span>
          <div className="flex gap-5">
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </footer>
    </main>
  );
}