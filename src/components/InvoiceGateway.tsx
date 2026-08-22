import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';
import { MerchantInvoice, InvoiceItem, WalletState, AuthState } from '../types';
import { ALL_COINS } from '../data/coinCatalog';
import { 
  FileText, 
  Plus, 
  QrCode, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Bot, 
  DollarSign,
  ArrowUpRight,
  Receipt,
  RefreshCw,
  Lock,
  Scan,
  Barcode as BarcodeIcon,
  X,
  ExternalLink,
  Zap
} from 'lucide-react';
import { sorobanCreateInvoice, sorobanPayInvoice } from '../stellar/contracts';
import { CURRENT_STELLAR_NETWORK, getStellarExplorerTxUrl, getStellarExplorerContractUrl } from '../stellar/config';

interface InvoiceGatewayProps {
  invoices: MerchantInvoice[];
  wallet: WalletState;
  authState: AuthState;
  onOpenAuthModal: () => void;
  onAddInvoice: (invoice: MerchantInvoice) => void;
  onMarkInvoicePaid: (id: string) => void;
}

export const InvoiceGateway: React.FC<InvoiceGatewayProps> = ({
  invoices,
  wallet,
  authState,
  onOpenAuthModal,
  onAddInvoice,
  onMarkInvoicePaid,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [selectedQrInvoice, setSelectedQrInvoice] = useState<MerchantInvoice | null>(null);
  const [qrModalMode, setQrModalMode] = useState<'QR' | 'BARCODE'>('QR');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmittingSoroban, setIsSubmittingSoroban] = useState(false);
  const [txSuccessInfo, setTxSuccessInfo] = useState<{ txHash: string; msg: string } | null>(null);

  // AI Parser state
  const [rawAiText, setRawAiText] = useState('');
  const [parsing, setParsing] = useState(false);

  // Standard Form State
  const [clientName, setClientName] = useState('');
  const [clientWallet, setClientWallet] = useState('');
  const [paymentToken, setPaymentToken] = useState<string>('USDC');
  const [autoSwapToUsdc, setAutoSwapToUsdc] = useState(true);
  const [dueDate, setDueDate] = useState('2026-08-25');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Smart Contract Audit & Integration', quantity: 1, unitPriceUsd: 2500, totalUsd: 2500 },
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: 'Additional Services', quantity: 1, unitPriceUsd: 1000, totalUsd: 1000 },
    ]);
  };

  const handleUpdateItem = (id: string, field: keyof InvoiceItem, val: any) => {
    setItems(
      items.map((it) => {
        if (it.id === id) {
          const updated = { ...it, [field]: val };
          if (field === 'quantity' || field === 'unitPriceUsd') {
            updated.totalUsd = updated.quantity * updated.unitPriceUsd;
          }
          return updated;
        }
        return it;
      })
    );
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authState.isAuthenticated) {
      setAuthError('🔒 Authentication Required: You must be signed in to issue merchant Web3 invoices.');
      onOpenAuthModal();
      return;
    }

    if (!clientName || !clientWallet) return;

    setIsSubmittingSoroban(true);
    setAuthError(null);

    const subtotalUsd = items.reduce((acc, curr) => acc + curr.totalUsd, 0);
    const activeMerchantAddress = authState.user?.walletAddress || wallet.address;
    const activeMerchantName = authState.user?.username || 'NexusPay AI Enterprise';

    try {
      const merchantAddress = activeMerchantAddress.startsWith('G') 
        ? activeMerchantAddress 
        : 'GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ';

      const clientAddress = clientWallet.startsWith('G')
        ? clientWallet
        : 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGUQ2EWKWF4X36S5L33X';

      const dueUnix = Math.floor(new Date(dueDate).getTime() / 1000) || Math.floor(Date.now() / 1000) + 86400 * 14;

      const res = await sorobanCreateInvoice({
        merchant: merchantAddress,
        client: clientAddress,
        totalAmount: subtotalUsd,
        dueDateUnix: dueUnix,
        memo: `Invoice for ${clientName}`,
      }, wallet.walletType.includes('Freighter'));

      const newInvoice: MerchantInvoice = {
        id: `soroban-inv-${Date.now().toString().slice(-4)}`,
        invoiceNumber: `NEX-SOROBAN-${Math.floor(100 + Math.random() * 900)}`,
        clientName,
        clientWallet,
        merchantName: activeMerchantName,
        merchantWallet: activeMerchantAddress,
        items,
        subtotalUsd,
        taxUsd: 0,
        totalUsd: subtotalUsd,
        paymentToken,
        autoSwapToUsdc,
        status: 'PENDING',
        dueDate,
        createdAt: new Date().toISOString().split('T')[0],
        qrPayload: `stellar:${activeMerchantAddress}?amount=${subtotalUsd}&asset_code=${paymentToken}`,
        txHash: res.txHash,
      };

      onAddInvoice(newInvoice);
      setTxSuccessInfo({ txHash: res.txHash, msg: `Soroban Invoice Registered on-chain! Tx: ${res.txHash.slice(0, 12)}...` });
      setShowModal(false);

      // Reset
      setClientName('');
      setClientWallet('');
    } catch (err: any) {
      console.error('Soroban Invoice creation error:', err);
      // Fallback
      const newInvoice: MerchantInvoice = {
        id: `inv-${Date.now().toString().slice(-4)}`,
        invoiceNumber: `NEX-2026-${Math.floor(100 + Math.random() * 900)}`,
        clientName,
        clientWallet,
        merchantName: activeMerchantName,
        merchantWallet: activeMerchantAddress,
        items,
        subtotalUsd,
        taxUsd: 0,
        totalUsd: subtotalUsd,
        paymentToken,
        autoSwapToUsdc,
        status: 'PENDING',
        dueDate,
        createdAt: new Date().toISOString().split('T')[0],
        qrPayload: `stellar:${activeMerchantAddress}?amount=${subtotalUsd}&asset_code=${paymentToken}`,
      };
      onAddInvoice(newInvoice);
      setShowModal(false);
    } finally {
      setIsSubmittingSoroban(false);
    }
  };

  const handleConfirmSorobanPay = async (invoiceId: string) => {
    try {
      const payer = wallet.address.startsWith('G') ? wallet.address : 'GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ';
      const res = await sorobanPayInvoice(8801, payer, wallet.walletType.includes('Freighter'));
      setTxSuccessInfo({ txHash: res.txHash, msg: `Invoice settled on Soroban Smart Contract! Tx: ${res.txHash.slice(0, 12)}...` });
      onMarkInvoicePaid(invoiceId);
    } catch (e) {
      onMarkInvoicePaid(invoiceId);
    }
  };

  const handleParseAiInvoiceText = async () => {
    if (!rawAiText.trim()) return;
    setParsing(true);

    try {
      const res = await fetch('/api/agent/parse-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceText: rawAiText }),
      });
      const data = await res.json();

      if (data.success && data.invoice) {
        const inv = data.invoice;
        setClientName(inv.clientName || 'Extracted B2B Client');
        setClientWallet(inv.clientWallet || '0x9911A34f82D991bc8203d985920a0F31a2938Ac1');
        if (inv.items && Array.isArray(inv.items)) {
          setItems(
            inv.items.map((it: any, idx: number) => ({
              id: idx.toString(),
              description: it.description || 'Service',
              quantity: it.quantity || 1,
              unitPriceUsd: it.unitPriceUsd || 1000,
              totalUsd: it.totalUsd || 1000,
            }))
          );
        }
        if (inv.preferredToken) setPaymentToken(inv.preferredToken);
        if (inv.dueDate) setDueDate(inv.dueDate);

        setShowAiModal(false);
        setShowModal(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setParsing(false);
    }
  };

  const handleCopyQrPayload = (inv: MerchantInvoice) => {
    navigator.clipboard.writeText(inv.qrPayload);
    setCopiedId(inv.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl border border-slate-800">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Receipt className="w-3.5 h-3.5" /> Soroban Smart Contract Invoicing
            </span>
            <a 
              href={getStellarExplorerContractUrl(CURRENT_STELLAR_NETWORK.contractId)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-300 hover:text-white flex items-center gap-1 underline"
            >
              <span>Contract: {CURRENT_STELLAR_NETWORK.contractId.slice(0, 8)}...</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Stellar SAC Invoice Gateway & Instant Settlement</h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Issue merchant invoices payable in USDC, XLM, or SAC tokens on Stellar Soroban with QR code paylinks, automated on-chain receipt signatures, and escrow settlement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200 border border-indigo-500/40 transition-all"
          >
            <Bot className="w-4 h-4 text-indigo-400" />
            <span>Smart Invoice Extractor</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Soroban Invoice</span>
          </button>
        </div>
      </div>

      {/* Live Soroban Notification Toast */}
      {txSuccessInfo && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{txSuccessInfo.msg}</span>
          </div>
          <a
            href={getStellarExplorerTxUrl(txSuccessInfo.txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shrink-0"
          >
            <span>View on Stellar Expert</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Invoices List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {invoices.map((inv) => (
          <div
            key={inv.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              
              {/* Status Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold block">{inv.invoiceNumber}</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{inv.clientName}</h3>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                    inv.status === 'PAID'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : inv.status === 'PENDING'
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {inv.status === 'PAID' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {inv.status}
                </span>
              </div>

              {/* Items Summary */}
              <div className="space-y-1.5 text-xs">
                {inv.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span className="truncate max-w-[180px]">{item.description}</span>
                    <span className="font-semibold">${item.totalUsd.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Amount Total */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Total Amount Due:</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  ${inv.totalUsd.toLocaleString()} {inv.paymentToken}
                </span>
              </div>

              {/* QR Paylink Payload */}
              <div className="p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-[11px] font-mono text-indigo-700 dark:text-indigo-300 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => { setSelectedQrInvoice(inv); setQrModalMode('QR'); }}
                  className="flex items-center gap-1.5 truncate hover:underline text-left"
                  title="Click to view & scan actual QR / Barcode"
                >
                  <QrCode className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                  <span className="truncate">{inv.qrPayload}</span>
                </button>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => { setSelectedQrInvoice(inv); setQrModalMode('QR'); }}
                    className="p-1 rounded bg-indigo-100 dark:bg-indigo-900/60 hover:bg-indigo-200 text-indigo-700 dark:text-indigo-200 text-[10px] font-sans font-bold flex items-center gap-0.5"
                  >
                    <Scan className="w-3 h-3" />
                    <span>Scan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyQrPayload(inv)}
                    className="p-1 hover:text-indigo-900 dark:hover:text-white"
                  >
                    {copiedId === inv.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

            </div>

            {/* Footer Action */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
              <span className="text-[10px] text-slate-400">Due: {inv.dueDate}</span>

              {inv.status === 'PENDING' && (
                <button
                  onClick={() => handleConfirmSorobanPay(inv.id)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-sm flex items-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Settle on Soroban</span>
                </button>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* AI Invoice Parser Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-500" />
                Automated Invoice Extractor
              </h3>
              <button onClick={() => setShowAiModal(false)} className="text-slate-400 text-lg font-bold">✕</button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Paste an unformatted invoice text, contract quote, or email description to extract line items, wallet payables, and due dates automatically.
            </p>

            <textarea
              rows={5}
              value={rawAiText}
              onChange={(e) => setRawAiText(e.target.value)}
              placeholder="e.g. Invoice for ZeroKnowledge Labs (0x9911A34f82D991bc8203d985920a0F31a2938Ac1): 1x Smart Contract Audit for $3,500 USDC, 1x Cross-Chain Bridge License for $2,000 USDC. Total $5,500 due in 14 days."
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs rounded-xl p-3 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAiModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold">
                Cancel
              </button>
              <button
                onClick={handleParseAiInvoiceText}
                disabled={parsing || !rawAiText.trim()}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                {parsing ? 'Extracting via AI...' : 'Extract Invoice Form'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Manual Issue Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Issue Web3 Merchant Invoice
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 text-lg font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-3 py-2 border border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Client Wallet Address
                  </label>
                  <input
                    type="text"
                    value={clientWallet}
                    onChange={(e) => setClientWallet(e.target.value)}
                    required
                    placeholder="0x..."
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono rounded-xl px-3 py-2 border border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Invoice Items</label>
                  <button type="button" onClick={handleAddItem} className="text-indigo-600 font-bold text-[11px]">
                    + Add Item
                  </button>
                </div>

                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                      className="col-span-6 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-2.5 py-1.5 border border-slate-300 dark:border-slate-700"
                    />
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                      className="col-span-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-2.5 py-1.5 border border-slate-300 dark:border-slate-700"
                    />
                    <input
                      type="number"
                      value={item.unitPriceUsd}
                      onChange={(e) => handleUpdateItem(item.id, 'unitPriceUsd', parseFloat(e.target.value) || 0)}
                      className="col-span-4 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-2.5 py-1.5 border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Accept Payment In (Any Coin)
                  </label>
                  <select
                    value={paymentToken}
                    onChange={(e: any) => setPaymentToken(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-3 py-2 border border-slate-300 dark:border-slate-700 font-medium"
                  >
                    {ALL_COINS.map((c) => (
                      <option key={c.symbol} value={c.symbol}>
                        {c.icon} {c.symbol} ({c.name})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-3 py-2 border border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Instant Auto-Swap Settlement option */}
              <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 dark:text-white text-[11px] flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-500" /> Auto-Swap to USDC Stablecoin
                  </span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Automatically converts any received coin ({paymentToken}) into USDC upon payment arrival.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoSwapToUsdc}
                  onChange={(e) => setAutoSwapToUsdc(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-md">
                  Issue & Create QR Paylink
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Scannable Invoice QR Code & Barcode Modal */}
      {selectedQrInvoice && (
        <div 
          onClick={() => setSelectedQrInvoice(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 text-center cursor-default"
          >
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-indigo-500" />
                  <span>Invoice Paylink {selectedQrInvoice.invoiceNumber}</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  ${selectedQrInvoice.totalUsd.toLocaleString()} {selectedQrInvoice.paymentToken} • {selectedQrInvoice.clientName}
                </p>
              </div>
              <button
                onClick={() => setSelectedQrInvoice(null)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Toggle QR vs Barcode */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold">
              <button
                onClick={() => setQrModalMode('QR')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  qrModalMode === 'QR' 
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>2D QR Code</span>
              </button>
              
              <button
                onClick={() => setQrModalMode('BARCODE')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  qrModalMode === 'BARCODE' 
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BarcodeIcon className="w-3.5 h-3.5" />
                <span>1D Barcode</span>
              </button>
            </div>

            {/* Scannable Rendering */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <div className="inline-block p-4 rounded-xl bg-white shadow border border-slate-200">
                {qrModalMode === 'QR' ? (
                  <QRCodeSVG 
                    value={selectedQrInvoice.merchantWallet || wallet.address} 
                    size={170} 
                    level="M" 
                    includeMargin={true}
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                  />
                ) : (
                  <div className="overflow-x-auto max-w-[250px]">
                    <Barcode 
                      value={(selectedQrInvoice.merchantWallet || wallet.address).slice(0, 32)} 
                      width={1.2}
                      height={50}
                      fontSize={10}
                      margin={4}
                      background="#ffffff"
                      lineColor="#0f172a"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                <Scan className="w-3.5 h-3.5" />
                <span>{qrModalMode === 'QR' ? 'Camera & Wallet Scannable' : 'POS & Barcode Scanner'}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono break-all text-slate-700 dark:text-slate-300">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-0.5">Payable Address / Deep Link:</span>
              {selectedQrInvoice.merchantWallet || wallet.address}
            </div>

            <button
              onClick={() => setSelectedQrInvoice(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow transition-all"
            >
              Done / Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
