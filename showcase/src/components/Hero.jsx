import React from "react";
import { motion } from "framer-motion";
import { SparklesCore } from "./ui/sparkles";
import { GlowingEffect } from "./ui/glowing-effect";
import { Shield, Play, Terminal, ArrowRight, Github, ExternalLink, Cpu } from "lucide-react";

export default function Hero() {
  const letters = "VOID VAULT".split("");

  // Letter stagger animation variants (matching Orbit / GSAP Power3.out style)
  const letterVariants = {
    hidden: { opacity: 0, y: 16, filter: "blur(12px)" },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        delay: 0.15 + i * 0.07,
        duration: 0.85,
        ease: [0.215, 0.61, 0.355, 1],
      },
    }),
  };

  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#050505] px-6 selection:bg-cyan-500/20 selection:text-white pt-20 pb-16">
      {/* Subtle background slow dust particles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <SparklesCore
          id="hero-sparkles-dust"
          background="transparent"
          minSize={0.4}
          maxSize={1.5}
          particleDensity={14}
          className="w-full h-full"
          particleColor="#38BDF8"
          speed={0.08}
        />
      </div>

      {/* Subtle radial center glow */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full pointer-events-none z-0 mix-blend-screen opacity-45"
        style={{
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.09) 0%, transparent 65%)",
        }}
      />

      {/* Centered Hero Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto select-none mt-2">
        {/* SIH 2026 Problem Statement Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/20 transition-colors backdrop-blur-md mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[11px] sm:text-xs font-mono tracking-wider text-neutral-300 font-medium uppercase">
            SIH 2026 • PS-26149 (NTRO)
          </span>
          <span className="text-neutral-600 hidden sm:inline">•</span>
          <span className="text-[11px] sm:text-xs text-neutral-400 hidden sm:inline">
            National Technical Research Organisation
          </span>
        </motion.div>

        {/* Static Brand Mark */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-4">
          <div className="absolute inset-0 rounded-2xl bg-cyan-500/15 blur-xl pointer-events-none" />
          <img
            src="/favicon.svg"
            alt="Void Vault Logo"
            className="w-full h-full object-contain filter drop-shadow-[0_0_24px_rgba(56,189,248,0.25)] relative z-10"
          />
        </div>

        {/* Staggered Typography Header (Orbit style) */}
        <h1 className="text-3xl sm:text-6xl md:text-7xl font-extrabold tracking-[0.16em] text-white uppercase font-mono leading-none flex gap-[0.14em] justify-center pl-[0.14em]">
          {letters.map((char, index) => (
            <motion.span
              key={index}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={letterVariants}
              className={char === " " ? "w-3 sm:w-6 inline-block" : "inline-block"}
            >
              {char}
            </motion.span>
          ))}
        </h1>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center mt-3 sm:mt-4"
        >
          <h2 className="text-sm sm:text-lg md:text-xl font-light text-neutral-300 tracking-wide">
            Secure Today. <span className="text-cyan-400 font-normal">Unrecoverable Tomorrow.</span>
          </h2>
        </motion.div>

        {/* Sparkles Divider Container (Acme / Orbit Style) */}
        <div className="w-full max-w-[26rem] sm:max-w-[36rem] px-6 h-12 sm:h-20 relative mt-3 sm:mt-4 overflow-hidden mx-auto">
          {/* Underline Gradients */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.7, duration: 1, ease: "easeInOut" }}
            className="absolute inset-x-8 top-0 h-[2px] w-5/6 mx-auto blur-sm origin-center"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.95), rgba(168, 85, 247, 0.8), transparent)",
            }}
          />
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.7, duration: 1, ease: "easeInOut" }}
            className="absolute inset-x-8 top-0 h-px w-5/6 mx-auto origin-center"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(56, 189, 248, 1), rgba(168, 85, 247, 0.9), transparent)",
              boxShadow: "0 0 12px rgba(56, 189, 248, 0.8)",
            }}
          />

          {/* Core Sparkles Particles */}
          <SparklesCore
            id="hero-divider-sparkles"
            background="transparent"
            minSize={0.4}
            maxSize={1.1}
            particleDensity={180}
            className="w-full h-full"
            particleColor="#38BDF8"
            speed={0.25}
          />

          {/* Radial Gradient to prevent sharp edges */}
          <div className="absolute inset-0 w-full h-full bg-[#050505] [mask-image:radial-gradient(260px_90px_at_top,transparent_20%,white)]" />
        </div>

        {/* Descriptive Pitch */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.9 }}
          className="flex flex-col items-center mt-1 z-10 relative"
        >
          <p className="text-xs sm:text-sm text-neutral-400 font-light max-w-sm sm:max-w-xl leading-relaxed tracking-normal">
            Hardware-Enforced Cryptographic Data Neutralization & Closed-Loop Forensic Verification.
            Engineered in pure Rust with unbuffered direct I/O, adversarial carving, and BSA 2023 Section 63 court-admissible audit trails.
          </p>
        </motion.div>

        {/* Orbit-Style Pill CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3 z-20 w-full px-4"
        >
          <a
            href="#demo"
            className="px-6 py-2.5 sm:px-8 sm:py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-[13px] sm:text-[14px] font-medium rounded-full transition-all duration-300 relative group overflow-hidden shadow-[0_0_20px_rgba(56,189,248,0.25)] hover:shadow-[0_0_30px_rgba(56,189,248,0.4)] active:scale-98 inline-flex items-center gap-2"
          >
            <GlowingEffect hoverLiquid breathe spread={30} borderWidth={1.5} proximity={40} glow />
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="relative z-10 font-medium">Explore Prototype</span>
          </a>

          <a
            href="#diagrams"
            className="px-5 py-2.5 sm:px-7 sm:py-3 bg-white/5 hover:bg-white/10 text-white text-[13px] sm:text-[14px] font-medium rounded-full border border-white/10 hover:border-white/20 transition-all duration-300 active:scale-98 backdrop-blur-sm relative group overflow-hidden inline-flex items-center gap-2"
          >
            <GlowingEffect hoverLiquid breathe spread={30} borderWidth={1.5} proximity={40} />
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="relative z-10">Technical Schematics</span>
          </a>

          <a
            href="https://github.com/nishchaydev/sih2026"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 sm:px-7 sm:py-3 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-[13px] sm:text-[14px] font-medium rounded-full border border-white/10 hover:border-white/20 transition-all duration-300 active:scale-98 backdrop-blur-sm relative group overflow-hidden inline-flex items-center gap-1.5"
          >
            <GlowingEffect hoverLiquid breathe spread={30} borderWidth={1.5} proximity={40} />
            <Github className="w-3.5 h-3.5" />
            <span className="relative z-10">GitHub</span>
          </a>
        </motion.div>

        {/* Live Metrics Micro-Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="mt-10 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 w-full max-w-3xl pt-6 border-t border-white/[0.06]"
        >
          <div className="flex flex-col items-center">
            <span className="text-xl sm:text-2xl font-bold font-mono text-cyan-400">67s</span>
            <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-mono">Smart Wipe™</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl sm:text-2xl font-bold font-mono text-white">1,248 MB/s</span>
            <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-mono">NVMe Direct I/O</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl sm:text-2xl font-bold font-mono text-cyan-400">152/152</span>
            <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-mono">Tests Passing</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl sm:text-2xl font-bold font-mono text-white">52 Papers</span>
            <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-mono">Research Archive</span>
          </div>
        </motion.div>
      </div>

      {/* Soft horizon lines at the bottom of hero */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/25 to-transparent blur-[0.5px] z-10" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[3px] bg-gradient-to-r from-transparent via-cyan-500/15 to-transparent blur-sm z-10" />
    </section>
  );
}
