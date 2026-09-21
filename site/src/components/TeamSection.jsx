import React from 'react';
import { teamConfig } from '../config/team';
import { GlowingEffect } from './ui/glowing-effect';
import { Github, Linkedin, ExternalLink, ShieldCheck, Terminal, Award } from 'lucide-react';

export default function TeamSection() {
  return (
    <section id="team" className="py-20 md:py-28 border-t border-white/[0.04] bg-[#050505] relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-cyan-500/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold tracking-widest text-cyan-400 uppercase">
            12 — TEAM eMitra
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-4 tracking-tight">
            The Team Behind Void Vault
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Representing Smart India Hackathon 2026 for Problem Statement PS-26149 (NTRO). Specializing in low-level systems programming, adversarial file carving, and judicial cryptographic audit trails.
          </p>
        </div>

        {/* 6 Member Profile Cards Grid with Orbit GlowingEffect */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamConfig.members.map((member, idx) => (
            <div
              key={idx}
              className="group relative p-6 rounded-2xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] transition-all duration-300 flex flex-col justify-between shadow-2xl"
            >
              <GlowingEffect hoverLiquid breathe spread={45} proximity={60} />

              <div className="relative z-10">
                {/* Header: Tag & Links */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-1 rounded bg-white/5 text-cyan-300 border border-white/10">
                    {member.tag}
                  </span>

                  <div className="flex items-center gap-2">
                    {member.github && member.github !== "#" && (
                      <a
                        href={member.github}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors border border-white/10"
                        title="GitHub Profile"
                      >
                        <Github className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Name & Role */}
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                  {member.name}
                </h3>
                <span className="text-xs font-medium text-cyan-400 block mb-3 font-mono">
                  {member.role}
                </span>

                <p className="text-xs text-neutral-300 leading-relaxed mb-5 font-light">
                  {member.coreResponsibility}
                </p>
              </div>

              {/* Skills Tags */}
              <div className="pt-4 border-t border-white/[0.06] relative z-10">
                <span className="text-[10px] font-mono text-neutral-400 block mb-2 uppercase font-semibold">
                  Core Competencies
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {member.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-neutral-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Team Banner */}
        <div className="mt-12 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] text-center max-w-xl mx-auto flex items-center justify-center gap-3 backdrop-blur-md">
          <Award className="w-5 h-5 text-cyan-400 shrink-0" />
          <p className="text-xs font-mono text-neutral-300">
            Team eMitra • Smart India Hackathon 2026 Grand Finale • NTRO PS-26149
          </p>
        </div>

      </div>
    </section>
  );
}
