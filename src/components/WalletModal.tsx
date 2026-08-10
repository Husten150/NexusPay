import React, { useState } from 'react';
import { WalletState } from '../types';
import { 
  Wallet, 
  CheckCircle2, 
  Zap, 
  PlusCircle, 
  ArrowRight,
  ShieldCheck,
  Check,
  Globe,
  AlertCircle
} from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletState;
  onConnectWallet: (type: 'Simulated Sandbox' | 'MetaMask' | 'Coinbase' | 'Phantom' | 'Injected Web3', customAddress?: string) => void;
  onTopUpFaucet: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  wallet,
  onConnectWallet,
  onTopUpFaucet,
}) => {
  const [customAddress, setCustomAddress] = useState('');
  const [isConnectingInjected, setIsConnectingInjected] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleInjectedConnect = async (providerType: 'MetaMask' | 'Coinbase' | 'Phantom') => {
    setErrorMessage('');
    setIsConnectingInjected(true);

    try {
      if (providerType === 'Phantom') {
        if (typeof window !== 'undefined' && (window as any).solana?.isPhantom) {
          const resp = await (window as any).solana.connect();
          const pubKey = resp.publicKey.toString();
          onConnectWallet('Phantom', pubKey);
          onClose();
          setIsConnectingInjected(false);
          return;
        } else {
          setErrorMessage('Phantom extension not detected. If on mobile, open this URL inside Phantom App Browser, or paste your address above.');
          setIsConnectingInjected(false);
          return;
        }
      } else {
        if (typeof window === 'undefined') {
          setErrorMessage('Window context unavailable.');
          setIsConnectingInjected(false);
          return;
        }

        let ethereumProvider = (window as any).ethereum;

        // Handle multiple injected providers (Coinbase + MetaMask co-existing)
        if (ethereumProvider?.providers?.length) {
          if (providerType === 'MetaMask') {
            ethereumProvider = ethereumProvider.providers.find((p: any) => p.isMetaMask) || ethereumProvider;
          } else if (providerType === 'Coinbase') {
            ethereumProvider = ethereumProvider.providers.find((p: any) => p.isCoinbaseWallet) || ethereumProvider;
          }
        }

        if (!ethereumProvider) {
          setErrorMessage(
            'MetaMask extension not found in this browser. ' +
            'If you are on mobile, open this site inside the MetaMask App Browser. ' +
            'Or paste your address directly in the input box above!'
          );
          setIsConnectingInjected(false);
          return;
        }

        try {
          const accounts = await ethereumProvider.request({ method: 'eth_requestAccounts' });
          if (accounts && accounts.length > 0) {
            onConnectWallet(providerType, accounts[0]);
            onClose();
            setIsConnectingInjected(false);
            return;
          } else {
            setErrorMessage('No accounts returned from wallet.');
          }
        } catch (reqErr: any) {
          if (reqErr.code === -32002) {
            setErrorMessage('MetaMask has a pending request! Please click the orange Fox icon in your browser extension bar to approve.');
          } else if (reqErr.code === 4001) {
            setErrorMessage('Connection request was rejected in MetaMask.');
          } else {
            setErrorMessage(`MetaMask error: ${reqErr.message || 'Failed to connect.'}`);
          }
          setIsConnectingInjected(false);
          return;
        }
      }
    } catch (err: any) {
      console.warn('Wallet connection error:', err);
      setErrorMessage(`Could not connect: ${err.message || 'Unknown error'}`);
    } finally {
      setIsConnectingInjected(false);
    }
  };

  const handleIntegrateCustomAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAddress || customAddress.trim().length < 8) {
      setErrorMessage('Please enter a valid wallet address (e.g. 0x... or Solana public key).');
      return;
    }
    setErrorMessage('');
    onConnectWallet('Injected Web3', customAddress.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Connect Real Web3 Wallet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Integrate your browser extension or custom address
              </p>
            </div>
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
            <span className="text-slate-400">Active Address:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {wallet.address.length > 20 
                ? `${wallet.address.slice(0, 10)}...${wallet.address.slice(-6)}`
                : wallet.address
              }
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

        {/* Manual Address Integration */}
        <form onSubmit={handleIntegrateCustomAddress} className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 space-y-2 text-xs">
          <span className="text-indigo-900 dark:text-indigo-200 font-bold block">
            Paste & Integrate Your Wallet Address Directly:
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              placeholder="0x... or ENS or Solana address"
              className="flex-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs rounded-xl px-3 py-2 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-all"
            >
              Integrate
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Provider List */}
        <div className="space-y-2 text-xs">
          <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
            Or Connect Browser Extension Wallet:
          </span>

          <button
            onClick={() => handleInjectedConnect('MetaMask')}
            disabled={isConnectingInjected}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">🦊</span>
              <span>MetaMask / Injected EIP-1193</span>
            </div>
            <span className="text-[10px] text-indigo-500 font-bold">Connect</span>
          </button>

          <button
            onClick={() => handleInjectedConnect('Coinbase')}
            disabled={isConnectingInjected}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">🔵</span>
              <span>Coinbase Wallet</span>
            </div>
            <span className="text-[10px] text-indigo-500 font-bold">Connect</span>
          </button>

          <button
            onClick={() => handleInjectedConnect('Phantom')}
            disabled={isConnectingInjected}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">👻</span>
              <span>Phantom (Solana)</span>
            </div>
            <span className="text-[10px] text-indigo-500 font-bold">Connect</span>
          </button>

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
        </div>

      </div>
    </div>
  );
};
