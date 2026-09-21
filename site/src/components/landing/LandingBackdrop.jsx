import React, { useMemo } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

/**
 * Orbit Landing Backdrop:
 *  1. Deep space wash — dark gradient with subtle warm amber-orange horizon glow
 *  2. Independent star twinkle — ~150 CSS-only stars, unsynchronized
 *  3. Slow orbit rotation — SVG elliptical orbit paths, one full rotation per 30 min
 *  4. Breathing sunrise — subtle horizon heartbeat pinned to the bottom
 *  5. Sharp horizon line with glowing blur
 *
 * No heavy WebGL shaders, zero artifacts, pure CSS keyframes.
 */
export function LandingBackdrop() {
  const reduced = useReducedMotion();
  const stars = useMemo(
    () =>
      Array.from({ length: 150 }, () => {
        const size = Math.random() < 0.1 ? 2 : 1;
        return {
          left: Math.random() * 100,
          top: Math.random() * 78,
          size,
          base: 0.2 + Math.random() * 0.5,
          duration: 3 + Math.random() * 5,
          delay: -Math.random() * 8,
        };
      }),
    [],
  );

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Deep space wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 110%, rgba(255, 86, 0, 0.12) 0%, transparent 55%), " +
            "linear-gradient(180deg, #0d0e10 0%, #08090a 55%, #050505 100%)",
        }}
      />

      {/* Stars — each with its own phase and duration */}
      <div className="absolute inset-0">
        {stars.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              opacity: s.base,
              boxShadow: s.size > 1 ? "0 0 4px rgba(255,255,255,0.7)" : undefined,
              animation: reduced
                ? undefined
                : `orbit-star-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
              ["--orbit-star-base"]: String(s.base),
            }}
          />
        ))}
      </div>

      {/* Slowly rotating orbit lines */}
      <svg
        viewBox="-500 -500 1000 1000"
        className="absolute left-1/2 top-[60%] h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2"
        style={{
          animation: reduced ? undefined : "orbit-rotate 1800s linear infinite",
          opacity: 0.35,
        }}
      >
        <defs>
          <radialGradient id="orbitFade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff5600" stopOpacity="0" />
            <stop offset="60%" stopColor="#ff5600" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ff5600" stopOpacity="0" />
          </radialGradient>
        </defs>
        {[220, 300, 380, 460].map((r, i) => (
          <ellipse
            key={r}
            cx="0"
            cy="0"
            rx={r}
            ry={r * 0.32}
            fill="none"
            stroke="url(#orbitFade)"
            strokeWidth={0.75}
            transform={`rotate(${i * 6 - 9})`}
          />
        ))}
      </svg>

      {/* Breathing sunrise — the heartbeat, pinned to the horizon */}
      <div
        className="absolute inset-x-0 bottom-[-6%] h-[70%]"
        style={{
          background:
            "radial-gradient(60% 90% at 50% 100%, rgba(255, 86, 0, 0.28) 0%, rgba(224, 76, 0, 0.14) 22%, transparent 55%)",
          animation: reduced ? undefined : "orbit-sunrise 8s ease-in-out infinite",
          filter: "blur(6px)",
        }}
      />

      {/* Sharp horizon line — a thin rim of light */}
      <div
        className="absolute inset-x-0 bottom-[10%] h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255, 122, 51, 0.85) 50%, transparent)",
          animation: reduced ? undefined : "orbit-sunrise 8s ease-in-out infinite",
          boxShadow: "0 0 24px rgba(255, 86, 0, 0.6)",
        }}
      />

      {/* Vignette to keep content readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(100% 60% at 50% 40%, rgba(5, 5, 5, 0.4), transparent 60%)",
        }}
      />
    </div>
  );
}
export default LandingBackdrop;
