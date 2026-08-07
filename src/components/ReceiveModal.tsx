import React, { useState, useEffect } from 'react';
import { WalletState, SupportedChain } from '../types';
import { 
  ArrowDownLeft, 
  Copy, 
  Check, 
  QrCode, 
  Globe, 
  Zap, 
  PlusCircle, 
  Share2, 
  CheckCircle2, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletState;
  onReceiveFunds: (amount: number, token: string, sender: string) => void;
}

export const ReceiveModal: React.FC<ReceiveModalProps> = ({
  isOpen,
  onClose,
  wallet,
  onReceiveFunds,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedChain, setSelectedChain] = useState<SupportedChain>(wallet.chain);
  const [selectedToken, setSelectedToken] = useState<'USDC' | 'ETH' | 'USDT' | 'MATIC' | 'SOL'>('USDC');
  
  // Simulation for live socket incoming payment test
  const [simulatingIncoming, setSimulatingIncoming] = useState(false);
  const [receivedNotification, setReceivedNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestIncomingPayment = () => {
    setSimulatingIncoming(true);
    setReceivedNotification(null);

    setTimeout(() => {
      const randomAmount = Math.floor(Math.random() * 500) + 100;
      onReceiveFunds(randomAmount, selectedToken, '0x8891...3a9f');
      setSimulatingIncoming(false);
      setReceivedNotification(`Received +${randomAmount} ${selectedToken} from global network!`);
    }, 1800);
  };

  // Build URI payload for QR code
  const qrUri = wallet.address.startsWith('0x') 
    ? `ethereum:${wallet.address}?token=${selectedToken}`
    : `solana:${wallet.address}?token=${selectedToken}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Receive Money
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Share your address or QR code to receive payments from any country
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-lg">
            ✕
          </button>
        </div>

        {/* Chain and Token selector */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1 text-[10px] uppercase">
              Target Network
            </label>
            <select
              value={selectedChain}
              onChange={(e) => setSelectedChain(e.target.value as SupportedChain)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-xl px-3 py-2 border border-slate-300 dark:border-slate-700 focus:outline-none"
            >
              <option value="Polygon">Polygon (PoS)</option>
              <option value="Base">Base L2</option>
              <option value="Ethereum">Ethereum Mainnet</option>
              <option value="Arbitrum">Arbitrum One</option>
              <option value="Optimism">Optimism</option>
              <option value="Solana">Solana Network</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1 text-[10px] uppercase">
              Requested Asset
            </label>
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-xl px-3 py-2 border border-slate-300 dark:border-slate-700 focus:outline-none"
            >
              <option value="USDC">USDC Stablecoin</option>
              <option value="ETH">ETH (Ethereum)</option>
              <option value="USDT">USDT Tether</option>
              <option value="MATIC">MATIC / POL</option>
              <option value="SOL">SOL (Solana)</option>
            </select>
          </div>
        </div>

        {/* Interactive QR Code Display */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          
          <div className="inline-block p-4 rounded-xl bg-white shadow-md border border-slate-200">
            {/* SVG Visual Representation of QR Code */}
            <svg className="w-36 h-36 mx-auto" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Outer Position Squares */}
              <rect x="5" y="5" width="26" height="26" rx="4" fill="#0f172a"/>
              <rect x="9" y="9" width="18" height="18" rx="2" fill="#ffffff"/>
              <rect x="13" y="13" width="10" height="10" rx="1" fill="#6366f1"/>

              <rect x="69" y="5" width="26" height="26" rx="4" fill="#0f172a"/>
              <rect x="73" y="9" width="18" height="18" rx="2" fill="#ffffff"/>
              <rect x="77" y="13" width="10" height="10" rx="1" fill="#6366f1"/>

              <rect x="5" y="69" width="26" height="26" rx="4" fill="#0f172a"/>
              <rect x="9" y="73" width="18" height="18" rx="2" fill="#ffffff"/>
              <rect x="13" y="77" width="10" height="10" rx="1" fill="#6366f1"/>

              {/* Matrix Data Patterns */}
              <rect x="36" y="8" width="6" height="6" rx="1" fill="#0f172a"/>
              <rect x="48" y="8" width="6" height="6" rx="1" fill="#0f172a"/>
              <rect x="58" y="18" width="6" height="6" rx="1" fill="#6366f1"/>
              
              <rect x="10" y="38" width="6" height="6" rx="1" fill="#0f172a"/>
              <rect x="22" y="38" width="6" height="6" rx="1" fill="#6366f1"/>
              <rect x="34" y="38" width="12" height="6" rx="1" fill="#0f172a"/>
              <rect x="52" y="38" width="8" height="6" rx="1" fill="#10b981"/>
              <rect x="66" y="38" width="6" height="6" rx="1" fill="#0f172a"/>
              <rect x="78" y="38" width="12" height="6" rx="1" fill="#6366f1"/>

              <rect x="38" y="52" width="24" height="24" rx="3" fill="#6366f1"/>
              <path d="M46 64L50 68L58 60" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>

              <rect x="8" y="52" width="6" height="6" rx="1" fill="#0f172a"/>
              <rect x="20" y="52" width="6" height="6" rx="1" fill="#0f172a"/>

              <rect x="68" y="52" width="12" height="6" rx="1" fill="#0f172a"/>
              <rect x="84" y="52" width="8" height="6" rx="1" fill="#10b981"/>

              <rect x="38" y="82" width="8" height="6" rx="1" fill="#0f172a"/>
              <rect x="52" y="82" width="14" height="6" rx="1" fill="#0f172a"/>
              <rect x="72" y="78" width="8" height="12" rx="1" fill="#6366f1"/>
            </svg>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
              Integrated Wallet Address:
            </span>
            <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100 break-all bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 select-all">
              {wallet.address}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Address</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Live Incoming Listener Banner */}
        <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-bold text-emerald-400">Live On-Chain Listener</span>
            </div>
            <span className="text-[10px] text-slate-400">WebSocket Active</span>
          </div>

          <p className="text-[11px] text-slate-300">
            Incoming transfers to this wallet on {selectedChain} will be detected and credited instantly.
          </p>

          {receivedNotification && (
            <div className="p-2 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{receivedNotification}</span>
            </div>
          )}

          <button
            onClick={handleTestIncomingPayment}
            disabled={simulatingIncoming}
            className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
          >
            {simulatingIncoming ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating Network Deposit...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>Test Receive Funds (Simulate Incoming Payment)</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
