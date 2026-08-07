import React, { useState, useEffect } from 'react';
import { 
  WalletState, 
  SupportedChain, 
  PaymentStream, 
  MerchantInvoice, 
  RemittanceQuote, 
  YieldPosition, 
  TransactionAuditLog, 
  AgentActionIntent 
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

import { Navbar } from './components/Navbar';
import { AgentCommandCenter } from './components/AgentCommandCenter';
import { DashboardOverview } from './components/DashboardOverview';
import { PayrollAndStreams } from './components/PayrollAndStreams';
import { InvoiceGateway } from './components/InvoiceGateway';
import { CrossBorderRemittance } from './components/CrossBorderRemittance';
import { TreasuryYieldOptimizer } from './components/TreasuryYieldOptimizer';
import { SecurityContractAuditor } from './components/SecurityContractAuditor';
import { WalletModal } from './components/WalletModal';

import { 
  LayoutDashboard, 
  Zap, 
  Receipt, 
  Globe, 
  PiggyBank, 
  ShieldCheck, 
  Bot, 
  Check, 
  Info
} from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'overview' | 'streams' | 'invoices' | 'remittance' | 'yield' | 'security'>('overview');
  
  // Modals
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persistent States
  const [wallet, setWallet] = useState<WalletState>(() => loadSavedState('wallet', INITIAL_WALLET));
  const [streams, setStreams] = useState<PaymentStream[]>(() => loadSavedState('streams', INITIAL_STREAMS));
  const [invoices, setInvoices] = useState<MerchantInvoice[]>(() => loadSavedState('invoices', INITIAL_INVOICES));
  const [remittances, setRemittances] = useState<RemittanceQuote[]>(() => loadSavedState('remittance', INITIAL_REMITTANCE_QUOTES));
  const [yieldPositions, setYieldPositions] = useState<YieldPosition[]>(() => loadSavedState('yield', INITIAL_YIELD_POSITIONS));
  const [auditLogs, setAuditLogs] = useState<TransactionAuditLog[]>(() => loadSavedState('audit_logs', INITIAL_AUDIT_LOGS));

  // Sync to LocalStorage
  useEffect(() => { saveState('wallet', wallet); }, [wallet]);
  useEffect(() => { saveState('streams', streams); }, [streams]);
  useEffect(() => { saveState('invoices', invoices); }, [invoices]);
  useEffect(() => { saveState('remittance', remittances); }, [remittances]);
  useEffect(() => { saveState('yield', yieldPositions); }, [yieldPositions]);
  useEffect(() => { saveState('audit_logs', auditLogs); }, [auditLogs]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Wallet Handlers
  const handleSelectChain = (chain: SupportedChain) => {
    setWallet((prev) => ({ ...prev, chain }));
    showToast(`Switched Web3 Network to ${chain}`);
  };

  const handleConnectWallet = (type: 'Simulated Sandbox' | 'MetaMask' | 'Coinbase' | 'Phantom') => {
    setWallet((prev) => ({
      ...prev,
      walletType: type,
      isConnected: true,
      address: type === 'Phantom' ? '5FHneW46xGXtfC69XpX2xR1...' : '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    }));
    showToast(`Connected ${type} Wallet`);
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
    showToast('claimed +10,000 USDC Testnet Faucet tokens!');
  };

  // Stream Handlers
  const handleAddStream = (newStream: PaymentStream) => {
    setStreams((prev) => [newStream, ...prev]);
    
    // Add audit log
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
    setInvoices((prev) => [newInv, ...prev]);
    showToast(`Issued Web3 Invoice ${newInv.invoiceNumber}`);
  };

  const handleMarkInvoicePaid = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === id) {
          // Increase wallet balance
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
    setYieldPositions((prev) => [pos, ...prev]);
    showToast(`Deposited $${pos.depositedAmountUsd.toLocaleString()} into ${pos.protocol}`);
  };

  // AI Agent Action Executor
  const handleExecuteAgentIntent = (intent: AgentActionIntent) => {
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
      setActiveTab('streams');
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
      setActiveTab('invoices');
    } else if (intent.actionType === 'CROSS_BORDER_REMITTANCE') {
      setActiveTab('remittance');
      showToast('AI Agent populated cross-border remittance quote!');
    } else if (intent.actionType === 'YIELD_DEPOSIT') {
      setActiveTab('yield');
      showToast('AI Agent navigated to Treasury Yield Vaults!');
    } else if (intent.actionType === 'SECURITY_AUDIT') {
      setActiveTab('security');
      showToast('AI Agent triggered contract audit scanner!');
    } else {
      showToast('AI Command processed and logged.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200 pb-16">
      
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
        onOpenWalletModal={() => setShowWalletModal(true)}
        onSelectChain={handleSelectChain}
        agentActive={true}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        
        {/* Track Header Banner */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 my-2">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs uppercase tracking-wider shadow-sm">
              Hackathon Entry
            </span>
            <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              <strong>Track 1:</strong> Payments & Infrastructure • <strong>Track 2:</strong> Web3 AI Agents & Real-World Use
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>EVM / L2 Multi-Chain Enabled</span>
          </div>
        </div>

        {/* Persistent AI Command Center Bar */}
        <AgentCommandCenter
          wallet={wallet}
          onExecuteIntent={handleExecuteAgentIntent}
        />

        {/* Tab Navigation Menu */}
        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto my-6 scrollbar-none">
          
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Treasury & Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('streams')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'streams'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4 text-emerald-500" />
            <span>Streaming Payroll</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px]">
              {streams.filter(s => s.status === 'ACTIVE').length} Active
            </span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'invoices'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Merchant Invoices</span>
          </button>

          <button
            onClick={() => setActiveTab('remittance')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'remittance'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Global Remittance</span>
          </button>

          <button
            onClick={() => setActiveTab('yield')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'yield'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PiggyBank className="w-4 h-4 text-amber-500" />
            <span>AI Yield Vaults</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-rose-500" />
            <span>Security Auditor</span>
          </button>

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
              onNavigateTab={(tab: any) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'streams' && (
            <PayrollAndStreams
              streams={streams}
              wallet={wallet}
              onAddStream={handleAddStream}
              onToggleStreamStatus={handleToggleStreamStatus}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoiceGateway
              invoices={invoices}
              wallet={wallet}
              onAddInvoice={handleAddInvoice}
              onMarkInvoicePaid={handleMarkInvoicePaid}
            />
          )}

          {activeTab === 'remittance' && (
            <CrossBorderRemittance
              quotes={remittances}
              wallet={wallet}
              onExecuteRemittance={handleExecuteRemittance}
            />
          )}

          {activeTab === 'yield' && (
            <TreasuryYieldOptimizer
              positions={yieldPositions}
              wallet={wallet}
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
        onClose={() => setShowWalletModal(false)}
        wallet={wallet}
        onConnectWallet={handleConnectWallet}
        onTopUpFaucet={handleTopUpFaucet}
      />

    </div>
  );
}
