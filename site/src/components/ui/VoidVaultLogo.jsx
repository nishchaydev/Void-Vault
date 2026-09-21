import React from 'react';

export function VoidVaultMark({ className = "w-8 h-8", variant = "orange" }) {
  // Variant: 'orange' | 'white' | 'silver'
  const isOrange = variant === "orange";
  
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={`vvMarkGradLeft_${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
          {isOrange ? (
            <>
              <stop offset="0%" stopColor="#FF7A33" />
              <stop offset="60%" stopColor="#FF5600" />
              <stop offset="100%" stopColor="#D44200" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#94A3B8" />
            </>
          )}
        </linearGradient>

        <linearGradient id={`vvMarkGradRight_${variant}`} x1="100%" y1="0%" x2="0%" y2="100%">
          {isOrange ? (
            <>
              <stop offset="0%" stopColor="#FF944D" />
              <stop offset="60%" stopColor="#FF5600" />
              <stop offset="100%" stopColor="#B83F00" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#F8FAFC" />
              <stop offset="50%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#64748B" />
            </>
          )}
        </linearGradient>

        <filter id={`vvGlow_${variant}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Left Shield Wing */}
      <path
        d="M 46.8 33.2 
           C 40.5 24.8, 23.2 11.5, 6.8 2.2 
           C 3.8 0.5, 1.5 2.2, 1.5 5.8 
           L 1.5 58.5 
           C 1.5 63.8, 5.2 68.2, 9.8 71.8 
           L 46.5 98.8 
           Z"
        fill={`url(#vvMarkGradLeft_${variant})`}
      />

      {/* Right Shield Wing (Mirrored with clean central gap) */}
      <path
        d="M 53.2 33.2 
           C 59.5 24.8, 76.8 11.5, 93.2 2.2 
           C 96.2 0.5, 98.5 2.2, 98.5 5.8 
           L 98.5 58.5 
           C 98.5 63.8, 94.8 68.2, 90.2 71.8 
           L 53.5 98.8 
           Z"
        fill={`url(#vvMarkGradRight_${variant})`}
      />
    </svg>
  );
}

export function VoidVaultImage({ className = "w-8 h-8", variant = "orange", alt = "Void Vault Logo" }) {
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const src = variant === 'orange' 
    ? `${cleanBase}brand/logo_mark_orange.png` 
    : variant === 'full'
    ? `${cleanBase}brand/logo_full_white.png`
    : `${cleanBase}brand/logo_mark_white.png`;
  
  return (
    <img 
      src={src} 
      alt={alt} 
      className={`object-contain ${className}`} 
      loading="eager"
    />
  );
}

export function VoidVaultLogo({ className = "h-8", showText = true }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <VoidVaultMark className="w-8 h-8 shrink-0" variant="orange" />
      {showText && (
        <div className="flex flex-col">
          <span className="font-black tracking-[0.16em] text-white uppercase text-sm font-sans leading-tight">
            VOID VAULT
          </span>
          <span className="text-[8px] font-mono tracking-[0.2em] text-neutral-400 uppercase leading-none mt-0.5">
            SECURE TODAY. RECOVER TOMORROW.
          </span>
        </div>
      )}
    </div>
  );
}

export default VoidVaultLogo;

