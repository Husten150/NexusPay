import React, { useState, useEffect } from 'react';
import { WalletState } from '../types';
import { 
  Wallet, 
  CheckCircle2, 
  Zap, 
  ArrowRight,
  ShieldCheck, 
  Check, 
  Globe, 
  AlertCircle, 
  ExternalLink, 
  Download, 
  RefreshCw, 
  Key,
  Coins
} from 'lucide-react';
import { 
  connectFreighter, 
  checkFreighterInstalled, 
  getOrCreateLocalStellarKeypair 
} from '../stellar/wallet';
import { CURRENT_STELLAR_NETWORK, getStellarExplorerAccountUrl, getStellarExplorerContractUrl } from '../stellar/config';
import { extractAddressAndParamsFromQr } from '../utils/chainAddress';

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
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  wallet,
  onConnectWallet,
  onDisconnectWallet,
}) => {
  const [customAddress, setCustomAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingProviderName, setConnectingProviderName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hasFreighter, setHasFreighter] = useState(false);
  const [stellarLocalKey, setStellarLocalKey] = useState<{ publicKey: string; secretKey: string } | null>(null);
  const [detectedEip6963Providers, setDetectedEip6963Providers] = useState<EIP6963ProviderDetail[]>([]);

  useEffect(() => {
    checkFreighterInstalled().then(setHasFreighter);
    const pair = getOrCreateLocalStellarKeypair();
    setStellarLocalKey(pair);
  }, []);

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

  const handleConnectFreighter = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsConnecting(true);
    setConnectingProviderName('Freighter');

    try {
      const account = await connectFreighter();
      if (account && account.publicKey) {
        onConnectWallet('Stellar Wallet (Freighter)', account.publicKey);
        setSuccessMessage(`Connected to Freighter: ${account.publicKey.slice(0, 6)}...${account.publicKey.slice(-4)}`);
        setTimeout(() => onClose(), 600);
      }
    } catch (err: any) {
      console.warn('Freighter connect error:', err);
      setErrorMessage(err.message || 'Could not connect to Freighter extension. Please unlock Freighter or use a direct Stellar keypair.');
    } finally {
      setIsConnecting(false);
      setConnectingProviderName(null);
    }
  };

  const handleConnectStellarLocalKeypair = async () => {
    const pair = stellarLocalKey || getOrCreateLocalStellarKeypair();
    onConnectWallet('Stellar Wallet (Freighter)', pair.publicKey);
    setSuccessMessage(`Connected to Stellar Account: ${pair.publicKey.slice(0, 6)}...${pair.publicKey.slice(-4)}`);
    setTimeout(() => onClose(), 600);
  };

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

  const handleConnectProvider = async (walletId: string) => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsConnecting(true);
    setConnectingProviderName(walletId);

    try {
      if (typeof window === 'undefined') {
        throw new Error('Browser window environment not available.');
      }

      if (walletId === 'Freighter') {
        await handleConnectFreighter();
        return;
      }

      if (walletId === 'MetaMask') {
        let ethereum = (window as any).ethereum;
        if (ethereum?.providers?.length) {
          ethereum = ethereum.providers.find((p: any) => p.isMetaMask) || ethereum;
        }

        if (ethereum) {
          await triggerEvmExtensionConnect(ethereum, 'MetaMask');
        } else {
          setErrorMessage('MetaMask extension not detected in this browser.');
        }
      } else if (walletId === 'Coinbase') {
        let provider = (window as any).coinbaseWalletExtension || (window as any).ethereum;
        if (provider?.providers?.length) {
          provider = provider.providers.find((p: any) => p.isCoinbaseWallet) || provider;
        }

        if (provider) {
          await triggerEvmExtensionConnect(provider, 'Coinbase Wallet');
        } else {
          setErrorMessage('Coinbase Wallet extension not detected in this browser.');
        }
      } else if (walletId === 'Phantom') {
        const solanaObj = (window as any).solana || (window as any).phantom?.solana;
        if (solanaObj && solanaObj.isPhantom) {
          const resp = await solanaObj.connect();
          const pubKey = resp.publicKey.toString();
          onConnectWallet('Phantom', pubKey);
          onClose();
        } else {
          setErrorMessage('Phantom extension not detected in this browser.');
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
      setErrorMessage('Please enter a valid wallet address (e.g. G... for Stellar or 0x...).');
      return;
    }
    setErrorMessage('');
    const parsed = extractAddressAndParamsFromQr(customAddress.trim());
    const cleanAddr = parsed.cleanAddress || customAddress.trim();
    const type = cleanAddr.startsWith('G') ? 'Stellar Wallet (Freighter)' : 'Injected Web3';
    onConnectWallet(type, cleanAddr);
    onClose();
  };

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
                Connect Wallet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Stellar & Soroban Smart Contract Integration
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
                : 'None'}
            </span>
          </div>

          <div className="flex justify-between items-center font-mono pt-1 border-t border-slate-200 dark:border-slate-800 text-[11px]">
            <span className="text-slate-400">Soroban Contract:</span>
            <a 
              href={getStellarExplorerContractUrl(CURRENT_STELLAR_NETWORK.contractId)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
            >
              {CURRENT_STELLAR_NETWORK.contractId.slice(0, 8)}...{CURRENT_STELLAR_NETWORK.contractId.slice(-6)}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Feedback messages */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Primary Stellar & Soroban Wallets */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Stellar & Soroban Wallets
          </div>

          {/* Stellar Freighter Wallet Button */}
          <button
            onClick={() => handleConnectProvider('Freighter')}
            disabled={isConnecting}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-indigo-500/40 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 transition-all text-left shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow">
                🚀
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Freighter Wallet (Stellar / Soroban)</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-bold">
                    Native
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {hasFreighter ? 'Extension detected in browser' : 'Official Stellar browser extension'}
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Direct Stellar Account Keypair */}
          {stellarLocalKey && (
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-500" />
                  Stellar Direct Account Keypair
                </span>
                <button
                  onClick={handleConnectStellarLocalKeypair}
                  className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] transition-all cursor-pointer"
                >
                  Use This Key
                </button>
              </div>
              <div className="font-mono text-[10px] text-slate-600 dark:text-slate-400 truncate">
                {stellarLocalKey.publicKey}
              </div>
            </div>
          )}
        </div>

        {/* Multi-Chain Wallets */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Multi-Chain Extensions
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleConnectProvider('MetaMask')}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <span>🦊</span>
              <span>MetaMask</span>
            </button>

            <button
              onClick={() => handleConnectProvider('Phantom')}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <span>🟣</span>
              <span>Phantom</span>
            </button>
          </div>
        </div>

        {/* Manual Address Input */}
        <form onSubmit={handleIntegrateCustomAddress} className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            Or Paste Custom Address (Stellar G... or EVM 0x...)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              placeholder="G... or 0x..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer"
            >
              Connect
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
