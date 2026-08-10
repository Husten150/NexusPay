export interface CoinInfo {
  symbol: string;
  name: string;
  icon: string;
  category: 'Native Layer 1' | 'Stablecoin' | 'DeFi & Utility' | 'Meme & Community';
  priceUsd: number;
  primaryNetwork: string;
  decimals: number;
  autoSwapSupported: boolean;
}

export const ALL_COINS: CoinInfo[] = [
  // Stablecoins
  { symbol: 'USDC', name: 'USD Coin', icon: '💵', category: 'Stablecoin', priceUsd: 1.00, primaryNetwork: 'Polygon / Multi-chain', decimals: 6, autoSwapSupported: true },
  { symbol: 'USDT', name: 'Tether USD', icon: '🟢', category: 'Stablecoin', priceUsd: 1.00, primaryNetwork: 'Ethereum / Tron / Polygon', decimals: 6, autoSwapSupported: true },
  { symbol: 'DAI', name: 'Maker DAI', icon: '🟡', category: 'Stablecoin', priceUsd: 1.00, primaryNetwork: 'Ethereum', decimals: 18, autoSwapSupported: true },
  { symbol: 'PYUSD', name: 'PayPal USD', icon: '🅿️', category: 'Stablecoin', priceUsd: 1.00, primaryNetwork: 'Ethereum / Solana', decimals: 6, autoSwapSupported: true },

  // Native Layer 1s
  { symbol: 'XLM', name: 'Stellar Lumens', icon: '🚀', category: 'Native Layer 1', priceUsd: 0.11, primaryNetwork: 'Stellar Network', decimals: 7, autoSwapSupported: true },
  { symbol: 'BTC', name: 'Bitcoin', icon: '🟠', category: 'Native Layer 1', priceUsd: 64200.00, primaryNetwork: 'Bitcoin Network', decimals: 8, autoSwapSupported: true },
  { symbol: 'ETH', name: 'Ethereum', icon: '🔷', category: 'Native Layer 1', priceUsd: 2700.00, primaryNetwork: 'Ethereum', decimals: 18, autoSwapSupported: true },
  { symbol: 'SOL', name: 'Solana', icon: '🟣', category: 'Native Layer 1', priceUsd: 145.00, primaryNetwork: 'Solana', decimals: 9, autoSwapSupported: true },
  { symbol: 'BNB', name: 'BNB Chain', icon: '🟡', category: 'Native Layer 1', priceUsd: 520.00, primaryNetwork: 'BNB Chain', decimals: 18, autoSwapSupported: true },
  { symbol: 'MATIC', name: 'Polygon (POL)', icon: '🟣', category: 'Native Layer 1', priceUsd: 0.45, primaryNetwork: 'Polygon', decimals: 18, autoSwapSupported: true },
  { symbol: 'XRP', name: 'XRP Ledger', icon: '⚡', category: 'Native Layer 1', priceUsd: 0.58, primaryNetwork: 'XRP Ledger', decimals: 6, autoSwapSupported: true },
  { symbol: 'ADA', name: 'Cardano', icon: '🔵', category: 'Native Layer 1', priceUsd: 0.36, primaryNetwork: 'Cardano', decimals: 6, autoSwapSupported: true },
  { symbol: 'AVAX', name: 'Avalanche', icon: '🔺', category: 'Native Layer 1', priceUsd: 22.50, primaryNetwork: 'Avalanche C-Chain', decimals: 18, autoSwapSupported: true },
  { symbol: 'TRX', name: 'TRON', icon: '🔴', category: 'Native Layer 1', priceUsd: 0.13, primaryNetwork: 'TRON Network', decimals: 6, autoSwapSupported: true },
  { symbol: 'TON', name: 'Toncoin', icon: '💎', category: 'Native Layer 1', priceUsd: 5.80, primaryNetwork: 'TON Network', decimals: 9, autoSwapSupported: true },
  { symbol: 'SUI', name: 'Sui', icon: '💧', category: 'Native Layer 1', priceUsd: 0.92, primaryNetwork: 'Sui Network', decimals: 9, autoSwapSupported: true },
  { symbol: 'NEAR', name: 'NEAR Protocol', icon: '🌐', category: 'Native Layer 1', priceUsd: 4.20, primaryNetwork: 'NEAR Network', decimals: 24, autoSwapSupported: true },

  // DeFi & Utility
  { symbol: 'LINK', name: 'Chainlink', icon: '🔗', category: 'DeFi & Utility', priceUsd: 11.50, primaryNetwork: 'Ethereum', decimals: 18, autoSwapSupported: true },
  { symbol: 'UNI', name: 'Uniswap', icon: '🦄', category: 'DeFi & Utility', priceUsd: 6.80, primaryNetwork: 'Ethereum', decimals: 18, autoSwapSupported: true },

  // Meme & Community Coins
  { symbol: 'DOGE', name: 'Dogecoin', icon: '🐕', category: 'Meme & Community', priceUsd: 0.10, primaryNetwork: 'Dogecoin Chain', decimals: 8, autoSwapSupported: true },
  { symbol: 'SHIB', name: 'Shiba Inu', icon: '🐶', category: 'Meme & Community', priceUsd: 0.000014, primaryNetwork: 'Ethereum', decimals: 18, autoSwapSupported: true },
  { symbol: 'PEPE', name: 'Pepe Coin', icon: '🐸', category: 'Meme & Community', priceUsd: 0.000008, primaryNetwork: 'Ethereum', decimals: 18, autoSwapSupported: true },
];

export function getCoinInfo(symbol: string): CoinInfo {
  const found = ALL_COINS.find((c) => c.symbol.toUpperCase() === symbol.toUpperCase());
  if (found) return found;
  return {
    symbol: symbol.toUpperCase(),
    name: `${symbol.toUpperCase()} Coin`,
    icon: '🪙',
    category: 'DeFi & Utility',
    priceUsd: 1.00,
    primaryNetwork: 'Multi-chain',
    decimals: 18,
    autoSwapSupported: true,
  };
}

export function convertCoinToUsd(symbol: string, amount: number): number {
  const info = getCoinInfo(symbol);
  return amount * info.priceUsd;
}

export function convertUsdToCoin(symbol: string, amountUsd: number): number {
  const info = getCoinInfo(symbol);
  if (info.priceUsd <= 0) return amountUsd;
  return amountUsd / info.priceUsd;
}
