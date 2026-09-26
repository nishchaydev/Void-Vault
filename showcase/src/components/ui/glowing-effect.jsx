import React, { useEffect, useRef } from "react";
import { subscribeGlow } from "../../lib/glow-manager";
import { useReducedMotion } from "../../hooks/useReducedMotion";

/**
 * Cursor-reactive conic-gradient border glow modeled after Orbit.
 * All instances share one pointermove + one rAF loop via `subscribeGlow`.
 */
export function GlowingEffect({
  borderWidth = 1.5,
  spread = 40,
  proximity = 72,
  inactiveZone = 0.01,
  glow = false,
  liquid = false,
  hoverLiquid = false,
  breathe = false,
  className = "",
  disabled = false,
}) {
  const ref = useRef(null);
  const innerRef = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    const inner = innerRef.current;
    if (!el || !inner || disabled) return;

    // Reduced motion: static gentle glow
    if (reduced) {
      el.style.setProperty("--ge-active", glow ? "0.85" : "0.6");
      inner.style.setProperty("--ge-angle", "135deg");
      return;
    }

    let angle = 0;
    let target = 0;
    let boost = 0;
    let lastPx = -99999;
    let lastPy = -99999;
    let currentActive = glow ? (liquid ? 1 : 0.6) : 0;
    let displayedActive = -1;

    let onScreen = true;
    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0]?.isIntersecting ?? true;
      },
      { rootMargin: "120px" }
    );
    io.observe(el);

    let rect = el.getBoundingClientRect();
    let rectDirty = false;
    const markDirty = () => {
      rectDirty = true;
    };
    const ro = new ResizeObserver(markDirty);
    ro.observe(el);
    window.addEventListener("scroll", markDirty, { passive: true, capture: true });
    window.addEventListener("resize", markDirty);

    const baseSpeed = liquid ? 60 : 0;
    const wantsLiquid = liquid || hoverLiquid;

    const unsub = subscribeGlow(({ dt, px, py, hasPointer }) => {
      if (!onScreen) return;

      if (!wantsLiquid && !glow && !hasPointer && currentActive < 0.002) return;
      if (hoverLiquid && !glow && !hasPointer && currentActive < 0.002 && boost < 0.5) return;

      if (rectDirty) {
        rect = el.getBoundingClientRect();
        rectDirty = false;
      }

      const outsideBand =
        !hasPointer ||
        px < rect.left - proximity ||
        px > rect.right + proximity ||
        py < rect.top - proximity ||
        py > rect.bottom + proximity;

      let eased = 0;
      let near = false;
      let dx = 0;
      let dy = 0;

      if (!outsideBand) {
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        dx = px - cx;
        dy = py - cy;
        const dist = Math.hypot(dx, dy);
        const minReach = Math.min(rect.width, rect.height) * inactiveZone;
        near = dist > minReach;
        const halfW = rect.width / 2;
        const halfH = rect.height / 2;
        const edgeDist = Math.hypot(
          Math.max(0, Math.abs(dx) - halfW),
          Math.max(0, Math.abs(dy) - halfH)
        );
        const nearness = Math.max(0, Math.min(1, 1 - edgeDist / Math.max(1, proximity)));
        eased = nearness * nearness * (3 - 2 * nearness);
      }

      let desiredActive;
      if (liquid) desiredActive = glow ? 1 : 0.55 + eased * 0.45;
      else if (hoverLiquid) desiredActive = eased + (glow ? 0.35 * (1 - eased) : 0);
      else desiredActive = near ? 1 : glow ? 0.6 : 0;

      const easeRate = desiredActive > currentActive ? 4 : 7.5;
      currentActive += (desiredActive - currentActive) * Math.min(1, dt * easeRate);
      if (Math.abs(currentActive - displayedActive) > 0.005) {
        el.style.setProperty("--ge-active", currentActive.toFixed(3));
        displayedActive = currentActive;
      }

      if (currentActive < 0.02 && desiredActive < 0.02) {
        boost *= Math.pow(0.03, dt);
        return;
      }

      if (wantsLiquid) {
        if (!outsideBand && (near || eased > 0.15)) {
          target = (Math.atan2(dy, dx) * 180) / Math.PI + 90 - spread;
          if (lastPx > -99998) {
            const vx = px - lastPx;
            const vy = py - lastPy;
            const v = Math.hypot(vx, vy);
            boost = Math.min(480, boost * 0.6 + v * 12);
          }
          lastPx = px;
          lastPy = py;
        }

        const diff = ((target - angle + 540) % 360) - 180;
        const pull = diff * Math.min(1, dt * 2.4);
        const dir = diff >= 0 ? 1 : -1;
        const flow = (baseSpeed + boost) * dt * dir;
        angle += pull + flow;
        boost *= Math.pow(0.03, dt);
        inner.style.setProperty("--ge-angle", angle.toFixed(2) + "deg");
      } else if (near) {
        angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90 - spread;
        inner.style.setProperty("--ge-angle", angle.toFixed(2) + "deg");
      }
    });

    return () => {
      unsub();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("scroll", markDirty, true);
      window.removeEventListener("resize", markDirty);
    };
  }, [disabled, glow, liquid, hoverLiquid, proximity, inactiveZone, reduced, spread]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={"pointer-events-none absolute inset-0 rounded-[inherit] " + className}
      style={{
        "--ge-border": `${borderWidth}px`,
        "--ge-spread": `${spread}`,
        "--ge-active": glow ? "0.7" : "0",
      }}
    >
      <div
        ref={innerRef}
        className={"absolute inset-0 rounded-[inherit] " + (breathe ? "ge-breathe" : "")}
        style={{
          padding: "var(--ge-border)",
          background:
            "conic-gradient(from var(--ge-angle, 0deg), transparent 0deg, color-mix(in oklab, var(--accent, #38bdf8) 55%, transparent) calc(var(--ge-spread) * 0.35deg), color-mix(in oklab, var(--accent, #38bdf8) 95%, transparent) calc(var(--ge-spread) * 0.75deg), oklch(0.78 0.17 240) calc(var(--ge-spread) * 1deg), color-mix(in oklab, var(--accent, #38bdf8) 95%, transparent) calc(var(--ge-spread) * 1.25deg), color-mix(in oklab, var(--accent, #38bdf8) 55%, transparent) calc(var(--ge-spread) * 1.65deg), transparent calc(var(--ge-spread) * 2deg))",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          opacity: "var(--ge-active, 0)",
          transition: "opacity 180ms cubic-bezier(0.22, 0.61, 0.36, 1)",
          filter:
            "drop-shadow(0 0 4px color-mix(in oklab, var(--accent, #38bdf8) 65%, transparent)) drop-shadow(0 0 12px color-mix(in oklab, var(--accent, #38bdf8) 40%, transparent)) drop-shadow(0 0 22px color-mix(in oklab, oklch(0.72 0.16 240) 45%, transparent))",
          willChange: "opacity",
        }}
      />
    </div>
  );
}
