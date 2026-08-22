import React, { useState } from 'react';
import { WalletState, PaymentStream, MerchantInvoice, TransactionAuditLog, YieldPosition, AuthState } from '../types';
import { getCoinInfo, ALL_COINS } from '../data/coinCatalog';
import { LiveTradingGraph } from './LiveTradingGraph';
import { TransactionHistory } from './TransactionHistory';
import { 
  TrendingUp, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  Layers, 
  Clock, 
  Zap, 
  PlusCircle, 
  Send, 
  FileText, 
  Globe, 
  PiggyBank,
  CheckCircle2,
  AlertCircle,
  Search,
  RefreshCw,
  CreditCard,
  Copy,
  Check,
  QrCode,
  Sparkles
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardOverviewProps {
  wallet: WalletState;
  streams: PaymentStream[];
  invoices: MerchantInvoice[];
  auditLogs: TransactionAuditLog[];
  yieldPositions: YieldPosition[];
  onNavigateTab: (tab: string) => void;
  authState?: AuthState;
  onOpenAuthModal?: () => void;
  onOpenWalletModal?: () => void;
  onOpenTransferModal?: () => void;
  onOpenReceiveModal?: () => void;
  onOpenSwapModal?: () => void;
  onOpenBuyModal?: () => void;
  onFinalizePending?: (txId: string) => void;
}

const TREASURY_CHART_DATA = [
  { month: 'Mar', balance: 142000, streamingOutflow: 8500 },
  { month: 'Apr', balance: 151000, streamingOutflow: 10200 },
  { month: 'May', balance: 168000, streamingOutflow: 11500 },
  { month: 'Jun', balance: 164000, streamingOutflow: 12100 },
  { month: 'Jul', balance: 178500, streamingOutflow: 13700 },
  { month: 'Aug', balance: 184520, streamingOutflow: 14500 },
];

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  wallet,
  streams,
  invoices,
  auditLogs,
  yieldPositions,
  onNavigateTab,
  authState,
  onOpenAuthModal,
  onOpenWalletModal,
  onOpenTransferModal,
  onOpenReceiveModal,
  onOpenSwapModal,
  onOpenBuyModal,
  onFinalizePending,
}) => {
  const [coinSearch, setCoinSearch] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);

  const isLoggedIn = Boolean(authState?.isAuthenticated && authState.user);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const activeStreams = streams.filter((s) => s.status === 'ACTIVE');
  const monthlyOutflow = activeStreams.reduce((acc, curr) => acc + curr.amount, 0);

  const pendingInvoices = invoices.filter((i) => i.status === 'PENDING');
  const pendingInflow = pendingInvoices.reduce((acc, curr) => acc + curr.totalUsd, 0);

  const totalEarnedYield = yieldPositions.reduce((acc, curr) => acc + curr.earnedYieldUsd, 0);

  return (
    <div className="space-y-6">
      
      {/* Interactive Wallet Balance & Primary Command Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          {/* Wallet Balance Display */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{wallet.chain} Connected</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
                <span>{wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}</span>
                <button 
                  onClick={handleCopyAddress}
                  className="text-slate-400 hover:text-white transition-colors"
                  title="Copy Wallet Address"
                >
                  {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Total Wallet Balance
              </span>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white flex items-baseline gap-2 mt-1">
                <span>${wallet.balanceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-sm sm:text-base font-semibold text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +4.85% (24h)
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Multi-chain treasury holding {Object.keys(wallet.tokenBalances).length} assets across Polygon, Base, Solana, Stellar, Ethereum & Bitcoin.
              </p>
            </div>
          </div>

          {/* Quick Wallet Action Buttons: Send, Receive, Swap, Buy Crypto */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 lg:w-auto w-full">
            {onOpenTransferModal && (
              <button
                onClick={onOpenTransferModal}
                className="flex flex-col items-center justify-center p-3 sm:px-4 sm:py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95 group"
              >
                <div className="p-2 rounded-xl bg-white/20 mb-1.5 group-hover:scale-110 transition-transform">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <span>Send Transfer</span>
              </button>
            )}

            {onOpenReceiveModal && (
              <button
                onClick={onOpenReceiveModal}
                className="flex flex-col items-center justify-center p-3 sm:px-4 sm:py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all active:scale-95 group"
              >
                <div className="p-2 rounded-xl bg-white/20 mb-1.5 group-hover:scale-110 transition-transform">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
                <span>Receive</span>
              </button>
            )}

            {onOpenSwapModal && (
              <button
                onClick={onOpenSwapModal}
                className="flex flex-col items-center justify-center p-3 sm:px-4 sm:py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all active:scale-95 group"
              >
                <div className="p-2 rounded-xl bg-white/20 mb-1.5 group-hover:scale-110 transition-transform">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <span>Swap Tokens</span>
              </button>
            )}

            {onOpenBuyModal && (
              <button
                onClick={onOpenBuyModal}
                className="flex flex-col items-center justify-center p-3 sm:px-4 sm:py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/30 transition-all active:scale-95 group"
              >
                <div className="p-2 rounded-xl bg-slate-950/20 mb-1.5 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-4 h-4 text-slate-950" />
                </div>
                <span>Buy Crypto</span>
              </button>
            )}
          </div>

        </div>
      </div>
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Treasury Balance Metric */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isLoggedIn ? `${authState?.user?.username}'s Balance` : 'Treasury Reserve'}
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              ${wallet.balanceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Verified On-Chain State
            </div>
          </div>
        </div>

        {/* Monthly Automated Outflow */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Stream Outflow
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              ${monthlyOutflow.toLocaleString()}/mo
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {activeStreams.length} streaming contracts live
            </div>
          </div>
        </div>

        {/* Pending Inflow */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending Invoice Inflow
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              ${pendingInflow.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {pendingInvoices.length} pending B2B client invoices
            </div>
          </div>
        </div>

        {/* DeFi Yield Accumulated */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              DeFi Yield Accumulated
            </span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              +${totalEarnedYield.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              Avg APY: 5.82% across Aave & Compound
            </div>
          </div>
        </div>

      </div>

      {/* Quick Action Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-bold">Quick Operations:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onOpenSwapModal && (
            <button
              onClick={onOpenSwapModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition-all shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Swap Coins</span>
            </button>
          )}
          {onOpenBuyModal && (
            <button
              onClick={onOpenBuyModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white transition-all shadow-xs"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Buy Crypto</span>
            </button>
          )}
          <button
            onClick={() => onNavigateTab('streams')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Payroll Stream</span>
          </button>
          <button
            onClick={() => onNavigateTab('invoices')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all border border-slate-700"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Issue Invoice</span>
          </button>
          <button
            onClick={() => onNavigateTab('remittance')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all border border-slate-700"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Remit Global</span>
          </button>
          <button
            onClick={() => onNavigateTab('yield')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all border border-slate-700"
          >
            <PiggyBank className="w-3.5 h-3.5" />
            <span>Yield Vault</span>
          </button>
        </div>
      </div>

      {/* Live Trading Graph for All Coins and Movement */}
      <LiveTradingGraph />

      {/* Main Grid: Chart & Token Holdings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Treasury Growth Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Treasury Flow & Asset Growth
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Historical balance reserves vs automated stream payouts (USDC)
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
              6 Month Trailing
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREASURY_CHART_DATA}>
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Balance']}
                />
                <Area type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#balanceGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Token Balance Allocation */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Multi-Coin Asset Breakdown
            </h3>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
              {Object.keys(wallet.tokenBalances).length} Coins Active
            </span>
          </div>

          {/* Coin Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={coinSearch}
              onChange={(e) => setCoinSearch(e.target.value)}
              placeholder="Search coin (e.g. BTC, ETH, SOL, DOGE...)"
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-72 pr-1">
            {(Object.entries(wallet.tokenBalances) as [string, number][])
              .filter(([token]) => token.toLowerCase().includes(coinSearch.toLowerCase()) || getCoinInfo(token).name.toLowerCase().includes(coinSearch.toLowerCase()))
              .map(([token, amount]) => {
                const info = getCoinInfo(token);
                const usdVal = Number(amount) * info.priceUsd;
                const pct = wallet.balanceUsd > 0 ? ((usdVal / wallet.balanceUsd) * 100).toFixed(1) : '0.0';

                return (
                  <div key={token} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{info.icon}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white">{token}</span>
                          <span className="text-[10px] text-slate-400">({info.category})</span>
                        </div>
                        <span className="text-[10px] text-slate-500">{amount.toLocaleString()} {token}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 dark:text-white block">${usdVal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">{pct}%</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

      </div>

      {/* Complete Interactive Transaction History with Sent, Received, and Pending */}
      <TransactionHistory 
        transactions={auditLogs}
        activeChain={wallet.chain}
        onFinalizePending={onFinalizePending}
        onOpenTransfer={onOpenTransferModal}
        onOpenReceive={onOpenReceiveModal}
        onOpenSwap={onOpenSwapModal}
        onOpenBuy={onOpenBuyModal}
      />

    </div>
  );
};

