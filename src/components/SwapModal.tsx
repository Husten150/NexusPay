import React, { useState, useEffect } from 'react';
import { WalletState, SupportedChain } from '../types';
import { ALL_COINS, getCoinInfo, convertCoinToUsd } from '../data/coinCatalog';
import { 
  RefreshCw, 
  ArrowDownUp, 
  Settings, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  X, 
  Info,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletState;
  onSwapSuccess: (swapData: {
    fromToken: string;
    toToken: string;
    fromAmount: number;
    toAmount: number;
    txHash: string;
    gasFeeUsd: number;
    chain: SupportedChain;
  }) => void;
}

export const SwapModal: React.FC<SwapModalProps> = ({
  isOpen,
  onClose,
  wallet,
  onSwapSuccess,
}) => {
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDC');
  const [fromAmount, setFromAmount] = useState<string>('0.5');
  const [slippage, setSlippage] = useState<number>(0.5); // 0.5%
  const [showSettings, setShowSettings] = useState(false);
  const [swapState, setSwapState] = useState<'IDLE' | 'QUOTING' | 'APPROVING' | 'SWAPPING' | 'SUCCESS'>('IDLE');
  const [txSuccessInfo, setTxSuccessInfo] = useState<{ txHash: string; fromAmt: number; toAmt: number } | null>(null);

  // Available tokens
  const availableTokens = ALL_COINS.map((c) => c.symbol);

  // Balance helpers
  const fromBalance = wallet.tokenBalances[fromToken] || 0;
  const toBalance = wallet.tokenBalances[toToken] || 0;

  const fromCoinInfo = getCoinInfo(fromToken);
  const toCoinInfo = getCoinInfo(toToken);

  // Calculate Exchange Rate & Output
  const parsedFromAmount = parseFloat(fromAmount) || 0;
  const fromValueUsd = parsedFromAmount * fromCoinInfo.priceUsd;
  const toAmountCalculated = toCoinInfo.priceUsd > 0 ? (fromValueUsd / toCoinInfo.priceUsd) : 0;
  const exchangeRate = toCoinInfo.priceUsd > 0 ? (fromCoinInfo.priceUsd / toCoinInfo.priceUsd) : 1;
  const minReceived = toAmountCalculated * (1 - slippage / 100);

  // Switch Tokens
  const handleSwitchTokens = () => {
    const prevFrom = fromToken;
    const prevTo = toToken;
    setFromToken(prevTo);
    setToToken(prevFrom);
    setFromAmount('1');
  };

  // Quick percent fill
  const handleQuickPercent = (pct: number) => {
    if (fromBalance <= 0) {
      setFromAmount('0');
      return;
    }
    const val = (fromBalance * pct).toFixed(fromCoinInfo.decimals <= 6 ? 4 : 6);
    setFromAmount(parseFloat(val).toString());
  };

  // Execute Swap
  const handleExecuteSwap = async () => {
    if (parsedFromAmount <= 0) return;
    if (parsedFromAmount > fromBalance) return;

    setSwapState('QUOTING');
    await new Promise((r) => setTimeout(r, 600));

    setSwapState('APPROVING');
    await new Promise((r) => setTimeout(r, 700));

    setSwapState('SWAPPING');
    await new Promise((r) => setTimeout(r, 900));

    const simulatedTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const gasFee = wallet.chain === 'Stellar Network' ? 0.00001 : wallet.chain === 'Polygon' ? 0.004 : wallet.chain === 'Base' ? 0.001 : 2.50;

    onSwapSuccess({
      fromToken,
      toToken,
      fromAmount: parsedFromAmount,
      toAmount: toAmountCalculated,
      txHash: simulatedTxHash,
      gasFeeUsd: gasFee,
      chain: wallet.chain,
    });

    setTxSuccessInfo({
      txHash: simulatedTxHash,
      fromAmt: parsedFromAmount,
      toAmt: toAmountCalculated,
    });
    setSwapState('SUCCESS');
  };

  const handleReset = () => {
    setSwapState('IDLE');
    setTxSuccessInfo(null);
    setFromAmount('1');
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
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Instant Multi-Coin Swap</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold">
                  DEX Aggregator
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Zero slippage routing across Uniswap, Stellar SDEX & Jupiter
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              title="Slippage Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slippage Settings Overlay */}
        {showSettings && (
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs animate-in fade-in">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold">
              <span>Slippage Tolerance</span>
              <span className="text-indigo-600 dark:text-indigo-400">{slippage}%</span>
            </div>
            <div className="flex items-center gap-2">
              {[0.1, 0.5, 1.0].map((val) => (
                <button
                  key={val}
                  onClick={() => setSlippage(val)}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                    slippage === val
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Success View */}
        {swapState === 'SUCCESS' && txSuccessInfo && (
          <div className="py-6 text-center space-y-4 animate-in fade-in">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-500 shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Swap Completed Successfully!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Exchanged {txSuccessInfo.fromAmt} {fromToken} for {txSuccessInfo.toAmt.toFixed(4)} {toToken}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-left text-xs font-mono break-all space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-sans font-semibold block">On-Chain Tx Hash:</span>
              <span className="text-slate-700 dark:text-slate-300 text-[11px]">{txSuccessInfo.txHash}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all"
              >
                Swap Another Coin
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

        {/* Swap Form View */}
        {swapState !== 'SUCCESS' && (
          <div className="space-y-3">
            
            {/* FROM CARD */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[10px]">You Pay</span>
                <span className="text-[11px]">
                  Balance: <strong className="font-mono text-slate-700 dark:text-slate-300">{fromBalance.toLocaleString()} {fromToken}</strong>
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0.0"
                  min="0"
                  step="any"
                  className="w-full bg-transparent text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white focus:outline-none placeholder-slate-300"
                />

                {/* Token Selector */}
                <select
                  value={fromToken}
                  onChange={(e) => setFromToken(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs rounded-xl px-3 py-2 focus:outline-none shadow-xs"
                >
                  {availableTokens.map((t) => (
                    <option key={t} value={t} disabled={t === toToken}>
                      {t} - {getCoinInfo(t).name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>≈ ${fromValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickPercent(0.25)}
                    className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold hover:bg-purple-100"
                  >
                    25%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPercent(0.5)}
                    className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold hover:bg-purple-100"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPercent(1.0)}
                    className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold hover:bg-purple-200"
                  >
                    MAX
                  </button>
                </div>
              </div>
            </div>

            {/* SWITCH BUTTON */}
            <div className="flex justify-center -my-2 relative z-10">
              <button
                type="button"
                onClick={handleSwitchTokens}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-purple-600 dark:text-purple-400 shadow-md hover:scale-110 active:scale-95 transition-all"
                title="Switch From / To"
              >
                <ArrowDownUp className="w-4 h-4" />
              </button>
            </div>

            {/* TO CARD */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[10px]">You Receive (Estimated)</span>
                <span className="text-[11px]">
                  Balance: <strong className="font-mono text-slate-700 dark:text-slate-300">{toBalance.toLocaleString()} {toToken}</strong>
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="w-full text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {toAmountCalculated > 0 ? toAmountCalculated.toFixed(toCoinInfo.decimals <= 6 ? 4 : 6) : '0.00'}
                </div>

                {/* Token Selector */}
                <select
                  value={toToken}
                  onChange={(e) => setToToken(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs rounded-xl px-3 py-2 focus:outline-none shadow-xs"
                >
                  {availableTokens.map((t) => (
                    <option key={t} value={t} disabled={t === fromToken}>
                      {t} - {getCoinInfo(t).name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>≈ ${fromValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
                <span className="text-emerald-500 font-semibold">Best Route Locked</span>
              </div>
            </div>

            {/* ROUTE & EXCHANGE RATE SUMMARY */}
            <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Rate</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  1 {fromToken} ≈ {exchangeRate.toFixed(4)} {toToken}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Guaranteed Minimum</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {minReceived.toFixed(4)} {toToken}
                </span>
              </div>
              <div className="flex justify-between">
                <span>DEX Aggregator Route</span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">
                  {wallet.chain === 'Stellar Network' ? 'Stellar SDEX (Soroban)' : wallet.chain === 'Solana' ? 'Jupiter Aggregator v6' : 'Uniswap v3 + Curve Split'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Network Gas</span>
                <span className="font-mono text-emerald-500 font-semibold">
                  {wallet.chain === 'Stellar Network' ? '0.00001 XLM ($0.00)' : wallet.chain === 'Polygon' ? '0.004 POL (<$0.01)' : '0.0005 ETH ($1.35)'}
                </span>
              </div>
            </div>

            {/* Error state if insufficient */}
            {parsedFromAmount > fromBalance && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Insufficient {fromToken} balance. You hold {fromBalance} {fromToken}.</span>
              </div>
            )}

            {/* EXECUTE SWAP BUTTON */}
            <button
              onClick={handleExecuteSwap}
              disabled={parsedFromAmount <= 0 || parsedFromAmount > fromBalance || swapState !== 'IDLE'}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-98"
            >
              {swapState === 'QUOTING' && (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Fetching Best On-Chain DEX Quote...</span>
                </>
              )}
              {swapState === 'APPROVING' && (
                <>
                  <ShieldCheck className="w-4 h-4 animate-pulse text-amber-300" />
                  <span>Approving {fromToken} Spending Limit...</span>
                </>
              )}
              {swapState === 'SWAPPING' && (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Broadcasting Swap to {wallet.chain}...</span>
                </>
              )}
              {swapState === 'IDLE' && (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Swap {fromToken} for {toToken}</span>
                </>
              )}
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
