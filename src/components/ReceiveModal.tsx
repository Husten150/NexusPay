import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';
import { WalletState, SupportedChain } from '../types';
import { ALL_COINS, getCoinsForChain } from '../data/coinCatalog';
import { getChainAddress } from '../utils/chainAddress';
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

  // Get active network address matching the selected chain format (Solana, Bitcoin, EVM, Tron, Stellar)
  const activeAddress = getChainAddress(selectedChain, wallet.address);

  // Available coins specifically on the selected target network
  const availableCoins = getCoinsForChain(selectedChain);

  // Auto-reset selected token if it's not supported on the newly selected network
  useEffect(() => {
    const isStillValid = availableCoins.some((c) => c.symbol === selectedToken);
    if (!isStillValid && availableCoins.length > 0) {
      setSelectedToken(availableCoins[0].symbol);
    }
  }, [selectedChain]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestIncomingPayment = () => {
    setSimulatingIncoming(true);
    setReceivedNotification(null);

    setTimeout(() => {
      const randomAmount = Math.floor(Math.random() * 500) + 100;
      onReceiveFunds(randomAmount, selectedToken, activeAddress);
      setSimulatingIncoming(false);
      setReceivedNotification(`Received +${randomAmount} ${selectedToken} on ${selectedChain}!`);
    }, 1800);
  };

  // Build real scannable payload URI - Raw active network address for 100% universal wallet compatibility
  const qrUri = activeAddress;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[360px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 space-y-3 animate-in zoom-in-95 duration-150 cursor-default max-h-[92vh] overflow-y-auto"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Receive Funds
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Scannable QR & Barcode
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-base px-1">
            ✕
          </button>
        </div>

        {/* Chain and Token selector */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-0.5 text-[9px] uppercase tracking-wider">
              Network
            </label>
            <select
              value={selectedChain}
              onChange={(e) => setSelectedChain(e.target.value as SupportedChain)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-lg px-2 py-1.5 border border-slate-200 dark:border-slate-700 focus:outline-none text-xs"
            >
              <option value="Polygon">Polygon</option>
              <option value="Base">Base L2</option>
              <option value="Ethereum">Ethereum</option>
              <option value="Arbitrum">Arbitrum</option>
              <option value="Optimism">Optimism</option>
              <option value="Solana">Solana</option>
              <option value="BNB Chain">BNB Chain</option>
              <option value="Avalanche">Avalanche</option>
              <option value="Tron">Tron</option>
              <option value="Bitcoin Network">Bitcoin</option>
              <option value="Stellar Network">Stellar</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-0.5 text-[9px] uppercase tracking-wider">
              Asset
            </label>
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-lg px-2 py-1.5 border border-slate-200 dark:border-slate-700 focus:outline-none text-xs"
            >
              {availableCoins.map((c) => (
                <option key={c.symbol} value={c.symbol}>
                  {c.symbol} ({c.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Toggle between 2D QR Code & 1D Barcode */}
        <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-[11px] font-bold">
          <button
            onClick={() => setCodeType('QR')}
            className={`flex-1 py-1 rounded-md flex items-center justify-center gap-1 transition-all ${
              codeType === 'QR' 
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <QrCode className="w-3 h-3" />
            <span>2D QR</span>
          </button>
          
          <button
            onClick={() => setCodeType('BARCODE')}
            className={`flex-1 py-1 rounded-md flex items-center justify-center gap-1 transition-all ${
              codeType === 'BARCODE' 
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarcodeIcon className="w-3 h-3" />
            <span>1D Barcode</span>
          </button>
        </div>

        {/* Real Scannable QR Code or Barcode Display */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-2">
          
          <div className="inline-block p-2.5 rounded-xl bg-white shadow-sm border border-slate-200">
            {codeType === 'QR' ? (
              <QRCodeSVG 
                value={qrUri} 
                size={130} 
                level="H"
                includeMargin={true}
              />
            ) : (
              <div className="overflow-x-auto max-w-[240px]">
                <Barcode 
                  value={activeAddress} 
                  width={1.0}
                  height={40}
                  fontSize={9}
                  margin={2}
                  background="#ffffff"
                  lineColor="#0f172a"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-1 text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
            <Scan className="w-3 h-3" />
            <span>{codeType === 'QR' ? 'Scannable QR Code' : 'Barcode Reader Scannable'}</span>
          </div>

          <div>
            <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider block">
              Address ({selectedChain}):
            </span>
            <div className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-100 break-all bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 mt-0.5 select-all">
              {activeAddress}
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
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
    </div>
  );
};
