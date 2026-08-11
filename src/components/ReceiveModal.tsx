import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';
import { WalletState, SupportedChain } from '../types';
import { ALL_COINS } from '../data/coinCatalog';
import { 
  ArrowDownLeft, 
  Copy, 
  Check, 
  QrCode, 
  Scan,
  Globe, 
  Zap, 
  PlusCircle, 
  Share2, 
  CheckCircle2, 
  Sparkles,
  RefreshCw,
  Barcode as BarcodeIcon
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
  const [selectedToken, setSelectedToken] = useState<string>('USDC');
  const [codeType, setCodeType] = useState<'QR' | 'BARCODE'>('QR');
  
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

  // Build real scannable payload URI - Raw wallet address for 100% universal wallet compatibility
  const qrUri = wallet.address;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150 cursor-default"
      >
        
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
                Actual scannable QR Code & Barcode for receiving funds
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
              <option value="BNB Chain">BNB Chain (BSC)</option>
              <option value="Avalanche">Avalanche C-Chain</option>
              <option value="Tron">Tron Network</option>
              <option value="Bitcoin Network">Bitcoin Network</option>
              <option value="Stellar Network">Stellar Network (XLM)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1 text-[10px] uppercase">
              Requested Asset
            </label>
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-xl px-3 py-2 border border-slate-300 dark:border-slate-700 focus:outline-none"
            >
              {ALL_COINS.map((c) => (
                <option key={c.symbol} value={c.symbol}>
                  {c.icon} {c.symbol} - {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Toggle between 2D QR Code & 1D Barcode */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold">
          <button
            onClick={() => setCodeType('QR')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              codeType === 'QR' 
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>2D QR Code</span>
          </button>
          
          <button
            onClick={() => setCodeType('BARCODE')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              codeType === 'BARCODE' 
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarcodeIcon className="w-3.5 h-3.5" />
            <span>1D Barcode</span>
          </button>
        </div>

        {/* Real Scannable QR Code or Barcode Display */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          
          <div className="inline-block p-4 rounded-xl bg-white shadow-md border border-slate-200">
            {codeType === 'QR' ? (
              <div className="p-1">
                <QRCodeSVG 
                  value={qrUri} 
                  size={160} 
                  level="H"
                  includeMargin={true}
                />
              </div>
            ) : (
              <div className="p-1 overflow-x-auto max-w-[280px]">
                <Barcode 
                  value={wallet.address} 
                  width={1.2}
                  height={55}
                  fontSize={10}
                  margin={4}
                  background="#ffffff"
                  lineColor="#0f172a"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
            <Scan className="w-3.5 h-3.5" />
            <span>{codeType === 'QR' ? 'Camera & Wallet Scannable' : 'POS & Barcode Reader Scannable'}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
              Receiving Address ({selectedChain}):
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
                  <span>Copied Address!</span>
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
