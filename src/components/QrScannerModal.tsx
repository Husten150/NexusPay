import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { Camera, Upload, X, CheckCircle2, AlertCircle, Scan, Sparkles, Image as ImageIcon } from 'lucide-react';
import { SupportedChain } from '../types';
import { extractAddressAndParamsFromQr, validateAddressForChain, getChainAddress } from '../utils/chainAddress';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: { address: string; amount?: number; token?: string; detectedChain?: SupportedChain }) => void;
  activeChain: SupportedChain;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  activeChain,
}) => {
  const [activeTab, setActiveTab] = useState<'CAMERA' | 'FILE' | 'DEMO'>('CAMERA');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualResult, setManualResult] = useState<{ address: string; amount?: number; token?: string; chain?: string } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestAnimationRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera helper
  const stopCamera = () => {
    if (requestAnimationRef.current) {
      cancelAnimationFrame(requestAnimationRef.current);
      requestAnimationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  // Start camera and real-time canvas decoding
  const startCamera = async () => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsScanning(true);
        scanFrame();
      }
    } catch (err: any) {
      console.warn('Camera initialization notice:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access or use File Upload / Demo QR.'
          : err.message || 'Unable to open camera stream. Try uploading a QR image.'
      );
      setActiveTab('FILE');
    }
  };

  // Continuous frame scanning loop using jsQR
  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      requestAnimationRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        handleQrPayload(code.data);
        return;
      }
    } catch (e) {
      // frame read exception ignore
    }

    requestAnimationRef.current = requestAnimationFrame(scanFrame);
  };

  // Process decoded QR text payload
  const handleQrPayload = (rawData: string) => {
    stopCamera();
    const parsed = extractAddressAndParamsFromQr(rawData);
    const chainToCheck = parsed.detectedChain || activeChain;
    const validation = validateAddressForChain(chainToCheck, parsed.cleanAddress);

    setManualResult({
      address: parsed.cleanAddress,
      amount: parsed.amount,
      token: parsed.token,
      chain: parsed.detectedChain || activeChain,
    });

    onScanSuccess({
      address: parsed.cleanAddress,
      amount: parsed.amount,
      token: parsed.token,
      detectedChain: parsed.detectedChain,
    });

    setTimeout(() => {
      onClose();
    }, 600);
  };

  // Handle uploaded image file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          handleQrPayload(code.data);
        } else {
          setCameraError('No valid QR code was detected in this image. Please select a clearer QR code image.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Start/stop camera on tab change or modal visibility
  useEffect(() => {
    if (isOpen && activeTab === 'CAMERA') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[400px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 space-y-3 animate-in zoom-in-95 duration-150 cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Scan QR Code / Address
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Auto-decodes Wallet Address & Payment URIs
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-base px-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('CAMERA')}
            className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1 transition-all ${
              activeTab === 'CAMERA'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Camera</span>
          </button>
          <button
            onClick={() => setActiveTab('FILE')}
            className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1 transition-all ${
              activeTab === 'FILE'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>
          <button
            onClick={() => setActiveTab('DEMO')}
            className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1 transition-all ${
              activeTab === 'DEMO'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quick Test</span>
          </button>
        </div>

        {/* Camera View */}
        {activeTab === 'CAMERA' && (
          <div className="relative rounded-xl overflow-hidden bg-black aspect-square flex items-center justify-center border border-slate-700">
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover" 
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Scanning Overlay Reticle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-indigo-400 rounded-xl relative animate-pulse">
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-indigo-400" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-indigo-400" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-indigo-400" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-indigo-400" />
                <div className="w-full h-0.5 bg-indigo-500/80 shadow-[0_0_8px_#6366f1] absolute top-1/2 -translate-y-1/2 animate-bounce" />
              </div>
            </div>

            {cameraError && (
              <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-4 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-400" />
                <p className="text-xs text-slate-200">{cameraError}</p>
                <button
                  onClick={() => setActiveTab('FILE')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
                >
                  Upload QR Image Instead
                </button>
              </div>
            )}
          </div>
        )}

        {/* File Upload View */}
        {activeTab === 'FILE' && (
          <div className="space-y-3">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer transition-colors space-y-2"
            >
              <div className="w-10 h-10 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Click or drag QR image here
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Supports PNG, JPG, WEBP screenshots
                </p>
              </div>
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </div>
            {cameraError && (
              <p className="text-[11px] text-amber-500 text-center font-medium">
                {cameraError}
              </p>
            )}
          </div>
        )}

        {/* Quick Test Demo View */}
        {activeTab === 'DEMO' && (
          <div className="space-y-2">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Select a valid pre-configured test address to simulate scanning instantly:
            </p>
            <div className="space-y-1.5">
              <button
                onClick={() => handleQrPayload('GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ')}
                className="w-full text-left p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-slate-700 transition-all text-xs"
              >
                <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Stellar Public Network Key</span>
                  <span className="text-[10px] text-emerald-500 font-semibold">Valid 56 chars</span>
                </div>
                <div className="font-mono text-[10px] text-slate-500 truncate">
                  GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ
                </div>
              </button>

              <button
                onClick={() => handleQrPayload('0x71C7656EC7ab88b098defB751B7401B5f6d8976F')}
                className="w-full text-left p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-slate-700 transition-all text-xs"
              >
                <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Polygon / Base / Ethereum (EVM)</span>
                  <span className="text-[10px] text-emerald-500 font-semibold">Valid Checksum</span>
                </div>
                <div className="font-mono text-[10px] text-slate-500 truncate">
                  0x71C7656EC7ab88b098defB751B7401B5f6d8976F
                </div>
              </button>

              <button
                onClick={() => handleQrPayload('stellar:GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ?amount=250&asset_code=USDC')}
                className="w-full text-left p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-slate-700 transition-all text-xs"
              >
                <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Stellar Payment URI (SEP-0007)</span>
                  <span className="text-[10px] text-indigo-500 font-semibold">Auto 250 USDC</span>
                </div>
                <div className="font-mono text-[10px] text-slate-500 truncate">
                  stellar:GA7QY... (250 USDC)
                </div>
              </button>

              <button
                onClick={() => handleQrPayload('ethereum:0x71C7656EC7ab88b098defB751B7401B5f6d8976F?value=100&token=USDC')}
                className="w-full text-left p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-slate-700 transition-all text-xs"
              >
                <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>EVM EIP-681 Paylink</span>
                  <span className="text-[10px] text-indigo-500 font-semibold">Auto 100 USDC</span>
                </div>
                <div className="font-mono text-[10px] text-slate-500 truncate">
                  ethereum:0x71C... (100 USDC)
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Scan Success Indicator */}
        {manualResult && (
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                QR Code Decoded Successfully!
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono truncate block">
                {manualResult.address}
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
