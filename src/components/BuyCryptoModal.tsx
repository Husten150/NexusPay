import React, { useState } from 'react';
import { WalletState, SupportedChain } from '../types';
import { ALL_COINS, getCoinInfo } from '../data/coinCatalog';
import { 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Zap, 
  X, 
  Building2, 
  Smartphone, 
  Banknote,
  DollarSign,
  Lock,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface BuyCryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletState;
  onBuySuccess: (buyData: {
    fiatAmount: number;
    fiatCurrency: string;
    cryptoToken: string;
    cryptoAmount: number;
    paymentMethod: string;
    txHash: string;
    chain: SupportedChain;
  }) => void;
}

const FIAT_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rateToUsd: 1.0 },
  { code: 'EUR', symbol: '€', name: 'Euro', rateToUsd: 1.09 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rateToUsd: 1.28 },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rateToUsd: 0.00063 },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rateToUsd: 0.74 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateToUsd: 0.67 },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', rateToUsd: 0.18 },
];

const PAYMENT_METHODS = [
  { id: 'CARD', name: 'Debit / Credit Card', icon: CreditCard, subtitle: 'Visa, Mastercard • Instant (<1m)' },
  { id: 'APPLE_PAY', name: 'Apple Pay', icon: Smartphone, subtitle: '1-Touch Biometric On-Ramp' },
  { id: 'GOOGLE_PAY', name: 'Google Pay', icon: Smartphone, subtitle: 'Instant Android & Web Checkout' },
  { id: 'BANK', name: 'Bank Wire / ACH / SEPA', icon: Building2, subtitle: 'Zero processing fee • Verified' },
];

export const BuyCryptoModal: React.FC<BuyCryptoModalProps> = ({
  isOpen,
  onClose,
  wallet,
  onBuySuccess,
}) => {
  const [fiatCurrency, setFiatCurrency] = useState('USD');
  const [fiatAmount, setFiatAmount] = useState('250');
  const [cryptoToken, setCryptoToken] = useState('USDC');
  const [selectedMethod, setSelectedMethod] = useState('CARD');
  const [cardHolder, setCardHolder] = useState('Enterprise Treasury');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [buyState, setBuyState] = useState<'IDLE' | 'PROCESSING' | 'AUTHORIZING' | 'SETTLING' | 'SUCCESS'>('IDLE');
  const [txSuccessInfo, setTxSuccessInfo] = useState<{ txHash: string; fiatAmt: number; cryptoAmt: number; token: string } | null>(null);

  const selectedFiatObj = FIAT_CURRENCIES.find((f) => f.code === fiatCurrency) || FIAT_CURRENCIES[0];
  const targetCoinInfo = getCoinInfo(cryptoToken);

  const parsedFiatAmount = parseFloat(fiatAmount) || 0;
  const fiatInUsd = parsedFiatAmount * selectedFiatObj.rateToUsd;
  const processingFee = selectedMethod === 'BANK' ? 0.00 : fiatInUsd * 0.015; // 1.5% fee on cards, 0 on bank
  const netFiatForCryptoUsd = Math.max(0, fiatInUsd - processingFee);
  const cryptoAmountCalculated = targetCoinInfo.priceUsd > 0 ? netFiatForCryptoUsd / targetCoinInfo.priceUsd : 0;

  const handleExecuteBuy = async () => {
    if (parsedFiatAmount <= 0) return;

    setBuyState('PROCESSING');
    await new Promise((r) => setTimeout(r, 700));

    setBuyState('AUTHORIZING');
    await new Promise((r) => setTimeout(r, 800));

    setBuyState('SETTLING');
    await new Promise((r) => setTimeout(r, 900));

    const simulatedTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const methodObj = PAYMENT_METHODS.find((m) => m.id === selectedMethod);

    onBuySuccess({
      fiatAmount: parsedFiatAmount,
      fiatCurrency,
      cryptoToken,
      cryptoAmount: cryptoAmountCalculated,
      paymentMethod: methodObj ? methodObj.name : 'Card Payment',
      txHash: simulatedTxHash,
      chain: wallet.chain,
    });

    setTxSuccessInfo({
      txHash: simulatedTxHash,
      fiatAmt: parsedFiatAmount,
      cryptoAmt: cryptoAmountCalculated,
      token: cryptoToken,
    });
    setBuyState('SUCCESS');
  };

  const handleReset = () => {
    setBuyState('IDLE');
    setTxSuccessInfo(null);
    setFiatAmount('250');
  };

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 cursor-default animate-in zoom-in-95"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Buy Crypto (Fiat On-Ramp)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold">
                  Zero Spread
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Instant delivery to {wallet.chain} ({wallet.address.slice(0, 6)}...{wallet.address.slice(-4)})
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success View */}
        {buyState === 'SUCCESS' && txSuccessInfo && (
          <div className="py-6 text-center space-y-4 animate-in fade-in">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-500 shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Crypto Purchased & Delivered!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Received +{txSuccessInfo.cryptoAmt.toFixed(targetCoinInfo.decimals <= 6 ? 4 : 6)} {txSuccessInfo.token} for {selectedFiatObj.symbol}{txSuccessInfo.fiatAmt.toLocaleString()} {fiatCurrency}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-left text-xs font-mono break-all space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-sans font-semibold block">On-Chain Delivery Tx:</span>
              <span className="text-slate-700 dark:text-slate-300 text-[11px]">{txSuccessInfo.txHash}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all"
              >
                Buy More Crypto
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Buy Form View */}
        {buyState !== 'SUCCESS' && (
          <div className="space-y-3">
            
            {/* FIAT INPUT CARD */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Spend Fiat Currency</span>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                  Card / Wire / Apple Pay
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1 flex items-center">
                  <span className="text-xl sm:text-2xl font-bold text-slate-400 mr-1">
                    {selectedFiatObj.symbol}
                  </span>
                  <input
                    type="number"
                    value={fiatAmount}
                    onChange={(e) => setFiatAmount(e.target.value)}
                    placeholder="250"
                    min="10"
                    step="10"
                    className="w-full bg-transparent text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white focus:outline-none placeholder-slate-300"
                  />
                </div>

                {/* Fiat Selector */}
                <select
                  value={fiatCurrency}
                  onChange={(e) => setFiatCurrency(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs rounded-xl px-3 py-2 focus:outline-none shadow-xs"
                >
                  {FIAT_CURRENCIES.map((f) => (
                    <option key={f.code} value={f.code}>
                      {f.code} ({f.symbol})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Fill Buttons */}
              <div className="flex items-center gap-1.5 pt-1">
                {[50, 100, 250, 500, 1000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFiatAmount(val.toString())}
                    className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                      fiatAmount === val.toString()
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-amber-950'
                    }`}
                  >
                    {selectedFiatObj.symbol}{val}
                  </button>
                ))}
              </div>
            </div>

            {/* CRYPTO OUTPUT CARD */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Crypto You Receive</span>
                <span className="text-[11px] text-emerald-500 font-semibold">
                  Delivered to {wallet.chain}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {cryptoAmountCalculated > 0 ? cryptoAmountCalculated.toFixed(targetCoinInfo.decimals <= 6 ? 4 : 6) : '0.00'}
                </div>

                {/* Crypto Token Selector */}
                <select
                  value={cryptoToken}
                  onChange={(e) => setCryptoToken(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs rounded-xl px-3 py-2 focus:outline-none shadow-xs"
                >
                  {ALL_COINS.map((c) => (
                    <option key={c.symbol} value={c.symbol}>
                      {c.symbol} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Rate: 1 {cryptoToken} ≈ ${targetCoinInfo.priceUsd.toLocaleString()} USD</span>
                <span className="font-mono text-emerald-500 font-semibold">Zero Slippage</span>
              </div>
            </div>

            {/* PAYMENT METHODS SELECTOR */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Select Payment Method
              </span>

              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((pm) => {
                  const Icon = pm.icon;
                  const isSelected = selectedMethod === pm.id;

                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setSelectedMethod(pm.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${
                        isSelected ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {pm.name}
                        </div>
                        <div className="text-[9px] text-slate-400 truncate">
                          {pm.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FEE BREAKDOWN & SUMMARY */}
            <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal Fiat</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {selectedFiatObj.symbol}{parsedFiatAmount.toLocaleString()} {fiatCurrency}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Processing Fee ({selectedMethod === 'BANK' ? '0%' : '1.5%'})</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  ${processingFee.toFixed(2)} USD
                </span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Network Fee</span>
                <span className="font-mono text-emerald-500 font-semibold">
                  Free (NexusPay Subsidized)
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1 font-bold text-slate-900 dark:text-white">
                <span>Total Amount Charged</span>
                <span className="font-mono">
                  {selectedFiatObj.symbol}{parsedFiatAmount.toLocaleString()} {fiatCurrency}
                </span>
              </div>
            </div>

            {/* BUY ACTION BUTTON */}
            <button
              onClick={handleExecuteBuy}
              disabled={parsedFiatAmount <= 0 || buyState !== 'IDLE'}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold text-sm shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-98"
            >
              {buyState === 'PROCESSING' && (
                <>
                  <Lock className="w-4 h-4 animate-spin" />
                  <span>Connecting to Fiat Gateway...</span>
                </>
              )}
              {buyState === 'AUTHORIZING' && (
                <>
                  <ShieldCheck className="w-4 h-4 animate-pulse text-yellow-300" />
                  <span>Authorizing 3D Secure Payment...</span>
                </>
              )}
              {buyState === 'SETTLING' && (
                <>
                  <Zap className="w-4 h-4 animate-spin text-emerald-300" />
                  <span>Minting & Delivering {cryptoToken} to Wallet...</span>
                </>
              )}
              {buyState === 'IDLE' && (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Buy {cryptoAmountCalculated.toFixed(2)} {cryptoToken} Now</span>
                </>
              )}
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
