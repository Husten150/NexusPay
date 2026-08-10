import { WalletState, PaymentStream, MerchantInvoice, RemittanceQuote, YieldPosition, TransactionAuditLog } from '../types';

export const INITIAL_WALLET: WalletState = {
  address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  chain: 'Polygon',
  isConnected: true,
  walletType: 'Simulated Sandbox',
  balanceUsd: 312850.50,
  tokenBalances: {
    USDC: 125400.00,
    BTC: 1.25,        // ~$80,250
    ETH: 18.5,        // ~$49,950
    USDT: 12500.00,
    SOL: 85.0,        // ~$12,325
    BNB: 15.0,        // ~$7,800
    MATIC: 15000.00,  // ~$6,750
    XRP: 8500.00,     // ~$4,930
    XLM: 25000.00,    // ~$2,750
    ADA: 12000.00,    // ~$4,320
    AVAX: 180.0,      // ~$4,050
    TRX: 25000.00,    // ~$3,250
    DOGE: 35000.00,   // ~$3,500
    TON: 450.0,       // ~$2,610
    SUI: 2500.0,      // ~$2,300
    NEAR: 600.0,      // ~$2,520
    DAI: 5000.00,
    PYUSD: 2500.00,
    LINK: 450.0,      // ~$5,175
    UNI: 650.0,       // ~$4,420
    SHIB: 150000000,  // ~$2,100
    PEPE: 250000000,  // ~$2,000
  },
};

export const INITIAL_STREAMS: PaymentStream[] = [
  {
    id: 'str-101',
    recipientName: 'Alex Rivera (Lead Engineer)',
    recipientAddress: '0x3F91A2d2C5E78bE934607d72863951B421a8D9f1',
    amount: 6500,
    token: 'USDC',
    frequency: 'monthly',
    status: 'ACTIVE',
    totalPaidUsd: 19500,
    startDate: '2026-05-01',
    nextPaymentDate: '2026-09-01',
    riskScore: 98,
    aiVerified: true,
    category: 'ENGINEERING_PAYROLL',
  },
  {
    id: 'str-102',
    recipientName: 'Elena Rostova (UI/UX Design)',
    recipientAddress: '0x88D23b49122c1E9012F49d97A622A63c18fB560C',
    amount: 4200,
    token: 'USDC',
    frequency: 'monthly',
    status: 'ACTIVE',
    totalPaidUsd: 8400,
    startDate: '2026-06-15',
    nextPaymentDate: '2026-08-15',
    riskScore: 95,
    aiVerified: true,
    category: 'FREELANCER',
  },
  {
    id: 'str-103',
    recipientName: 'Chainlink Oracle Node Feed',
    recipientAddress: '0x1111111254fb6c44bac0bed2854e76f90643097d',
    amount: 800,
    token: 'MATIC',
    frequency: 'weekly',
    status: 'ACTIVE',
    totalPaidUsd: 3200,
    startDate: '2026-07-01',
    nextPaymentDate: '2026-08-08',
    riskScore: 100,
    aiVerified: true,
    category: 'SAAS_SUBSCRIPTION',
  },
  {
    id: 'str-104',
    recipientName: 'Solidity Security Auditor Retainer',
    recipientAddress: '0x99990A4532Bc117cEa2C21fA011f0a1c6e11942C',
    amount: 3000,
    token: 'USDC',
    frequency: 'monthly',
    status: 'PAUSED',
    totalPaidUsd: 6000,
    startDate: '2026-04-10',
    nextPaymentDate: '2026-08-10',
    riskScore: 88,
    aiVerified: true,
    category: 'FREELANCER',
  },
];

export const INITIAL_INVOICES: MerchantInvoice[] = [
  {
    id: 'inv-8801',
    invoiceNumber: 'NEX-2026-089',
    clientName: 'Aetheria Protocol Foundation',
    clientWallet: '0x55A3761274F298b11c97fB2533B27244D20059Ac',
    merchantName: 'NexusPay AI Enterprise Solutions',
    merchantWallet: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    items: [
      { id: '1', description: 'Smart Contract Payment Gateway Integration', quantity: 1, unitPriceUsd: 3500, totalUsd: 3500 },
      { id: '2', description: 'Automated AI Escrow Contract Deployment', quantity: 1, unitPriceUsd: 2200, totalUsd: 2200 },
    ],
    subtotalUsd: 5700,
    taxUsd: 0,
    totalUsd: 5700,
    paymentToken: 'USDC',
    status: 'PAID',
    dueDate: '2026-08-02',
    createdAt: '2026-07-25',
    qrPayload: 'ethereum:0x71C7656EC7ab88b098defB751B7401B5f6d8976F@137/pay?value=5700&token=USDC',
    txHash: '0x9a8f712e4d01b128539201948571c50e21a8d9b102938475f6019a827364b5e0',
  },
  {
    id: 'inv-8802',
    invoiceNumber: 'NEX-2026-092',
    clientName: 'ZeroKnowledge Labs Ltd',
    clientWallet: '0x9911A34f82D991bc8203d985920a0F31a2938Ac1',
    merchantName: 'NexusPay AI Enterprise Solutions',
    merchantWallet: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    items: [
      { id: '1', description: 'Cross-chain Remittance Engine API License', quantity: 1, unitPriceUsd: 4800, totalUsd: 4800 },
    ],
    subtotalUsd: 4800,
    taxUsd: 0,
    totalUsd: 4800,
    paymentToken: 'USDC',
    status: 'PENDING',
    dueDate: '2026-08-15',
    createdAt: '2026-08-01',
    qrPayload: 'ethereum:0x71C7656EC7ab88b098defB751B7401B5f6d8976F@137/pay?value=4800&token=USDC',
  },
  {
    id: 'inv-8803',
    invoiceNumber: 'NEX-2026-095',
    clientName: 'Starlight NFT Gaming Studio',
    clientWallet: '0x1234567890123456789012345678901234567890',
    merchantName: 'NexusPay AI Enterprise Solutions',
    merchantWallet: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    items: [
      { id: '1', description: 'Web3 Micro-payment Widget Customization', quantity: 1, unitPriceUsd: 1800, totalUsd: 1800 },
    ],
    subtotalUsd: 1800,
    taxUsd: 0,
    totalUsd: 1800,
    paymentToken: 'MATIC',
    status: 'OVERDUE',
    dueDate: '2026-07-30',
    createdAt: '2026-07-10',
    qrPayload: 'ethereum:0x71C7656EC7ab88b098defB751B7401B5f6d8976F@137/pay?value=1800&token=MATIC',
  },
];

export const INITIAL_REMITTANCE_QUOTES: RemittanceQuote[] = [
  {
    id: 'rem-301',
    sourceCurrency: 'USD (USDC)',
    targetCurrency: 'EUR (SEPA Web3)',
    sourceAmount: 1000,
    targetAmountEstimated: 922.50,
    web3FeeUsd: 0.18,
    tradBankFeeUsd: 38.50,
    savingsUsd: 38.32,
    savingsPercent: 99.5,
    routeChain: 'Polygon',
    estimatedTimeSeconds: 4,
    fxRate: 0.9225,
    recipientCountry: 'Germany',
    recipientName: 'Klaus Webber GmbH',
    recipientWalletOrAccount: 'DE89370400440532013000',
  },
  {
    id: 'rem-302',
    sourceCurrency: 'USD (USDC)',
    targetCurrency: 'KES (Mobile Money M-Pesa)',
    sourceAmount: 500,
    targetAmountEstimated: 64250.00,
    web3FeeUsd: 0.12,
    tradBankFeeUsd: 22.00,
    savingsUsd: 21.88,
    savingsPercent: 99.4,
    routeChain: 'Base',
    estimatedTimeSeconds: 2,
    fxRate: 128.5,
    recipientCountry: 'Kenya',
    recipientName: 'David Ochieng',
    recipientWalletOrAccount: '+254712345678',
  },
  {
    id: 'rem-303',
    sourceCurrency: 'USD (USDC)',
    targetCurrency: 'BRL (Pix Instant Pay)',
    sourceAmount: 2500,
    targetAmountEstimated: 13850.00,
    web3FeeUsd: 0.25,
    tradBankFeeUsd: 75.00,
    savingsUsd: 74.75,
    savingsPercent: 99.6,
    routeChain: 'Polygon',
    estimatedTimeSeconds: 3,
    fxRate: 5.54,
    recipientCountry: 'Brazil',
    recipientName: 'Fernanda Santos Tech',
    recipientWalletOrAccount: '000.111.222-33',
  },
];

export const INITIAL_YIELD_POSITIONS: YieldPosition[] = [
  {
    id: 'yld-01',
    protocol: 'Aave v3',
    asset: 'USDC',
    apy: 5.82,
    depositedAmountUsd: 65000,
    earnedYieldUsd: 1240.50,
    riskRating: 'LOW',
    status: 'ACTIVE',
  },
  {
    id: 'yld-02',
    protocol: 'Compound v3',
    asset: 'USDC',
    apy: 5.45,
    depositedAmountUsd: 30000,
    earnedYieldUsd: 512.20,
    riskRating: 'LOW',
    status: 'ACTIVE',
  },
  {
    id: 'yld-03',
    protocol: 'Uniswap v3 LP',
    asset: 'ETH',
    apy: 12.40,
    depositedAmountUsd: 25000,
    earnedYieldUsd: 980.00,
    riskRating: 'MEDIUM',
    status: 'ACTIVE',
  },
  {
    id: 'yld-04',
    protocol: 'Curve Lido',
    asset: 'ETH',
    apy: 3.90,
    depositedAmountUsd: 15000,
    earnedYieldUsd: 195.00,
    riskRating: 'LOW',
    status: 'ACTIVE',
  },
];

export const INITIAL_AUDIT_LOGS: TransactionAuditLog[] = [
  {
    id: 'log-901',
    timestamp: '2026-08-07 03:12:40',
    txHash: '0x4f12...b8e9',
    type: 'STREAM_EXEC',
    summary: 'Automated streaming payroll trigger: $6,500 USDC to Alex Rivera',
    amountUsd: 6500,
    chain: 'Polygon',
    status: 'CONFIRMED',
    gasFeeUsd: 0.0042,
    aiRiskLevel: 'SAFE',
  },
  {
    id: 'log-902',
    timestamp: '2026-08-06 18:45:12',
    txHash: '0x88a1...1092',
    type: 'INVOICE_PAYMENT',
    summary: 'Merchant Payment Received for NEX-2026-089 ($5,700 USDC)',
    amountUsd: 5700,
    chain: 'Polygon',
    status: 'CONFIRMED',
    gasFeeUsd: 0.0061,
    aiRiskLevel: 'SAFE',
  },
  {
    id: 'log-903',
    timestamp: '2026-08-05 11:20:05',
    txHash: '0xd921...77a4',
    type: 'SECURITY_BLOCK',
    summary: 'AI Security Agent Blocked Unlimited Token Approval call to suspicious proxy (0xBad...99)',
    amountUsd: 0,
    chain: 'Ethereum',
    status: 'BLOCKED',
    gasFeeUsd: 0.00,
    aiRiskLevel: 'CRITICAL',
  },
  {
    id: 'log-904',
    timestamp: '2026-08-04 14:10:33',
    txHash: '0x1029...e491',
    type: 'TREASURY_REBALANCE',
    summary: 'Rebalanced $25,000 USDC into Aave v3 Pool (APY 5.82%)',
    amountUsd: 25000,
    chain: 'Arbitrum',
    status: 'CONFIRMED',
    gasFeeUsd: 0.082,
    aiRiskLevel: 'SAFE',
  },
];

// Helper to save state to LocalStorage
export function loadSavedState<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(`nexuspay_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    return fallback;
  }
}

export function saveState<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`nexuspay_${key}`, JSON.stringify(value));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}
