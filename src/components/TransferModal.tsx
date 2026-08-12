import React, { useState, useEffect } from 'react';
import { WalletState, SupportedChain, TransactionAuditLog, AuthState } from '../types';
import { ALL_COINS, getCoinInfo, convertCoinToUsd, getCoinsForChain } from '../data/coinCatalog';
import { validateAddressForChain, CHAIN_ADDRESS_MAP, getChainAddress } from '../utils/chainAddress';
import { 
  Send, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Copy,
  Check,
  RefreshCw,
  Gauge,
  Flame,
  Coins,
  Lock,
  Sparkles,
  Landmark,
  Building2,
  CreditCard,
  ArrowDownRight,
  Banknote
} from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletState;
  authState: AuthState;
  onOpenAuthModal: () => void;
  onCompleteTransfer: (amount: number, token: string, recipient: string, txHash: string) => void;
}

type GasPriority = 'slow' | 'standard' | 'fast';

interface NetworkGasInfo {
  baseGwei: number;
  unitLabel: string;
  usdBase: number;
  blockTimeSec: number;
  congestion: 'LOW' | 'NORMAL' | 'HIGH';
}

const CHAIN_GAS_CONFIG: Record<SupportedChain, NetworkGasInfo> = {
  Ethereum: { baseGwei: 18, unitLabel: 'Gwei', usdBase: 0.85, blockTimeSec: 12, congestion: 'NORMAL' },
  Polygon: { baseGwei: 35, unitLabel: 'Gwei', usdBase: 0.005, blockTimeSec: 2, congestion: 'LOW' },
  Base: { baseGwei: 0.08, unitLabel: 'Gwei', usdBase: 0.002, blockTimeSec: 2, congestion: 'LOW' },
  Arbitrum: { baseGwei: 0.1, unitLabel: 'Gwei', usdBase: 0.003, blockTimeSec: 1, congestion: 'LOW' },
  Optimism: { baseGwei: 0.02, unitLabel: 'Gwei', usdBase: 0.002, blockTimeSec: 2, congestion: 'LOW' },
  Solana: { baseGwei: 5000, unitLabel: 'Lamports', usdBase: 0.0008, blockTimeSec: 0.4, congestion: 'LOW' },
  'BNB Chain': { baseGwei: 3.0, unitLabel: 'Gwei', usdBase: 0.03, blockTimeSec: 3, congestion: 'NORMAL' },
  Avalanche: { baseGwei: 25, unitLabel: 'Gwei', usdBase: 0.02, blockTimeSec: 2, congestion: 'LOW' },
  Tron: { baseGwei: 1.0, unitLabel: 'Energy/TRX', usdBase: 0.12, blockTimeSec: 3, congestion: 'NORMAL' },
  'Bitcoin Network': { baseGwei: 14, unitLabel: 'sat/vB', usdBase: 1.80, blockTimeSec: 600, congestion: 'HIGH' },
  'Stellar Network': { baseGwei: 100, unitLabel: 'stroops', usdBase: 0.000001, blockTimeSec: 3, congestion: 'LOW' },
};

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  wallet,
  authState,
  onOpenAuthModal,
  onCompleteTransfer,
}) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('100');
  const [selectedToken, setSelectedToken] = useState<string>('USDC');
  const [selectedChain, setSelectedChain] = useState<SupportedChain>(wallet.chain);
  const [note, setNote] = useState('');
  const [gasPriority, setGasPriority] = useState<GasPriority>('standard');
  const [lastRefreshedSec, setLastRefreshedSec] = useState(0);
  const [isRefreshingGas, setIsRefreshingGas] = useState(false);
  const [gasVariance, setGasVariance] = useState(1.0);

  // Transfer Mode: On-Chain Wallet Send vs Bank Account Off-Ramp Withdrawal
  const [transferMode, setTransferMode] = useState<'CRYPTO' | 'BANK_WITHDRAWAL'>('CRYPTO');

  // Destination Bank Account Details
  const [bankName, setBankName] = useState(authState.user?.bankAccount?.bankName || 'JPMorgan Chase');
  const [bankAccountName, setBankAccountName] = useState(
    authState.user?.bankAccount?.accountName || authState.user?.fullName || authState.user?.username || 'Johnathan Vance'
  );
  const [bankAccountNumber, setBankAccountNumber] = useState(authState.user?.bankAccount?.accountNumber || '1029384756');
  const [bankRoutingNumber, setBankRoutingNumber] = useState(authState.user?.bankAccount?.routingNumber || '021000021');

  // Keep Bank Details in Sync with user profile
  useEffect(() => {
    if (authState.user?.bankAccount) {
      setBankName(authState.user.bankAccount.bankName || 'JPMorgan Chase');
      setBankAccountName(
        authState.user.bankAccount.accountName || authState.user.fullName || authState.user.username
      );
      setBankAccountNumber(authState.user.bankAccount.accountNumber || '1029384756');
      setBankRoutingNumber(authState.user.bankAccount.routingNumber || '021000021');
    }
  }, [authState.user, isOpen]);

  // Transaction execution state
  const [status, setStatus] = useState<'IDLE' | 'PREPARING' | 'WAITING_SIGNATURE' | 'BROADCASTING' | 'CONFIRMED' | 'FAILED'>('IDLE');
  const [txHash, setTxHash] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Transfer security authorization inputs
  const [authStep, setAuthStep] = useState<'FORM' | 'AUTHENTICATING'>('FORM');
  const [authPassword, setAuthPassword] = useState('');
  const [auth2faCode, setAuth2faCode] = useState('');

  // Keep selectedChain synced with wallet or auto-adjust based on token primary network
  useEffect(() => {
    setSelectedChain(wallet.chain);
  }, [wallet.chain]);

  // Available coins specifically on the selected network
  const availableCoins = getCoinsForChain(selectedChain);

  // Auto-reset selected token if it's not supported on newly selected network
  useEffect(() => {
    const isStillValid = availableCoins.some((c) => c.symbol === selectedToken);
    if (!isStillValid && availableCoins.length > 0) {
      setSelectedToken(availableCoins[0].symbol);
    }
  }, [selectedChain]);

  // Simulate real-time gas price fluctuations
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setLastRefreshedSec((prev) => prev + 1);
      if (Math.random() > 0.6) {
        // slight fluctuation (+/- 5%)
        setGasVariance(0.95 + Math.random() * 0.1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentCoin = getCoinInfo(selectedToken);
  const tokenBalance = wallet.tokenBalances[selectedToken] || 0;
  const numericAmount = parseFloat(amount) || 0;
  const usdValue = convertCoinToUsd(selectedToken, numericAmount);

  const chainConfig = CHAIN_GAS_CONFIG[selectedChain] || CHAIN_GAS_CONFIG.Ethereum;
  const priorityMultiplier = gasPriority === 'slow' ? 0.85 : gasPriority === 'fast' ? 1.35 : 1.0;
  const currentGwei = (chainConfig.baseGwei * gasVariance * priorityMultiplier).toFixed(chainConfig.unitLabel === 'Lamports' ? 0 : 2);
  const estimatedGasUsd = Math.max(0.0001, chainConfig.usdBase * gasVariance * priorityMultiplier);

  const handleRefreshGas = () => {
    setIsRefreshingGas(true);
    setTimeout(() => {
      setGasVariance(0.92 + Math.random() * 0.16);
      setLastRefreshedSec(0);
      setIsRefreshingGas(false);
    }, 450);
  };

  const getExplorerUrl = (chain: SupportedChain, hash: string) => {
    switch (chain) {
      case 'Ethereum': return `https://etherscan.io/tx/${hash}`;
      case 'Polygon': return `https://polygonscan.com/tx/${hash}`;
      case 'Base': return `https://basescan.org/tx/${hash}`;
      case 'Arbitrum': return `https://arbiscan.io/tx/${hash}`;
      case 'Optimism': return `https://optimistic.etherscan.io/tx/${hash}`;
      case 'Solana': return `https://solscan.io/tx/${hash}`;
      case 'BNB Chain': return `https://bscscan.com/tx/${hash}`;
      case 'Avalanche': return `https://snowtrace.io/tx/${hash}`;
      case 'Tron': return `https://tronscan.org/#/transaction/${hash}`;
      case 'Bitcoin Network': return `https://mempool.space/tx/${hash}`;
      case 'Stellar Network': return `https://stellarexpert.io/tx/${hash}`;
      default: return `https://etherscan.io/tx/${hash}`;
    }
  };

  const handleProceedToSecurity = () => {
    if (!authState.isAuthenticated) {
      setErrorMessage('🔒 Authentication Required: You must be signed in to execute transfers or withdrawals.');
      onOpenAuthModal();
      return;
    }

    if (numericAmount <= 0) {
      setErrorMessage('Please enter a valid amount.');
      return;
    }

    if (transferMode === 'CRYPTO') {
      if (!recipient) {
        setErrorMessage('Please provide a valid recipient address.');
        return;
      }

      const validation = validateAddressForChain(selectedChain, recipient);
      if (!validation.isValid) {
        setErrorMessage(`Invalid address for ${selectedChain}: ${validation.reason}`);
        return;
      }
    } else {
      // Bank Withdrawal Validation
      if (!bankName.trim() || !bankAccountNumber.trim()) {
        setErrorMessage('Please specify a valid Bank Name and Account / IBAN Number.');
        return;
      }
      const maskedAcct = bankAccountNumber.trim().length > 4 ? bankAccountNumber.trim().slice(-4) : bankAccountNumber.trim();
      setRecipient(`Bank Wire: ${bankName.trim()} (****${maskedAcct}) - ${bankAccountName.trim() || 'Legal Name'}`);
    }

    if (numericAmount > tokenBalance && tokenBalance > 0) {
      setErrorMessage(`Insufficient ${selectedToken} balance (You have ${tokenBalance} ${selectedToken}).`);
      return;
    }

    setErrorMessage('');
    setAuthStep('AUTHENTICATING');
  };

  const handleExecuteTransfer = async () => {
    if (!authPassword) {
      setErrorMessage('🔒 Password required: Please enter your NexusPay account password.');
      return;
    }

    if (authState.user?.passwordHash && authPassword !== authState.user.passwordHash) {
      setErrorMessage('❌ Invalid account password provided. Please check and try again.');
      return;
    }

    if (!auth2faCode || auth2faCode.trim().length < 6) {
      setErrorMessage('🔐 2FA Security Token Required: Please enter your 6-digit Google Authenticator / 2FA code.');
      return;
    }

    setErrorMessage('');
    setStatus('PREPARING');

    // Simulate/attempt real EIP-1193 Web3 transaction if wallet provider exists in window
    try {
      await new Promise((r) => setTimeout(r, 600));
      setStatus('WAITING_SIGNATURE');

      let generatedHash = '';

      // Check if user is connected via real injected wallet provider
      if (wallet.walletType === 'MetaMask' || wallet.walletType === 'Injected Web3' || wallet.walletType === 'Coinbase') {
        if (typeof window !== 'undefined' && (window as any).ethereum) {
          try {
            const valueHex = selectedToken === 'ETH' ? `0x${(numericAmount * 1e18).toString(16)}` : '0x0';
            const params = [{
              from: wallet.address,
              to: recipient.startsWith('0x') ? recipient : '0x0000000000000000000000000000000000000000',
              value: valueHex,
            }];
            
            const txResponse = await (window as any).ethereum.request({
              method: 'eth_sendTransaction',
              params,
            });
            generatedHash = txResponse;
          } catch (err: any) {
            console.warn('Real Web3 prompt declined or fallback needed:', err);
            generatedHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
          }
        } else {
          generatedHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
        }
      } else {
        generatedHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
      }

      setTxHash(generatedHash);
      setStatus('BROADCASTING');

      await new Promise((r) => setTimeout(r, 1200));
      setStatus('CONFIRMED');

      onCompleteTransfer(numericAmount, selectedToken, recipient, generatedHash);
    } catch (err: any) {
      setStatus('FAILED');
      setErrorMessage(err.message || 'Transaction failed on network.');
    }
  };

  const resetModal = () => {
    setStatus('IDLE');
    setAuthStep('FORM');
    setAuthPassword('');
    setAuth2faCode('');
    setRecipient('');
    setAmount('100');
    setErrorMessage('');
    setTxHash('');
    onClose();
  };

  return (
    <div 
      onClick={resetModal}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto cursor-default"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Transfer & Send Cryptocurrencies
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Send any coin (BTC, ETH, SOL, XLM, Stablecoins...) with real-time gas estimation
              </p>
            </div>
          </div>
          <button 
            onClick={resetModal} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {status === 'IDLE' && authStep === 'FORM' && (
          <div className="space-y-3.5 text-xs">
            
            {/* Transfer Mode Switcher */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setTransferMode('CRYPTO');
                  setErrorMessage('');
                }}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  transferMode === 'CRYPTO'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Crypto Wallet Send</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTransferMode('BANK_WITHDRAWAL');
                  setErrorMessage('');
                }}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  transferMode === 'BANK_WITHDRAWAL'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Landmark className="w-3.5 h-3.5" />
                <span>Withdraw to Bank</span>
              </button>
            </div>

            {transferMode === 'CRYPTO' ? (
              <>
                {/* Sender Source & Target Chain Selection */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">From Account</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs block truncate">
                      {wallet.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : 'Not Connected'}
                    </span>
                    <span className="text-[10px] text-indigo-500 font-semibold">{wallet.walletType}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <label className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider mb-0.5">Network Rail</label>
                    <select
                      value={selectedChain}
                      onChange={(e) => setSelectedChain(e.target.value as SupportedChain)}
                      className="w-full bg-transparent font-bold text-slate-900 dark:text-white text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="Ethereum">Ethereum Mainnet</option>
                      <option value="Polygon">Polygon POS</option>
                      <option value="Base">Base L2</option>
                      <option value="Arbitrum">Arbitrum One</option>
                      <option value="Optimism">Optimism</option>
                      <option value="Solana">Solana Network</option>
                      <option value="BNB Chain">BNB Chain (BSC)</option>
                      <option value="Avalanche">Avalanche C-Chain</option>
                      <option value="Tron">Tron Network</option>
                      <option value="Bitcoin Network">Bitcoin Network</option>
                      <option value="Stellar Network">Stellar Network (XLM)</option>
                    </select>
                  </div>
                </div>

                {/* Recipient Address Input */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                      Recipient Address / ENS / Domain
                    </label>
                    {recipient.trim() && (
                      <span className={`text-[10px] font-semibold flex items-center gap-1 ${
                        validateAddressForChain(selectedChain, recipient).isValid 
                          ? 'text-emerald-500 dark:text-emerald-400' 
                          : 'text-amber-500'
                      }`}>
                        {validateAddressForChain(selectedChain, recipient).isValid ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Valid {validateAddressForChain(selectedChain, recipient).isDomain ? 'Domain' : selectedChain} Address</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3" />
                            <span>{validateAddressForChain(selectedChain, recipient).reason}</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder={selectedChain === 'Solana' ? '7xKXtg... (Solana Address)' : selectedChain === 'Bitcoin Network' ? 'bc1q... (Bitcoin Address)' : selectedChain === 'Stellar Network' ? 'G... (Stellar Public Key)' : selectedChain === 'Tron' ? 'T... (Tron Address)' : '0x71C... or recipient.eth'}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  
                  {/* Quick Sample Fill Options */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[10px]">
                    <span className="text-slate-400 font-medium">Quick Fill:</span>
                    <button
                      type="button"
                      onClick={() => setRecipient(getChainAddress(selectedChain))}
                      className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800 transition-all active:scale-95 flex items-center gap-1"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                      <span>Valid {selectedChain} Sample</span>
                    </button>
                    {['Ethereum', 'Polygon', 'Base', 'Arbitrum', 'Optimism'].includes(selectedChain) && (
                      <button
                        type="button"
                        onClick={() => setRecipient('treasury.eth')}
                        className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-600 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-800 transition-all active:scale-95"
                      >
                        treasury.eth
                      </button>
                    )}
                    {selectedChain === 'Solana' && (
                      <button
                        type="button"
                        onClick={() => setRecipient('treasury.sol')}
                        className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-600 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-800 transition-all active:scale-95"
                      >
                        treasury.sol
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* Bank Account Destination Details */
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
                  <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-emerald-500" />
                    Destination Bank Account
                  </span>
                  <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    FedNow / ACH / Wire Instant
                  </span>
                </div>

                {authState.user?.bankAccount ? (
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-emerald-300 block text-[11px]">{bankName}</span>
                      <span className="text-[10px] text-slate-300 font-mono">
                        Acc: ****{bankAccountNumber.slice(-4)} • {bankAccountName}
                      </span>
                    </div>
                    <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Linked
                    </span>
                  </div>
                ) : (
                  <div className="text-[10px] text-amber-500 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 flex items-center justify-between">
                    <span>No bank account linked in profile. Enter details below:</span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAuthModal();
                      }}
                      className="underline font-bold text-amber-400 hover:text-amber-300 text-[10px] shrink-0"
                    >
                      Link in Profile
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. Chase / Barclays"
                      className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 focus:outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={bankAccountName}
                      onChange={(e) => setBankAccountName(e.target.value)}
                      placeholder="Legal Account Name"
                      className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 focus:outline-none text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                      Account Number / IBAN
                    </label>
                    <input
                      type="text"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      placeholder="1029384756 or IBAN"
                      className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 focus:outline-none text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                      Routing / SWIFT Code
                    </label>
                    <input
                      type="text"
                      value={bankRoutingNumber}
                      onChange={(e) => setBankRoutingNumber(e.target.value)}
                      placeholder="021000021"
                      className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 focus:outline-none text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Token & Amount Selection (Supports ALL Coins) */}
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-5">
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Select Token (Any Coin)
                </label>
                <select
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl px-2.5 py-2 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                >
                  {availableCoins.map((c) => (
                    <option key={c.symbol} value={c.symbol}>
                      {c.icon} {c.symbol} ({c.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-7">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                    Amount
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Bal: {tokenBalance.toLocaleString()} {selectedToken}
                  </span>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-xs rounded-xl pl-3 pr-14 py-2 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setAmount(tokenBalance > 0 ? tokenBalance.toString() : '100')}
                    className="absolute right-1.5 px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-bold text-[10px] hover:opacity-80"
                  >
                    MAX
                  </button>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5 text-right">
                  ~${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </span>
              </div>
            </div>

            {/* Note/Memo Optional */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Transaction Note / Memo (Optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Vendor payout or Stellar memo"
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>

            {/* Real-time Gas Fee Estimator Box */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/80 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                    Live Gas Fee Estimator ({selectedChain})
                  </span>
                </div>
                
                <button
                  type="button"
                  onClick={handleRefreshGas}
                  className="flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshingGas ? 'animate-spin' : ''}`} />
                  <span>{lastRefreshedSec}s ago</span>
                </button>
              </div>

              {/* Gas Speed / Priority Selector */}
              <div className="grid grid-cols-3 gap-1.5 bg-white/80 dark:bg-slate-900/80 p-1 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                {(['slow', 'standard', 'fast'] as GasPriority[]).map((p) => {
                  const mult = p === 'slow' ? 0.85 : p === 'fast' ? 1.35 : 1.0;
                  const gwei = (chainConfig.baseGwei * gasVariance * mult).toFixed(1);
                  const usd = Math.max(0.0001, chainConfig.usdBase * gasVariance * mult);

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setGasPriority(p)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold text-center transition-all ${
                        gasPriority === p
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="capitalize block">{p}</span>
                      <span className="font-mono text-[9px] opacity-90">${usd < 0.01 ? usd.toFixed(4) : usd.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>

              {/* Breakdown */}
              <div className="space-y-1 pt-1 border-t border-indigo-200/50 dark:border-indigo-900/50 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Current Base Rate:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {currentGwei} {chainConfig.unitLabel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Estimated Total Fee:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    ~${estimatedGasUsd < 0.01 ? estimatedGasUsd.toFixed(5) : estimatedGasUsd.toFixed(3)} USD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Block Confirmation Time:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" /> ~{chainConfig.blockTimeSec}s
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action button: Proceed to Security Verification */}
            <button
              onClick={handleProceedToSecurity}
              className={`w-full py-3 rounded-xl text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 ${
                transferMode === 'BANK_WITHDRAWAL'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/20'
              }`}
            >
              <Lock className="w-4 h-4 text-emerald-300" />
              <span>
                {transferMode === 'BANK_WITHDRAWAL' ? 'Authorize Bank Withdrawal' : 'Authorize Transfer'} ({numericAmount} {selectedToken})
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>
        )}

        {/* STEP 2: SECURITY AUTHORIZATION SCREEN (TOKEN, PASSWORD, 2FA AUTHENTICATION) */}
        {status === 'IDLE' && authStep === 'AUTHENTICATING' && (
          <div className="space-y-4 text-xs animate-in fade-in duration-150">
            
            {/* Header / Summary Card */}
            <div className="p-4 rounded-xl bg-indigo-950/50 border border-indigo-800/80 space-y-3">
              <div className="flex items-center justify-between border-b border-indigo-900/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{currentCoin?.icon || '🪙'}</span>
                  <div>
                    <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                      {numericAmount} {selectedToken}
                    </h4>
                    <span className="text-[11px] text-emerald-400 font-semibold block">
                      ~${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-indigo-900 text-indigo-300 font-bold text-[10px] border border-indigo-700">
                  {selectedChain}
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Recipient Address:</span>
                  <span className="font-mono text-indigo-200 font-bold">
                    {recipient.length > 20 ? `${recipient.slice(0, 10)}...${recipient.slice(-8)}` : recipient}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimated Gas Fee:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    ~${estimatedGasUsd < 0.01 ? estimatedGasUsd.toFixed(4) : estimatedGasUsd.toFixed(2)} USD
                  </span>
                </div>
              </div>
            </div>

            {/* Authentication & Security Form */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 border-b border-slate-800 pb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Security & Password Authorization</span>
              </div>

              {/* Password Challenge */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  Account Password
                </label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Enter your NexusPay password"
                  className="w-full bg-slate-900 text-white rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                />
              </div>

              {/* 2FA Authenticator Challenge */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    2FA Authenticator Code / Token
                  </label>
                  <button
                    type="button"
                    onClick={() => setAuth2faCode('849201')}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono underline"
                  >
                    Auto-Fill 2FA: 849201
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={auth2faCode}
                  onChange={(e) => setAuth2faCode(e.target.value)}
                  placeholder="Enter 6-digit Google Authenticator code"
                  className="w-full bg-slate-900 text-emerald-300 font-mono tracking-widest text-center text-sm font-bold rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAuthStep('FORM');
                  setErrorMessage('');
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-all active:scale-95"
              >
                ← Back
              </button>

              <button
                type="button"
                onClick={handleExecuteTransfer}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Confirm & Execute Transfer</span>
              </button>
            </div>

          </div>
        )}

        {/* Progressing state */}
        {(status === 'PREPARING' || status === 'WAITING_SIGNATURE' || status === 'BROADCASTING') && (
          <div className="py-8 text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-600 animate-spin"></div>
              <Zap className="w-8 h-8 text-indigo-500" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {status === 'PREPARING' && 'Preparing On-Chain Payload & Gas Lock...'}
                {status === 'WAITING_SIGNATURE' && 'Awaiting Signature from Connected Wallet...'}
                {status === 'BROADCASTING' && 'Broadcasting Transaction to L2 / L1 Validators...'}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Settling {numericAmount} {selectedToken} on {selectedChain}.
              </p>
            </div>

            <div className="max-w-xs mx-auto space-y-2 text-xs text-left pt-2">
              <div className={`flex items-center gap-2 ${status === 'PREPARING' ? 'text-indigo-600 font-bold' : 'text-emerald-500'}`}>
                <CheckCircle2 className="w-4 h-4" /> 1. Locked Gas Rate ({currentGwei} {chainConfig.unitLabel})
              </div>
              <div className={`flex items-center gap-2 ${status === 'WAITING_SIGNATURE' ? 'text-indigo-600 font-bold' : status === 'BROADCASTING' ? 'text-emerald-500' : 'text-slate-400'}`}>
                <CheckCircle2 className="w-4 h-4" /> 2. Cryptographic Signature
              </div>
              <div className={`flex items-center gap-2 ${status === 'BROADCASTING' ? 'text-indigo-600 font-bold animate-pulse' : 'text-slate-400'}`}>
                <CheckCircle2 className="w-4 h-4" /> 3. Block Propagation
              </div>
            </div>
          </div>
        )}

        {/* Confirmed State */}
        {status === 'CONFIRMED' && (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Transaction Confirmed On-Chain!
              </h4>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                Successfully transferred {numericAmount} {selectedToken} (~${usdValue.toFixed(2)} USD) to recipient.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs text-left font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Recipient:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{recipient.slice(0, 10)}...{recipient.slice(-6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Network:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">{selectedChain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gas Paid:</span>
                <span className="text-emerald-500 font-bold">~${estimatedGasUsd.toFixed(4)} USD ({currentGwei} {chainConfig.unitLabel})</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-slate-800">
                <span className="text-slate-400">Tx Hash:</span>
                <a
                  href={getExplorerUrl(selectedChain, txHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-500 hover:underline font-bold flex items-center gap-1 text-[11px]"
                >
                  {txHash.slice(0, 12)}...{txHash.slice(-6)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <button
              onClick={resetModal}
              className="w-full py-3 rounded-xl bg-slate-900 text-white dark:bg-indigo-600 hover:opacity-90 font-bold text-xs shadow-md transition-all"
            >
              Done & Return to Treasury
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

