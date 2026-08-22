import React, { useState } from 'react';
import { TransactionAuditLog, SupportedChain } from '../types';
import { getCoinInfo } from '../data/coinCatalog';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  RefreshCw, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Layers,
  Calendar,
  Send,
  Zap,
  TrendingDown,
  TrendingUp,
  X
} from 'lucide-react';

interface TransactionHistoryProps {
  transactions: TransactionAuditLog[];
  onFinalizePending?: (txId: string) => void;
  activeChain?: SupportedChain;
  onOpenTransfer?: () => void;
  onOpenReceive?: () => void;
  onOpenSwap?: () => void;
  onOpenBuy?: () => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  onFinalizePending,
  activeChain,
  onOpenTransfer,
  onOpenReceive,
  onOpenSwap,
  onOpenBuy,
}) => {
  const [filterTab, setFilterTab] = useState<'ALL' | 'SENT' | 'RECEIVED' | 'PENDING'>('ALL');
  const [selectedChain, setSelectedChain] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<TransactionAuditLog | null>(null);
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxId(id);
    setTimeout(() => setCopiedTxId(null), 2000);
  };

  // Helper to categorize transaction
  const getCategory = (tx: TransactionAuditLog): 'SENT' | 'RECEIVED' | 'PENDING' | 'SWAP' | 'BUY' => {
    if (tx.status === 'PENDING') return 'PENDING';
    if (tx.category) return tx.category;
    if (tx.type === 'TRANSFER_SEND' || tx.type === 'STREAM_EXEC' || tx.type === 'TREASURY_REBALANCE' || tx.type === 'REMITTANCE') {
      return 'SENT';
    }
    if (tx.type === 'TRANSFER_RECEIVE' || tx.type === 'INVOICE_PAYMENT') {
      return 'RECEIVED';
    }
    if (tx.type === 'SWAP') return 'SWAP';
    if (tx.type === 'BUY_CRYPTO') return 'BUY';
    return 'SENT';
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    const cat = getCategory(tx);

    // Tab Filter
    if (filterTab === 'SENT' && cat !== 'SENT') return false;
    if (filterTab === 'RECEIVED' && cat !== 'RECEIVED' && cat !== 'BUY') return false;
    if (filterTab === 'PENDING' && tx.status !== 'PENDING') return false;

    // Chain Filter
    if (selectedChain !== 'ALL' && tx.chain !== selectedChain) return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSummary = tx.summary.toLowerCase().includes(q);
      const matchHash = tx.txHash.toLowerCase().includes(q);
      const matchToken = (tx.token || '').toLowerCase().includes(q);
      const matchChain = tx.chain.toLowerCase().includes(q);
      const matchSender = (tx.senderAddress || '').toLowerCase().includes(q);
      const matchRecipient = (tx.recipientAddress || '').toLowerCase().includes(q);
      return matchSummary || matchHash || matchToken || matchChain || matchSender || matchRecipient;
    }

    return true;
  });

  // Calculate Metrics
  const totalSentUsd = transactions
    .filter((tx) => getCategory(tx) === 'SENT' && tx.status === 'CONFIRMED')
    .reduce((acc, curr) => acc + curr.amountUsd, 0);

  const totalReceivedUsd = transactions
    .filter((tx) => (getCategory(tx) === 'RECEIVED' || getCategory(tx) === 'BUY') && tx.status === 'CONFIRMED')
    .reduce((acc, curr) => acc + curr.amountUsd, 0);

  const pendingCount = transactions.filter((tx) => tx.status === 'PENDING').length;
  const pendingAmountUsd = transactions
    .filter((tx) => tx.status === 'PENDING')
    .reduce((acc, curr) => acc + curr.amountUsd, 0);

  return (
    <div className="space-y-6">
      
      {/* Header Banner & Overview Metrics */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Transaction History & On-Chain Audit</span>
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live ledger of sent transfers, incoming deposits, swaps, buy on-ramps, and pending mempool transactions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenTransfer && (
              <button
                onClick={onOpenTransfer}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            )}
            {onOpenReceive && (
              <button
                onClick={onOpenReceive}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Receive</span>
              </button>
            )}
            {onOpenSwap && (
              <button
                onClick={onOpenSwap}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Swap</span>
              </button>
            )}
            {onOpenBuy && (
              <button
                onClick={onOpenBuy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Buy Crypto</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Metric Cards: Sent, Received, Pending */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Sent Metric */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
                Total Sent (Outgoing)
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300">
                Outflow
              </span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              ${totalSentUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-400">
              {transactions.filter(t => getCategory(t) === 'SENT' && t.status === 'CONFIRMED').length} outgoing transfers settled
            </div>
          </div>

          {/* Received Metric */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
                Total Received (Incoming)
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300">
                Inflow
              </span>
            </div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              +${totalReceivedUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-400">
              {transactions.filter(t => (getCategory(t) === 'RECEIVED' || getCategory(t) === 'BUY') && t.status === 'CONFIRMED').length} incoming payments & on-ramps
            </div>
          </div>

          {/* Pending Metric */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                Pending In-Flight
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300">
                Mempool
              </span>
            </div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {pendingCount} Pending (${pendingAmountUsd.toLocaleString()})
            </div>
            <div className="text-[10px] text-slate-400">
              {pendingCount > 0 ? 'Awaiting validator confirmations' : 'All transactions confirmed'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Category Tabs: All, Sent, Received, Pending */}
        <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold overflow-x-auto scrollbar-none">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              filterTab === 'ALL'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Activity ({transactions.length})
          </button>
          <button
            onClick={() => setFilterTab('SENT')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all whitespace-nowrap ${
              filterTab === 'SENT'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-3 h-3 text-rose-500" />
            <span>Sent ({transactions.filter(t => getCategory(t) === 'SENT').length})</span>
          </button>
          <button
            onClick={() => setFilterTab('RECEIVED')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all whitespace-nowrap ${
              filterTab === 'RECEIVED'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-3 h-3 text-emerald-500" />
            <span>Received ({transactions.filter(t => getCategory(t) === 'RECEIVED' || getCategory(t) === 'BUY').length})</span>
          </button>
          <button
            onClick={() => setFilterTab('PENDING')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all whitespace-nowrap ${
              filterTab === 'PENDING'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3 h-3 text-amber-500 animate-spin" />
            <span>Pending ({pendingCount})</span>
          </button>
        </div>

        {/* Search & Chain Filters */}
        <div className="flex items-center gap-2">
          {/* Chain Selector */}
          <div className="relative">
            <select
              value={selectedChain}
              onChange={(e) => setSelectedChain(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700 focus:outline-none"
            >
              <option value="ALL">All Chains</option>
              <option value="Polygon">Polygon</option>
              <option value="Base">Base</option>
              <option value="Solana">Solana</option>
              <option value="Stellar Network">Stellar</option>
              <option value="Ethereum">Ethereum</option>
              <option value="Bitcoin Network">Bitcoin</option>
              <option value="Arbitrum">Arbitrum</option>
              <option value="Optimism">Optimism</option>
              <option value="Tron">Tron</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search address, hash, token..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Transaction List */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No Transactions Found
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-0.5">
                {searchQuery ? `No records matched query "${searchQuery}".` : `No ${filterTab.toLowerCase()} transactions logged yet.`}
              </p>
            </div>
            {(onOpenTransfer || onOpenReceive) && (
              <div className="flex justify-center gap-2 pt-2">
                {onOpenTransfer && (
                  <button
                    onClick={onOpenTransfer}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 shadow-xs"
                  >
                    Send Transfer
                  </button>
                )}
                {onOpenReceive && (
                  <button
                    onClick={onOpenReceive}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
                  >
                    Receive Funds
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTransactions.map((tx) => {
              const cat = getCategory(tx);
              const isSent = cat === 'SENT';
              const isReceived = cat === 'RECEIVED';
              const isPending = tx.status === 'PENDING';
              const isSwap = cat === 'SWAP';
              const isBuy = cat === 'BUY';

              return (
                <div 
                  key={tx.id} 
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-xl px-2 transition-all group"
                >
                  {/* Left: Icon & Summary */}
                  <div className="flex items-start gap-3">
                    {/* Action Icon Badge */}
                    <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                      isPending
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-300/40 animate-pulse'
                        : isSent
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
                        : isReceived
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
                        : isSwap
                        ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50'
                        : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50'
                    }`}>
                      {isPending ? (
                        <Clock className="w-4 h-4 animate-spin" />
                      ) : isSent ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : isReceived ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : isSwap ? (
                        <RefreshCw className="w-4 h-4" />
                      ) : (
                        <CreditCard className="w-4 h-4" />
                      )}
                    </div>

                    {/* Main Description */}
                    <div className="space-y-1 overflow-hidden">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {tx.summary}
                        </span>

                        {/* Status Chip */}
                        {isPending ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                            Pending (2/12)
                          </span>
                        ) : tx.status === 'CONFIRMED' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            Confirmed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                            {tx.status}
                          </span>
                        )}
                      </div>

                      {/* Metadata row: Chain, Timestamp, Addresses */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {tx.chain}
                        </span>
                        <span>•</span>
                        <span>{tx.timestamp}</span>
                        
                        {tx.txHash && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1 font-mono text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                              <span>{tx.txHash.length > 16 ? `${tx.txHash.slice(0, 8)}...${tx.txHash.slice(-6)}` : tx.txHash}</span>
                              <button
                                onClick={() => handleCopy(tx.txHash, tx.id)}
                                className="text-slate-400 hover:text-indigo-500"
                                title="Copy Hash"
                              >
                                {copiedTxId === tx.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amounts & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-11 sm:pl-0">
                    <div className="text-left sm:text-right">
                      <div className={`font-bold text-sm sm:text-base ${
                        isSent
                          ? 'text-rose-600 dark:text-rose-400'
                          : isReceived || isBuy
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        {isSent ? '-' : isReceived || isBuy ? '+' : ''}
                        {tx.cryptoAmount ? `${tx.cryptoAmount.toLocaleString()} ${tx.token || 'USDC'}` : `$${tx.amountUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                      </div>

                      <div className="text-[10px] text-slate-400 flex items-center sm:justify-end gap-1.5">
                        <span>≈ ${tx.amountUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
                        <span>•</span>
                        <span>Gas: ${tx.gasFeeUsd.toFixed(4)}</span>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <button
                      onClick={() => setSelectedTxForReceipt(tx)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 text-xs font-semibold transition-colors flex items-center gap-1"
                      title="View Receipt"
                    >
                      <span>Receipt</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transaction Receipt Modal */}
      {selectedTxForReceipt && (
        <div 
          onClick={() => setSelectedTxForReceipt(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 cursor-default animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Transaction Receipt
                  </h3>
                  <p className="text-[11px] text-slate-400">On-Chain Settled Proof & Audit</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTxForReceipt(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Amount Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 text-center space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Settled Amount</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                ${selectedTxForReceipt.amountUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
              </div>
              {selectedTxForReceipt.cryptoAmount && (
                <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                  {selectedTxForReceipt.cryptoAmount} {selectedTxForReceipt.token}
                </div>
              )}
            </div>

            {/* Field Breakdown */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Status</span>
                <span className={`font-bold ${
                  selectedTxForReceipt.status === 'CONFIRMED' ? 'text-emerald-500' : 'text-amber-500'
                }`}>
                  {selectedTxForReceipt.status}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Network / Chain</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTxForReceipt.chain}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Timestamp</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{selectedTxForReceipt.timestamp}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Gas Network Fee</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">${selectedTxForReceipt.gasFeeUsd.toFixed(5)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">AI Risk Guard</span>
                <span className="font-bold text-emerald-500 uppercase">{selectedTxForReceipt.aiRiskLevel} (Passed)</span>
              </div>

              {selectedTxForReceipt.recipientAddress && (
                <div className="py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 block mb-1">Recipient Address</span>
                  <div className="font-mono text-[11px] p-2 rounded-lg bg-slate-100 dark:bg-slate-800 break-all text-slate-700 dark:text-slate-300">
                    {selectedTxForReceipt.recipientAddress}
                  </div>
                </div>
              )}

              <div className="py-1">
                <span className="text-slate-500 block mb-1">Transaction Hash</span>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  <span className="truncate mr-2">{selectedTxForReceipt.txHash}</span>
                  <button
                    onClick={() => handleCopy(selectedTxForReceipt.txHash, 'receipt')}
                    className="text-indigo-600 hover:text-indigo-500 shrink-0"
                  >
                    {copiedTxId === 'receipt' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {selectedTxForReceipt.status === 'PENDING' && onFinalizePending && (
              <button
                onClick={() => {
                  onFinalizePending(selectedTxForReceipt.id);
                  setSelectedTxForReceipt(null);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulate Fast-Track Confirmation</span>
              </button>
            )}

            <button
              onClick={() => setSelectedTxForReceipt(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
