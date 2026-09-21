import React from 'react';
import { motion } from 'framer-motion';
import { SparklesCore } from './ui/sparkles';
import { GlowingEffect } from './ui/glowing-effect';
import LandingBackdrop from './landing/LandingBackdrop';
import { useRouter } from '../context/RouterContext';
import { VoidVaultMark } from './ui/VoidVaultLogo';
import { Play, FileText, Download, ShieldCheck, CheckCircle2, BookOpen, Layers } from 'lucide-react';

export function Hero() {
  const { navigate } = useRouter();
  const letters = "VOID VAULT".split("");

  const letterVariants = {
    hidden: { opacity: 0, y: 14, filter: "blur(10px)" },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        delay: 0.15 + i * 0.05,
        duration: 0.8,
        ease: [0.215, 0.61, 0.355, 1],
      },
    }),
  };

  const handleNav = (target) => (e) => {
    e.preventDefault();
    navigate(target);
  };

  return (
    <section id="top" className="relative min-h-[92vh] w-full flex flex-col items-center justify-center overflow-hidden px-4 pt-16 pb-20 select-none">
      {/* Authentic Orbit Backdrop: Stars, Rotating Orbit Paths, Breathing Sunrise */}
      <LandingBackdrop />

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto w-full">
        
        {/* SIH Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-mono text-orange-400 backdrop-blur-md shadow-[0_0_15px_rgba(255,86,0,0.15)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          <span>SIH 2026 • PS SIH26149 (NTRO) • Team eMitra (146878)</span>
        </motion.div>

        {/* Orbit Brand Emblem */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative mb-5"
        >
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-b from-[#1c1d22] to-[#0c0d0f] border border-orange-500/30 flex items-center justify-center shadow-[0_0_35px_rgba(255,86,0,0.22)] mx-auto relative group p-3.5">
            <div className="absolute inset-0 rounded-2xl bg-orange-500/10 blur-xl group-hover:bg-orange-500/20 transition-all" />
            <VoidVaultMark 
              className="w-full h-full text-orange-500 relative z-10 drop-shadow-[0_0_18px_rgba(255,86,0,0.75)] group-hover:scale-105 transition-transform" 
              variant="orange" 
            />
          </div>
        </motion.div>

        {/* Staggered Typography Header (Exact Orbit Style) */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-[0.18em] text-white uppercase font-sans leading-none flex gap-[0.1em] justify-center pl-[0.1em] drop-shadow-[0_0_25px_rgba(255,86,0,0.25)]">
          {letters.map((char, index) => (
            <motion.span
              key={index}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={letterVariants}
              className={`inline-block ${char === " " ? "w-4 md:w-8" : ""}`}
            >
              {char}
            </motion.span>
          ))}
        </h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-3 text-lg sm:text-2xl font-light text-orange-400 tracking-wide"
        >
          Secure Today. Recover Tomorrow.
        </motion.p>

        {/* Sparkles Divider Container (Exact Acme Style from Orbit Landing.tsx) */}
        <div className="w-full max-w-[28rem] md:max-w-[36rem] px-6 h-12 md:h-20 relative mt-3 overflow-hidden mx-auto">
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.9, ease: "easeInOut" }}
            className="absolute inset-x-8 top-0 h-[2px] w-5/6 mx-auto blur-sm origin-center"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255, 86, 0, 0.9), transparent)",
            }}
          />
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.9, ease: "easeInOut" }}
            className="absolute inset-x-8 top-0 h-px w-5/6 mx-auto origin-center"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255, 86, 0, 0.9), transparent)",
              boxShadow: "0 0 12px rgba(255, 86, 0, 0.8)",
            }}
          />
          <SparklesCore
            background="transparent"
            minSize={0.4}
            maxSize={1.0}
            particleDensity={400}
            className="w-full h-full"
            particleColor="#FFFFFF"
            speed={0.15}
          />
          <div className="absolute inset-0 w-full h-full bg-transparent [mask-image:radial-gradient(280px_90px_at_top,transparent_20%,white)]" />
        </div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="max-w-2xl text-sm sm:text-base text-neutral-400 font-light leading-relaxed mt-1"
        >
          Hardware-enforced data sanitization & closed-loop forensic verification.
          Built for Smart India Hackathon 2026. Complete technical evidence, specifications, and architecture dossiers.
        </motion.p>

        {/* CTA Buttons (Orbit Pill Design with GlowingEffect) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3.5 w-full px-4"
        >
          <a
            href="#/demo"
            onClick={handleNav('demo')}
            className="relative group px-7 py-3 rounded-full text-sm font-medium text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-[0_0_25px_rgba(255,86,0,0.35)] transition-all duration-300 hover:scale-[1.03] active:scale-98 flex items-center gap-2"
          >
            <GlowingEffect hoverLiquid breathe spread={35} borderWidth={1.5} proximity={45} glow />
            <Play className="w-4 h-4 fill-white relative z-10" />
            <span className="relative z-10">Watch Demo</span>
          </a>

          <a
            href="#/ps-matrix"
            onClick={handleNav('ps-matrix')}
            className="relative group px-6 py-3 rounded-full text-sm font-medium text-neutral-200 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-orange-500/40 transition-all duration-300 backdrop-blur-md hover:scale-[1.02] active:scale-98 flex items-center gap-2"
          >
            <GlowingEffect hoverLiquid breathe spread={30} borderWidth={1.2} proximity={40} glow />
            <ShieldCheck className="w-4 h-4 text-orange-400 relative z-10" />
            <span className="relative z-10">PS Matrix</span>
          </a>

          <a
            href="#/docs"
            onClick={handleNav('docs')}
            className="relative group px-6 py-3 rounded-full text-sm font-medium text-neutral-200 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-orange-500/40 transition-all duration-300 backdrop-blur-md hover:scale-[1.02] active:scale-98 flex items-center gap-2"
          >
            <GlowingEffect hoverLiquid breathe spread={30} borderWidth={1.2} proximity={40} glow />
            <BookOpen className="w-4 h-4 text-orange-400 relative z-10" />
            <span className="relative z-10">18 Docs</span>
          </a>

          <a
            href="#/pack"
            onClick={handleNav('pack')}
            className="relative group px-6 py-3 rounded-full text-sm font-medium text-neutral-200 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-orange-500/40 transition-all duration-300 backdrop-blur-md hover:scale-[1.02] active:scale-98 flex items-center gap-2"
          >
            <GlowingEffect hoverLiquid breathe spread={30} borderWidth={1.2} proximity={40} glow />
            <Download className="w-4 h-4 text-orange-400 relative z-10" />
            <span className="relative z-10">Evaluator Pack</span>
          </a>
        </motion.div>

        {/* Real Numbers Metrics Bar (NO MORE PENDING) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl pt-8 border-t border-white/[0.06]"
        >
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
            <div className="text-xl font-bold text-white font-mono flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              152 / 152
            </div>
            <p className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mt-1">Tests Passing</p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
            <div className="text-xl font-bold text-orange-400 font-mono flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-orange-400" />
              17
            </div>
            <p className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mt-1">Standards Aligned</p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
            <div className="text-xl font-bold text-white font-mono flex items-center justify-center gap-1.5">
              <Layers className="w-4 h-4 text-orange-400" />
              3 + 2
            </div>
            <p className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mt-1">Core Modules</p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
            <div className="text-xl font-bold text-orange-400 font-mono flex items-center justify-center gap-1.5">
              <BookOpen className="w-4 h-4 text-orange-400" />
              52
            </div>
            <p className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mt-1">Papers Dossier</p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
export default Hero;
