import { SupportedChain } from '../types';
import { StrKey } from '@stellar/stellar-sdk';

/**
 * Valid multi-chain default addresses mapped to each supported blockchain network.
 * All addresses conform strictly to their respective cryptography & checksum standards:
 * - EVM: EIP-55 mixed-case checksummed hex
 * - Stellar: RFC 4648 Base32 Ed25519 public key (56 chars, starting with G)
 * - Solana: Base58 public key (44 chars)
 * - Bitcoin: Bech32 native SegWit mainnet address (bc1q...)
 * - Tron: Base58Check mainnet address (34 chars, starting with T)
 */
export const CHAIN_ADDRESS_MAP: Record<SupportedChain, string> = {
  'Polygon': '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  'Base': '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  'Ethereum': '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  'Arbitrum': '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  'Optimism': '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  'BNB Chain': '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  'Avalanche': '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  'Solana': '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  'Bitcoin Network': 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
  'Stellar Network': 'GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ',
  'Tron': 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
};

/**
 * Extracts and cleans the public address and optional payment parameters (amount, token)
 * from a raw QR code string or payment URI (e.g. SEP-0007, EIP-681, BIP-21, SolPay).
 */
export function extractAddressAndParamsFromQr(rawInput: string): {
  cleanAddress: string;
  amount?: number;
  token?: string;
  detectedChain?: SupportedChain;
} {
  let text = (rawInput || '').trim();
  if (!text) return { cleanAddress: '' };

  let detectedChain: SupportedChain | undefined;
  let amount: number | undefined;
  let token: string | undefined;

  // Handle SEP-0007: web+stellar:pay?destination=G...&amount=...&asset_code=...
  if (text.startsWith('web+stellar:pay?') || text.startsWith('stellar:pay?') || text.startsWith('stellar:')) {
    detectedChain = 'Stellar Network';
    try {
      const urlPart = text.replace(/^web\+stellar:pay\?|^stellar:pay\?|^stellar:\/\//i, '').replace(/^stellar:/i, '');
      if (urlPart.includes('destination=')) {
        const params = new URLSearchParams(urlPart.includes('?') ? urlPart.split('?')[1] : urlPart);
        const dest = params.get('destination') || '';
        const amt = params.get('amount');
        const asset = params.get('asset_code');
        if (dest) {
          return {
            cleanAddress: dest,
            amount: amt ? parseFloat(amt) : undefined,
            token: asset || undefined,
            detectedChain,
          };
        }
      } else if (urlPart.includes('?')) {
        const [addrPart, queryPart] = urlPart.split('?');
        const params = new URLSearchParams(queryPart);
        const amt = params.get('amount') || params.get('value');
        const asset = params.get('asset_code') || params.get('token');
        return {
          cleanAddress: addrPart,
          amount: amt ? parseFloat(amt) : undefined,
          token: asset || undefined,
          detectedChain,
        };
      } else {
        return { cleanAddress: urlPart, detectedChain };
      }
    } catch {
      // fallback
    }
  }

  // Handle EIP-681: ethereum:0x... or polygon:0x... or arbitrum:0x...
  const evmPrefixMatch = text.match(/^(ethereum|polygon|base|arbitrum|optimism|bsc|avalanche):([0-9a-zA-Z_@]+)(\?(.*))?$/i);
  if (evmPrefixMatch) {
    const prefix = evmPrefixMatch[1].toLowerCase();
    const rawTarget = evmPrefixMatch[2];
    const queryString = evmPrefixMatch[4] || '';

    // Strip chain ID if present (e.g. 0x71C...@137/pay)
    const cleanAddr = rawTarget.split('@')[0].split('/')[0];
    
    if (prefix === 'ethereum') detectedChain = 'Ethereum';
    else if (prefix === 'polygon') detectedChain = 'Polygon';
    else if (prefix === 'base') detectedChain = 'Base';
    else if (prefix === 'arbitrum') detectedChain = 'Arbitrum';
    else if (prefix === 'optimism') detectedChain = 'Optimism';
    else if (prefix === 'bsc') detectedChain = 'BNB Chain';
    else if (prefix === 'avalanche') detectedChain = 'Avalanche';

    if (queryString) {
      const params = new URLSearchParams(queryString);
      const val = params.get('value') || params.get('amount');
      const tok = params.get('token') || params.get('asset');
      if (val) amount = parseFloat(val);
      if (tok) token = tok;
    }

    return { cleanAddress: cleanAddr, amount, token, detectedChain };
  }

  // Handle Solana Pay: solana:7xKX...?amount=1&spl-token=...
  if (text.startsWith('solana:')) {
    detectedChain = 'Solana';
    const rest = text.replace(/^solana:/i, '');
    const [addrPart, queryPart] = rest.split('?');
    if (queryPart) {
      const params = new URLSearchParams(queryPart);
      const amt = params.get('amount');
      if (amt) amount = parseFloat(amt);
    }
    return { cleanAddress: addrPart, amount, detectedChain };
  }

  // Handle Bitcoin BIP-21: bitcoin:bc1q...?amount=...
  if (text.startsWith('bitcoin:')) {
    detectedChain = 'Bitcoin Network';
    const rest = text.replace(/^bitcoin:/i, '');
    const [addrPart, queryPart] = rest.split('?');
    if (queryPart) {
      const params = new URLSearchParams(queryPart);
      const amt = params.get('amount');
      if (amt) amount = parseFloat(amt);
    }
    return { cleanAddress: addrPart, amount, detectedChain };
  }

  // Handle Tron URI: tron:T...
  if (text.startsWith('tron:')) {
    detectedChain = 'Tron';
    const rest = text.replace(/^tron:/i, '');
    const [addrPart] = rest.split('?');
    return { cleanAddress: addrPart, detectedChain };
  }

  // Strip generic query params if pasted with ?
  if (text.includes('?') && !text.startsWith('http')) {
    const [addrPart, queryPart] = text.split('?');
    const params = new URLSearchParams(queryPart);
    const amt = params.get('amount') || params.get('value');
    const tok = params.get('token') || params.get('asset') || params.get('asset_code');
    if (amt) amount = parseFloat(amt);
    if (tok) token = tok;
    return { cleanAddress: addrPart.trim(), amount, token };
  }

  return { cleanAddress: text };
}

/**
 * Returns a valid formatted public address for a given blockchain network.
 * Prioritizes the user's active wallet address if valid for that chain, otherwise provides standard fallback.
 */
export function getChainAddress(chain: SupportedChain, fallbackAddress?: string): string {
  if (fallbackAddress && fallbackAddress.trim()) {
    const valid = validateAddressForChain(chain, fallbackAddress);
    if (valid.isValid) {
      return fallbackAddress.trim();
    }
  }
  return CHAIN_ADDRESS_MAP[chain] || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
}

/**
 * Generates an official payment QR Code URI for a given network, address, token, and optional amount.
 */
export function generatePaymentUri(chain: SupportedChain, address: string, token?: string, amount?: number): string {
  const clean = extractAddressAndParamsFromQr(address).cleanAddress;
  const isEvm = ['Polygon', 'Base', 'Ethereum', 'Arbitrum', 'Optimism', 'BNB Chain', 'Avalanche'].includes(chain);

  if (isEvm) {
    let uri = `ethereum:${clean}`;
    const params = new URLSearchParams();
    if (amount && amount > 0) params.append('value', amount.toString());
    if (token) params.append('token', token);
    const qs = params.toString();
    return qs ? `${uri}?${qs}` : uri;
  }

  if (chain === 'Stellar Network') {
    let uri = `stellar:${clean}`;
    const params = new URLSearchParams();
    if (amount && amount > 0) params.append('amount', amount.toString());
    if (token) params.append('asset_code', token);
    const qs = params.toString();
    return qs ? `${uri}?${qs}` : uri;
  }

  if (chain === 'Solana') {
    let uri = `solana:${clean}`;
    if (amount && amount > 0) uri += `?amount=${amount}`;
    return uri;
  }

  if (chain === 'Bitcoin Network') {
    let uri = `bitcoin:${clean}`;
    if (amount && amount > 0) uri += `?amount=${amount}`;
    return uri;
  }

  if (chain === 'Tron') {
    return `tron:${clean}`;
  }

  return clean;
}

/**
 * Validates if an input address string matches the expected format for the target network.
 * Supports standard raw addresses, 0x hex, Base58, Bech32, URIs, and Web3 ENS/Domain aliases (.eth, .sol, .crypto, .cb.id).
 */
export function validateAddressForChain(chain: SupportedChain, address: string): { isValid: boolean; reason?: string; isDomain?: boolean; cleanedAddress?: string } {
  if (!address) {
    return { isValid: false, reason: 'Address cannot be empty.' };
  }

  // Extract address if wrapped in payment URI (e.g. ethereum:0x..., stellar:G...)
  const { cleanAddress } = extractAddressAndParamsFromQr(address);
  const trimmed = cleanAddress.trim();

  if (!trimmed) {
    return { isValid: false, reason: 'Address cannot be empty.' };
  }

  // Check for ENS or Web3 Domain Aliases (e.g. vitalik.eth, treasury.sol, company.crypto, alice.cb.id)
  const domainPattern = /^[a-zA-Z0-9-]+\.(eth|sol|crypto|cb\.id|lens|domain|unstoppable|dao|btc|near|polygon)$/i;
  if (domainPattern.test(trimmed) || (trimmed.includes('.') && !trimmed.startsWith('0x') && trimmed.split('.').length === 2)) {
    return { isValid: true, isDomain: true, cleanedAddress: trimmed };
  }

  // Handle EVM Chains (Ethereum, Polygon, Base, Arbitrum, Optimism, BNB, Avalanche)
  const isEvm = ['Polygon', 'Base', 'Ethereum', 'Arbitrum', 'Optimism', 'BNB Chain', 'Avalanche'].includes(chain);
  if (isEvm) {
    if (!trimmed.startsWith('0x')) {
      return { 
        isValid: false, 
        reason: `${chain} address must start with '0x' (or be a valid ENS domain like .eth).` 
      };
    }
    if (trimmed.length !== 42) {
      return { 
        isValid: false, 
        reason: `${chain} EVM address must be 42 characters long (currently ${trimmed.length}).` 
      };
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      return { 
        isValid: false, 
        reason: 'Invalid hexadecimal characters in EVM address.' 
      };
    }
    return { isValid: true, cleanedAddress: trimmed };
  }

  // Solana
  if (chain === 'Solana') {
    if (trimmed.startsWith('0x')) {
      return { 
        isValid: false, 
        reason: 'Solana addresses do not start with 0x. Enter a Base58 address (e.g. 7xKX...) or .sol domain.' 
      };
    }
    if (trimmed.length < 32 || trimmed.length > 44) {
      return { 
        isValid: false, 
        reason: `Solana address must be 32 to 44 characters long (currently ${trimmed.length}).` 
      };
    }
    if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(trimmed)) {
      return { isValid: false, reason: 'Invalid Base58 characters in Solana address.' };
    }
    return { isValid: true, cleanedAddress: trimmed };
  }

  // Bitcoin
  if (chain === 'Bitcoin Network') {
    const isBtcFormat = trimmed.startsWith('1') || trimmed.startsWith('3') || trimmed.toLowerCase().startsWith('bc1q') || trimmed.toLowerCase().startsWith('bc1p');
    if (!isBtcFormat) {
      return { 
        isValid: false, 
        reason: 'Bitcoin address must start with 1, 3, or bc1q/bc1p.' 
      };
    }
    if (trimmed.length < 26 || trimmed.length > 65) {
      return { 
        isValid: false, 
        reason: `Bitcoin address length invalid (currently ${trimmed.length} chars).` 
      };
    }
    if (trimmed.toLowerCase().startsWith('bc1')) {
      if (!/^[a-zA-Z0-9]+$/.test(trimmed)) {
        return { isValid: false, reason: 'Invalid Bech32 characters in Bitcoin address.' };
      }
    } else {
      if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(trimmed)) {
        return { isValid: false, reason: 'Invalid Base58 characters in Bitcoin address.' };
      }
    }
    return { isValid: true, cleanedAddress: trimmed };
  }

  // Stellar Network
  if (chain === 'Stellar Network') {
    if (!trimmed.startsWith('G')) {
      return { 
        isValid: false, 
        reason: 'Stellar public key must start with uppercase letter G.' 
      };
    }
    if (trimmed.length !== 56) {
      return { 
        isValid: false, 
        reason: `Stellar public key must be exactly 56 characters (currently ${trimmed.length}).` 
      };
    }
    // Validate Base32 character set (A-Z, 2-7)
    if (!/^G[A-Z2-7]{55}$/.test(trimmed)) {
      return { 
        isValid: false, 
        reason: 'Invalid characters in Stellar public key (Stellar uses Base32: A-Z, 2-7).' 
      };
    }
    // Cryptographic Ed25519 checksum verification using Stellar SDK
    try {
      if (!StrKey.isValidEd25519PublicKey(trimmed)) {
        return {
          isValid: false,
          reason: 'Stellar public key failed CRC16 checksum verification.',
        };
      }
    } catch {
      // If SDK check throws, the regex check above passed
    }
    return { isValid: true, cleanedAddress: trimmed };
  }

  // TRON
  if (chain === 'Tron') {
    if (!trimmed.startsWith('T')) {
      return { 
        isValid: false, 
        reason: 'TRON address must start with uppercase letter T.' 
      };
    }
    if (trimmed.length !== 34) {
      return { 
        isValid: false, 
        reason: `TRON address must be exactly 34 characters long (currently ${trimmed.length}).` 
      };
    }
    if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(trimmed)) {
      return { isValid: false, reason: 'Invalid Base58 characters in TRON address.' };
    }
    return { isValid: true, cleanedAddress: trimmed };
  }

  return { isValid: true, cleanedAddress: trimmed };
}


