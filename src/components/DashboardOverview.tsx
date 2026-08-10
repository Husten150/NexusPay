import React, { useState } from 'react';
import { WalletState, PaymentStream, MerchantInvoice, TransactionAuditLog, YieldPosition } from '../types';
import { getCoinInfo, ALL_COINS } from '../data/coinCatalog';
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
  Search
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardOverviewProps {
  wallet: WalletState;
  streams: PaymentStream[];
  invoices: MerchantInvoice[];
  auditLogs: TransactionAuditLog[];
  yieldPositions: YieldPosition[];
  onNavigateTab: (tab: string) => void;
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
}) => {
  const [coinSearch, setCoinSearch] = useState('');

  const activeStreams = streams.filter((s) => s.status === 'ACTIVE');
  const monthlyOutflow = activeStreams.reduce((acc, curr) => acc + curr.amount, 0);

  const pendingInvoices = invoices.filter((i) => i.status === 'PENDING');
  const pendingInflow = pendingInvoices.reduce((acc, curr) => acc + curr.totalUsd, 0);

  const totalEarnedYield = yieldPositions.reduce((acc, curr) => acc + curr.earnedYieldUsd, 0);

  return (
    <div className="space-y-6">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Treasury Balance */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Web3 Treasury
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
              <TrendingUp className="w-3.5 h-3.5" /> +8.4% this month
            </div>
          </div>
        </div>

        {/* Monthly Automated Outflow */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Stream Outflow
            </span>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              ${monthlyOutflow.toLocaleString()}/mo
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {activeStreams.length} active automated streams
            </div>
          </div>
        </div>

        {/* Pending Invoice Inflow */}
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
              AI Yield Accumulated
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
          <span className="text-sm font-bold">Quick Web3 Operations:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateTab('streams')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Stream</span>
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

      {/* Transaction & AI Audit Activity Feed */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Recent On-Chain Activity & AI Safeguards
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live transaction logs audited by Gemini 3.6 Flash guard
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {auditLogs.map((log) => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  log.status === 'CONFIRMED' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                }`}>
                  {log.status === 'CONFIRMED' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{log.summary}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{log.timestamp}</span>
                    <span>•</span>
                    <span className="font-mono">{log.txHash}</span>
                    <span>•</span>
                    <span>{log.chain}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {log.amountUsd > 0 ? `$${log.amountUsd.toLocaleString()}` : 'Audit Block'}
                  </span>
                  <span className="text-[10px] text-slate-400">Gas: ${log.gasFeeUsd.toFixed(4)}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  log.aiRiskLevel === 'SAFE' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                }`}>
                  {log.aiRiskLevel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
