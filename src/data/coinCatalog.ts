export interface CoinInfo {
  symbol: string;
  name: string;
  icon: string;
  category: 'Native Layer 1' | 'Stablecoin' | 'DeFi & Utility' | 'Meme & Community';
  priceUsd: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  marketCap: string;
  primaryNetwork: string;
  supportedNetworks: string[];
  decimals: number;
  autoSwapSupported: boolean;
}

export const ALL_COINS: CoinInfo[] = [
  // Stablecoins
  { symbol: 'USDC', name: 'USD Coin', icon: '💵', category: 'Stablecoin', priceUsd: 1.00, change24h: 0.02, high24h: 1.002, low24h: 0.999, volume24h: '$8.4B', marketCap: '$34.2B', primaryNetwork: 'Polygon / Multi-chain', supportedNetworks: ['Polygon', 'Base', 'Ethereum', 'Arbitrum', 'Optimism', 'Solana', 'BNB Chain', 'Avalanche', 'Tron', 'Stellar Network'], decimals: 6, autoSwapSupported: true },
  { symbol: 'USDT', name: 'Tether USD', icon: '🟢', category: 'Stablecoin', priceUsd: 1.00, change24h: -0.01, high24h: 1.001, low24h: 0.998, volume24h: '$32.1B', marketCap: '$118.5B', primaryNetwork: 'Ethereum / Tron / Polygon', supportedNetworks: ['Ethereum', 'Polygon', 'Base', 'Arbitrum', 'Optimism', 'Solana', 'BNB Chain', 'Avalanche', 'Tron'], decimals: 6, autoSwapSupported: true },
  { symbol: 'DAI', name: 'Maker DAI', icon: '🟡', category: 'Stablecoin', priceUsd: 1.00, change24h: 0.01, high24h: 1.001, low24h: 0.999, volume24h: '$1.2B', marketCap: '$5.1B', primaryNetwork: 'Ethereum', supportedNetworks: ['Ethereum', 'Polygon', 'Base', 'Arbitrum', 'Optimism'], decimals: 18, autoSwapSupported: true },
  { symbol: 'PYUSD', name: 'PayPal USD', icon: '🅿️', category: 'Stablecoin', priceUsd: 1.00, change24h: 0.00, high24h: 1.001, low24h: 0.999, volume24h: '$410M', marketCap: '$820M', primaryNetwork: 'Ethereum / Solana', supportedNetworks: ['Ethereum', 'Solana'], decimals: 6, autoSwapSupported: true },

  // Native Layer 1s
  { symbol: 'BTC', name: 'Bitcoin', icon: '🟠', category: 'Native Layer 1', priceUsd: 64200.00, change24h: 3.45, high24h: 65100.00, low24h: 62800.00, volume24h: '$28.5B', marketCap: '$1.26T', primaryNetwork: 'Bitcoin Network', supportedNetworks: ['Bitcoin Network'], decimals: 8, autoSwapSupported: true },
  { symbol: 'ETH', name: 'Ethereum', icon: '🔷', category: 'Native Layer 1', priceUsd: 2700.00, change24h: 2.18, high24h: 2750.00, low24h: 2620.00, volume24h: '$15.2B', marketCap: '$324.8B', primaryNetwork: 'Ethereum', supportedNetworks: ['Ethereum', 'Base', 'Arbitrum', 'Optimism'], decimals: 18, autoSwapSupported: true },
  { symbol: 'SOL', name: 'Solana', icon: '🟣', category: 'Native Layer 1', priceUsd: 145.00, change24h: 6.82, high24h: 148.50, low24h: 135.20, volume24h: '$4.8B', marketCap: '$67.8B', primaryNetwork: 'Solana', supportedNetworks: ['Solana'], decimals: 9, autoSwapSupported: true },
  { symbol: 'XLM', name: 'Stellar Lumens', icon: '🚀', category: 'Native Layer 1', priceUsd: 0.11, change24h: 4.12, high24h: 0.115, low24h: 0.104, volume24h: '$340M', marketCap: '$3.2B', primaryNetwork: 'Stellar Network', supportedNetworks: ['Stellar Network'], decimals: 7, autoSwapSupported: true },
  { symbol: 'BNB', name: 'BNB Chain', icon: '🟡', category: 'Native Layer 1', priceUsd: 520.00, change24h: 1.25, high24h: 528.00, low24h: 512.00, volume24h: '$1.8B', marketCap: '$75.9B', primaryNetwork: 'BNB Chain', supportedNetworks: ['BNB Chain'], decimals: 18, autoSwapSupported: true },
  { symbol: 'MATIC', name: 'Polygon (POL)', icon: '🟣', category: 'Native Layer 1', priceUsd: 0.45, change24h: 5.40, high24h: 0.472, low24h: 0.421, volume24h: '$520M', marketCap: '$4.4B', primaryNetwork: 'Polygon', supportedNetworks: ['Polygon'], decimals: 18, autoSwapSupported: true },
  { symbol: 'XRP', name: 'XRP Ledger', icon: '⚡', category: 'Native Layer 1', priceUsd: 0.58, change24h: -1.15, high24h: 0.598, low24h: 0.569, volume24h: '$1.4B', marketCap: '$32.5B', primaryNetwork: 'XRP Ledger', supportedNetworks: ['Ethereum', 'BNB Chain'], decimals: 6, autoSwapSupported: true },
  { symbol: 'ADA', name: 'Cardano', icon: '🔵', category: 'Native Layer 1', priceUsd: 0.36, change24h: 0.85, high24h: 0.372, low24h: 0.351, volume24h: '$380M', marketCap: '$12.9B', primaryNetwork: 'Cardano', supportedNetworks: ['Ethereum', 'BNB Chain'], decimals: 6, autoSwapSupported: true },
  { symbol: 'AVAX', name: 'Avalanche', icon: '🔺', category: 'Native Layer 1', priceUsd: 22.50, change24h: 4.65, high24h: 23.40, low24h: 21.30, volume24h: '$490M', marketCap: '$8.9B', primaryNetwork: 'Avalanche C-Chain', supportedNetworks: ['Avalanche'], decimals: 18, autoSwapSupported: true },
  { symbol: 'TRX', name: 'TRON', icon: '🔴', category: 'Native Layer 1', priceUsd: 0.13, change24h: 0.90, high24h: 0.134, low24h: 0.128, volume24h: '$620M', marketCap: '$11.3B', primaryNetwork: 'TRON Network', supportedNetworks: ['Tron'], decimals: 6, autoSwapSupported: true },
  { symbol: 'TON', name: 'Toncoin', icon: '💎', category: 'Native Layer 1', priceUsd: 5.80, change24h: -2.40, high24h: 6.05, low24h: 5.68, volume24h: '$710M', marketCap: '$14.7B', primaryNetwork: 'TON Network', supportedNetworks: ['Ethereum', 'BNB Chain'], decimals: 9, autoSwapSupported: true },
  { symbol: 'SUI', name: 'Sui', icon: '💧', category: 'Native Layer 1', priceUsd: 0.92, change24h: 8.95, high24h: 0.965, low24h: 0.835, volume24h: '$680M', marketCap: '$2.6B', primaryNetwork: 'Sui Network', supportedNetworks: ['Ethereum'], decimals: 9, autoSwapSupported: true },
  { symbol: 'NEAR', name: 'NEAR Protocol', icon: '🌐', category: 'Native Layer 1', priceUsd: 4.20, change24h: 3.10, high24h: 4.38, low24h: 4.02, volume24h: '$310M', marketCap: '$4.8B', primaryNetwork: 'NEAR Network', supportedNetworks: ['Ethereum'], decimals: 24, autoSwapSupported: true },

  // DeFi & Utility
  { symbol: 'LINK', name: 'Chainlink', icon: '🔗', category: 'DeFi & Utility', priceUsd: 11.50, change24h: 2.75, high24h: 11.85, low24h: 11.10, volume24h: '$420M', marketCap: '$6.9B', primaryNetwork: 'Ethereum', supportedNetworks: ['Ethereum', 'Arbitrum', 'Polygon', 'Optimism', 'Base'], decimals: 18, autoSwapSupported: true },
  { symbol: 'UNI', name: 'Uniswap', icon: '🦄', category: 'DeFi & Utility', priceUsd: 6.80, change24h: 1.80, high24h: 7.02, low24h: 6.62, volume24h: '$260M', marketCap: '$4.1B', primaryNetwork: 'Ethereum', supportedNetworks: ['Ethereum', 'Arbitrum', 'Polygon', 'Optimism', 'Base'], decimals: 18, autoSwapSupported: true },

  // Meme & Community Coins
  { symbol: 'DOGE', name: 'Dogecoin', icon: '🐕', category: 'Meme & Community', priceUsd: 0.10, change24h: -0.80, high24h: 0.105, low24h: 0.098, volume24h: '$890M', marketCap: '$14.6B', primaryNetwork: 'Dogecoin Chain', supportedNetworks: ['Bitcoin Network', 'BNB Chain'], decimals: 8, autoSwapSupported: true },
  { symbol: 'SHIB', name: 'Shiba Inu', icon: '🐶', category: 'Meme & Community', priceUsd: 0.000014, change24h: 1.10, high24h: 0.0000145, low24h: 0.0000137, volume24h: '$340M', marketCap: '$8.2B', primaryNetwork: 'Ethereum', supportedNetworks: ['Ethereum'], decimals: 18, autoSwapSupported: true },
  { symbol: 'PEPE', name: 'Pepe Coin', icon: '🐸', category: 'Meme & Community', priceUsd: 0.000008, change24h: 7.30, high24h: 0.0000086, low24h: 0.0000073, volume24h: '$610M', marketCap: '$3.4B', primaryNetwork: 'Ethereum', supportedNetworks: ['Ethereum'], decimals: 18, autoSwapSupported: true },
];

export function getCoinsForChain(chainName: string): CoinInfo[] {
  if (!chainName) return ALL_COINS;
  const filtered = ALL_COINS.filter((c) => {
    if (!c.supportedNetworks || c.supportedNetworks.length === 0) return true;
    return c.supportedNetworks.some((net) => 
      net.toLowerCase().includes(chainName.toLowerCase()) || 
      chainName.toLowerCase().includes(net.toLowerCase())
    );
  });
  return filtered.length > 0 ? filtered : ALL_COINS;
}

export function getCoinInfo(symbol: string): CoinInfo {
  const found = ALL_COINS.find((c) => c.symbol.toUpperCase() === symbol.toUpperCase());
  if (found) return found;
  return {
    symbol: symbol.toUpperCase(),
    name: `${symbol.toUpperCase()} Coin`,
    icon: '🪙',
    category: 'DeFi & Utility',
    priceUsd: 1.00,
    change24h: 0.00,
    high24h: 1.05,
    low24h: 0.95,
    volume24h: '$100M',
    marketCap: '$500M',
    primaryNetwork: 'Multi-chain',
    supportedNetworks: [],
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

export function calculateTotalWalletUsd(tokenBalances: Record<string, number>): number {
  if (!tokenBalances) return 0;
  return Object.entries(tokenBalances).reduce((total, [symbol, amount]) => {
    const info = getCoinInfo(symbol);
    return total + (Number(amount) || 0) * (info.priceUsd || 0);
  }, 0);
}
