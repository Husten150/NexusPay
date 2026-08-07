import React, { useState, useEffect } from 'react';
import { PaymentStream, WalletState } from '../types';
import { 
  Play, 
  Pause, 
  Square, 
  Plus, 
  ShieldCheck, 
  Clock, 
  Zap, 
  RefreshCw, 
  DollarSign, 
  Users, 
  UserCheck, 
  Sparkles,
  Bot,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface PayrollAndStreamsProps {
  streams: PaymentStream[];
  wallet: WalletState;
  onAddStream: (stream: PaymentStream) => void;
  onToggleStreamStatus: (id: string, newStatus: 'ACTIVE' | 'PAUSED' | 'CANCELLED') => void;
}

export const PayrollAndStreams: React.FC<PayrollAndStreamsProps> = ({
  streams,
  wallet,
  onAddStream,
  onToggleStreamStatus,
}) => {
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [recipientName, setRecipientName] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('5000');
  const [token, setToken] = useState<'USDC' | 'USDT' | 'ETH' | 'MATIC'>('USDC');
  const [frequency, setFrequency] = useState<'realtime' | 'daily' | 'weekly' | 'monthly'>('monthly');
  const [category, setCategory] = useState<'ENGINEERING_PAYROLL' | 'FREELANCER' | 'SAAS_SUBSCRIPTION' | 'GRANT_DISBURSEMENT'>('ENGINEERING_PAYROLL');

  // AI Verification state
  const [verifying, setVerifying] = useState(false);
  const [verificationDone, setVerificationDone] = useState(false);

  // Live ticking counter for streaming effect
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleVerifyRecipient = async () => {
    if (!recipientAddress) return;
    setVerifying(true);
    // Simulate AI address audit call
    setTimeout(() => {
      setVerifying(false);
      setVerificationDone(true);
    }, 800);
  };

  const handleCreateStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName || !recipientAddress || !amount) return;

    const newStream: PaymentStream = {
      id: `str-${Date.now().toString().slice(-4)}`,
      recipientName,
      recipientAddress,
      amount: parseFloat(amount),
      token,
      frequency,
      status: 'ACTIVE',
      totalPaidUsd: 0,
      startDate: new Date().toISOString().split('T')[0],
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      riskScore: 98,
      aiVerified: true,
      category,
    };

    onAddStream(newStream);
    setShowModal(false);
    // Reset form
    setRecipientName('');
    setRecipientAddress('');
    setVerificationDone(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl border border-indigo-800/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> Real-time Value Streaming
            </span>
            <span className="text-xs text-indigo-200">EIP-1620 / Superfluid Architecture</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Automated Streaming Payroll & Recurrent Outflow</h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Continuously stream salaries to freelancers, core developers, and oracle nodes every second. AI agents automatically verify recipient addresses and pause stream if unusual activity occurs.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/20 transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>New Automated Stream</span>
        </button>
      </div>

      {/* Streams List Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {streams.map((stream) => {
          // Calculate ticking micro-accumulated streaming amount
          const isRealtime = stream.status === 'ACTIVE';
          const ratePerSec = stream.amount / (30 * 24 * 3600);
          const liveStreamingDisplay = isRealtime ? (stream.totalPaidUsd + (tick * ratePerSec * 10)).toFixed(6) : stream.totalPaidUsd.toFixed(2);

          return (
            <div
              key={stream.id}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all shadow-sm space-y-4 relative ${
                stream.status === 'ACTIVE'
                  ? 'border-indigo-500/30 dark:border-indigo-500/30 shadow-indigo-500/5'
                  : 'border-slate-200 dark:border-slate-800 opacity-80'
              }`}
            >
              {/* Header: Name, Category, Status */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {stream.category.replace('_', ' ')}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {stream.recipientName}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block truncate max-w-[200px]">
                    {stream.recipientAddress}
                  </span>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                    stream.status === 'ACTIVE'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {stream.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>}
                  {stream.status}
                </span>
              </div>

              {/* Ticking Realtime Stream Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-1">
                <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                  <span>STREAMING REAL-TIME VALUE</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{stream.frequency.toUpperCase()} RATE</span>
                </div>
                <div className="text-lg font-mono font-bold text-slate-900 dark:text-white flex items-baseline gap-1">
                  <span>${liveStreamingDisplay}</span>
                  <span className="text-xs font-semibold text-slate-500">{stream.token}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Allocation: <strong className="text-slate-700 dark:text-slate-300">${stream.amount.toLocaleString()} {stream.token}</strong> / {stream.frequency}
                </div>
              </div>

              {/* AI Guard Verification & Safety Score */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>AI Guard: <strong className="text-emerald-600 dark:text-emerald-400">Verified ({stream.riskScore}/100)</strong></span>
                </div>
                <span className="text-[10px] text-slate-400">Next: {stream.nextPaymentDate}</span>
              </div>

              {/* Stream Control Action Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                {stream.status === 'ACTIVE' ? (
                  <button
                    onClick={() => onToggleStreamStatus(stream.id, 'PAUSED')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 text-xs font-semibold transition-colors"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause Stream</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onToggleStreamStatus(stream.id, 'ACTIVE')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Resume Stream</span>
                  </button>
                )}

                <button
                  onClick={() => onToggleStreamStatus(stream.id, 'CANCELLED')}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-100 dark:hover:bg-rose-950 hover:text-rose-600 text-xs font-semibold transition-colors"
                >
                  <Square className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal: Create Stream */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-500" />
                Create AI-Verified Web3 Payment Stream
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStream} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Recipient Name / Label
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Maya Lin (Frontend Architect)"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Recipient Web3 Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => {
                      setRecipientAddress(e.target.value);
                      setVerificationDone(false);
                    }}
                    placeholder="0x..."
                    required
                    className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyRecipient}
                    disabled={verifying || !recipientAddress}
                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1 transition-all"
                  >
                    {verifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
                    <span>AI Check</span>
                  </button>
                </div>

                {verificationDone && (
                  <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>AI Audit Pass: No drainer signature detected. Risk score 98/100.</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Amount & Token
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-3 py-2 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <select
                      value={token}
                      onChange={(e: any) => setToken(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-xl px-2.5 py-2 border border-slate-300 dark:border-slate-700"
                    >
                      <option value="USDC">USDC</option>
                      <option value="USDT">USDT</option>
                      <option value="ETH">ETH</option>
                      <option value="MATIC">MATIC</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Stream Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e: any) => setFrequency(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-3 py-2 border border-slate-300 dark:border-slate-700"
                  >
                    <option value="realtime">Real-time (Per Second)</option>
                    <option value="daily">Daily Batch</option>
                    <option value="weekly">Weekly Stream</option>
                    <option value="monthly">Monthly Salary</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Expense Category
                </label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-3 py-2 border border-slate-300 dark:border-slate-700"
                >
                  <option value="ENGINEERING_PAYROLL">Engineering Payroll</option>
                  <option value="FREELANCER">Freelancer Retainer</option>
                  <option value="SAAS_SUBSCRIPTION">SaaS / Infrastructure Feed</option>
                  <option value="GRANT_DISBURSEMENT">Ecosystem Grant Disbursement</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md"
                >
                  Confirm & Initialize Stream
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
