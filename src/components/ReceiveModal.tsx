import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';
import { WalletState, SupportedChain } from '../types';
import { ALL_COINS, getCoinsForChain } from '../data/coinCatalog';
import { getChainAddress, generatePaymentUri, validateAddressForChain } from '../utils/chainAddress';
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
  Barcode as BarcodeIcon,
  ShieldCheck,
  ExternalLink
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
  const [qrFormat, setQrFormat] = useState<'RAW' | 'URI'>('RAW');
  const [customAmount, setCustomAmount] = useState<string>('');
  
  // Simulation for live socket incoming payment test
  const [simulatingIncoming, setSimulatingIncoming] = useState(false);
  const [receivedNotification, setReceivedNotification] = useState<string | null>(null);

  // Get active network address matching the selected chain format (Solana, Bitcoin, EVM, Tron, Stellar)
  const activeAddress = getChainAddress(selectedChain, wallet.address);
  const addressValidation = validateAddressForChain(selectedChain, activeAddress);

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
    const textToCopy = qrFormat === 'URI' 
      ? generatePaymentUri(selectedChain, activeAddress, selectedToken, parseFloat(customAmount) || undefined)
      : activeAddress;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestIncomingPayment = () => {
    setSimulatingIncoming(true);
    setReceivedNotification(null);

    setTimeout(() => {
      const randomAmount = parseFloat(customAmount) || (Math.floor(Math.random() * 500) + 100);
      onReceiveFunds(randomAmount, selectedToken, activeAddress);
      setSimulatingIncoming(false);
      setReceivedNotification(`Received +${randomAmount} ${selectedToken} on ${selectedChain}!`);
    }, 1800);
  };

  // Build real scannable payload URI
  const rawQrValue = qrFormat === 'URI'
    ? generatePaymentUri(selectedChain, activeAddress, selectedToken, parseFloat(customAmount) || undefined)
    : activeAddress;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[380px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 space-y-3 animate-in zoom-in-95 duration-150 cursor-default max-h-[94vh] overflow-y-auto"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Receive Funds</span>
                <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                  Live
                </span>
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Camera & Wallet Scannable QR Code
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
              <option value="Polygon">Polygon (EVM)</option>
              <option value="Base">Base L2 (EVM)</option>
              <option value="Ethereum">Ethereum (EVM)</option>
              <option value="Arbitrum">Arbitrum (EVM)</option>
              <option value="Optimism">Optimism (EVM)</option>
              <option value="Solana">Solana</option>
              <option value="BNB Chain">BNB Chain</option>
              <option value="Avalanche">Avalanche</option>
              <option value="Tron">Tron</option>
              <option value="Bitcoin Network">Bitcoin</option>
              <option value="Stellar Network">Stellar Public Network</option>
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

        {/* QR Code Format Toggle: Raw Address vs Payment URI */}
        <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg text-[10px]">
          <span className="text-slate-500 dark:text-slate-400 font-medium px-1">QR Format:</span>
          <div className="flex gap-1 font-semibold">
            <button
              onClick={() => setQrFormat('RAW')}
              className={`px-2 py-0.5 rounded transition-all ${
                qrFormat === 'RAW'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Universal Address
            </button>
            <button
              onClick={() => setQrFormat('URI')}
              className={`px-2 py-0.5 rounded transition-all ${
                qrFormat === 'URI'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Payment URI
            </button>
          </div>
        </div>

        {/* Real Scannable QR Code Display */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-2">
          
          <div className="inline-block p-3 rounded-xl bg-white shadow-sm border border-slate-200">
            {codeType === 'QR' ? (
              <QRCodeSVG 
                value={rawQrValue} 
                size={140} 
                level="M"
                includeMargin={true}
                bgColor="#ffffff"
                fgColor="#0f172a"
              />
            ) : (
              <div className="overflow-x-auto max-w-[240px]">
                <Barcode 
                  value={activeAddress.slice(0, 32)} 
                  width={1.1}
                  height={45}
                  fontSize={9}
                  margin={2}
                  background="#ffffff"
                  lineColor="#0f172a"
                />
              </div>
            )}
          </div>

          {/* Validation Status Badge */}
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold">
            {addressValidation.isValid ? (
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Valid {selectedChain} Public Address</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-amber-500">
                <span>{addressValidation.reason}</span>
              </div>
            )}
          </div>

          <div>
            <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider block">
              Public Address ({selectedChain}):
            </span>
            <div className="font-mono text-[10px] font-bold text-slate-800 dark:text-slate-100 break-all bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 mt-0.5 select-all">
              {activeAddress}
            </div>
          </div>

          {qrFormat === 'URI' && (
            <div className="text-[9px] text-slate-400 font-mono break-all text-left bg-slate-100 dark:bg-slate-900/90 p-1.5 rounded border border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-slate-500 block">QR Payload:</span>
              {rawQrValue}
            </div>
          )}

          <button
            onClick={handleCopy}
            className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-98"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy {qrFormat === 'URI' ? 'Payment Link' : 'Public Address'}</span>
              </>
            )}
          </button>

          {/* Quick Incoming Payment Tester */}
          <button
            onClick={handleTestIncomingPayment}
            disabled={simulatingIncoming}
            className="w-full py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] transition-all flex items-center justify-center gap-1.5"
          >
            {simulatingIncoming ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin text-indigo-500" />
                <span>Listening for on-chain incoming tx...</span>
              </>
            ) : (
              <>
                <Zap className="w-3 h-3 text-amber-500" />
                <span>Simulate Incoming Deposit to this Address</span>
              </>
            )}
          </button>

          {receivedNotification && (
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold animate-in fade-in">
              {receivedNotification}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
