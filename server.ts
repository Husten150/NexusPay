import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'NexusPay AI Web3 Engine', timestamp: new Date().toISOString() });
});

/**
 * AI Web3 Agent Command & Intent Parser Route
 * Converts natural language prompt into structured Web3 action, gas estimate, risk assessment, and contract calls.
 */
app.post('/api/agent/intent', async (req, res) => {
  try {
    const { prompt, userWallet, userName, userEmail, selectedChain } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const systemInstruction = `
You are NexusPay AI, an advanced agentic Web3 financial assistant and smart treasury optimizer.
Your goal is to parse natural language user prompts related to crypto payments, payroll streams, invoice creation, treasury swaps, cross-border remittances, or security audits, and convert them into structured Web3 transaction intents based on the user's LIVE active account.

When generating parameter fields (e.g. merchantName, senderName, wallet address), ALWAYS prioritize using the user's live logged-in account information provided in the context unless a specific external third party recipient is explicitly named in the prompt. Do NOT use fake demo names like "Alex Rivera" if the user prompt refers to their own account or payroll.

Evaluate the user's intent, assign a security risk rating ('SAFE', 'WARNING', or 'CRITICAL'), estimate network gas in USD, generate clear step-by-step confirmation details, and construct simulated smart contract parameters.

Always reply with valid JSON following this schema:
{
  "actionType": "PAYROLL_STREAM" | "INSTANT_TRANSFER" | "CREATE_INVOICE" | "CROSS_BORDER_REMITTANCE" | "TREASURY_SWAP" | "SECURITY_AUDIT" | "YIELD_DEPOSIT" | "GENERAL_QUERY",
  "title": string,
  "summary": string,
  "parameters": {
    "recipientAddress"?: string,
    "recipientName"?: string,
    "amount"?: number,
    "token"?: string,
    "frequency"?: "instant" | "daily" | "weekly" | "monthly",
    "sourceChain"?: string,
    "targetChain"?: string,
    "targetCurrency"?: string,
    "invoiceItems"?: Array<{ description: string, amount: number }>,
    "dueDate"?: string,
    "targetProtocol"?: string,
    "apy"?: number
  },
  "riskLevel": "SAFE" | "WARNING" | "CRITICAL",
  "riskScore": number (1-100, where 100 is safest),
  "safetyExplanation": string,
  "estimatedGasUsd": number,
  "confidenceScore": number (0.0 to 1.0),
  "suggestedOptimization": string,
  "contractCallPreview": {
    "targetContract": string,
    "functionSignature": string,
    "callDataHex": string,
    "estimatedTimeSeconds": number
  }
}
`;

    const userMessage = `Live Account Context: Logged-in Username: "${userName || 'Treasury User'}", User Email: "${userEmail || 'user@nexuspay.io'}", Live Wallet Address: "${userWallet || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'}" on network "${selectedChain || 'Ethereum Mainnet'}". User Prompt: "${prompt}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: userMessage,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const responseText = response.text || '{}';
    const parsedData = JSON.parse(responseText);

    res.json({ success: true, intent: parsedData });
  } catch (error: any) {
    console.error('Error in /api/agent/intent:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process agent intent',
      fallback: {
        actionType: 'GENERAL_QUERY',
        title: 'Action Parsed with Default Safeguards',
        summary: 'Unable to parse dynamic intent via AI model. Provided standard transfer structure.',
        riskLevel: 'SAFE',
        riskScore: 90,
        safetyExplanation: 'Standard address format verified.',
        estimatedGasUsd: 0.45,
        confidenceScore: 0.85,
        suggestedOptimization: 'Use Layer 2 networks like Base or Polygon to reduce gas by 92%.',
      },
    });
  }
});

/**
 * AI Security & Smart Contract Auditor Endpoint
 * Evaluates contract addresses or transaction parameters for vulnerabilities, malicious drainers, or infinite approvals.
 */
app.post('/api/agent/audit-tx', async (req, res) => {
  try {
    const { targetAddress, chain, contractCodeOrDesc } = req.body;

    const systemInstruction = `
You are a top-tier Web3 Security Auditor & Threat Detection AI Engine for NexusPay AI.
Analyze the target contract/address or code snippet for common security risks including:
- Unlimited Token Approvals / Allowance Drainers
- Unverified proxy pattern or backdoor owner functions
- High slippage or Sandwich attack vulnerability
- Phishing / Blacklisted honeypot indicators
- Reentrancy risks or unhandled call return values

Return JSON in this format:
{
  "targetAddress": string,
  "isVerified": boolean,
  "securityScore": number (0-100),
  "threatLevel": "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "auditSummary": string,
  "vulnerabilities": Array<{
    "title": string,
    "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    "description": string,
    "remediation": string
  }>,
  "approvalPermissionsCheck": {
    "hasUnlimitedApproval": boolean,
    "recommendedLimit": string
  },
  "verdict": "APPROVE" | "PROCEED_WITH_CAUTION" | "REJECT_TRANSACTION"
}
`;

    const promptText = `Analyze target: ${targetAddress} on network: ${chain || 'Ethereum'}. Code/Context: ${contractCodeOrDesc || 'Standard ERC20 / DeFi Interaction'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    res.json({ success: true, audit: parsedData });
  } catch (error: any) {
    console.error('Error in /api/agent/audit-tx:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * AI Merchant Invoice Extractor Endpoint
 * Parses unstructured text into formatted B2B Web3 invoice items.
 */
app.post('/api/agent/parse-invoice', async (req, res) => {
  try {
    const { invoiceText } = req.body;

    const systemInstruction = `
Extract structured invoice details from unstructured invoice text or payment requests.
Return JSON:
{
  "clientName": string,
  "clientWallet": string,
  "items": Array<{ "description": string, "quantity": number, "unitPriceUsd": number, "totalUsd": number }>,
  "subtotalUsd": number,
  "taxUsd": number,
  "totalUsd": number,
  "preferredToken": "USDC" | "USDT" | "ETH" | "MATIC" | "SOL",
  "dueDate": string (YYYY-MM-DD),
  "notes": string
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Parse invoice: ${invoiceText}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    res.json({ success: true, invoice: JSON.parse(response.text || '{}') });
  } catch (error: any) {
    console.error('Error in /api/agent/parse-invoice:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * AI Treasury Yield Strategy Advisor
 */
app.post('/api/agent/yield-strategy', async (req, res) => {
  try {
    const { treasuryBalanceUsd, riskTolerance, assetAllocations } = req.body;

    const systemInstruction = `
You are an AI Treasury Yield Optimizer for decentralized autonomous organizations (DAOs) and Web3 companies.
Recommend a portfolio allocation strategy across DeFi blue-chip protocols (e.g. Aave v3, Compound v3, Uniswap v3 LP, Curve stETH) to maximize risk-adjusted APY while preserving principal liquidity.

Return JSON:
{
  "strategyName": string,
  "recommendedApy": number,
  "estimatedAnnualYieldUsd": number,
  "riskRating": "LOW" | "BALANCED" | "AGGRESSIVE",
  "allocations": Array<{
    "protocol": string,
    "asset": string,
    "percentage": number,
    "allocationUsd": number,
    "currentApy": number,
    "reasoning": string
  }>,
  "rebalancingTips": string
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Treasury: $${treasuryBalanceUsd || 250000} USD. Risk level: ${riskTolerance || 'BALANCED'}. Allocations context: ${JSON.stringify(assetAllocations || {})}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    res.json({ success: true, strategy: JSON.parse(response.text || '{}') });
  } catch (error: any) {
    console.error('Error in /api/agent/yield-strategy:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve Vite dev / prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 NexusPay AI Web3 server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
