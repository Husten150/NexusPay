import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Monitor, CheckCircle2, Share, PlusSquare, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    // Check if already in standalone app mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('Install prompt not supported directly by browser. Please follow the step-by-step instructions below.');
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-slate-900 border border-indigo-500/30 text-white rounded-2xl shadow-2xl p-6 space-y-5 relative overflow-hidden animate-in zoom-in-95 duration-150 cursor-default"
      >
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <Download className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Download NexusPay App
              </h3>
              <p className="text-xs text-slate-400">
                Install as a native standalone app on mobile & desktop
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {/* Status */}
        {isInstalled ? (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="font-bold text-sm">NexusPay is already installed!</p>
            <p className="text-slate-300 text-[11px]">
              You are running NexusPay as a standalone native app on this device.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Quick Install Button for Chrome/Android/Desktop */}
            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-emerald-500 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>One-Click Install NexusPay App Now</span>
              </button>
            )}

            {/* iOS Step-by-Step Instructions */}
            {isIOS && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs text-slate-300">
                <div className="font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                  <span>iOS Safari Install Instructions:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300">
                  <li className="flex items-center gap-1.5">
                    1. Tap the <Share className="w-3.5 h-3.5 text-indigo-400 inline" /> <strong>Share</strong> icon in Safari.
                  </li>
                  <li className="flex items-center gap-1.5">
                    2. Scroll down and select <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" /> <strong>Add to Home Screen</strong>.
                  </li>
                  <li>3. Tap <strong>Add</strong> at the top right to launch NexusPay anytime.</li>
                </ol>
              </div>
            )}

            {/* General Desktop / Android Browser Guide */}
            {!deferredPrompt && !isIOS && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
                <div className="font-bold text-white flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-indigo-400" />
                  <span>Chrome / Edge / Mobile App Installation:</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Click the <strong>Install / Download icon</strong> in your browser address bar (top right on Desktop or bottom menu on Android Chrome) to install NexusPay to your home screen or application launcher.
                </p>
              </div>
            )}

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-indigo-300 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> Fast Offline Cache
                </span>
                <p className="text-[10px] text-slate-400">Service Worker caching for instant offline app loading.</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Secure Vault
                </span>
                <p className="text-[10px] text-slate-400">Encrypted local keys and WebAuthn biometric security.</p>
              </div>
            </div>

          </div>
        )}

        {/* Footer button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all"
        >
          Close
        </button>

      </div>
    </div>
  );
};
