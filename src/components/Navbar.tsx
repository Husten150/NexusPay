import React, { useState } from 'react';
import { WalletState, SupportedChain, AuthState } from '../types';
import { 
  ShieldCheck, 
  Wallet, 
  ChevronDown, 
  Zap, 
  Send,
  ArrowDownLeft,
  Bot,
  User,
  KeyRound,
  LogIn,
  Download
} from 'lucide-react';

interface NavbarProps {
  wallet: WalletState;
  authState: AuthState;
  onOpenWalletModal: () => void;
  onOpenTransferModal: () => void;
  onOpenReceiveModal: () => void;
  onOpenAuthModal: () => void;
  onOpenPwaModal?: () => void;
  onNavigateHome?: () => void;
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
  { name: 'BNB Chain', icon: '🟡', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', gasGwei: 3.0 },
  { name: 'Avalanche', icon: '🔺', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', gasGwei: 25.0 },
  { name: 'Tron', icon: '🔴', color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20', gasGwei: 1.0 },
  { name: 'Bitcoin Network', icon: '🟠', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20', gasGwei: 15.0 },
  { name: 'Stellar Network', icon: '🚀', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20', gasGwei: 0.00001 },
];

export const Navbar: React.FC<NavbarProps> = ({
  wallet,
  authState,
  onOpenWalletModal,
  onOpenTransferModal,
  onOpenReceiveModal,
  onOpenAuthModal,
  onOpenPwaModal,
  onNavigateHome,
  onSelectChain,
  agentActive,
}) => {
  const [showChainMenu, setShowChainMenu] = useState(false);

  const activeChainObj = CHAINS.find((c) => c.name === wallet.chain) || CHAINS[0];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        
        {/* Brand & Track Badge */}
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex items-center gap-3 text-left hover:opacity-85 transition-opacity focus:outline-none cursor-pointer group"
          title="Redirect to Main Page (Overview)"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
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
                Enterprise
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Enterprise Web3 Financial Infrastructure & Remittance
            </p>
          </div>
        </button>

        {/* Center Actions: Transfer & Receive Money Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTransferModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Transfer Money</span>
            <span className="sm:hidden">Send</span>
          </button>

          <button
            onClick={onOpenReceiveModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Receive</span>
            <span className="sm:hidden">Receive</span>
          </button>
        </div>

        {/* Right Actions: Network Selector & Connect Wallet */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Network Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowChainMenu(!showChainMenu)}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all shadow-sm ${activeChainObj.color}`}
            >
              <span>{activeChainObj.icon}</span>
              <span className="hidden md:inline">{activeChainObj.name}</span>
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
            onClick={() => {
              if (!authState.isAuthenticated) {
                onOpenAuthModal();
              } else {
                onOpenWalletModal();
              }
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 hover:bg-slate-800 transition-all shadow-md active:scale-95"
          >
            <Wallet className="w-3.5 h-3.5 text-indigo-400 dark:text-white" />
            <span className="font-mono font-semibold tracking-tight">
              {authState.isAuthenticated && wallet.isConnected
                ? (wallet.address.length > 12 
                    ? `${wallet.address.slice(0, 5)}...${wallet.address.slice(-4)}`
                    : wallet.address)
                : 'Connect Wallet'
              }
            </span>
          </button>

          {/* Download App / Install PWA Button */}
          {onOpenPwaModal && (
            <button
              onClick={onOpenPwaModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-sm transition-all active:scale-95 border border-purple-400/30"
              title="Download & Install NexusPay App"
            >
              <Download className="w-3.5 h-3.5 animate-bounce text-purple-200" />
              <span className="hidden lg:inline">Download App</span>
              <span className="lg:hidden">App</span>
            </button>
          )}

          {/* User Account / Profile Button */}
          <button
            onClick={onOpenAuthModal}
            title={authState.isAuthenticated ? "View User Profile & Account Details" : "Open Profile Sign In / Sign Up"}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shadow-sm active:scale-95 ${
              authState.isAuthenticated
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-slate-700 hover:bg-indigo-100 dark:hover:bg-slate-700'
            }`}
          >
            {authState.isAuthenticated ? (
              <>
                <User className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span className="hidden sm:inline">
                  Profile: <strong className="text-slate-900 dark:text-white">{authState.user?.username}</strong>
                </span>
                <span className="hidden md:inline-block px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                  {((authState.user?.walletAddress || wallet.address)).slice(0, 5)}...{((authState.user?.walletAddress || wallet.address)).slice(-4)}
                </span>
                <span className="sm:hidden font-semibold">Profile</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                <span className="hidden sm:inline">Sign In / Sign Up</span>
                <span className="sm:hidden">Sign In</span>
              </>
            )}
          </button>

        </div>
      </div>
    </header>
  );
};
