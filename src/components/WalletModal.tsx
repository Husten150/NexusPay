import React from 'react';
import { WalletState } from '../types';
import { 
  Wallet, 
  CheckCircle2, 
  ExternalLink, 
  Zap, 
  ShieldCheck, 
  PlusCircle, 
  Sparkles,
  Bot
} from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletState;
  onConnectWallet: (type: 'Simulated Sandbox' | 'MetaMask' | 'Coinbase' | 'Phantom') => void;
  onTopUpFaucet: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  wallet,
  onConnectWallet,
  onTopUpFaucet,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Connect Web3 Wallet
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-lg">
            ✕
          </button>
        </div>

        {/* Current Active Account Status */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Connected Wallet:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
              {wallet.walletType}
            </span>
          </div>

          <div className="flex justify-between items-center font-mono">
            <span className="text-slate-400">Address:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {wallet.address.slice(0, 10)}...{wallet.address.slice(-6)}
            </span>
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-slate-800">
            <span className="text-slate-400">Treasury Total:</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              ${wallet.balanceUsd.toLocaleString()} USD
            </span>
          </div>
        </div>

        {/* Faucet Top-up button */}
        <button
          onClick={onTopUpFaucet}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Claim +10,000 USDC Testnet Faucet</span>
        </button>

        {/* Provider List */}
        <div className="space-y-2 text-xs">
          <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Select Wallet Provider:</span>

          <button
            onClick={() => {
              onConnectWallet('Simulated Sandbox');
              onClose();
            }}
            className="w-full p-3 rounded-xl border border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 flex items-center justify-between font-semibold transition-all text-indigo-900 dark:text-indigo-200"
          >
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-indigo-500" />
              <span>Demo Web3 Sandbox Wallet (Pre-Funded)</span>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </button>

          <button
            onClick={() => {
              onConnectWallet('MetaMask');
              onClose();
            }}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">🦊</span>
              <span>MetaMask / Injected Web3 Provider</span>
            </div>
          </button>

          <button
            onClick={() => {
              onConnectWallet('Coinbase');
              onClose();
            }}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">🔵</span>
              <span>Coinbase Wallet</span>
            </div>
          </button>

          <button
            onClick={() => {
              onConnectWallet('Phantom');
              onClose();
            }}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">👻</span>
              <span>Phantom (Solana)</span>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
};
