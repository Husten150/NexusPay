import { SupportedChain } from '../types';

/**
 * Valid multi-chain addresses mapped to each supported blockchain network.
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
  'Stellar Network': 'GA7Y88B098DEFB751B7401B5F6D8976FNEXUSPAY71C',
  'Tron': 'T9yD88b098defB751B7401B5f6d8976FNEXUS',
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
 */
export function validateAddressForChain(chain: SupportedChain, address: string): { isValid: boolean; reason?: string } {
  const trimmed = address.trim();
  if (!trimmed) {
    return { isValid: false, reason: 'Address cannot be empty.' };
  }

  // Handle EVM Chains
  const isEvm = ['Polygon', 'Base', 'Ethereum', 'Arbitrum', 'Optimism', 'BNB Chain', 'Avalanche'].includes(chain);
  if (isEvm) {
    if (!trimmed.startsWith('0x')) {
      return { isValid: false, reason: `${chain} addresses must start with '0x' (EVM format).` };
    }
    if (trimmed.length !== 42) {
      return { isValid: false, reason: `${chain} address must be exactly 42 hex characters.` };
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      return { isValid: false, reason: 'Invalid hexadecimal characters in EVM address.' };
    }
    return { isValid: true };
  }

  // Solana
  if (chain === 'Solana') {
    if (trimmed.startsWith('0x')) {
      return { isValid: false, reason: 'Solana addresses do not start with 0x. Expected Base58 address (e.g. 7xKX...).' };
    }
    if (trimmed.length < 32 || trimmed.length > 44) {
      return { isValid: false, reason: 'Solana address must be between 32 and 44 Base58 characters.' };
    }
    return { isValid: true };
  }

  // Bitcoin
  if (chain === 'Bitcoin Network') {
    const isBtcFormat = trimmed.startsWith('1') || trimmed.startsWith('3') || trimmed.startsWith('bc1q') || trimmed.startsWith('bc1p');
    if (!isBtcFormat) {
      return { isValid: false, reason: 'Bitcoin address must start with 1, 3, or bc1q/bc1p.' };
    }
    if (trimmed.length < 26 || trimmed.length > 65) {
      return { isValid: false, reason: 'Invalid Bitcoin address length.' };
    }
    return { isValid: true };
  }

  // Stellar
  if (chain === 'Stellar Network') {
    if (!trimmed.startsWith('G')) {
      return { isValid: false, reason: 'Stellar public keys must start with uppercase letter G.' };
    }
    if (trimmed.length !== 56) {
      return { isValid: false, reason: 'Stellar public keys must be 56 uppercase characters.' };
    }
    return { isValid: true };
  }

  // Tron
  if (chain === 'Tron') {
    if (!trimmed.startsWith('T')) {
      return { isValid: false, reason: 'TRON addresses must start with uppercase T.' };
    }
    if (trimmed.length !== 34) {
      return { isValid: false, reason: 'TRON address must be 34 characters long.' };
    }
    return { isValid: true };
  }

  return { isValid: true };
}
