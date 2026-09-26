// Single rAF + single pointermove loop, shared across every GlowingEffect
// instance. Prevents N listeners * N rAFs from piling up when a page has
// many glowing inputs/buttons.

const subs = new Set();
let px = -99999;
let py = -99999;
let hasPointer = false;
let raf = null;
let last = 0;
let listening = false;

function tick(now) {
  const dt = last ? Math.min(0.064, (now - last) / 1000) : 0.016;
  last = now;
  const frame = { now, dt, px, py, hasPointer };
  // iterate over a snapshot so unsubscribes during a frame are safe
  subs.forEach((s) => s(frame));
  if (subs.size) {
    raf = requestAnimationFrame(tick);
  } else {
    raf = null;
    last = 0;
  }
}

function onMove(e) {
  px = e.clientX;
  py = e.clientY;
  hasPointer = true;
}

function onLeave() {
  hasPointer = false;
}

function ensureListening() {
  if (listening || typeof window === "undefined") return;
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerdown", onMove, { passive: true });
  document.addEventListener("pointerleave", onLeave);
  window.addEventListener("blur", onLeave);
  listening = true;
}

export function subscribeGlow(cb) {
  ensureListening();
  subs.add(cb);
  if (raf == null) raf = requestAnimationFrame(tick);
  return () => {
    subs.delete(cb);
  };
}
