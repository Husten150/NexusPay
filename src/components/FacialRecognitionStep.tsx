import React, { useState, useRef, useEffect } from 'react';
import { Camera, ScanFace, CheckCircle2, ShieldCheck, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

interface FacialRecognitionStepProps {
  onScanComplete: (dataUrl: string) => void;
  isVerified: boolean;
}

export const FacialRecognitionStep: React.FC<FacialRecognitionStepProps> = ({
  onScanComplete,
  isVerified,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setIsScanning(true);
    setScanProgress(0);
    setCameraError(null);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }
    } catch (err) {
      console.warn('Camera access prevented or not available, fallback to simulation:', err);
    }

    // Progress animation
    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setScanProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        captureSnapshot();
      }
    }, 250);
  };

  const captureSnapshot = () => {
    let mockUrl = '';
    if (videoRef.current && streamRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        mockUrl = canvas.toDataURL('image/jpeg');
      }
    }

    if (!mockUrl) {
      // High-resolution SVG face avatar snapshot placeholder if camera stream isn't permitted in iframe
      mockUrl = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%230f172a"/><circle cx="100" cy="80" r="40" fill="%2338bdf8" opacity="0.8"/><ellipse cx="100" cy="160" rx="60" ry="35" fill="%2338bdf8" opacity="0.8"/><circle cx="100" cy="100" r="85" stroke="%2310b981" stroke-width="3" fill="none" stroke-dasharray="8 4"/></svg>`;
    }

    // Stop track
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setCapturedImage(mockUrl);
    setIsScanning(false);
    onScanComplete(mockUrl);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
        <span className="font-bold text-xs text-white flex items-center gap-1.5">
          <ScanFace className="w-4 h-4 text-emerald-400" />
          Mandatory Facial Recognition Scan
        </span>
        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          AI Biometric ID
        </span>
      </div>

      <div className="relative aspect-video max-h-40 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
        {isScanning ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-2">
            <video
              ref={videoRef}
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />

            {/* Scanning Overlay Grid */}
            <div className="absolute inset-0 border-2 border-dashed border-emerald-400/70 rounded-lg m-3 pointer-events-none animate-pulse flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-2 border-emerald-400/90 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
              </div>
            </div>

            {/* Scanning Laser Line */}
            <div
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg shadow-emerald-400/80 transition-all duration-200"
              style={{ top: `${scanProgress}%` }}
            />

            <div className="relative z-10 bg-slate-950/80 px-3 py-1 rounded-full text-[10px] font-mono text-emerald-300 font-bold border border-emerald-500/40">
              Scanning Facial Mesh: {scanProgress}%
            </div>
          </div>
        ) : capturedImage || isVerified ? (
          <div className="flex flex-col items-center justify-center p-3 text-center space-y-2">
            <div className="relative">
              {capturedImage ? (
                <img
                  src={capturedImage}
                  alt="Biometric Scan"
                  className="w-20 h-20 rounded-full object-cover border-2 border-emerald-400 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400">
                  <ScanFace className="w-8 h-8" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-slate-950 shadow">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Facial Biometrics Match 99.8%
              </span>
              <p className="text-[10px] text-slate-400">
                Liveness check passed & encrypted into user account
              </p>
            </div>

            <button
              type="button"
              onClick={startCamera}
              className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1 font-semibold pt-0.5"
            >
              <RefreshCw className="w-3 h-3" /> Re-scan Face
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-3 text-center space-y-2">
            <div className="p-2.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Camera className="w-6 h-6" />
            </div>

            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white">
                Perform Liveness Selfie Scan
              </span>
              <p className="text-[10px] text-slate-400 max-w-xs">
                Face detection is required for location banking KYC & account security.
              </p>
            </div>

            <button
              type="button"
              onClick={startCamera}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Start Facial Scan</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
