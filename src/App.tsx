import React, { useState, useEffect } from 'react';
import { 
  WalletState, 
  SupportedChain, 
  PaymentStream, 
  MerchantInvoice, 
  RemittanceQuote, 
  YieldPosition, 
  TransactionAuditLog, 
  AgentActionIntent,
  UserAccount,
  AuthState
} from './types';
import { 
  INITIAL_WALLET, 
  INITIAL_STREAMS, 
  INITIAL_INVOICES, 
  INITIAL_REMITTANCE_QUOTES, 
  INITIAL_YIELD_POSITIONS, 
  INITIAL_AUDIT_LOGS, 
  loadSavedState, 
  saveState 
} from './data/mockWeb3State';
import { getCoinInfo } from './data/coinCatalog';

import { Navbar } from './components/Navbar';
import { AgentCommandCenter } from './components/AgentCommandCenter';
import { DashboardOverview } from './components/DashboardOverview';
import { PayrollAndStreams } from './components/PayrollAndStreams';
import { InvoiceGateway } from './components/InvoiceGateway';
import { CrossBorderRemittance } from './components/CrossBorderRemittance';
import { TreasuryYieldOptimizer } from './components/TreasuryYieldOptimizer';
import { SecurityContractAuditor } from './components/SecurityContractAuditor';
import { WalletModal } from './components/WalletModal';
import { TransferModal } from './components/TransferModal';
import { ReceiveModal } from './components/ReceiveModal';
import { SubmissionHubModal } from './components/SubmissionHubModal';
import { AuthModal } from './components/AuthModal';
import { PwaInstallModal } from './components/PwaInstallModal';

import { 
  LayoutDashboard, 
  Zap, 
  Receipt, 
  Globe, 
  PiggyBank, 
  ShieldCheck, 
  Check
} from 'lucide-react';

export default function App() {
  // Navigation with URL & History Sync
  const [activeTab, setActiveTab] = useState<'overview' | 'streams' | 'invoices' | 'remittance' | 'yield' | 'security'>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const initialTab = urlParams.get('tab');
      if (initialTab && ['overview', 'streams', 'invoices', 'remittance', 'yield', 'security'].includes(initialTab)) {
        return initialTab as any;
      }
    }
    return 'overview';
  });

  // Tab change handler with window.history.pushState support
  const handleTabChange = (tab: 'overview' | 'streams' | 'invoices' | 'remittance' | 'yield' | 'security', pushToHistory = true) => {
    setShowWalletModal(false);
    setShowTransferModal(false);
    setShowReceiveModal(false);
    setShowSubmissionHubModal(false);
    setShowAuthModal(false);
    setShowPwaModal(false);

    setActiveTab(tab);
    if (pushToHistory && typeof window !== 'undefined') {
      const newUrl = `${window.location.pathname}?tab=${tab}`;
      if (window.location.search !== `?tab=${tab}` || !window.history.state || window.history.state.tab !== tab) {
        window.history.pushState({ tab }, '', newUrl);
      }
    }
  };

  // Helper functions to open modals with browser history tracking
  const handleOpenWalletModal = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({ modal: 'wallet', tab: activeTab }, '', `${window.location.pathname}?tab=${activeTab}&modal=wallet`);
    }
    setShowWalletModal(true);
  };

  const handleOpenTransferModal = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({ modal: 'transfer', tab: activeTab }, '', `${window.location.pathname}?tab=${activeTab}&modal=transfer`);
    }
    setShowTransferModal(true);
  };

  const handleOpenReceiveModal = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({ modal: 'receive', tab: activeTab }, '', `${window.location.pathname}?tab=${activeTab}&modal=receive`);
    }
    setShowReceiveModal(true);
  };

  const handleOpenAuthModal = (reason?: string) => {
    setAuthReason(reason);
    if (typeof window !== 'undefined') {
      window.history.pushState({ modal: 'auth', tab: activeTab }, '', `${window.location.pathname}?tab=${activeTab}&modal=auth`);
    }
    setShowAuthModal(true);
  };

  const handleOpenPwaModal = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({ modal: 'pwa', tab: activeTab }, '', `${window.location.pathname}?tab=${activeTab}&modal=pwa`);
    }
    setShowPwaModal(true);
  };

  const handleCloseModal = (modalName: 'auth' | 'wallet' | 'transfer' | 'receive' | 'submission' | 'pwa') => {
    if (modalName === 'auth') {
      setShowAuthModal(false);
      setAuthReason(undefined);
    } else if (modalName === 'wallet') {
      setShowWalletModal(false);
    } else if (modalName === 'transfer') {
      setShowTransferModal(false);
    } else if (modalName === 'receive') {
      setShowReceiveModal(false);
    } else if (modalName === 'submission') {
      setShowSubmissionHubModal(false);
    } else if (modalName === 'pwa') {
      setShowPwaModal(false);
    }

    if (typeof window !== 'undefined' && window.location.search.includes('modal=')) {
      window.history.replaceState({ tab: activeTab }, '', `${window.location.pathname}?tab=${activeTab}`);
    }
  };

  // Initial history state initialization on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab') || activeTab || 'overview';
      const modalParam = urlParams.get('modal');

      if (!window.history.state) {
        const historyObj: any = { tab: tabParam };
        if (modalParam) historyObj.modal = modalParam;
        window.history.replaceState(historyObj, '', window.location.href);
      }
    }
  }, []);

  // Listen for browser Back and Forward arrow navigation (popstate event)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state) {
        if (state.tab && ['overview', 'streams', 'invoices', 'remittance', 'yield', 'security'].includes(state.tab)) {
          setActiveTab(state.tab);
        }
        setShowWalletModal(state.modal === 'wallet');
        setShowTransferModal(state.modal === 'transfer');
        setShowReceiveModal(state.modal === 'receive');
        setShowAuthModal(state.modal === 'auth');
        setShowSubmissionHubModal(state.modal === 'submission');
        setShowPwaModal(state.modal === 'pwa');
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        const tabFromUrl = urlParams.get('tab');
        const modalFromUrl = urlParams.get('modal');

        if (tabFromUrl && ['overview', 'streams', 'invoices', 'remittance', 'yield', 'security'].includes(tabFromUrl)) {
          setActiveTab(tabFromUrl as any);
        } else {
          setActiveTab('overview');
        }

        setShowWalletModal(modalFromUrl === 'wallet');
        setShowTransferModal(modalFromUrl === 'transfer');
        setShowReceiveModal(modalFromUrl === 'receive');
        setShowAuthModal(modalFromUrl === 'auth');
        setShowSubmissionHubModal(modalFromUrl === 'submission');
        setShowPwaModal(modalFromUrl === 'pwa');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  // Helper to check url modal parameter
  const getInitialModalState = (modalName: string, defaultIfNoModalParam = false) => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const m = urlParams.get('modal');
      if (m !== null) {
        return m === modalName;
      }
    }
    return defaultIfNoModalParam;
  };

  // Modals
  const [showWalletModal, setShowWalletModal] = useState(() => getInitialModalState('wallet'));
  const [showTransferModal, setShowTransferModal] = useState(() => getInitialModalState('transfer'));
  const [showReceiveModal, setShowReceiveModal] = useState(() => getInitialModalState('receive'));
  const [showSubmissionHubModal, setShowSubmissionHubModal] = useState(() => getInitialModalState('submission'));
  const [showAuthModal, setShowAuthModal] = useState(() => getInitialModalState('auth', false));
  const [showPwaModal, setShowPwaModal] = useState(() => getInitialModalState('pwa'));
  const [authReason, setAuthReason] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Authentication State
  const [authState, setAuthState] = useState<AuthState>(() => {
    const savedAuth = loadSavedState('auth_state', null);
    if (savedAuth && savedAuth.user && savedAuth.isAuthenticated) {
      return savedAuth;
    }
    // Default: Unauthenticated public homepage on entering URL
    return {
      isAuthenticated: false,
      user: null
    };
  });

  // Persistent States
  const [wallet, setWallet] = useState<WalletState>(() => loadSavedState('wallet', INITIAL_WALLET));
  const [streams, setStreams] = useState<PaymentStream[]>(() => loadSavedState('streams', INITIAL_STREAMS));
  const [invoices, setInvoices] = useState<MerchantInvoice[]>(() => loadSavedState('invoices', INITIAL_INVOICES));
  const [remittances, setRemittances] = useState<RemittanceQuote[]>(() => loadSavedState('remittance', INITIAL_REMITTANCE_QUOTES));
  const [yieldPositions, setYieldPositions] = useState<YieldPosition[]>(() => loadSavedState('yield', INITIAL_YIELD_POSITIONS));
  const [auditLogs, setAuditLogs] = useState<TransactionAuditLog[]>(() => loadSavedState('audit_logs', INITIAL_AUDIT_LOGS));

  // Sync to LocalStorage
  useEffect(() => { saveState('auth_state', authState); }, [authState]);
  useEffect(() => { saveState('wallet', wallet); }, [wallet]);
  useEffect(() => { saveState('streams', streams); }, [streams]);
  useEffect(() => { saveState('invoices', invoices); }, [invoices]);
  useEffect(() => { saveState('remittance', remittances); }, [remittances]);
  useEffect(() => { saveState('yield', yieldPositions); }, [yieldPositions]);
  useEffect(() => { saveState('audit_logs', auditLogs); }, [auditLogs]);

  const handleLoginSuccess = (user: UserAccount) => {
    const userWalletAddress = user.walletAddress || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
    const updatedUser = { ...user, walletAddress: userWalletAddress };

    setAuthState({
      isAuthenticated: true,
      user: updatedUser
    });

    setWallet((prev) => ({
      ...prev,
      address: userWalletAddress,
      isConnected: true,
    }));

    showToast(`Welcome, ${updatedUser.username}! Wallet linked: ${userWalletAddress.slice(0, 6)}...${userWalletAddress.slice(-4)}`);
  };

  const handleUpdateUser = (updatedUser: UserAccount) => {
    setAuthState({
      isAuthenticated: true,
      user: updatedUser,
    });
    // Persist in localStorage
    const savedUsersRaw = localStorage.getItem('nexuspay_users');
    let usersList: UserAccount[] = [];
    if (savedUsersRaw) {
      try { usersList = JSON.parse(savedUsersRaw); } catch (err) {}
    }
    const idx = usersList.findIndex((u) => u.id === updatedUser.id || u.email === updatedUser.email);
    if (idx >= 0) {
      usersList[idx] = updatedUser;
    } else {
      usersList.push(updatedUser);
    }
    localStorage.setItem('nexuspay_users', JSON.stringify(usersList));
    showToast('Profile & KYC Identification updated successfully!');
  };

  const handleLogout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null
    });
    showToast('Signed out of account.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Auto-detect & listen for real MetaMask / Injected provider on mount
  useEffect(() => {
    const checkConnectedMetaMask = async () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const ethereum = (window as any).ethereum;
          const accounts = await ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            const realAddr = accounts[0];
            
            // Try fetching real native chain balance in wei
            let weiBalanceHex = '0x0';
            try {
              weiBalanceHex = await ethereum.request({ method: 'eth_getBalance', params: [realAddr, 'latest'] });
            } catch (e) {
              console.warn('eth_getBalance failed:', e);
            }

            const weiVal = parseInt(weiBalanceHex, 16) || 0;
            const ethAmount = Number((weiVal / 1e18).toFixed(4));
            const ethPrice = 2700; // USD

            setWallet((prev) => ({
              ...prev,
              walletType: 'MetaMask',
              isConnected: true,
              address: realAddr,
              balanceUsd: prev.walletType === 'MetaMask' ? (ethAmount * ethPrice) : prev.balanceUsd,
              tokenBalances: {
                ...prev.tokenBalances,
                ETH: ethAmount > 0 ? ethAmount : (prev.tokenBalances.ETH || 0),
              },
            }));
          }

          const handleAccountsChanged = async (accs: string[]) => {
            if (accs.length > 0) {
              const realAddr = accs[0];
              setWallet((prev) => ({
                ...prev,
                walletType: 'MetaMask',
                isConnected: true,
                address: realAddr,
              }));
              showToast(`MetaMask Connected: ${realAddr.slice(0, 6)}...${realAddr.slice(-4)}`);
            } else {
              setWallet((prev) => ({
                ...prev,
                isConnected: false,
                address: '',
              }));
              showToast('MetaMask Disconnected');
            }
          };

          ethereum.on?.('accountsChanged', handleAccountsChanged);

          return () => {
            ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
          };
        } catch (err) {
          console.warn('Error checking MetaMask accounts:', err);
        }
      }
    };

    checkConnectedMetaMask();
  }, []);

  // Wallet Handlers
  const handleSelectChain = (chain: SupportedChain) => {
    setWallet((prev) => ({ ...prev, chain }));
    showToast(`Switched Web3 Network to ${chain}`);
  };

  const handleConnectWallet = async (
    type: 'Enterprise Treasury Vault' | 'MetaMask' | 'Coinbase' | 'Phantom' | 'Stellar Wallet (Freighter)' | 'Injected Web3', 
    customAddress?: string
  ) => {
    let addressToSet = customAddress || '';

    if (!addressToSet && type === 'MetaMask' && typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          addressToSet = accounts[0];
        }
      } catch (err: any) {
        console.warn('MetaMask request error:', err);
      }
    }

    if (!addressToSet) {
      addressToSet = type === 'Phantom' ? '5FHneW46xGXtfC69XpX2xR1...' : type === 'Stellar Wallet (Freighter)' ? 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGUQ2EWKWF4X36S5L33X' : '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
    }

    setWallet((prev) => ({
      ...prev,
      walletType: type,
      isConnected: true,
      address: addressToSet,
    }));
    showToast(`Connected & Integrated Wallet: ${addressToSet.slice(0, 8)}...`);
  };

  const handleDisconnectWallet = () => {
    setWallet({
      address: '',
      chain: 'Polygon',
      isConnected: false,
      walletType: 'MetaMask',
      balanceUsd: 0,
      tokenBalances: {
        USDC: 0,
        BTC: 0,
        ETH: 0,
        USDT: 0,
        SOL: 0,
        BNB: 0,
        MATIC: 0,
        XRP: 0,
        ADA: 0,
        AVAX: 0,
        TRX: 0,
        DOGE: 0,
        TON: 0,
        SUI: 0,
        NEAR: 0,
        DAI: 0,
        PYUSD: 0,
        LINK: 0,
        UNI: 0,
        SHIB: 0,
        PEPE: 0,
      },
    });
    showToast('Disconnected wallet & cleared active session.');
  };

  const handleTopUpFaucet = () => {
    setWallet((prev) => ({
      ...prev,
      balanceUsd: prev.balanceUsd + 10000,
      tokenBalances: {
        ...prev.tokenBalances,
        USDC: prev.tokenBalances.USDC + 10000,
      },
    }));
    showToast('Deposited +10,000 USDC into live wallet balance!');
  };

  // Transfer execution handler
  const handleCompleteTransfer = (amount: number, token: string, recipient: string, txHash: string) => {
    const coinInfo = getCoinInfo(token);
    const usdEquivalent = amount * coinInfo.priceUsd;

    setWallet((prev) => ({
      ...prev,
      balanceUsd: Math.max(0, prev.balanceUsd - usdEquivalent),
      tokenBalances: {
        ...prev.tokenBalances,
        [token]: Math.max(0, (prev.tokenBalances[token] || 0) - amount),
      },
    }));

    const newLog: TransactionAuditLog = {
      id: `log-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      txHash,
      type: 'REMITTANCE',
      summary: `Real-time Transfer Sent: ${amount} ${token} (~$${usdEquivalent.toFixed(2)} USD) to ${recipient}`,
      amountUsd: usdEquivalent,
      chain: wallet.chain,
      status: 'CONFIRMED',
      gasFeeUsd: 0.008,
      aiRiskLevel: 'SAFE',
    };

    setAuditLogs((prev) => [newLog, ...prev]);
    showToast(`Transferred ${amount} ${token} on-chain!`);
  };

  // Receive funds callback
  const handleReceiveFunds = (amount: number, token: string, sender: string) => {
    const coinInfo = getCoinInfo(token);
    const usdEquivalent = amount * coinInfo.priceUsd;

    setWallet((prev) => ({
      ...prev,
      balanceUsd: prev.balanceUsd + usdEquivalent,
      tokenBalances: {
        ...prev.tokenBalances,
        [token]: (prev.tokenBalances[token] || 0) + amount,
      },
    }));

    const newLog: TransactionAuditLog = {
      id: `log-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      txHash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      type: 'INVOICE_PAYMENT',
      summary: `Real-time Payment Received: +${amount} ${token} (~$${usdEquivalent.toFixed(2)} USD) from ${sender}`,
      amountUsd: usdEquivalent,
      chain: wallet.chain,
      status: 'CONFIRMED',
      gasFeeUsd: 0.004,
      aiRiskLevel: 'SAFE',
    };

    setAuditLogs((prev) => [newLog, ...prev]);
    showToast(`Received +${amount} ${token} in real time!`);
  };

  // Stream Handlers
  const handleAddStream = (newStream: PaymentStream) => {
    if (!authState.isAuthenticated) {
      setAuthReason('Creating a payroll stream requires signing in to an account.');
      setShowAuthModal(true);
      showToast('🔒 Transaction blocked: Please sign in or create an account.');
      return;
    }

    setStreams((prev) => [newStream, ...prev]);
    
    const newLog: TransactionAuditLog = {
      id: `log-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      txHash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      type: 'STREAM_EXEC',
      summary: `Created Payment Stream: $${newStream.amount} ${newStream.token} to ${newStream.recipientName}`,
      amountUsd: newStream.amount,
      chain: wallet.chain,
      status: 'CONFIRMED',
      gasFeeUsd: 0.008,
      aiRiskLevel: 'SAFE',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    showToast(`Created payment stream to ${newStream.recipientName}`);
  };

  const handleToggleStreamStatus = (id: string, newStatus: 'ACTIVE' | 'PAUSED' | 'CANCELLED') => {
    setStreams((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
    showToast(`Updated stream status to ${newStatus}`);
  };

  // Invoice Handlers
  const handleAddInvoice = (newInv: MerchantInvoice) => {
    if (!authState.isAuthenticated) {
      setAuthReason('Issuing merchant invoices requires signing in to an account.');
      setShowAuthModal(true);
      showToast('🔒 Transaction blocked: Please sign in or create an account.');
      return;
    }

    setInvoices((prev) => [newInv, ...prev]);
    showToast(`Issued Web3 Invoice ${newInv.invoiceNumber}`);
  };

  const handleMarkInvoicePaid = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === id) {
          setWallet((w) => ({
            ...w,
            balanceUsd: w.balanceUsd + inv.totalUsd,
            tokenBalances: { ...w.tokenBalances, USDC: w.tokenBalances.USDC + inv.totalUsd },
          }));

          const newLog: TransactionAuditLog = {
            id: `log-${Date.now().toString().slice(-4)}`,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
            txHash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
            type: 'INVOICE_PAYMENT',
            summary: `Merchant Payment Received for ${inv.invoiceNumber} ($${inv.totalUsd.toLocaleString()})`,
            amountUsd: inv.totalUsd,
            chain: wallet.chain,
            status: 'CONFIRMED',
            gasFeeUsd: 0.005,
            aiRiskLevel: 'SAFE',
          };
          setAuditLogs((logs) => [newLog, ...logs]);

          return { ...inv, status: 'PAID' as const };
        }
        return inv;
      })
    );
    showToast('Invoice paid & settled into treasury balance!');
  };

  // Remittance Handler
  const handleExecuteRemittance = (quote: RemittanceQuote) => {
    if (!authState.isAuthenticated) {
      setAuthReason('Sending cross-border remittances requires signing in to an account.');
      setShowAuthModal(true);
      showToast('🔒 Transaction blocked: Please sign in or create an account.');
      return;
    }

    setRemittances((prev) => [quote, ...prev]);
    setWallet((w) => ({
      ...w,
      balanceUsd: Math.max(0, w.balanceUsd - quote.sourceAmount),
      tokenBalances: { ...w.tokenBalances, USDC: Math.max(0, w.tokenBalances.USDC - quote.sourceAmount) },
    }));

    const newLog: TransactionAuditLog = {
      id: `log-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      txHash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      type: 'REMITTANCE',
      summary: `Remittance Settled: $${quote.sourceAmount} USDC to ${quote.recipientName} (${quote.recipientCountry})`,
      amountUsd: quote.sourceAmount,
      chain: quote.routeChain,
      status: 'CONFIRMED',
      gasFeeUsd: quote.web3FeeUsd,
      aiRiskLevel: 'SAFE',
    };
    setAuditLogs((logs) => [newLog, ...logs]);
    showToast(`Remittance sent to ${quote.recipientName}! Saved $${quote.savingsUsd.toFixed(2)} in fees.`);
  };

  // Yield Position Handler
  const handleAddYieldPosition = (pos: YieldPosition) => {
    if (!authState.isAuthenticated) {
      setAuthReason('Depositing into AI Yield Vaults requires signing in to an account.');
      setShowAuthModal(true);
      showToast('🔒 Transaction blocked: Please sign in or create an account.');
      return;
    }

    setYieldPositions((prev) => [pos, ...prev]);
    showToast(`Deposited $${pos.depositedAmountUsd.toLocaleString()} into ${pos.protocol}`);
  };

  // AI Agent Action Executor
  const handleExecuteAgentIntent = (intent: AgentActionIntent) => {
    const requiresAuth = ['PAYROLL_STREAM', 'INSTANT_TRANSFER', 'CREATE_INVOICE', 'CROSS_BORDER_REMITTANCE', 'YIELD_DEPOSIT'].includes(intent.actionType);

    if (requiresAuth && !authState.isAuthenticated) {
      setAuthReason(`AI execution of ${intent.actionType.replace(/_/g, ' ').toLowerCase()} requires signing in to an account.`);
      setShowAuthModal(true);
      showToast('🔒 Transaction blocked: Please sign in or create an account.');
      return;
    }

    if (intent.actionType === 'PAYROLL_STREAM' && intent.parameters.recipientName) {
      const newStream: PaymentStream = {
        id: `str-${Date.now().toString().slice(-4)}`,
        recipientName: intent.parameters.recipientName || 'Alex Rivera (Lead Engineer)',
        recipientAddress: intent.parameters.recipientAddress || '0x3F91A2d2C5E78bE934607d72863951B421a8D9f1',
        amount: intent.parameters.amount || 6500,
        token: (intent.parameters.token as any) || 'USDC',
        frequency: intent.parameters.frequency === 'instant' ? 'realtime' : (intent.parameters.frequency || 'monthly'),
        status: 'ACTIVE',
        totalPaidUsd: 0,
        startDate: new Date().toISOString().split('T')[0],
        nextPaymentDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
        riskScore: intent.riskScore || 96,
        aiVerified: true,
        category: 'ENGINEERING_PAYROLL',
      };
      handleAddStream(newStream);
      handleTabChange('streams');
    } else if (intent.actionType === 'INSTANT_TRANSFER') {
      setShowTransferModal(true);
      showToast('AI Agent opened Transfer modal');
    } else if (intent.actionType === 'CREATE_INVOICE') {
      const sub = intent.parameters.amount || 2500;
      const newInv: MerchantInvoice = {
        id: `inv-${Date.now().toString().slice(-4)}`,
        invoiceNumber: `NEX-2026-${Math.floor(100 + Math.random() * 900)}`,
        clientName: intent.parameters.recipientName || 'ZeroKnowledge Labs',
        clientWallet: intent.parameters.recipientAddress || '0x9911A34f82D991bc8203d985920a0F31a2938Ac1',
        merchantName: 'NexusPay AI Enterprise',
        merchantWallet: wallet.address,
        items: [{ id: '1', description: 'Smart Contract & AI Integration', quantity: 1, unitPriceUsd: sub, totalUsd: sub }],
        subtotalUsd: sub,
        taxUsd: 0,
        totalUsd: sub,
        paymentToken: (intent.parameters.token as any) || 'USDC',
        status: 'PENDING',
        dueDate: intent.parameters.dueDate || '2026-08-25',
        createdAt: new Date().toISOString().split('T')[0],
        qrPayload: `ethereum:${wallet.address}@137/pay?value=${sub}&token=USDC`,
      };
      handleAddInvoice(newInv);
      handleTabChange('invoices');
    } else if (intent.actionType === 'CROSS_BORDER_REMITTANCE') {
      handleTabChange('remittance');
      showToast('AI Agent populated cross-border remittance quote!');
    } else if (intent.actionType === 'YIELD_DEPOSIT') {
      handleTabChange('yield');
      showToast('AI Agent navigated to Treasury Yield Vaults!');
    } else if (intent.actionType === 'SECURITY_AUDIT') {
      handleTabChange('security');
      showToast('AI Agent triggered contract audit scanner!');
    } else {
      showToast('AI Command processed and logged.');
    }
  };

  return (
    <div className="min-h-screen bg-vibrant-quad dark:bg-vibrant-quad text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200 pb-16 relative overflow-x-hidden">
      
      {/* Ambient Decorative Multi-Color Mesh Accents (Orange, Blue, Red, Green) */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div className="fixed top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2"></div>
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 translate-y-1/2"></div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-xl bg-slate-900 text-white shadow-2xl border border-indigo-500/40 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        wallet={wallet}
        authState={authState}
        onOpenWalletModal={handleOpenWalletModal}
        onOpenTransferModal={handleOpenTransferModal}
        onOpenReceiveModal={handleOpenReceiveModal}
        onOpenAuthModal={() => handleOpenAuthModal()}
        onOpenPwaModal={handleOpenPwaModal}
        onNavigateHome={() => {
          setShowReceiveModal(false);
          setShowTransferModal(false);
          setShowWalletModal(false);
          setShowAuthModal(false);
          setShowSubmissionHubModal(false);
          handleTabChange('overview');
        }}
        onSelectChain={handleSelectChain}
        agentActive={true}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        
        {/* Persistent AI Command Center Bar */}
        <AgentCommandCenter
          wallet={wallet}
          authState={authState}
          onOpenAuthModal={() => handleOpenAuthModal()}
          onExecuteIntent={handleExecuteAgentIntent}
        />

        {/* Tab Navigation Menu (Clean, Multi-Color Tab Bar) */}
        <div className="my-6">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            
            <button
              onClick={() => handleTabChange('overview')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border shadow-sm ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-400/80 shadow-orange-500/25'
                  : 'bg-slate-900/60 dark:bg-slate-900/80 border-slate-800/80 text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 ${activeTab === 'overview' ? 'text-white' : 'text-orange-400'}`} />
              <span>Treasury & Overview</span>
            </button>

            <button
              onClick={() => handleTabChange('streams')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border shadow-sm ${
                activeTab === 'streams'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white border-emerald-400/80 shadow-emerald-500/25'
                  : 'bg-slate-900/60 dark:bg-slate-900/80 border-slate-800/80 text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Zap className={`w-4 h-4 ${activeTab === 'streams' ? 'text-white' : 'text-emerald-400'}`} />
              <span>Streaming Payroll</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${
                activeTab === 'streams' 
                  ? 'bg-white/20 text-white border-white/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {streams.filter(s => s.status === 'ACTIVE').length} Active
              </span>
            </button>

            <button
              onClick={() => handleTabChange('invoices')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border shadow-sm ${
                activeTab === 'invoices'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-500 text-white border-blue-400/80 shadow-blue-500/25'
                  : 'bg-slate-900/60 dark:bg-slate-900/80 border-slate-800/80 text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Receipt className={`w-4 h-4 ${activeTab === 'invoices' ? 'text-white' : 'text-blue-400'}`} />
              <span>Merchant Invoices</span>
            </button>

            <button
              onClick={() => handleTabChange('remittance')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border shadow-sm ${
                activeTab === 'remittance'
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-500 text-white border-cyan-400/80 shadow-cyan-500/25'
                  : 'bg-slate-900/60 dark:bg-slate-900/80 border-slate-800/80 text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Globe className={`w-4 h-4 ${activeTab === 'remittance' ? 'text-white' : 'text-cyan-400'}`} />
              <span>Global Remittance</span>
            </button>

            <button
              onClick={() => handleTabChange('yield')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border shadow-sm ${
                activeTab === 'yield'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-extrabold border-amber-300/80 shadow-amber-500/25'
                  : 'bg-slate-900/60 dark:bg-slate-900/80 border-slate-800/80 text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <PiggyBank className={`w-4 h-4 ${activeTab === 'yield' ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>AI Yield Vaults</span>
            </button>

            <button
              onClick={() => handleTabChange('security')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border shadow-sm ${
                activeTab === 'security'
                  ? 'bg-gradient-to-r from-rose-600 to-red-500 text-white border-rose-400/80 shadow-rose-500/25'
                  : 'bg-slate-900/60 dark:bg-slate-900/80 border-slate-800/80 text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${activeTab === 'security' ? 'text-white' : 'text-rose-400'}`} />
              <span>Security Auditor</span>
            </button>

          </div>
        </div>


        {/* Tab Content Display */}
        <div className="transition-all duration-150">
          {activeTab === 'overview' && (
            <DashboardOverview
              wallet={wallet}
              streams={streams}
              invoices={invoices}
              auditLogs={auditLogs}
              yieldPositions={yieldPositions}
              onNavigateTab={(tab: any) => handleTabChange(tab)}
              authState={authState}
              onOpenAuthModal={handleOpenAuthModal}
              onOpenWalletModal={handleOpenWalletModal}
            />
          )}

          {activeTab === 'streams' && (
            <PayrollAndStreams
              streams={streams}
              wallet={wallet}
              authState={authState}
              onOpenAuthModal={() => handleOpenAuthModal()}
              onAddStream={handleAddStream}
              onToggleStreamStatus={handleToggleStreamStatus}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoiceGateway
              invoices={invoices}
              wallet={wallet}
              authState={authState}
              onOpenAuthModal={() => handleOpenAuthModal()}
              onAddInvoice={handleAddInvoice}
              onMarkInvoicePaid={handleMarkInvoicePaid}
            />
          )}

          {activeTab === 'remittance' && (
            <CrossBorderRemittance
              quotes={remittances}
              wallet={wallet}
              authState={authState}
              onOpenAuthModal={() => handleOpenAuthModal()}
              onExecuteRemittance={handleExecuteRemittance}
            />
          )}

          {activeTab === 'yield' && (
            <TreasuryYieldOptimizer
              positions={yieldPositions}
              wallet={wallet}
              authState={authState}
              onOpenAuthModal={() => handleOpenAuthModal()}
              onAddPosition={handleAddYieldPosition}
            />
          )}

          {activeTab === 'security' && (
            <SecurityContractAuditor
              wallet={wallet}
            />
          )}
        </div>

      </main>

      {/* Connect Wallet Modal */}
      <WalletModal
        isOpen={showWalletModal}
        onClose={() => handleCloseModal('wallet')}
        wallet={wallet}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
        onTopUpFaucet={handleTopUpFaucet}
      />

      {/* Real-time Transfer Money Modal */}
      <TransferModal
        isOpen={showTransferModal}
        onClose={() => handleCloseModal('transfer')}
        wallet={wallet}
        authState={authState}
        onOpenAuthModal={() => handleOpenAuthModal()}
        onCompleteTransfer={handleCompleteTransfer}
      />

      {/* Real-time Receive Money Modal */}
      <ReceiveModal
        isOpen={showReceiveModal}
        onClose={() => handleCloseModal('receive')}
        wallet={wallet}
        onReceiveFunds={handleReceiveFunds}
      />

      {/* Level 4 Submission Hub Modal */}
      <SubmissionHubModal
        isOpen={showSubmissionHubModal}
        onClose={() => handleCloseModal('submission')}
        wallet={wallet}
      />

      {/* Authentication & Secret Code Recovery Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => handleCloseModal('auth')}
        authState={authState}
        onLoginSuccess={handleLoginSuccess}
        onUpdateUser={handleUpdateUser}
        onLogout={handleLogout}
        authReason={authReason}
      />

      {/* PWA Standalone App Installer Modal */}
      <PwaInstallModal
        isOpen={showPwaModal}
        onClose={() => handleCloseModal('pwa')}
      />

    </div>
  );
}
