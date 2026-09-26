import React, { useEffect, useState, useRef } from 'react';
import { ShaderAnimation } from '../ui/shader-animation';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { Shield, Sparkles, Terminal, ChevronRight, X } from 'lucide-react';

const TELEMETRY_LOGS = [
  { step: '01/05', text: 'INITIALIZING HARDWARE INTERLOCKS & OS LOCKOUT' },
  { step: '02/05', text: 'CALIBRATING 256-BIN SIMD SHANNON ENTROPY DETECTOR' },
  { step: '03/05', text: 'ARMING WIN32 UNBUFFERED DIRECT I/O CONTROLLER' },
  { step: '04/05', text: 'ENFORCING 17 PURGE STANDARDS (NIST / DOD / CSEC)' },
  { step: '05/05', text: 'ATTESTING BSA 2023 SEC 63 CRYPTOGRAPHIC MERKLE ROOT' },
  { step: 'READY', text: 'SYSTEM ARMED • ENTERING COMMAND COCKPIT' }
];

export function BootSplash({ onDone, duration = 2800 }) {
  const [leaving, setLeaving] = useState(false);
  const [logIndex, setLogIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const reduced = useReducedMotion();
  const timerRef = useRef(null);

  // Keyboard shortcut: Escape or Space to skip immediately
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' || e.key === ' ') {
        e.preventDefault();
        finishEarly();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Telemetry log progression
  useEffect(() => {
    if (reduced) return;
    const interval = setInterval(() => {
      setLogIndex((prev) => (prev < TELEMETRY_LOGS.length - 1 ? prev + 1 : prev));
    }, 480);
    return () => clearInterval(interval);
  }, [reduced]);

  // Smooth progress bar counter (0 -> 100%)
  useEffect(() => {
    const totalTime = reduced ? 800 : duration;
    const stepTime = 30;
    const stepIncrement = 100 / (totalTime / stepTime);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + stepIncrement;
        if (next >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return next;
      });
    }, stepTime);

    return () => clearInterval(progressInterval);
  }, [reduced, duration]);

  // Main lifecycle timeout
  useEffect(() => {
    const effectiveDuration = reduced ? 900 : duration;
    timerRef.current = setTimeout(() => {
      setLeaving(true);
    }, effectiveDuration);

    return () => clearTimeout(timerRef.current);
  }, [reduced, duration]);

  // Clean unmount after exit transition
  useEffect(() => {
    if (!leaving) return;
    const exitTimer = setTimeout(() => {
      if (onDone) onDone();
    }, reduced ? 250 : 650);
    return () => clearTimeout(exitTimer);
  }, [leaving, onDone, reduced]);

  const finishEarly = () => {
    setLeaving(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="System Initializing"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 transition-all ${
        leaving
          ? 'opacity-0 scale-105 blur-md pointer-events-none'
          : 'opacity-100 scale-100 blur-0'
      }`}
      style={{
        transitionDuration: reduced ? '300ms' : '700ms',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        background:
          'radial-gradient(120% 90% at 50% 50%, #081120 0%, #03060c 60%, #010204 100%)',
      }}
    >
      {/* WebGL Shader field — identical atmosphere to Orbit */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-80 mix-blend-screen"
        style={{
          animation: reduced ? undefined : 'bootShaderFadeIn 1.2s ease-out both'
        }}
      >
        <ShaderAnimation
          className="h-full w-full"
          intensity={1.25}
          warm={[0.0, 0.85, 1.0]}
          cool={[0.15, 0.45, 0.95]}
          reducedMotion={reduced}
        />
      </div>

      {/* Center Vignette pulling focus to the brand logo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(45% 40% at 50% 55%, transparent 0%, transparent 40%, rgba(2, 4, 8, 0.75) 100%)',
        }}
      />

      {/* Subtle Starfield backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: [
            'radial-gradient(1px 1px at 15% 20%, white, transparent 60%)',
            'radial-gradient(1px 1px at 80% 25%, white, transparent 60%)',
            'radial-gradient(1px 1px at 30% 80%, white, transparent 60%)',
            'radial-gradient(1px 1px at 70% 85%, white, transparent 60%)',
            'radial-gradient(0.7px 0.7px at 50% 12%, white, transparent 60%)',
            'radial-gradient(0.7px 0.7px at 90% 65%, white, transparent 60%)',
          ].join(','),
        }}
      />

      {/* Skip button at top-right for judges who want instant access */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={finishEarly}
          type="button"
          className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-white border border-white/10 hover:border-cyan-500/40 text-xs font-mono transition-all duration-200 cursor-pointer shadow-lg"
        >
          <span>Skip Boot</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 font-mono">ESC</span>
        </button>
      </div>

      {/* Main Brand Core & Staggered Reveal */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto">
        
        {/* Animated Brand Mark / Emblem */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 bg-cyan-500/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-b from-[#0e1726] to-[#050911] border border-cyan-500/30 flex items-center justify-center shadow-2xl shadow-cyan-950/80">
            <svg
              className="w-9 h-9 text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 8L20 34L34 8H26L20 22L14 8H6Z"
                fill="currentColor"
              />
              <path
                d="M13 8L20 20L27 8H22L20 12L18 8H13Z"
                fill="#38bdf8"
                opacity="0.9"
              />
            </svg>
          </div>
        </div>

        {/* Staggered Wordmark */}
        <div
          className="flex items-center justify-center font-bold text-white tracking-[0.45em] sm:tracking-[0.6em] uppercase text-2xl sm:text-3xl pl-[0.45em] sm:pl-[0.6em] mb-4 drop-shadow-[0_0_24px_rgba(255,255,255,0.15)]"
        >
          {'VOID VAULT'.split('').map((char, i) => (
            <span
              key={i}
              className="inline-block"
              style={{
                animation: reduced
                  ? undefined
                  : `bootLetterFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.2 + i * 0.05}s both`,
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>

        {/* Orbit-style glowing accent underline */}
        <div className="relative w-48 sm:w-64 h-[2px] mx-auto mb-6 overflow-hidden rounded-full">
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
            style={{
              boxShadow: '0 0 16px rgba(6, 182, 212, 0.9)',
              animation: reduced
                ? undefined
                : 'bootUnderlineExpand 1s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both',
            }}
          />
        </div>

        {/* Subtitle / Ministry Badge */}
        <div
          className="text-xs font-mono text-neutral-400 tracking-widest uppercase mb-6"
          style={{
            animation: reduced
              ? undefined
              : 'bootLetterFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.9s both'
          }}
        >
          <span className="text-cyan-400">SIH 2026 PS-26149</span>
          <span className="mx-2 text-white/20">•</span>
          <span>NTRO DEFENSE SPEC</span>
        </div>

        {/* Cockpit Status Pill & Dynamic Telemetry Log */}
        <div
          className="w-full max-w-sm rounded-xl bg-black/60 border border-white/10 p-3.5 backdrop-blur-md shadow-2xl space-y-2.5"
          style={{
            animation: reduced
              ? undefined
              : 'bootLetterFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.1s both'
          }}
        >
          <div className="flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-2 text-cyan-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              <span className="font-semibold tracking-wider">
                {TELEMETRY_LOGS[logIndex].step}
              </span>
            </div>
            <span className="text-neutral-400 font-mono">
              {Math.min(100, Math.round(progress))}%
            </span>
          </div>

          <p className="text-[11px] font-mono text-neutral-300 text-left truncate tracking-wide">
            {TELEMETRY_LOGS[logIndex].text}
          </p>

          {/* Micro Progress Bar */}
          <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-75 rounded-full"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>

        {/* Subtle Bottom Instruction */}
        <div
          className="mt-6 text-[10px] font-mono text-neutral-500 uppercase tracking-widest"
          style={{
            animation: reduced
              ? undefined
              : 'bootLetterFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.3s both'
          }}
        >
          Secure Today · Unrecoverable Tomorrow
        </div>
      </div>

      <style>{`
        @keyframes bootLetterFade {
          0% {
            opacity: 0;
            transform: translateY(14px);
            filter: blur(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0px);
          }
        }
        @keyframes bootUnderlineExpand {
          0% {
            transform: scaleX(0);
            opacity: 0;
          }
          100% {
            transform: scaleX(1);
            opacity: 1;
          }
        }
        @keyframes bootShaderFadeIn {
          0% {
            opacity: 0;
            transform: scale(1.12);
            filter: blur(14px);
          }
          100% {
            opacity: 0.85;
            transform: scale(1);
            filter: blur(0);
          }
        }
      `}</style>
    </div>
  );
}

export default BootSplash;
