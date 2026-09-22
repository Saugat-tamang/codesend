'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isAuth = pathname === '/signin' || pathname === '/login';

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? 'rgba(5,5,7,0.92)' : 'rgba(5,5,7,0.4)',
          backdropFilter: 'blur(24px)',
          borderBottom: scrolled ? '1px solid rgba(0,255,136,0.08)' : '1px solid transparent',
        }}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{
          background: 'linear-gradient(90deg, transparent 0%, #00ff88 30%, #00d4ff 70%, transparent 100%)',
          opacity: scrolled ? 0.6 : 0.3,
          transition: 'opacity 0.5s',
        }} />

        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 group">
            <span className="text-xl font-black" style={{ fontFamily: 'JetBrains Mono', color: '#00ff88', transition: 'filter 0.3s' }}>
              {'</'}
            </span>
            <span className="text-xl font-black tracking-tight text-white">Code</span>
            <span className="text-xl font-black tracking-tight" style={{ color: '#00ff88' }}>Send</span>
            <span className="text-xl font-black" style={{ fontFamily: 'JetBrains Mono', color: '#00ff88' }}>{'>'}</span>
          </Link>

          {/* Center links — hidden on auth pages */}
          {!isAuth && (
            <div className="hidden md:flex items-center gap-1">
              {[
                { label: 'Features', href: '#features' },
                { label: 'How it works', href: '#how' },
                { label: 'Pricing', href: '#pricing' },
                { label: 'Docs', href: '#docs' },
              ].map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-white/50 hover:text-white hover:bg-white/5"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}

          {/* Right CTA */}
          <div className="flex items-center gap-3">
            {pathname === '/' && (
              <>
                <Link
                  href="/login"
                  className="hidden sm:block px-4 py-2 text-sm font-semibold text-white/60 hover:text-white transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signin"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #00ff88, #00c6aa)',
                    color: '#050507',
                    boxShadow: '0 0 20px rgba(0,255,136,0.25)',
                  }}
                >
                  <span>Get Started</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </>
            )}
            {pathname === '/login' && (
              <Link
                href="/signin"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #00ff88, #00c6aa)', color: '#050507', boxShadow: '0 0 20px rgba(0,255,136,0.25)' }}
              >
                Sign Up
              </Link>
            )}
            {pathname === '/signin' && (
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-white/60 hover:text-white transition-colors"
              >
                Log in
              </Link>
            )}

            {/* Mobile hamburger */}
            {!isAuth && (
              <button
                className="md:hidden p-2 text-white/50 hover:text-white transition-colors"
                onClick={() => setMobileOpen(o => !o)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {mobileOpen
                    ? <path d="M18 6L6 18M6 6l12 12" />
                    : <path d="M3 12h18M3 6h18M3 18h18" />}
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/5 px-6 py-4 flex flex-col gap-2" style={{ background: 'rgba(5,5,7,0.98)' }}>
            {['Features', 'How it works', 'Pricing', 'Docs'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(' ', '-')}`} className="py-2 text-white/50 hover:text-white text-sm font-medium transition-colors">
                {l}
              </a>
            ))}
            <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
              <Link href="/login" className="py-2 text-sm font-medium text-white/50 hover:text-white transition-colors">Log in</Link>
              <Link href="/signin" className="py-2.5 text-center rounded-lg text-sm font-bold" style={{ background: 'linear-gradient(135deg,#00ff88,#00c6aa)', color: '#050507' }}>
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
