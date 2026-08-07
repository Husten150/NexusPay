import React, { useState } from 'react';
import { RemittanceQuote, WalletState } from '../types';
import { 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  TrendingDown, 
  Clock, 
  Zap, 
  ShieldCheck, 
  Send,
  Building2,
  DollarSign
} from 'lucide-react';

interface CrossBorderRemittanceProps {
  quotes: RemittanceQuote[];
  wallet: WalletState;
  onExecuteRemittance: (quote: RemittanceQuote) => void;
}

export const CrossBorderRemittance: React.FC<CrossBorderRemittanceProps> = ({
  quotes,
  wallet,
  onExecuteRemittance,
}) => {
  const [sourceAmount, setSourceAmount] = useState('1000');
  const [selectedCountry, setSelectedCountry] = useState<'Germany' | 'Kenya' | 'Brazil'>('Kenya');
  const [recipientName, setRecipientName] = useState('David Ochieng');
  const [recipientAccount, setRecipientAccount] = useState('+254712345678');
  const [executingId, setExecutingId] = useState<string | null>(null);

  // FX rates
  const countryConfig = {
    Germany: { currency: 'EUR (SEPA)', rate: 0.9225, bankFee: 38.50, flag: '🇩🇪', route: 'Polygon' as const },
    Kenya: { currency: 'KES (M-Pesa)', rate: 128.5, bankFee: 22.00, flag: '🇰🇪', route: 'Base' as const },
    Brazil: { currency: 'BRL (Pix)', rate: 5.54, bankFee: 75.00, flag: '🇧🇷', route: 'Polygon' as const },
  };

  const currentCfg = countryConfig[selectedCountry];
  const srcVal = parseFloat(sourceAmount) || 0;
  const estimatedTarget = srcVal * currentCfg.rate;
  const web3Fee = 0.15;
  const tradFee = currentCfg.bankFee;
  const savings = tradFee - web3Fee;

  const handleSendRemittance = () => {
    const newQuote: RemittanceQuote = {
      id: `rem-${Date.now().toString().slice(-4)}`,
      sourceCurrency: 'USD (USDC)',
      targetCurrency: currentCfg.currency,
      sourceAmount: srcVal,
      targetAmountEstimated: estimatedTarget,
      web3FeeUsd: web3Fee,
      tradBankFeeUsd: tradFee,
      savingsUsd: savings,
      savingsPercent: 99.5,
      routeChain: currentCfg.route,
      estimatedTimeSeconds: 3,
      fxRate: currentCfg.rate,
      recipientCountry: selectedCountry,
      recipientName,
      recipientWalletOrAccount: recipientAccount,
    };

    setExecutingId(newQuote.id);
    setTimeout(() => {
      onExecuteRemittance(newQuote);
      setExecutingId(null);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl border border-emerald-900/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Cross-Border Remittance Engine
            </span>
            <span className="text-xs text-emerald-200">99.5% Fee Reduction vs SWIFT Wire</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Global Web3 Remittance & Instant Local Currency Off-Ramp</h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Settle value cross-border in 3 seconds directly into European SEPA bank accounts, Kenyan M-Pesa mobile wallets, or Brazilian Pix instant payment systems.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Remittance Calculator */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Send Low-Fee Global Remittance
          </h3>

          <div className="space-y-4 text-xs">
            
            {/* Amount Input */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                You Send (USDC Stablecoin)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 font-bold text-slate-400">$</span>
                <input
                  type="number"
                  value={sourceAmount}
                  onChange={(e) => setSourceAmount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-base font-bold rounded-xl pl-8 pr-20 py-3 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute right-3 font-bold text-indigo-600 dark:text-indigo-400">USDC</span>
              </div>
            </div>

            {/* Target Country Selector */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Recipient Country & Local Payment Network
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Kenya', 'Germany', 'Brazil'] as const).map((country) => (
                  <button
                    key={country}
                    type="button"
                    onClick={() => {
                      setSelectedCountry(country);
                      if (country === 'Kenya') { setRecipientName('David Ochieng'); setRecipientAccount('+254712345678'); }
                      if (country === 'Germany') { setRecipientName('Klaus Webber GmbH'); setRecipientAccount('DE89370400440532013000'); }
                      if (country === 'Brazil') { setRecipientName('Fernanda Santos Tech'); setRecipientAccount('000.111.222-33'); }
                    }}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedCountry === country
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xl block">{countryConfig[country].flag}</span>
                    <span className="text-xs font-semibold block mt-1">{country}</span>
                    <span className="text-[10px] text-slate-400 block">{countryConfig[country].currency.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Recipient Full Name
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-3 py-2 border border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Local Mobile / Account ID
                </label>
                <input
                  type="text"
                  value={recipientAccount}
                  onChange={(e) => setRecipientAccount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-3 py-2 border border-slate-300 dark:border-slate-700 font-mono"
                />
              </div>
            </div>

            {/* Comparison Box */}
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Recipient Receives (Est.):</span>
                <span className="text-lg font-mono font-bold text-emerald-400">
                  {estimatedTarget.toLocaleString(undefined, { maximumFractionDigits: 2 })} {currentCfg.currency}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-[11px]">
                <div className="space-y-0.5">
                  <span className="text-slate-400 block">NexusPay Web3 L2 Fee:</span>
                  <span className="text-emerald-400 font-bold">$0.15 USD (~3 sec)</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-400 block">Trad Wire (SWIFT):</span>
                  <span className="text-rose-400 font-bold">${tradFee.toFixed(2)} USD (3-5 days)</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold flex items-center justify-between">
                <span>Total Fee Savings:</span>
                <span className="text-sm font-bold text-emerald-400">+${savings.toFixed(2)} USD Saved (99.5%)</span>
              </div>
            </div>

            <button
              onClick={handleSendRemittance}
              disabled={!!executingId || srcVal <= 0}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {executingId ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Executing Settlement On-Chain...</span>
                </>
              ) : (
                <>
                  <span>Send ${srcVal.toLocaleString()} USDC via {currentCfg.route} L2</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </div>
        </div>

        {/* Right Column: Historical / Sample Remittances */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Remittance Operations
            </h3>

            <div className="space-y-3">
              {quotes.map((q) => (
                <div key={q.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{q.recipientName}</span>
                      <span className="text-[10px] text-slate-400">{q.recipientCountry} • {q.routeChain}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                      SETTLED ({q.estimatedTimeSeconds}s)
                    </span>
                  </div>

                  <div className="flex justify-between items-center font-mono font-semibold pt-1 border-t border-slate-200 dark:border-slate-700/60">
                    <span className="text-slate-600 dark:text-slate-300">${q.sourceAmount} USDC</span>
                    <span className="text-emerald-600 dark:text-emerald-400">➔ {q.targetAmountEstimated.toLocaleString()} {q.targetCurrency.split(' ')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
