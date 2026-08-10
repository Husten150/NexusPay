export interface UserAccount {
  id: string;
  username: string;
  email: string;
  passwordHash?: string;
  secretRecoveryCode: string;
  isRecoveryKeyBackedUp: boolean;
  biometricRegistered?: boolean;
  biometricCredentialId?: string;
  walletAddress: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserAccount | null;
}

export type SupportedChain = 
  | 'Ethereum' 
  | 'Polygon' 
  | 'Base' 
  | 'Arbitrum' 
  | 'Solana' 
  | 'Optimism' 
  | 'BNB Chain' 
  | 'Avalanche' 
  | 'Tron' 
  | 'Bitcoin Network'
  | 'Stellar Network';

export interface WalletState {
  address: string;
  chain: SupportedChain;
  isConnected: boolean;
  walletType: 'Enterprise Treasury Vault' | 'MetaMask' | 'Coinbase' | 'Phantom' | 'Stellar Wallet (Freighter)' | 'Injected Web3';
  balanceUsd: number;
  tokenBalances: Record<string, number>;
}

export interface PaymentStream {
  id: string;
  recipientName: string;
  recipientAddress: string;
  amount: number;
  token: string; // Accepts any coin (USDC, BTC, ETH, SOL, BNB, DOGE, etc.)
  frequency: 'realtime' | 'daily' | 'weekly' | 'monthly';
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  totalPaidUsd: number;
  startDate: string;
  nextPaymentDate: string;
  riskScore: number;
  aiVerified: boolean;
  category: 'ENGINEERING_PAYROLL' | 'FREELANCER' | 'SAAS_SUBSCRIPTION' | 'GRANT_DISBURSEMENT';
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPriceUsd: number;
  totalUsd: number;
}

export interface MerchantInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientWallet: string;
  merchantName: string;
  merchantWallet: string;
  items: InvoiceItem[];
  subtotalUsd: number;
  taxUsd: number;
  totalUsd: number;
  paymentToken: string; // Accepts any coin (BTC, ETH, USDC, USDT, SOL, BNB, XRP, DOGE, etc.)
  autoSwapToUsdc?: boolean; // Option to auto-settle any coin directly into USDC
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED';
  dueDate: string;
  createdAt: string;
  qrPayload: string;
  txHash?: string;
}

export interface RemittanceQuote {
  id: string;
  sourceCurrency: string;
  targetCurrency: string;
  sourceAmount: number;
  targetAmountEstimated: number;
  web3FeeUsd: number;
  tradBankFeeUsd: number;
  savingsUsd: number;
  savingsPercent: number;
  routeChain: SupportedChain;
  estimatedTimeSeconds: number;
  fxRate: number;
  recipientCountry: string;
  recipientName: string;
  recipientWalletOrAccount: string;
}

export interface YieldPosition {
  id: string;
  protocol: 'Aave v3' | 'Compound v3' | 'Uniswap v3 LP' | 'Curve Lido' | 'Morpho Blue';
  asset: 'USDC' | 'ETH' | 'USDT';
  apy: number;
  depositedAmountUsd: number;
  earnedYieldUsd: number;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'ACTIVE' | 'WITHDRAWN';
}

export interface TransactionAuditLog {
  id: string;
  timestamp: string;
  txHash: string;
  type: 'STREAM_EXEC' | 'INVOICE_PAYMENT' | 'TREASURY_REBALANCE' | 'REMITTANCE' | 'SECURITY_BLOCK';
  summary: string;
  amountUsd: number;
  chain: SupportedChain;
  status: 'CONFIRMED' | 'PENDING' | 'BLOCKED';
  gasFeeUsd: number;
  aiRiskLevel: 'SAFE' | 'WARNING' | 'CRITICAL';
}

export interface AgentActionIntent {
  actionType: 'PAYROLL_STREAM' | 'INSTANT_TRANSFER' | 'CREATE_INVOICE' | 'CROSS_BORDER_REMITTANCE' | 'TREASURY_SWAP' | 'SECURITY_AUDIT' | 'YIELD_DEPOSIT' | 'GENERAL_QUERY';
  title: string;
  summary: string;
  parameters: {
    recipientAddress?: string;
    recipientName?: string;
    amount?: number;
    token?: string;
    frequency?: 'instant' | 'daily' | 'weekly' | 'monthly';
    sourceChain?: SupportedChain;
    targetChain?: SupportedChain;
    targetCurrency?: string;
    invoiceItems?: Array<{ description: string; amount: number }>;
    dueDate?: string;
    targetProtocol?: string;
    apy?: number;
  };
  riskLevel: 'SAFE' | 'WARNING' | 'CRITICAL';
  riskScore: number;
  safetyExplanation: string;
  estimatedGasUsd: number;
  confidenceScore: number;
  suggestedOptimization: string;
  contractCallPreview?: {
    targetContract: string;
    functionSignature: string;
    callDataHex: string;
    estimatedTimeSeconds: number;
  };
}
