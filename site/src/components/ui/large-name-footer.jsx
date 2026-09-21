import React, { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { Github, FileText, Shield, ExternalLink, Cpu, Terminal, ArrowUp, Code2 } from "lucide-react";

export function LargeNameFooter() {
  const containerRef = useRef(null);

  // Track scroll progress of the footer element
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  });

  // Giant typography shifts upwards and increases opacity as user scrolls to bottom
  const y = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const opacity = useTransform(scrollYProgress, [0, 0.7, 1], [0, 0.08, 0.12]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      ref={containerRef}
      className="group/footer pt-24 pb-12 px-6 md:px-10 bg-[#050505] border-t border-white/[0.04] relative overflow-hidden z-20"
    >
      <div className="container mx-auto max-w-[1200px] relative z-10 flex flex-col md:flex-row md:flex-wrap justify-between md:items-start">
        {/* Left / Logo block */}
        <div className="mb-8 md:mb-0 flex flex-col items-start order-1 md:order-1 md:w-1/2">
          <a href="#" className="flex items-center gap-3">
            <img src="/favicon.svg" alt="Void Vault Mark" className="w-8 h-8 object-contain" />
            <h2 className="text-xl font-bold tracking-tight text-white font-mono">VOID VAULT</h2>
          </a>

          <p className="text-sm text-neutral-400 mt-3 max-w-[340px] leading-relaxed">
            Hardware-Enforced Cryptographic Data Neutralization & Closed-Loop Forensic Verification. Built for SIH 2026 Problem Statement PS-26149 (NTRO).
          </p>

          {/* Quick Connect Tray */}
          <div className="relative flex items-center gap-1.5 p-1.5 rounded-2xl bg-neutral-950 border border-white/[0.08] shadow-2xl mt-6 max-w-max select-none">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none"></div>

            {/* GitHub */}
            <a
              href="https://github.com/nishchaydev/sih2026"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Repository"
              className="group/btn relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors duration-200"
            >
              <span className="absolute inset-1 rounded-lg bg-white/[0.08] transition-all duration-300 ease-out opacity-0 scale-90 group-hover/btn:opacity-100 group-hover/btn:scale-100"></span>
              <span className="relative z-10 transition-all duration-300 ease-out text-neutral-400 group-hover/btn:text-white group-hover/btn:scale-110">
                <Github className="w-4 h-4" />
              </span>
              <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-orange-500 transition-all duration-300 ease-out w-0 opacity-0 group-hover/btn:w-3 group-hover/btn:opacity-100"></span>
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-neutral-900 border border-white/10 text-white text-[11px] font-medium whitespace-nowrap transition-all duration-300 ease-out opacity-0 translate-y-1 pointer-events-none group-hover/btn:opacity-100 group-hover/btn:translate-y-0 shadow-xl">
                GitHub Repo
              </span>
            </a>

            {/* Architecture SVG */}
            <a
              href="/voidvault-architecture.svg"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="System Architecture"
              className="group/btn relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors duration-200"
            >
              <span className="absolute inset-1 rounded-lg bg-white/[0.08] transition-all duration-300 ease-out opacity-0 scale-90 group-hover/btn:opacity-100 group-hover/btn:scale-100"></span>
              <span className="relative z-10 transition-all duration-300 ease-out text-neutral-400 group-hover/btn:text-white group-hover/btn:scale-110">
                <Cpu className="w-4 h-4" />
              </span>
              <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-orange-500 transition-all duration-300 ease-out w-0 opacity-0 group-hover/btn:w-3 group-hover/btn:opacity-100"></span>
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-neutral-900 border border-white/10 text-white text-[11px] font-medium whitespace-nowrap transition-all duration-300 ease-out opacity-0 translate-y-1 pointer-events-none group-hover/btn:opacity-100 group-hover/btn:translate-y-0 shadow-xl">
                Architecture SVG
              </span>
            </a>

            {/* Research */}
            <a
              href="#research"
              aria-label="52 Research Papers"
              className="group/btn relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors duration-200"
            >
              <span className="absolute inset-1 rounded-lg bg-white/[0.08] transition-all duration-300 ease-out opacity-0 scale-90 group-hover/btn:opacity-100 group-hover/btn:scale-100"></span>
              <span className="relative z-10 transition-all duration-300 ease-out text-neutral-400 group-hover/btn:text-white group-hover/btn:scale-110">
                <FileText className="w-4 h-4" />
              </span>
              <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-orange-500 transition-all duration-300 ease-out w-0 opacity-0 group-hover/btn:w-3 group-hover/btn:opacity-100"></span>
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-neutral-900 border border-white/10 text-white text-[11px] font-medium whitespace-nowrap transition-all duration-300 ease-out opacity-0 translate-y-1 pointer-events-none group-hover/btn:opacity-100 group-hover/btn:translate-y-0 shadow-xl">
                52 Papers Dossier
              </span>
            </a>

            {/* Back to Top */}
            <button
              onClick={scrollToTop}
              aria-label="Scroll to top"
              className="group/btn relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors duration-200 cursor-pointer"
            >
              <span className="absolute inset-1 rounded-lg bg-white/[0.08] transition-all duration-300 ease-out opacity-0 scale-90 group-hover/btn:opacity-100 group-hover/btn:scale-100"></span>
              <span className="relative z-10 transition-all duration-300 ease-out text-neutral-400 group-hover/btn:text-white group-hover/btn:scale-110">
                <ArrowUp className="w-4 h-4" />
              </span>
              <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-orange-500 transition-all duration-300 ease-out w-0 opacity-0 group-hover/btn:w-3 group-hover/btn:opacity-100"></span>
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-neutral-900 border border-white/10 text-white text-[11px] font-medium whitespace-nowrap transition-all duration-300 ease-out opacity-0 translate-y-1 pointer-events-none group-hover/btn:opacity-100 group-hover/btn:translate-y-0 shadow-xl">
                Back to Top
              </span>
            </button>
          </div>

          <p className="text-xs text-neutral-500 mt-6 font-mono">
            Smart India Hackathon 2026 • Team eMitra • NTRO PS-26149
          </p>
        </div>

        {/* Giant Floating Background Typography (VOID VAULT) */}
        <div className="relative w-full flex mt-12 mb-8 md:mt-2 md:mb-0 items-center justify-center select-none pointer-events-none overflow-visible z-0 order-2 md:order-3">
          <motion.h1
            style={{ y, opacity }}
            className="text-center text-[15vw] sm:text-[11rem] md:text-[14rem] lg:text-[18rem] font-black uppercase tracking-tight leading-none text-white/5 select-none"
          >
            VOID VAULT
          </motion.h1>
        </div>

        {/* Right / Links Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 order-3 md:order-2 md:w-1/2 md:justify-end md:ml-auto z-10">
          <div>
            <h3 className="font-semibold text-neutral-200 text-xs font-mono uppercase tracking-wider mb-3">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#demo" className="text-neutral-400 hover:text-white transition-colors">Live Prototype</a></li>
              <li><a href="#diagrams" className="text-neutral-400 hover:text-white transition-colors">Schematics</a></li>
              <li><a href="#research" className="text-neutral-400 hover:text-white transition-colors">Research (52 Papers)</a></li>
              <li><a href="#benchmarks" className="text-neutral-400 hover:text-white transition-colors">Benchmarks</a></li>
              <li><a href="#impact" className="text-neutral-400 hover:text-white transition-colors">Govt & NTRO Impact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-neutral-200 text-xs font-mono uppercase tracking-wider mb-3">Repository Files</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="https://github.com/nishchaydev/sih2026" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors inline-flex items-center gap-1">GitHub Repo <ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="https://github.com/nishchaydev/sih2026/tree/main/ps149" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">Rust Core (ps149)</a></li>
              <li><a href="https://github.com/nishchaydev/sih2026/tree/main/gui" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">Tauri GUI</a></li>
              <li><a href="https://github.com/nishchaydev/sih2026/tree/main/research" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">Research Dossiers</a></li>
              <li><a href="https://github.com/nishchaydev/sih2026/tree/main/docs" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">Docs & Specs</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-neutral-200 text-xs font-mono uppercase tracking-wider mb-3">Compliance</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="text-neutral-400">NIST SP 800-88 R1</span></li>
              <li><span className="text-neutral-400">DoD 5220.22-M</span></li>
              <li><span className="text-neutral-400">BSA 2023 Sec 63</span></li>
              <li><span className="text-neutral-400">IEEE 2883-2022</span></li>
              <li><span className="text-neutral-400">Air-Gapped SCIF Ready</span></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
