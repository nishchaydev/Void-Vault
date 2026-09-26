import React, { useEffect, useRef } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

/**
 * High-performance, silky-smooth Canvas particle stardust matching Orbit.
 */
export function SparklesCore({
  id = "sparkles-canvas",
  className = "w-full h-full",
  background = "transparent",
  minSize = 0.4,
  maxSize = 1.2,
  speed = 0.2,
  particleColor = "#FFFFFF",
  particleDensity = 80,
}) {
  const canvasRef = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let particles = [];
    let width = (canvas.width = canvas.parentElement?.clientWidth || 300);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 150);

    const onResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
      initParticles();
    };

    window.addEventListener("resize", onResize);

    const count = Math.min(300, Math.floor((width * height * particleDensity) / 100000));

    function initParticles() {
      particles = [];
      const total = Math.max(15, count);
      for (let i = 0; i < total; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * (maxSize - minSize) + minSize,
          alpha: Math.random() * 0.7 + 0.2,
          speedY: (Math.random() * 0.4 - 0.2) * speed,
          speedX: (Math.random() * 0.4 - 0.2) * speed,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinkleDir: Math.random() > 0.5 ? 1 : -1,
        });
      }
    }

    initParticles();

    if (reduced) {
      // Just draw static stars once
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        ctx.fillStyle = particleColor;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      return () => window.removeEventListener("resize", onResize);
    }

    let isVisible = true;
    const io = new IntersectionObserver((entries) => {
      isVisible = entries[0]?.isIntersecting ?? true;
    });
    io.observe(canvas);

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.alpha += p.twinkleSpeed * p.twinkleDir;
        if (p.alpha >= 0.9) {
          p.alpha = 0.9;
          p.twinkleDir = -1;
        } else if (p.alpha <= 0.15) {
          p.alpha = 0.15;
          p.twinkleDir = 1;
        }

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = particleColor;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", onResize);
      io.disconnect();
    };
  }, [minSize, maxSize, speed, particleColor, particleDensity, reduced]);

  return (
    <canvas
      ref={canvasRef}
      id={id}
      className={`pointer-events-none ${className}`}
      style={{ background }}
    />
  );
}
