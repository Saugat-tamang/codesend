'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// ===================================================
// VS Code animation data
// ===================================================
const CODE_LINES = [
  { text: 'import { useEffect, useState } from "react";', tokens: [
    { t: 'import', c: '#c678dd' }, { t: ' { ', c: '#abb2bf' },
    { t: 'useEffect', c: '#61afef' }, { t: ', ', c: '#abb2bf' },
    { t: 'useState', c: '#61afef' }, { t: ' } ', c: '#abb2bf' },
    { t: 'from', c: '#c678dd' }, { t: ' "react"', c: '#98c379' }, { t: ';', c: '#abb2bf' },
  ]},
  { text: '', tokens: [] },
  { text: 'async function fetchUserData(userId: string) {', tokens: [
    { t: 'async ', c: '#c678dd' }, { t: 'function ', c: '#c678dd' },
    { t: 'fetchUserData', c: '#61afef' }, { t: '(', c: '#abb2bf' },
    { t: 'userId', c: '#e06c75' }, { t: ': ', c: '#abb2bf' },
    { t: 'string', c: '#e5c07b' }, { t: ') {', c: '#abb2bf' },
  ]},
  { text: '  const res = await fetch(`/api/users/${userId}`);', tokens: [
    { t: '  ', c: '#abb2bf' }, { t: 'const ', c: '#c678dd' },
    { t: 'res', c: '#e06c75' }, { t: ' = ', c: '#abb2bf' },
    { t: 'await ', c: '#c678dd' }, { t: 'fetch', c: '#61afef' },
    { t: '(`/api/users/${userId}`)', c: '#98c379' }, { t: ';', c: '#abb2bf' },
  ]},
  { text: '  if (!res.ok) throw new Error("Not found");', tokens: [
    { t: '  ', c: '#abb2bf' }, { t: 'if ', c: '#c678dd' },
    { t: '(!res.ok) ', c: '#abb2bf' }, { t: 'throw ', c: '#c678dd' },
    { t: 'new ', c: '#c678dd' }, { t: 'Error', c: '#61afef' },
    { t: '("Not found")', c: '#98c379' }, { t: ';', c: '#abb2bf' },
  ]},
  { text: '  const data: User = await res.json();', tokens: [
    { t: '  ', c: '#abb2bf' }, { t: 'const ', c: '#c678dd' },
    { t: 'data', c: '#e06c75' }, { t: ': ', c: '#abb2bf' },
    { t: 'User', c: '#e5c07b' }, { t: ' = ', c: '#abb2bf' },
    { t: 'await ', c: '#c678dd' }, { t: 'res', c: '#e06c75' },
    { t: '.json()', c: '#abb2bf' }, { t: ';', c: '#abb2bf' },
  ]},
  { text: '  return data;', tokens: [
    { t: '  ', c: '#abb2bf' }, { t: 'return ', c: '#c678dd' },
    { t: 'data', c: '#e06c75' }, { t: ';', c: '#abb2bf' },
  ]},
  { text: '}', tokens: [{ t: '}', c: '#abb2bf' }] },
];

// ===================================================
// Lines that get "selected" (3-6 = the function body)
// ===================================================
const SELECT_START = 2;
const SELECT_END = 7;

type Phase = 'typing' | 'selecting' | 'menu' | 'sending' | 'received' | 'resetting';


// ===================================================
// Typing hook
// ===================================================
function useTyping(lines: typeof CODE_LINES, speed = 28) {
  const [charCount, setCharCount] = useState(0);
  const total = lines.reduce((s, l) => s + l.text.length + 1, 0);
  const done = charCount >= total;

  useEffect(() => {
    setCharCount(0);
  }, [lines]);

  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => setCharCount(c => Math.min(c + 1, total)), speed + Math.random() * 15);
    return () => clearTimeout(t);
  }, [charCount, done, total, speed]);

  // ===================================================
  // Build revealed lines
  // ===================================================
  let remaining = charCount;
  const revealed = lines.map(line => {
    const take = Math.min(remaining, line.text.length);
    remaining = Math.max(0, remaining - line.text.length - 1);
    return take;
  });

  return { revealed, done };
}

// ===================================================
// VsCodeWindow 
// ===================================================
function VsCodeWindow({ phase, onPhaseEnd }: { phase: Phase; onPhaseEnd: () => void }) {
  const { revealed, done } = useTyping(CODE_LINES);
  const calledRef = useRef(false);

  const [minimapWidths, setMinimapWidths] = useState<number[] | null>(null);

  useEffect(() => {
    setMinimapWidths(CODE_LINES.map(() => 50 + Math.random() * 30));
  }, []);

  useEffect(() => {
    if (done && phase === 'typing' && !calledRef.current) {
      calledRef.current = true;
      setTimeout(onPhaseEnd, 800);
    }
  }, [done, phase, onPhaseEnd]);

  useEffect(() => {
    calledRef.current = false;
  }, [phase]);

  const showSelection = phase === 'selecting' || phase === 'menu' || phase === 'sending';
  const showMenu = phase === 'menu' || phase === 'sending';
  const dimCode = phase === 'sending' || phase === 'received';

  return (
    <div
      className="relative rounded-xl overflow-hidden w-full"
      style={{
        background: '#1e1e2e',
        border: `1px solid ${showMenu ? '#00ff8840' : '#2a2a3a'}`,
        boxShadow: showMenu ? '0 0 60px rgba(0,255,136,0.12)' : '0 20px 60px rgba(0,0,0,0.6)',
        transition: 'all 0.4s ease',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '13px',
      }}
    >
      {/* VS Code title bar */}
      <div className="flex items-center gap-0 border-b" style={{ background: '#181825', borderColor: '#2a2a3a' }}>
        {/* Sidebar icons strip */}
        <div className="flex flex-col items-center gap-4 px-2 py-3 border-r border-white/5" style={{ background: '#181825' }}>
          {['M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'].map((d, i) => (
            <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5">
              <path d={d} />
            </svg>
          ))}
        </div>

        {/* File tabs */}
        <div className="flex-1 flex items-end pt-1">
          <div className="flex items-center gap-1.5 px-4 py-2 text-xs border-t-2 border-b-0"
            style={{ borderTopColor: '#00ff88', color: '#cdd6f4', background: '#1e1e2e' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#61afef" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            </svg>
            userService.ts
            <span className="ml-1 text-white/20 hover:text-white cursor-pointer">×</span>
          </div>
          <div className="px-3 py-2 text-xs text-white/25">api.ts</div>
        </div>
      </div>

      <div className="flex" style={{ minHeight: '280px' }}>
        {/* Minimap */}
        <div className="hidden lg:block w-14 shrink-0 border-r border-white/3 relative overflow-hidden" style={{ background: '#1a1a28' }}>
          {CODE_LINES.map((_, i) => (
            <div key={i} className="mx-2 my-0.5 h-1 rounded-sm"
              style={{ background: showSelection && i >= SELECT_START && i <= SELECT_END ? '#00ff8830' : '#ffffff08', width: `${minimapWidths ? minimapWidths[i] : 65}%` }} />
          ))}
        </div>

        {/* Gutter + code */}
        <div className="flex-1 overflow-hidden py-3 relative" style={{ opacity: dimCode ? 0.4 : 1, transition: 'opacity 0.5s ease' }}>
          {CODE_LINES.map((line, lineIdx) => {
            const visibleChars = revealed[lineIdx] ?? 0;
            const isSelected = showSelection && lineIdx >= SELECT_START && lineIdx <= SELECT_END;
            const isCursorLine = !done && visibleChars < line.text.length;

            let rendered = 0;
            return (
              <div
                key={lineIdx}
                className="flex items-center pr-6 relative"
                style={{
                  background: isSelected ? 'rgba(0,255,136,0.08)' : 'transparent',
                  borderLeft: isSelected ? '2px solid rgba(0,255,136,0.5)' : '2px solid transparent',
                  minHeight: '22px',
                }}
              >
                {/* Line number */}
                <span className="w-10 text-right shrink-0 px-3 select-none text-xs leading-6"
                  style={{ color: isCursorLine ? '#cdd6f4' : '#4a4a5e' }}>
                  {lineIdx + 1}
                </span>

                {/* Code tokens */}
                <span className="leading-6 whitespace-pre">
                  {line.tokens.map((tok, ti) => {
                    const start = rendered;
                    rendered += tok.t.length;
                    const show = Math.max(0, Math.min(tok.t.length, visibleChars - start));
                    if (show <= 0) return null;
                    return (
                      <span key={ti} style={{ color: tok.c }}>{tok.t.slice(0, show)}</span>
                    );
                  })}
                  {isCursorLine && (
                    <span className="inline-block w-0.5 h-3.5 align-middle cursor-blink" style={{ background: '#00ff88', marginLeft: '1px' }} />
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right-click context menu */}
      {showMenu && (
        <div
          className="absolute rounded-lg overflow-hidden"
          style={{
            top: '120px', left: '160px', width: '240px',
            background: '#252535',
            border: '1px solid rgba(0,255,136,0.2)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,255,136,0.1)',
            animation: 'menu-pop 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards',
            zIndex: 10,
          }}
        >
          {['Go to Definition', 'Find All References', 'Rename Symbol', '─────────────', 'Format Document', 'Quick Fix...', '─────────────'].map((item, i) => (
            <div key={i} className="px-3 py-1.5 text-xs"
              style={{ color: item.startsWith('─') ? '#ffffff15' : '#9399b2', fontSize: '11px' }}>
              {item}
            </div>
          ))}
          {/* Highlighted CodeSend option */}
          <div
            className="px-3 py-2 flex items-center gap-2.5 cursor-pointer relative overflow-hidden"
            style={{
              background: 'linear-gradient(90deg, rgba(0,255,136,0.18), rgba(0,255,136,0.08))',
              borderTop: '1px solid rgba(0,255,136,0.15)',
              borderBottom: '1px solid rgba(0,255,136,0.15)',
            }}
          >
            <div className="w-4 h-4 rounded flex items-center justify-center shrink-0"
              style={{ background: '#00ff88', fontSize: '9px' }}>
              <span style={{ color: '#050507', fontWeight: 900, fontFamily: 'JetBrains Mono' }}>&lt;/&gt;</span>
            </div>
            <span className="font-semibold text-xs" style={{ color: '#00ff88' }}>Send to CodeSend</span>
            <span className="ml-auto text-xs" style={{ color: 'rgba(0,255,136,0.4)', fontFamily: 'JetBrains Mono' }}>⌘⇧S</span>
          </div>
          {['─────────────', 'Copy', 'Cut', 'Paste'].map((item, i) => (
            <div key={i} className="px-3 py-1.5 text-xs"
              style={{ color: item.startsWith('─') ? '#ffffff15' : '#9399b2', fontSize: '11px' }}>
              {item}
            </div>
          ))}
        </div>
      )}

      {/* Status bar */}
      <div className="flex items-center gap-4 px-3 py-1 text-xs border-t" style={{ background: '#181825', borderColor: '#2a2a3a' }}>
        <span style={{ color: '#00ff88', fontFamily: 'JetBrains Mono', fontSize: '11px' }}>
          {phase === 'menu' ? '⌘ 6 lines selected' : phase === 'sending' ? '↗ Sending to CodeSend...' : done ? 'TypeScript' : '● Editing'}
        </span>
        <span className="ml-auto" style={{ color: '#4a4a5e', fontSize: '11px' }}>UTF-8 · LF · Ln {CODE_LINES.length}, Col 1</span>
      </div>
    </div>
  );
}

// ===================================================
// Dashboard preview
// ===================================================
function DashboardPreview({ visible }: { visible: boolean }) {
  return (
    <div
      className="rounded-xl overflow-hidden border w-full"
      style={{
        background: '#0d0d14',
        borderColor: visible ? 'rgba(0,255,136,0.3)' : '#1e1e2a',
        boxShadow: visible ? '0 0 80px rgba(0,255,136,0.15), 0 0 160px rgba(0,255,136,0.05)' : '0 20px 60px rgba(0,0,0,0.4)',
        opacity: visible ? 1 : 0.25,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.97)',
        transition: 'all 0.7s cubic-bezier(0.34,1.3,0.64,1)',
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-white/5" style={{ background: '#09090f' }}>
        <div className="flex items-center gap-1.5">
          <span className="font-black text-sm" style={{ fontFamily: 'JetBrains Mono', color: '#00ff88' }}>{'</'}</span>
          <span className="font-black text-sm text-white">CodeSend</span>
          <span className="font-black text-sm" style={{ fontFamily: 'JetBrains Mono', color: '#00ff88' }}>{'>'}</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00ff88' }} />
          <span className="text-xs font-mono" style={{ color: '#00ff88' }}>RECEIVED</span>
        </div>
      </div>

      {/* Share bar */}
      {visible && (
        <div className="px-4 py-3 border-b border-white/5" style={{ animation: 'fade-in-up 0.4s ease 0.1s both' }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#ffffff06', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ color: '#00ff88', fontSize: '12px' }}>🔗</span>
            <span className="text-xs font-mono flex-1" style={{ color: '#6b7080', fontFamily: 'JetBrains Mono' }}>
              codesend.io/<span style={{ color: '#cdd6f4' }}>userService-x7k2p</span>
            </span>
            <button className="text-xs px-2.5 py-1 rounded font-bold transition-all hover:scale-105"
              style={{ background: '#00ff88', color: '#050507', fontFamily: 'JetBrains Mono', fontSize: '11px' }}>
              COPY
            </button>
          </div>
        </div>
      )}

      {/* Code snippet */}
      <div className="p-4 font-mono" style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', lineHeight: '1.7' }}>
        {visible && CODE_LINES.slice(SELECT_START, SELECT_END + 1).map((line, i) => (
          <div key={i} className="flex gap-4" style={{ animation: `fade-in-up 0.3s ease ${i * 0.06}s both` }}>
            <span style={{ color: '#4a4a5e', minWidth: '20px' }}>{i + 1}</span>
            <span>{line.tokens.map((t, ti) => <span key={ti} style={{ color: t.c }}>{t.t}</span>)}</span>
          </div>
        ))}
      </div>

      {/* Meta footer */}
      {visible && (
        <div className="px-4 py-2.5 border-t border-white/5 flex items-center gap-3" style={{ background: '#09090f', animation: 'fade-in-up 0.4s ease 0.5s both' }}>
          <span className="text-xs font-mono" style={{ color: '#4a4a5e', fontFamily: 'JetBrains Mono' }}>TypeScript · 6 lines · Just now</span>
          <div className="flex items-center gap-2 ml-auto">
            <span className="px-2 py-0.5 text-xs rounded font-mono" style={{ background: '#00ff8812', color: '#00ff88', border: '1px solid #00ff8825', fontFamily: 'JetBrains Mono', fontSize: '10px' }}>
              FROM VS Code
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ===================================================
// Send animation connector
// ===================================================
function SendConnector({ active }: { active: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-8">
      <div className="relative w-px bg-white/5 flex-1 overflow-visible min-h-[60px]">
        {active && (
          <>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px"
              style={{ height: '100%', background: 'linear-gradient(180deg, #00ff88, transparent)', animation: 'slide-down 0.8s ease forwards' }} />
            {[0, 1, 2].map(i => (
              <div key={i} className="absolute left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                style={{ background: '#00ff88', animation: `particle-drop 0.8s ease ${i * 0.15}s forwards`, top: 0 }} />
            ))}
          </>
        )}
      </div>
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500"
        style={{
          background: active ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${active ? 'rgba(0,255,136,0.5)' : 'rgba(255,255,255,0.08)'}`,
          boxShadow: active ? '0 0 20px rgba(0,255,136,0.3)' : 'none',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={active ? '#00ff88' : '#4a4a5e'} strokeWidth="2" style={{ transition: 'stroke 0.5s' }}>
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
      <div className="relative w-px bg-white/5 flex-1 min-h-[60px]" />
    </div>
  );
}

// ===================================================
// Features
// ===================================================
const FEATURES = [
  { icon: '⚡', title: 'Zero friction', body: 'No account. No login. Select code, right-click, send. Done in 2 seconds.' },
  { icon: '🔗', title: 'Instant share link', body: 'A permanent, clean URL generated the moment you hit send.' },
  { icon: '🎨', title: 'Syntax highlighting', body: 'Auto-detects 100+ languages with gorgeous dark-mode rendering.' },
  { icon: '🔒', title: 'Privacy controls', body: 'Expiry timers, password protection, and view-once snippets.' },
  { icon: '📋', title: 'One-click copy', body: 'Recipients copy the full snippet — no friction, no signup.' },
  { icon: '🧩', title: 'VS Code extension', body: 'Right-click any selection and hit "Send to CodeSend" — that\'s it.' },
];

// ===================================================
// Landing page
// ===================================================
export default function Landing() {
  const [phase, setPhase] = useState<Phase>('typing');

  const advance = () => {
    setPhase('selecting');
    setTimeout(() => {
      setPhase('menu');
      setTimeout(() => {
        setPhase('sending');
        setTimeout(() => {
          setPhase('received');
          setTimeout(() => {
            setPhase('resetting');
            setTimeout(() => setPhase('typing'), 400);
          }, 3500);
        }, 800);
      }, 1800);
    }, 900);
  };

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', color: '#f0f0f0' }}>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20 overflow-hidden">
        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `linear-gradient(rgba(0,255,136,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.035) 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
        }} />
        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(0,255,136,0.07) 0%, transparent 65%)' }} />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,180,255,0.04) 0%, transparent 70%)' }} />

        {/* Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 text-xs font-mono"
          style={{ background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.2)', color: '#00ff88' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          VS Code extension now live · Free forever
        </div>

        {/* Headline */}
        <h1 className="text-center font-black leading-none mb-5 max-w-4xl"
          style={{ fontSize: 'clamp(2.8rem, 8vw, 6rem)', letterSpacing: '-0.04em' }}>
          <span className="text-white">Send code from</span>
          <br />
          <span style={{
            backgroundImage: 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            VS Code
          </span>
          <span className="text-white"> instantly.</span>
        </h1>

        <p className="text-center text-lg md:text-xl font-light max-w-lg mb-12 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Select code → right-click → <span style={{ color: '#00ff88', fontFamily: 'JetBrains Mono', fontSize: '0.85em' }}>Send to CodeSend</span>.
          <br />Get a shareable link in under a second. No login needed.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-24">
          <Link
            href="/signin"
            className="group flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #00ff88 0%, #00c6aa 100%)',
              color: '#050507',
              boxShadow: '0 0 30px rgba(0,255,136,0.35), 0 0 80px rgba(0,255,136,0.1)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M8 4v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.242a2 2 0 0 0-.602-1.43L16.083 2.57A2 2 0 0 0 14.685 2H10a2 2 0 0 0-2 2z"/>
              <path d="M16 18v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2"/>
            </svg>
            Share Code Now
          </Link>
        </div>

        {/* Social proof */}
        <div className="flex items-center gap-6 text-xs font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>
          <span>✓ No signup required</span>
          <span className="w-px h-3 bg-white/10" />
          <span>✓ Open source extension</span>
          <span className="hidden sm:block w-px h-3 bg-white/10" />
          <span className="hidden sm:block">✓ 12,400+ developers</span>
        </div>
      </section>

      {/* ── Demo animation ── */}
      <section id="demo" className="px-6 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-mono mb-3 tracking-widest" style={{ color: '#00ff88' }}>HOW IT WORKS</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
            Right-click. Send. Done.
          </h2>
          <p className="text-white/40 max-w-sm mx-auto">Watch the full flow — from typing in VS Code to a live shareable link.</p>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch gap-0">
          {/* VS Code side */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-4 h-4 rounded" style={{ background: '#007ACC' }} />
              <span className="text-xs font-mono text-white/40">Visual Studio Code</span>
              {phase === 'selecting' && (
                <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', animation: 'fade-in-up 0.2s ease' }}>
                  Selecting code...
                </span>
              )}
              {phase === 'menu' && (
                <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88' }}>
                  Right-click menu
                </span>
              )}
              {phase === 'sending' && (
                <span className="text-xs font-mono px-2 py-0.5 rounded animate-pulse" style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88' }}>
                  Sending...
                </span>
              )}
            </div>
            <VsCodeWindow phase={phase} onPhaseEnd={advance} />
          </div>

          {/* Connector */}
          <SendConnector active={phase === 'sending'} />

          {/* CodeSend side */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3 justify-end">
              <span className="text-xs font-mono text-white/40">codesend.io</span>
              <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: '#00ff88' }}>
                <span style={{ color: '#050507', fontFamily: 'JetBrains Mono', fontSize: '8px', fontWeight: 900 }}>&gt;</span>
              </div>
            </div>
            <DashboardPreview visible={phase === 'received'} />
          </div>
        </div>

        {/* Phase dots */}
        <div className="flex items-center justify-center gap-3 mt-10">
          {(['typing', 'selecting', 'menu', 'sending', 'received'] as Phase[]).map((p, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full transition-all duration-300"
                style={{ background: phase === p ? '#00ff88' : 'rgba(255,255,255,0.1)', boxShadow: phase === p ? '0 0 8px #00ff88' : 'none' }} />
              {i < 4 && <div className="w-8 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-12 mt-2">
          {['Type', 'Select', 'Menu', 'Send', 'Done'].map((l, i) => (
            <span key={i} className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>{l}</span>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="px-6 py-24" style={{ background: '#080810' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-mono mb-3 tracking-widest" style={{ color: '#00ff88' }}>FEATURES</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
              Built for how devs
              <br />
              <span style={{ color: '#00ff88' }}>actually share.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-xl group transition-all duration-300 hover:-translate-y-1"
                style={{ background: '#0d0d14', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="text-2xl mb-4">{f.icon}</div>
                <h3 className="text-white font-bold mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            <span className="font-black text-sm" style={{ fontFamily: 'JetBrains Mono', color: '#00ff88' }}>{'</'}</span>
            <span className="font-black text-sm text-white">CodeSend</span>
            <span className="font-black text-sm" style={{ fontFamily: 'JetBrains Mono', color: '#00ff88' }}>{'>'}</span>
          </div>
          <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.15)' }}>© 2026 CodeSend · Made for developers</p>
          <div className="flex gap-6 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {['Privacy', 'Terms', 'GitHub', 'Changelog'].map(l => (
              <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}