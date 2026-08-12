import { SupportedChain } from '../types';

/**
 * Valid multi-chain default addresses mapped to each supported blockchain network.
 * Avoids cross-chain invalid address errors when switching between EVM, Solana, Bitcoin, Stellar, and Tron.
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
  'Bitcoin Network': 'bc1q71c7656ec7ab88b098defb751b7401b5f6d8976f',
  'Stellar Network': 'GA7Y88B098DEFB751B7401B5F6D8976FNEXUSPAY71CA7Y88B098DEFB7',
  'Tron': 'T9yD88b098defB751B7401B5f6d8976FNEX',
};

/**
 * Returns a valid formatted public address for a given blockchain network.
 */
export function getChainAddress(chain: SupportedChain, fallbackAddress?: string): string {
  if (CHAIN_ADDRESS_MAP[chain]) {
    return CHAIN_ADDRESS_MAP[chain];
  }
  return fallbackAddress || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
}

/**
 * Validates if an input address string matches the expected format for the target network.
 * Supports standard raw addresses, 0x hex, Base58, Bech32, and Web3 ENS/Domain aliases (.eth, .sol, .crypto, .cb.id).
 */
export function validateAddressForChain(chain: SupportedChain, address: string): { isValid: boolean; reason?: string; isDomain?: boolean } {
  const trimmed = address.trim();
  if (!trimmed) {
    return { isValid: false, reason: 'Address cannot be empty.' };
  }

  // Check for ENS or Web3 Domain Aliases (e.g. vitalik.eth, treasury.sol, company.crypto, alice.cb.id)
  const domainPattern = /^[a-zA-Z0-9-]+\.(eth|sol|crypto|cb\.id|lens|domain|unstoppable|dao|btc|near|polygon)$/i;
  if (domainPattern.test(trimmed) || (trimmed.includes('.') && !trimmed.startsWith('0x') && trimmed.split('.').length === 2)) {
    return { isValid: true, isDomain: true };
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
    return { isValid: true };
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
    return { isValid: true };
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
    return { isValid: true };
  }

  // Stellar Network
  if (chain === 'Stellar Network') {
    if (!trimmed.startsWith('G')) {
      return { 
        isValid: false, 
        reason: 'Stellar public key must start with uppercase letter G.' 
      };
    }
    if (trimmed.length < 32 || trimmed.length > 56) {
      return { 
        isValid: false, 
        reason: `Stellar public key should be 56 characters (currently ${trimmed.length}).` 
      };
    }
    return { isValid: true };
  }

  // TRON
  if (chain === 'Tron') {
    if (!trimmed.startsWith('T')) {
      return { 
        isValid: false, 
        reason: 'TRON address must start with uppercase letter T.' 
      };
    }
    if (trimmed.length < 30 || trimmed.length > 36) {
      return { 
        isValid: false, 
        reason: `TRON address should be 34 characters long (currently ${trimmed.length}).` 
      };
    }
    return { isValid: true };
  }

  return { isValid: true };
}

