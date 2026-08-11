import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  ExternalLink,
  Download,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface EIP6963ProviderDetail {
  info: {
    rdns: string;
    uuid: string;
    name: string;
    icon: string;
  };
  provider: any;
}

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletState;
  onConnectWallet: (type: 'Enterprise Treasury Vault' | 'MetaMask' | 'Coinbase' | 'Phantom' | 'Stellar Wallet (Freighter)' | 'Injected Web3', customAddress?: string) => void;
  onDisconnectWallet?: () => void;
  onTopUpFaucet: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  wallet,
  onConnectWallet,
  onDisconnectWallet,
  onTopUpFaucet,
}) => {
  const [customAddress, setCustomAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingProviderName, setConnectingProviderName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [detectedEip6963Providers, setDetectedEip6963Providers] = useState<EIP6963ProviderDetail[]>([]);

  // Listen for EIP-6963 wallet extension announcements
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const providerMap = new Map<string, EIP6963ProviderDetail>();

    const handleAnnounce = (event: any) => {
      if (event.detail && event.detail.info) {
        const key = event.detail.info.uuid || event.detail.info.rdns || event.detail.info.name;
        providerMap.set(key, event.detail);
        setDetectedEip6963Providers(Array.from(providerMap.values()));
      }
    };

    window.addEventListener('eip6963:announceProvider', handleAnnounce);
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    return () => {
      window.removeEventListener('eip6963:announceProvider', handleAnnounce);
    };
  }, []);

  if (!isOpen) return null;

  // Helper to trigger EVM extension connection
  const triggerEvmExtensionConnect = async (providerObj: any, providerLabel: string) => {
    if (!providerObj) {
      throw new Error(`${providerLabel} extension not found in this browser context.`);
    }

    try {
      const accounts = await providerObj.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        const realAddress = accounts[0];
        
        let walletTypeParam: 'MetaMask' | 'Coinbase' | 'Injected Web3' = 'Injected Web3';
        if (providerLabel.toLowerCase().includes('metamask')) walletTypeParam = 'MetaMask';
        if (providerLabel.toLowerCase().includes('coinbase')) walletTypeParam = 'Coinbase';

        onConnectWallet(walletTypeParam, realAddress);
        onClose();
        return realAddress;
      } else {
        throw new Error('No accounts returned from wallet extension.');
      }
    } catch (err: any) {
      if (err.code === -32002) {
        throw new Error(`${providerLabel} has a pending request! Please open your browser extension to approve.`);
      } else if (err.code === 4001) {
        throw new Error(`Connection request was cancelled in ${providerLabel}.`);
      } else {
        throw new Error(err.message || `Failed to connect to ${providerLabel}.`);
      }
    }
  };

  // Main universal wallet connector
  const handleConnectProvider = async (walletId: string) => {
    setErrorMessage('');
    setIsConnecting(true);
    setConnectingProviderName(walletId);

    try {
      if (typeof window === 'undefined') {
        throw new Error('Browser window environment not available.');
      }

      // Check EIP-6963 announced providers first
      const eipMatch = detectedEip6963Providers.find(p => 
        p.info.name.toLowerCase().includes(walletId.toLowerCase()) || 
        p.info.rdns.toLowerCase().includes(walletId.toLowerCase())
      );

      if (eipMatch) {
        await triggerEvmExtensionConnect(eipMatch.provider, eipMatch.info.name);
        return;
      }

      // Specific provider fallbacks
      if (walletId === 'MetaMask') {
        let ethereum = (window as any).ethereum;
        if (ethereum?.providers?.length) {
          ethereum = ethereum.providers.find((p: any) => p.isMetaMask) || ethereum;
        }

        if (ethereum) {
          await triggerEvmExtensionConnect(ethereum, 'MetaMask');
        } else {
          setErrorMessage(
            'MetaMask extension not detected in this browser tab. ' +
            'If you have MetaMask installed, ensure it is enabled in your browser extensions or open this page directly in a browser tab. ' +
            'You can also paste your wallet address below!'
          );
        }
      } 
      else if (walletId === 'Coinbase') {
        let provider = (window as any).coinbaseWalletExtension || (window as any).ethereum;
        if (provider?.providers?.length) {
          provider = provider.providers.find((p: any) => p.isCoinbaseWallet) || provider;
        }

        if (provider) {
          await triggerEvmExtensionConnect(provider, 'Coinbase Wallet');
        } else {
          setErrorMessage('Coinbase Wallet extension not detected in this browser.');
        }
      }
      else if (walletId === 'Phantom') {
        const solanaObj = (window as any).solana || (window as any).phantom?.solana;
        if (solanaObj && solanaObj.isPhantom) {
          const resp = await solanaObj.connect();
          const pubKey = resp.publicKey.toString();
          onConnectWallet('Phantom', pubKey);
          onClose();
        } else {
          setErrorMessage('Phantom extension not detected in this browser. Please install Phantom extension or paste your Solana address.');
        }
      }
      else if (walletId === 'Rabby') {
        const rabbyObj = (window as any).rabby || ((window as any).ethereum?.isRabby ? (window as any).ethereum : null);
        if (rabbyObj) {
          await triggerEvmExtensionConnect(rabbyObj, 'Rabby Wallet');
        } else {
          setErrorMessage('Rabby Wallet extension not detected.');
        }
      }
      else if (walletId === 'Trust') {
        const trustObj = (window as any).trustwallet || ((window as any).ethereum?.isTrust ? (window as any).ethereum : null);
        if (trustObj) {
          await triggerEvmExtensionConnect(trustObj, 'Trust Wallet');
        } else {
          setErrorMessage('Trust Wallet extension not detected in this browser.');
        }
      }
      else if (walletId === 'OKX') {
        const okxObj = (window as any).okxwallet || ((window as any).ethereum?.isOKExWallet ? (window as any).ethereum : null);
        if (okxObj) {
          await triggerEvmExtensionConnect(okxObj, 'OKX Wallet');
        } else {
          setErrorMessage('OKX Wallet extension not detected.');
        }
      }
      else if (walletId === 'Stellar') {
        const freighter = (window as any).freighterApi || (window as any).freighter || (window as any).stellar;
        if (freighter) {
          let pubKey = '';
          if (typeof freighter.getPublicKey === 'function') {
            pubKey = await freighter.getPublicKey();
          } else if (typeof freighter.request === 'function') {
            const res = await freighter.request({ method: 'getPublicKey' });
            pubKey = res?.publicKey || res;
          }
          if (pubKey) {
            onConnectWallet('Stellar Wallet (Freighter)', pubKey);
            onClose();
          } else {
            setErrorMessage('Could not retrieve public key from Stellar Freighter extension.');
          }
        } else {
          setErrorMessage('Freighter Stellar extension not detected.');
        }
      }
      else if (walletId === 'GenericInjected') {
        if ((window as any).ethereum) {
          await triggerEvmExtensionConnect((window as any).ethereum, 'Browser Extension Wallet');
        } else {
          setErrorMessage('No EIP-1193 Web3 browser wallet extension found.');
        }
      }

    } catch (err: any) {
      console.warn('Wallet connect error:', err);
      setErrorMessage(err.message || 'Connection failed.');
    } finally {
      setIsConnecting(false);
      setConnectingProviderName(null);
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

  // Check which extension providers are available in window
  const hasMetaMaskInjected = typeof window !== 'undefined' && !!(window as any).ethereum;
  const hasPhantomInjected = typeof window !== 'undefined' && !!((window as any).solana?.isPhantom || (window as any).phantom?.solana);
  const hasFreighterInjected = typeof window !== 'undefined' && !!((window as any).freighterApi || (window as any).freighter || (window as any).stellar);
  const hasCoinbaseInjected = typeof window !== 'undefined' && !!((window as any).coinbaseWalletExtension || (window as any).ethereum?.isCoinbaseWallet);
  const hasRabbyInjected = typeof window !== 'undefined' && !!((window as any).rabby || (window as any).ethereum?.isRabby);

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto cursor-default"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Connect Wallet Extension
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct extension connection via EIP-1193 & EIP-6963
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {/* Current Active Account Status */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400">Connected Wallet:</span>
            <span className={`px-2 py-0.5 rounded font-bold ${
              wallet.isConnected
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
            }`}>
              {wallet.isConnected ? wallet.walletType : 'Disconnected'}
            </span>
          </div>

          <div className="flex justify-between items-center font-mono">
            <span className="text-slate-400">Active Address:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {wallet.address 
                ? (wallet.address.length > 20 
                    ? `${wallet.address.slice(0, 8)}...${wallet.address.slice(-6)}`
                    : wallet.address)
                : 'None'
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

        {/* EIP-6963 Detected Extensions Section */}
        {detectedEip6963Providers.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              Detected Extension(s) in Browser:
            </span>
            <div className="grid grid-cols-1 gap-2">
              {detectedEip6963Providers.map((det) => (
                <button
                  key={det.info.uuid || det.info.rdns}
                  onClick={() => triggerEvmExtensionConnect(det.provider, det.info.name)}
                  disabled={isConnecting}
                  className="w-full p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 font-bold text-xs flex items-center justify-between transition-all active:scale-95 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    {det.info.icon ? (
                      <img src={det.info.icon} alt={det.info.name} className="w-6 h-6 rounded-lg" />
                    ) : (
                      <Wallet className="w-5 h-5 text-emerald-400" />
                    )}
                    <span className="text-slate-900 dark:text-white font-bold">{det.info.name}</span>
                  </div>
                  <span className="px-2 py-1 rounded-lg bg-emerald-500 text-slate-950 font-extrabold text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Connect Extension
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Primary Extension Buttons */}
        <div className="space-y-2 text-xs">
          <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
            Choose Your Wallet Extension:
          </span>

          {/* MetaMask */}
          <button
            onClick={() => handleConnectProvider('MetaMask')}
            disabled={isConnecting}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200 transition-all active:scale-95 group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🦊</span>
              <div className="text-left">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  MetaMask
                  {hasMetaMaskInjected && (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-mono">
                      Detected
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400">Ethereum, Polygon, Arbitrum, BSC, L2s</div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-600 group-hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1">
              {isConnecting && connectingProviderName === 'MetaMask' ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                'Connect'
              )}
            </span>
          </button>

          {/* Coinbase Wallet */}
          <button
            onClick={() => handleConnectProvider('Coinbase')}
            disabled={isConnecting}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200 transition-all active:scale-95 group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🔵</span>
              <div className="text-left">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Coinbase Wallet
                  {hasCoinbaseInjected && (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-mono">
                      Detected
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400">Coinbase Extension & Smart Wallet</div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-600 group-hover:bg-indigo-500 text-white font-bold text-[11px]">
              {isConnecting && connectingProviderName === 'Coinbase' ? 'Connecting...' : 'Connect'}
            </span>
          </button>

          {/* Phantom Wallet */}
          <button
            onClick={() => handleConnectProvider('Phantom')}
            disabled={isConnecting}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200 transition-all active:scale-95 group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">👻</span>
              <div className="text-left">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Phantom
                  {hasPhantomInjected && (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-mono">
                      Detected
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400">Solana & Multi-Chain Extension</div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-600 group-hover:bg-indigo-500 text-white font-bold text-[11px]">
              {isConnecting && connectingProviderName === 'Phantom' ? 'Connecting...' : 'Connect'}
            </span>
          </button>

          {/* Rabby Wallet */}
          <button
            onClick={() => handleConnectProvider('Rabby')}
            disabled={isConnecting}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200 transition-all active:scale-95 group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🐰</span>
              <div className="text-left">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Rabby Wallet
                  {hasRabbyInjected && (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-mono">
                      Detected
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400">Security-focused Multi-chain EVM Extension</div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-600 group-hover:bg-indigo-500 text-white font-bold text-[11px]">
              {isConnecting && connectingProviderName === 'Rabby' ? 'Connecting...' : 'Connect'}
            </span>
          </button>

          {/* Stellar Freighter */}
          <button
            onClick={() => handleConnectProvider('Stellar')}
            disabled={isConnecting}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200 transition-all active:scale-95 group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🚀</span>
              <div className="text-left">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Freighter / Stellar
                  {hasFreighterInjected && (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-mono">
                      Detected
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400">Stellar Cross-Border Remittance Extension</div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-600 group-hover:bg-indigo-500 text-white font-bold text-[11px]">
              {isConnecting && connectingProviderName === 'Stellar' ? 'Connecting...' : 'Connect'}
            </span>
          </button>

          {/* Generic Injected Web3 */}
          <button
            onClick={() => handleConnectProvider('GenericInjected')}
            disabled={isConnecting}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200 transition-all active:scale-95 group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">⚡</span>
              <div className="text-left">
                <div className="font-bold text-slate-900 dark:text-white">
                  Other EIP-1193 Extension (Trust, OKX, Rainbow)
                </div>
                <div className="text-[10px] text-slate-400">Connect any injected browser extension</div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-600 group-hover:bg-indigo-500 text-white font-bold text-[11px]">
              Connect
            </span>
          </button>
        </div>

        {/* Error message / Notice */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>Wallet Extension Notice:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Manual Address Integration */}
        <form onSubmit={handleIntegrateCustomAddress} className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 space-y-2 text-xs">
          <span className="text-indigo-900 dark:text-indigo-200 font-bold block">
            Or Paste Your Wallet Address Directly:
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              placeholder="0x... or ENS or Stellar/Solana Public Key"
              className="flex-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs rounded-xl px-3 py-2 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-all"
            >
              Link
            </button>
          </div>
        </form>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onTopUpFaucet}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+10,000 Testnet Faucet</span>
          </button>

          {onDisconnectWallet && (
            <button
              onClick={() => {
                onDisconnectWallet();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
            >
              Disconnect
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

