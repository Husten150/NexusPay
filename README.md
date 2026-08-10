# NexusPay AI — Web3 Treasury & Autonomous Financial Infrastructure

![NexusPay AI Hero Banner](./src/assets/images/nexuspay_hero_banner_1786395993479.jpg)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-Google_GenAI-8E75FF?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![Web3](https://img.shields.io/badge/Web3-EIP--1193_Injected-F16822?style=flat-square&logo=ethereum&logoColor=white)](https://ethereum.org/)

**NexusPay AI** is an enterprise-grade Web3 financial operating system and autonomous AI agent designed for real-time global money transfers, payment streaming, automated invoice settlement, cross-border remittance, and DeFi treasury yield optimization across multi-chain networks.

---

## 🌟 Key Highlights & Live Features

### 1. 🤖 Autonomous AI Command Center
* **Natural Language Intent Execution**: Type commands like *"Transfer 500 USDC to 0x71C..."*, *"Create payroll stream for Alex"*, or *"Send 1,000 USDC remittance to Kenya via M-Pesa"*.
* **Real-Time Risk Scoring**: Automated AI safety evaluation (0–100 scale), gas cost prediction, and pre-flight transaction verification before signing.
* **Powered by Google Gemini AI**: Instant cryptographic transaction synthesis without human friction.

### 2. ⚡ Real-Time Web3 Wallet & On-Chain Transfers
* **Multi-Wallet Connectivity**: Native support for **MetaMask**, **Coinbase Wallet**, **Phantom (Solana)**, **Injected EIP-1193**, or custom raw wallet addresses (`0x...` / ENS).
* **Instant Money Transfers**: Real-time EIP-1193 signature prompts with direct block explorer transaction tracking (**Etherscan**, **Polygonscan**, **Basescan**, **Arbiscan**, **Solscan**).
* **Receive Funds & Live Listener**: QR code modal with address copying and an active WebSocket on-chain deposit listener.
* **Testnet Faucet**: One-click claim of `+$10,000 USDC` sandbox tokens for instant testing.

### 3. 🌊 Real-Time Payment Streaming Payroll
* **Per-Second Token Streaming**: Sablier/Superfluid-style real-time micro-payments for global contractors and employees.
* **Stream Controls**: Pause, resume, or cancel active streams dynamically with live accumulated payout counters.

### 4. 🧾 Cryptographic Merchant Invoice Gateway
* **Web3 Invoice Generation**: Create structured invoices with line items, tax calculations, and selectable payment tokens (**USDC**, **ETH**, **USDT**, **MATIC**, **SOL**).
* **Instant Settlement**: Payees scan QR codes or execute one-click on-chain settlement directly into the treasury balance.

### 5. 🌍 Cross-Border Global Remittance (190+ Countries)
* **Direct Fiat Rail Conversion**: Connect Web3 stablecoins directly into local banking and mobile money networks worldwide:
  * 🇪🇺 **Europe**: SEPA Instant IBANs (EUR)
  * 🇧🇷 **Brazil**: Pix Instant Payments (BRL)
  * 🇲🇽 **Mexico**: SPEI Banking (MXN)
  * 🇰🇪 🇬🇭 **Africa**: M-Pesa Mobile Money (KES, GHS) & Naira Direct (NGN)
  * 🇮🇳 **India**: UPI Handles (INR)
  * 🇵🇭 **Philippines**: GCash Mobile Wallet (PHP)
  * 🇺🇸 **United States**: ACH / FedNow (USD)
  * 🇬🇧 **United Kingdom**: Faster Payments (GBP)
* **99.5% Fee Savings**: $0.15 L2 transaction fee vs. $35.00+ legacy SWIFT wire fees with 3-second instant finality.

### 6. 📈 AI Treasury Yield Optimizer
* **Automated Yield Vaults**: Deploy idle treasury capital into top DeFi protocols (**Aave v3**, **Compound v3**, **Convex**, **Uniswap v3 LP**).
* **Risk-Adjusted APY**: Automated rebalancing and instant deposit/withdrawal workflows.

### 7. 🛡️ Security & Smart Contract Auditor
* **Static Analysis Engine**: Scans contract bytecode for reentrancy bugs, access control vulnerabilities, and unverified proxies before interaction.

---

## 📐 System Architecture

![NexusPay AI Architecture Diagram](./src/assets/images/nexuspay_architecture_1786396003113.jpg)

The NexusPay AI system architecture decouples user intent from chain-specific complexity:

1. **User / Prompt Input** ➔ Natural language or UI control.
2. **AI Intent Parser (Gemini SDK)** ➔ Generates structured `AgentActionIntent` with risk score & gas estimation.
3. **Web3 Execution Layer** ➔ Routes payload through EIP-1193 provider to Polygon, Base, Ethereum, Arbitrum, Optimism, or Solana.
4. **Fiat Rail Gateway** ➔ Off-chain liquidity pools convert stablecoins into local SEPA, Pix, SPEI, M-Pesa, or UPI fiat payouts.
5. **On-Chain Audit Logger** ➔ Stores immutable transaction logs and risk analysis metrics.

---

## 📹 Video & Interactive Demo Walkthrough

### 🎬 Product Demo Preview
Below is a visual overview of the primary operational workflows within NexusPay AI:

```
+-----------------------------------------------------------------------------------+
|  [ 🤖 AI Agent Command Center ]                                                    |
|  Prompt: "Send $500 USDC to 0x71C7656EC7ab88b098defB751B7401B5f6d8976F on Base"    |
|  Status: AI Verified (Risk Score: 98/100) -> Executing On-Chain...                |
+-----------------------------------------------------------------------------------+
|  [ 💳 Real-Time Wallet Balance ]              [ 🌍 Global Remittance Engine ]      |
|  Total Balance: $128,450.00 USD               Route: Polygon -> M-Pesa (Kenya)    |
|  USDC: 112,000 | ETH: 4.5 | MATIC: 12,500      Fee: $0.15 USD | Time: 3 Seconds    |
+-----------------------------------------------------------------------------------+
|  [ ⚡ Active Payment Streams ]                 [ 🧾 Merchant Invoices ]             |
|  • Alex Rivera (Lead Engineer): $6,500/mo      • NEX-2026-104 ($2,500 USDC) - PAID  |
|  • Server Infrastructure: $1,200/mo            • NEX-2026-105 ($4,800 USDC) - PENDING |
+-----------------------------------------------------------------------------------+
```

#### Walkthrough Steps:
1. **Connecting Wallet**: Click **Connect Real Web3 Wallet** in the top navigation bar. Choose your injected browser extension or paste any custom wallet address.
2. **Executing Real-Time Transfers**: Click **Transfer Money** to open the transfer modal. Enter recipient address and amount. The app invokes your connected wallet or simulates on-chain EIP-1193 signature broadcast with live hash link.
3. **Receiving Money**: Click **Receive Money** to reveal your deposit QR code, or click **Test Receive Funds** to trigger the WebSocket listener.
4. **Global Remittance**: Navigate to the **Global Remittance** tab. Select target country (e.g. Kenya, Germany, Brazil, India), enter amount, and click **Send**. Local fiat currency is calculated in real time with instant settlement log.
5. **AI Agent Commands**: Try typing `Send 250 USDC to 0x123...` or `Create payroll stream of 5000 USDC` into the AI input bar at the top!

---

## 🌐 Supported Blockchains & Networks

| Blockchain Network | Chain ID / Standard | Settlement Speed | Typical Gas Fee | Primary Rail |
| :--- | :--- | :--- | :--- | :--- |
| **Polygon PoS** | `137` (EVM) | ~2 sec | ~$0.008 USD | Remittance / Micro-transactions |
| **Base L2** | `8453` (EVM) | ~1 sec | ~$0.005 USD | Low-cost Coinbase ecosystem |
| **Ethereum Mainnet** | `1` (EVM) | ~12 sec | ~$1.50–$5.00 USD | High-value settlement |
| **Arbitrum One** | `42161` (EVM) | ~1 sec | ~$0.02 USD | Treasury & Yield Vaults |
| **Optimism** | `10` (EVM) | ~2 sec | ~$0.01 USD | Corporate Payroll Streams |
| **Solana** | `Mainnet-Beta` | ~0.4 sec | ~$0.0005 USD | High-frequency micropayments |

---

## 🛠️ Technology Stack

* **Frontend**: React 18, Vite, TypeScript, Tailwind CSS
* **Icons & UI**: Lucide React, Framer Motion
* **Web3 Integration**: EIP-1193 Provider API, Custom Web3 RPC Listeners
* **AI Engine**: `@google/genai` (Google Gemini AI SDK)
* **Backend Server**: Node.js / Express with TypeScript (`server.ts`)
* **Build System**: Vite + `esbuild` for CJS production server bundling

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: `v18.0.0` or higher
* **npm** or **bun**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/nexuspay-ai.git
   cd nexuspay-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the project root based on `.env.example`:
   ```env
   # .env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   PORT=3000
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 🔒 Security & Safety Disclaimers

* **Smart Contract Safety**: All transactions initiated via NexusPay AI pass through pre-flight AI static checks to detect unverified proxy calls and high-risk parameters.
* **Key Security**: NexusPay AI never stores or transmits private keys. All cryptographic signatures are handled directly by client-side Web3 wallet extensions (MetaMask, Coinbase Wallet, Phantom) via standard EIP-1193 providers.

---

## 📄 License

This project is licensed under the **MIT License**.
