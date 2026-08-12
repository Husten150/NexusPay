import React, { useState, useEffect } from 'react';
import { ALL_COINS, CoinInfo } from '../data/coinCatalog';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Activity, 
  Sparkles, 
  BarChart2, 
  Clock, 
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  RefreshCw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface LiveTradingGraphProps {
  onSelectCoinToTrade?: (symbol: string) => void;
}

type Timeframe = '1H' | '24H' | '7D' | '1M' | '1Y';

export const LiveTradingGraph: React.FC<LiveTradingGraphProps> = ({ onSelectCoinToTrade }) => {
  const [selectedCoinSymbol, setSelectedCoinSymbol] = useState<string>('BTC');
  const [timeframe, setTimeframe] = useState<Timeframe>('24H');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [livePrices, setLivePrices] = useState<Record<string, { price: number; change24h: number; flash: 'UP' | 'DOWN' | null }>>({});

  // Initialize live prices
  useEffect(() => {
    const initialMap: Record<string, { price: number; change24h: number; flash: 'UP' | 'DOWN' | null }> = {};
    ALL_COINS.forEach((coin) => {
      initialMap[coin.symbol] = {
        price: coin.priceUsd,
        change24h: coin.change24h,
        flash: null,
      };
    });
    setLivePrices(initialMap);
  }, []);

  // Simulate real-time price movement ticks every 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrices((prev) => {
        const next = { ...prev };
        // Randomly update 2-3 coins slightly
        const randomCoins = ALL_COINS.slice().sort(() => 0.5 - Math.random()).slice(0, 3);

        randomCoins.forEach((c) => {
          const current = next[c.symbol] || { price: c.priceUsd, change24h: c.change24h, flash: null };
          // Random change between -0.3% and +0.3%
          const pctDelta = (Math.random() - 0.48) * 0.006;
          let newPrice = current.price * (1 + pctDelta);
          if (c.category === 'Stablecoin') {
            newPrice = Number((1.00 + (Math.random() - 0.5) * 0.002).toFixed(4));
          } else if (newPrice < 0.0001) {
            newPrice = current.price;
          }

          const flashType = newPrice >= current.price ? 'UP' : 'DOWN';
          const newChange24h = Number((current.change24h + (pctDelta * 100)).toFixed(2));

          next[c.symbol] = {
            price: Number(newPrice.toFixed(c.priceUsd < 0.01 ? 6 : c.priceUsd < 1 ? 4 : 2)),
            change24h: newChange24h,
            flash: flashType,
          };
        });

        return next;
      });

      // Clear flash highlights after 1.2s
      setTimeout(() => {
        setLivePrices((prev) => {
          const resetFlashes = { ...prev };
          Object.keys(resetFlashes).forEach((sym) => {
            if (resetFlashes[sym]) {
              resetFlashes[sym] = { ...resetFlashes[sym], flash: null };
            }
          });
          return resetFlashes;
        });
      }, 1200);

    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const selectedCoin = ALL_COINS.find((c) => c.symbol === selectedCoinSymbol) || ALL_COINS[0];
  const activePriceData = livePrices[selectedCoin.symbol] || {
    price: selectedCoin.priceUsd,
    change24h: selectedCoin.change24h,
    flash: null,
  };

  // Generate chart data points based on coin price and timeframe
  const chartPoints = React.useMemo(() => {
    const pointsCount = timeframe === '1H' ? 12 : timeframe === '24H' ? 24 : timeframe === '7D' ? 28 : timeframe === '1M' ? 30 : 52;
    const basePrice = activePriceData.price;
    const isUp = activePriceData.change24h >= 0;

    const points = [];
    let current = basePrice * (1 - (activePriceData.change24h / 100));

    for (let i = 0; i < pointsCount; i++) {
      const progress = i / pointsCount;
      const volatility = basePrice * 0.02;
      const noise = (Math.sin(i * 1.5) + (Math.random() - 0.45)) * volatility;
      
      let pricePoint = current + noise + (isUp ? progress * (basePrice * (activePriceData.change24h / 100)) : -progress * (basePrice * Math.abs(activePriceData.change24h / 100)));
      if (pricePoint <= 0) pricePoint = basePrice * 0.9;

      let label = `${i * (24 / pointsCount)}h`;
      if (timeframe === '1H') label = `${i * 5}m`;
      if (timeframe === '7D') label = `Day ${Math.floor(i / 4) + 1}`;
      if (timeframe === '1M') label = `Day ${i + 1}`;
      if (timeframe === '1Y') label = `Wk ${i + 1}`;

      points.push({
        time: label,
        price: Number(pricePoint.toFixed(basePrice < 0.01 ? 6 : basePrice < 1 ? 4 : 2)),
      });
    }

    // Ensure last point equals current live price
    if (points.length > 0) {
      points[points.length - 1].price = activePriceData.price;
    }

    return points;
  }, [selectedCoinSymbol, timeframe, activePriceData.price, activePriceData.change24h]);

  const filteredCoins = ALL_COINS.filter((coin) => {
    const matchesSearch = coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || coin.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || coin.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6 text-white">
      
      {/* Header & Live Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Live Multi-Coin Trading Graph & Rates
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Live Feed
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time market rates, price movements, and high-frequency trading metrics across all supported assets
          </p>
        </div>

        {/* Categories Selector */}
        <div className="flex items-center gap-1 overflow-x-auto bg-slate-950 p-1 rounded-xl border border-slate-800">
          {['ALL', 'Native Layer 1', 'Stablecoin', 'DeFi & Utility', 'Meme & Community'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat === 'Native Layer 1' ? 'L1 Chains' : cat === 'DeFi & Utility' ? 'DeFi' : cat === 'Meme & Community' ? 'Memes' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Trading Stage: Focused Coin Chart Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-4 bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800">
          
          {/* Active Selected Coin Stat Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedCoin.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{selectedCoin.name}</h3>
                  <span className="text-xs font-mono font-semibold text-slate-400">({selectedCoin.symbol})</span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-indigo-300 font-medium">
                    {selectedCoin.category}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-xl font-bold font-mono transition-colors duration-300 ${
                    activePriceData.flash === 'UP' ? 'text-emerald-400' : activePriceData.flash === 'DOWN' ? 'text-rose-400' : 'text-white'
                  }`}>
                    ${activePriceData.price.toLocaleString(undefined, { minimumFractionDigits: activePriceData.price < 1 ? 4 : 2 })}
                  </span>

                  <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono flex items-center gap-1 ${
                    activePriceData.change24h >= 0 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {activePriceData.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {activePriceData.change24h >= 0 ? '+' : ''}{activePriceData.change24h}%
                  </span>
                </div>
              </div>
            </div>

            {/* Timeframe Buttons */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {(['1H', '24H', '7D', '1M', '1Y'] as Timeframe[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    timeframe === tf ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">24h High</span>
              <span className="font-mono font-bold text-slate-200">${selectedCoin.high24h}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">24h Low</span>
              <span className="font-mono font-bold text-slate-200">${selectedCoin.low24h}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">24h Volume</span>
              <span className="font-mono font-bold text-slate-200">{selectedCoin.volume24h}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Market Cap</span>
              <span className="font-mono font-bold text-slate-200">{selectedCoin.marketCap}</span>
            </div>
          </div>

          {/* Interactive Area Chart */}
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartPoints}>
                <defs>
                  <linearGradient id="tradingChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop 
                      offset="5%" 
                      stopColor={activePriceData.change24h >= 0 ? '#10b981' : '#f43f5e'} 
                      stopOpacity={0.4}
                    />
                    <stop 
                      offset="95%" 
                      stopColor={activePriceData.change24h >= 0 ? '#10b981' : '#f43f5e'} 
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false} 
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => `$${val < 1 ? val : val > 1000 ? Math.round(val) : val}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString(undefined, { minimumFractionDigits: activePriceData.price < 1 ? 4 : 2 })}`, `${selectedCoin.symbol} Rate`]}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke={activePriceData.change24h >= 0 ? '#10b981' : '#f43f5e'} 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#tradingChartGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Quick Coin Selector List */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col h-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Select Coin to View Chart
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {ALL_COINS.length} Coins Available
            </span>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coin..."
              className="w-full bg-slate-900 text-white rounded-xl pl-8 pr-2.5 py-1.5 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
            />
          </div>

          {/* Coin List Scroll */}
          <div className="space-y-1.5 overflow-y-auto max-h-[310px] pr-1 flex-1">
            {filteredCoins.map((coin) => {
              const live = livePrices[coin.symbol] || { price: coin.priceUsd, change24h: coin.change24h, flash: null };
              const isSelected = coin.symbol === selectedCoinSymbol;

              return (
                <button
                  key={coin.symbol}
                  onClick={() => setSelectedCoinSymbol(coin.symbol)}
                  className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition-all ${
                    isSelected 
                      ? 'bg-indigo-600/30 border border-indigo-500/50 shadow' 
                      : 'bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{coin.icon}</span>
                    <div>
                      <div className="font-bold text-xs text-white">{coin.symbol}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[90px]">{coin.name}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-mono font-bold text-xs transition-colors duration-300 ${
                      live.flash === 'UP' ? 'text-emerald-400' : live.flash === 'DOWN' ? 'text-rose-400' : 'text-white'
                    }`}>
                      ${live.price.toLocaleString(undefined, { minimumFractionDigits: live.price < 1 ? 4 : 2 })}
                    </div>
                    <div className={`text-[10px] font-mono font-semibold flex items-center justify-end gap-0.5 ${
                      live.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {live.change24h >= 0 ? '+' : ''}{live.change24h}%
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Comprehensive All Coins Rate & Movement Ticker Grid */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            All Crypto Assets — Live Rates & 24h Movements
          </h3>
          <span className="text-xs text-slate-400">
            Click any row to load into live chart
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Asset</th>
                <th className="py-3 px-4 font-semibold text-right">Live Rate (USD)</th>
                <th className="py-3 px-4 font-semibold text-right">24h Movement</th>
                <th className="py-3 px-4 font-semibold text-right">24h High / Low</th>
                <th className="py-3 px-4 font-semibold text-right">24h Volume</th>
                <th className="py-3 px-4 font-semibold text-right">Market Cap</th>
                <th className="py-3 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredCoins.map((coin) => {
                const live = livePrices[coin.symbol] || { price: coin.priceUsd, change24h: coin.change24h, flash: null };

                return (
                  <tr 
                    key={coin.symbol} 
                    onClick={() => setSelectedCoinSymbol(coin.symbol)}
                    className="hover:bg-slate-900/80 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{coin.icon}</span>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{coin.symbol}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-indigo-300">
                              {coin.category}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">{coin.name}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-4 text-right font-mono font-bold">
                      <span className={`transition-colors duration-300 ${
                        live.flash === 'UP' ? 'text-emerald-400' : live.flash === 'DOWN' ? 'text-rose-400' : 'text-white'
                      }`}>
                        ${live.price.toLocaleString(undefined, { minimumFractionDigits: live.price < 1 ? 4 : 2 })}
                      </span>
                    </td>

                    <td className="py-2.5 px-4 text-right">
                      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                        live.change24h >= 0 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {live.change24h >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {live.change24h >= 0 ? '+' : ''}{live.change24h}%
                      </span>
                    </td>

                    <td className="py-2.5 px-4 text-right font-mono text-[11px] text-slate-400">
                      <div><span className="text-emerald-400">${coin.high24h}</span> / <span className="text-rose-400">${coin.low24h}</span></div>
                    </td>

                    <td className="py-2.5 px-4 text-right font-mono text-[11px] text-slate-300">
                      {coin.volume24h}
                    </td>

                    <td className="py-2.5 px-4 text-right font-mono text-[11px] text-slate-300">
                      {coin.marketCap}
                    </td>

                    <td className="py-2.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setSelectedCoinSymbol(coin.symbol)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 font-bold text-[10px] transition-all"
                      >
                        Trade {coin.symbol}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
