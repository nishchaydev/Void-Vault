import React, { useEffect } from 'react';
import { X, Download, ExternalLink, ZoomIn } from 'lucide-react';

export default function LightboxModal({ isOpen, onClose, imageSrc, title, description }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="absolute inset-0"
        onClick={onClose}
      />

      <div className="relative z-10 max-w-6xl w-full max-h-[92vh] flex flex-col rounded-2xl bg-[#090D15] border border-slate-700 shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#06090E]">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              {title || "Asset Preview"}
            </h3>
            {description && (
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                {description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={imageSrc}
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700 transition-colors"
              title="Download image"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close fullscreen modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content / High-Res Image View */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-black/50">
          <img
            src={imageSrc}
            alt={title || "Preview"}
            className="max-w-full max-h-[75vh] object-contain rounded-lg border border-slate-800 shadow-2xl"
          />
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#06090E] border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Void Vault · High-Resolution Evidence Asset</span>
          <span>Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
}
