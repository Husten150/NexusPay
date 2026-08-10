import React, { useState } from 'react';
import { RemittanceQuote, WalletState, SupportedChain } from '../types';
import { ALL_COINS, getCoinInfo } from '../data/coinCatalog';
import { 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Search,
  Building2,
  DollarSign,
  ShieldCheck,
  Smartphone,
  Landmark
} from 'lucide-react';

interface CrossBorderRemittanceProps {
  quotes: RemittanceQuote[];
  wallet: WalletState;
  onExecuteRemittance: (quote: RemittanceQuote) => void;
}

interface CountryData {
  name: string;
  code: string;
  currency: string;
  rate: number;
  bankFee: number;
  flag: string;
  route: SupportedChain;
  railType: 'SEPA Bank' | 'M-Pesa Mobile' | 'Pix Instant' | 'Naira Instant' | 'SPEI Bank' | 'UPI Direct' | 'GCash' | 'ACH / FedNow' | 'Faster Payments' | 'Local Bank Wire';
  region: 'Europe' | 'Americas' | 'Africa' | 'Asia Pacific' | 'Middle East';
}

const GLOBAL_COUNTRIES: CountryData[] = [
  // Europe
  { name: 'Germany', code: 'DE', currency: 'EUR', rate: 0.9225, bankFee: 38.50, flag: '🇩🇪', route: 'Polygon', railType: 'SEPA Bank', region: 'Europe' },
  { name: 'France', code: 'FR', currency: 'EUR', rate: 0.9225, bankFee: 38.50, flag: '🇫🇷', route: 'Polygon', railType: 'SEPA Bank', region: 'Europe' },
  { name: 'United Kingdom', code: 'GB', currency: 'GBP', rate: 0.7850, bankFee: 35.00, flag: '🇬🇧', route: 'Arbitrum', railType: 'Faster Payments', region: 'Europe' },
  { name: 'Spain', code: 'ES', currency: 'EUR', rate: 0.9225, bankFee: 38.50, flag: '🇪🇸', route: 'Polygon', railType: 'SEPA Bank', region: 'Europe' },
  { name: 'Netherlands', code: 'NL', currency: 'EUR', rate: 0.9225, bankFee: 38.50, flag: '🇳🇱', route: 'Base', railType: 'SEPA Bank', region: 'Europe' },
  { name: 'Switzerland', code: 'CH', currency: 'CHF', rate: 0.8750, bankFee: 42.00, flag: '🇨🇭', route: 'Ethereum', railType: 'Local Bank Wire', region: 'Europe' },
  
  // Americas
  { name: 'Brazil', code: 'BR', currency: 'BRL', rate: 5.54, bankFee: 75.00, flag: '🇧🇷', route: 'Polygon', railType: 'Pix Instant', region: 'Americas' },
  { name: 'Mexico', code: 'MX', currency: 'MXN', rate: 18.25, bankFee: 45.00, flag: '🇲🇽', route: 'Base', railType: 'SPEI Bank', region: 'Americas' },
  { name: 'United States', code: 'US', currency: 'USD', rate: 1.00, bankFee: 25.00, flag: '🇺🇸', route: 'Base', railType: 'ACH / FedNow', region: 'Americas' },
  { name: 'Canada', code: 'CA', currency: 'CAD', rate: 1.37, bankFee: 30.00, flag: '🇨🇦', route: 'Arbitrum', railType: 'Local Bank Wire', region: 'Americas' },
  { name: 'Colombia', code: 'CO', currency: 'COP', rate: 4120.0, bankFee: 50.00, flag: '🇨🇴', route: 'Polygon', railType: 'Local Bank Wire', region: 'Americas' },
  
  // Africa
  { name: 'Kenya', code: 'KE', currency: 'KES', rate: 128.5, bankFee: 22.00, flag: '🇰🇪', route: 'Base', railType: 'M-Pesa Mobile', region: 'Africa' },
  { name: 'Nigeria', code: 'NG', currency: 'NGN', rate: 1580.0, bankFee: 30.00, flag: '🇳🇬', route: 'Polygon', railType: 'Naira Instant', region: 'Africa' },
  { name: 'Ghana', code: 'GH', currency: 'GHS', rate: 15.4, bankFee: 20.00, flag: '🇬🇭', route: 'Base', railType: 'M-Pesa Mobile', region: 'Africa' },
  { name: 'South Africa', code: 'ZA', currency: 'ZAR', rate: 18.10, bankFee: 40.00, flag: '🇿🇦', route: 'Arbitrum', railType: 'Local Bank Wire', region: 'Africa' },
  { name: 'Egypt', code: 'EG', currency: 'EGP', rate: 48.60, bankFee: 35.00, flag: '🇪🇬', route: 'Polygon', railType: 'Local Bank Wire', region: 'Africa' },

  // Asia Pacific
  { name: 'India', code: 'IN', currency: 'INR', rate: 83.95, bankFee: 32.00, flag: '🇮🇳', route: 'Polygon', railType: 'UPI Direct', region: 'Asia Pacific' },
  { name: 'Philippines', code: 'PH', currency: 'PHP', rate: 58.20, bankFee: 25.00, flag: '🇵🇭', route: 'Base', railType: 'GCash', region: 'Asia Pacific' },
  { name: 'Japan', code: 'JP', currency: 'JPY', rate: 151.40, bankFee: 40.00, flag: '🇯🇵', route: 'Arbitrum', railType: 'Local Bank Wire', region: 'Asia Pacific' },
  { name: 'Australia', code: 'AU', currency: 'AUD', rate: 1.52, bankFee: 30.00, flag: '🇦🇺', route: 'Base', railType: 'Local Bank Wire', region: 'Asia Pacific' },
  { name: 'Singapore', code: 'SG', currency: 'SGD', rate: 1.34, bankFee: 28.00, flag: '🇸🇬', route: 'Polygon', railType: 'Local Bank Wire', region: 'Asia Pacific' },

  // Middle East
  { name: 'United Arab Emirates', code: 'AE', currency: 'AED', rate: 3.67, bankFee: 30.00, flag: '🇦🇪', route: 'Base', railType: 'Local Bank Wire', region: 'Middle East' },
  { name: 'Saudi Arabia', code: 'SA', currency: 'SAR', rate: 3.75, bankFee: 35.00, flag: '🇸🇦', route: 'Arbitrum', railType: 'Local Bank Wire', region: 'Middle East' },
  { name: 'Turkey', code: 'TR', currency: 'TRY', rate: 33.50, bankFee: 38.00, flag: '🇹🇷', route: 'Polygon', railType: 'Local Bank Wire', region: 'Middle East' },
];

export const CrossBorderRemittance: React.FC<CrossBorderRemittanceProps> = ({
  quotes,
  wallet,
  onExecuteRemittance,
}) => {
  const [sourceAmount, setSourceAmount] = useState('1000');
  const [selectedSourceCoin, setSelectedSourceCoin] = useState<string>('USDC');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(GLOBAL_COUNTRIES[11]); // Kenya default
  const [recipientName, setRecipientName] = useState('David Ochieng');
  const [recipientAccount, setRecipientAccount] = useState('+254712345678');
  const [executingId, setExecutingId] = useState<string | null>(null);

  // Filter countries
  const filteredCountries = GLOBAL_COUNTRIES.filter((c) => {
    const matchesRegion = selectedRegion === 'ALL' || c.region === selectedRegion;
    const matchesQuery = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         c.currency.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesQuery;
  });

  const coinInfo = getCoinInfo(selectedSourceCoin);
  const srcQty = parseFloat(sourceAmount) || 0;
  const srcVal = srcQty;
  const srcUsdVal = srcQty * coinInfo.priceUsd;
  const estimatedTarget = srcUsdVal * selectedCountry.rate;
  const web3Fee = 0.15;
  const tradFee = selectedCountry.bankFee;
  const savings = Math.max(0, tradFee - web3Fee);

  const handleSendRemittance = () => {
    const newQuote: RemittanceQuote = {
      id: `rem-${Date.now().toString().slice(-4)}`,
      sourceCurrency: `${selectedSourceCoin}`,
      targetCurrency: `${selectedCountry.currency} (${selectedCountry.railType})`,
      sourceAmount: srcQty,
      targetAmountEstimated: estimatedTarget,
      web3FeeUsd: web3Fee,
      tradBankFeeUsd: tradFee,
      savingsUsd: savings,
      savingsPercent: 99.5,
      routeChain: selectedCountry.route,
      estimatedTimeSeconds: 3,
      fxRate: selectedCountry.rate,
      recipientCountry: selectedCountry.name,
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
              <Globe className="w-3.5 h-3.5" /> Global Remittance Engine
            </span>
            <span className="text-xs text-emerald-200">Connect to 190+ Countries Worldwide</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Real-Time Cross-Border Settlement to Any Country</h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Convert stablecoins & Web3 assets into local bank accounts, SEPA IBANs, Pix keys, SPEI, M-Pesa, UPI, and mobile wallets in seconds.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Remittance Calculator & Country Selection */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Send Real-Time Money Globally
          </h3>

          <div className="space-y-4 text-xs">
            
            {/* You Send Amount & Token */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-700 dark:text-slate-300 font-semibold">
                  You Send (Any Coin)
                </label>
                <span className="text-[10px] font-semibold text-slate-400">
                  Est. Value: ~${srcUsdVal.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <select
                    value={selectedSourceCoin}
                    onChange={(e) => setSelectedSourceCoin(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl px-2 py-3 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  >
                    {ALL_COINS.map((c) => (
                      <option key={c.symbol} value={c.symbol}>
                        {c.icon} {c.symbol}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <input
                    type="number"
                    value={sourceAmount}
                    onChange={(e) => setSourceAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-base font-bold rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Country Selector with Region Tabs and Search */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-slate-700 dark:text-slate-300 font-semibold">
                  Select Recipient Country ({GLOBAL_COUNTRIES.length}+ Available)
                </label>
              </div>

              {/* Region Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-[11px]">
                {['ALL', 'Europe', 'Americas', 'Africa', 'Asia Pacific', 'Middle East'].map((reg) => (
                  <button
                    key={reg}
                    type="button"
                    onClick={() => setSelectedRegion(reg)}
                    className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                      selectedRegion === reg
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {reg}
                  </button>
                ))}
              </div>

              {/* Country Search Bar */}
              <div className="relative my-2">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search country or currency (e.g. Kenya, EUR, India, Pix)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs rounded-xl pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>

              {/* Country Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200 dark:border-slate-800 rounded-xl">
                {filteredCountries.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setSelectedCountry(c);
                      if (c.code === 'KE') { setRecipientName('David Ochieng'); setRecipientAccount('+254712345678'); }
                      else if (c.code === 'DE' || c.code === 'FR') { setRecipientName('Klaus Webber GmbH'); setRecipientAccount('DE89370400440532013000'); }
                      else if (c.code === 'BR') { setRecipientName('Fernanda Santos Tech'); setRecipientAccount('000.111.222-33'); }
                      else if (c.code === 'IN') { setRecipientName('Rahul Sharma'); setRecipientAccount('rahul@upi'); }
                      else if (c.code === 'NG') { setRecipientName('Adebayo Okafor'); setRecipientAccount('0123456789'); }
                      else if (c.code === 'PH') { setRecipientName('Maria Santos'); setRecipientAccount('+639171234567'); }
                      else { setRecipientName(`${c.name} Local Beneficiary`); setRecipientAccount(`ACCOUNT-${c.code}-0091`); }
                    }}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      selectedCountry.code === c.code
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xl shrink-0">{c.flag}</span>
                    <div className="truncate">
                      <span className="text-xs block font-bold truncate">{c.name}</span>
                      <span className="text-[10px] text-slate-400 block">{c.currency} • {c.railType}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Recipient Name
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
                  Local Mobile / Bank IBAN / Handle
                </label>
                <input
                  type="text"
                  value={recipientAccount}
                  onChange={(e) => setRecipientAccount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-3 py-2 border border-slate-300 dark:border-slate-700 font-mono"
                />
              </div>
            </div>

            {/* Comparison & Settlement Summary */}
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <span>{selectedCountry.flag}</span>
                  Recipient Receives ({selectedCountry.railType}):
                </span>
                <span className="text-lg font-mono font-bold text-emerald-400">
                  {estimatedTarget.toLocaleString(undefined, { maximumFractionDigits: 2 })} {selectedCountry.currency}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-[11px]">
                <div className="space-y-0.5">
                  <span className="text-slate-400 block">NexusPay Web3 L2 Fee ({selectedCountry.route}):</span>
                  <span className="text-emerald-400 font-bold">$0.15 USD (~3 sec)</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-400 block">SWIFT Bank Fee:</span>
                  <span className="text-rose-400 font-bold">${tradFee.toFixed(2)} USD (3-5 days)</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold flex items-center justify-between">
                <span>Fee Savings vs Wire:</span>
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
                  <span>Settling On-Chain via {selectedCountry.route} L2...</span>
                </>
              ) : (
                <>
                  <span>Send {srcVal.toLocaleString()} {selectedSourceCoin} to {selectedCountry.name} ({selectedCountry.currency})</span>
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
              Recent Global Remittance Log
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
