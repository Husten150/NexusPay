import React, { useState } from 'react';
import { WalletState, SupportedChain } from '../types';
import { 
  ShieldCheck, 
  Wallet, 
  ChevronDown, 
  Sparkles, 
  Activity, 
  Zap, 
  Globe, 
  ExternalLink,
  Bot
} from 'lucide-react';

interface NavbarProps {
  wallet: WalletState;
  onOpenWalletModal: () => void;
  onSelectChain: (chain: SupportedChain) => void;
  agentActive: boolean;
}

const CHAINS: { name: SupportedChain; icon: string; color: string; gasGwei: number }[] = [
  { name: 'Polygon', icon: '🟣', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', gasGwei: 28 },
  { name: 'Base', icon: '🔵', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', gasGwei: 0.01 },
  { name: 'Ethereum', icon: '🔷', color: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20', gasGwei: 12 },
  { name: 'Arbitrum', icon: '🟦', color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20', gasGwei: 0.1 },
  { name: 'Solana', icon: '🟣', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', gasGwei: 0.0005 },
  { name: 'Optimism', icon: '🔴', color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20', gasGwei: 0.02 },
];

export const Navbar: React.FC<NavbarProps> = ({
  wallet,
  onOpenWalletModal,
  onSelectChain,
  agentActive,
}) => {
  const [showChainMenu, setShowChainMenu] = useState(false);

  const activeChainObj = CHAINS.find((c) => c.name === wallet.chain) || CHAINS[0];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Track Badge */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 text-white shadow-md shadow-indigo-500/20">
            <Zap className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-indigo-200 dark:to-slate-200 bg-clip-text text-transparent">
                NexusPay
              </span>
              <span className="px-1.5 py-0.5 text-xs font-semibold rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                AI Agent
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Web3 Treasury & Autonomous Financial Infrastructure
            </p>
          </div>
        </div>

        {/* Center: Agent Status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
          <Bot className="w-4 h-4 text-indigo-500 animate-pulse" />
          <span className="font-medium">AI Guard:</span>
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Auditing & Optimizing
          </span>
        </div>

        {/* Right Actions: Network Selector & Connect Wallet */}
        <div className="flex items-center gap-3">
          
          {/* Network Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowChainMenu(!showChainMenu)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shadow-sm ${activeChainObj.color}`}
            >
              <span>{activeChainObj.icon}</span>
              <span className="hidden sm:inline">{activeChainObj.name}</span>
              <span className="text-[10px] opacity-75 font-normal">({activeChainObj.gasGwei} Gwei)</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {showChainMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Select Chain Network
                </div>
                {CHAINS.map((chain) => (
                  <button
                    key={chain.name}
                    onClick={() => {
                      onSelectChain(chain.name);
                      setShowChainMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors ${
                      wallet.chain === chain.name ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{chain.icon}</span>
                      <span>{chain.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{chain.gasGwei} Gwei</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Wallet Connect Button */}
          <button
            onClick={onOpenWalletModal}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 hover:bg-slate-800 transition-all shadow-md shadow-indigo-500/10 active:scale-95"
          >
            <Wallet className="w-3.5 h-3.5 text-indigo-400 dark:text-white" />
            <div className="flex flex-col items-start text-left">
              <span className="font-mono font-semibold tracking-tight">
                {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
              </span>
            </div>
            <span className="ml-1 pl-2 border-l border-slate-700 dark:border-indigo-400/30 text-[11px] font-bold text-emerald-400">
              ${wallet.balanceUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </button>

        </div>
      </div>
    </header>
  );
};
