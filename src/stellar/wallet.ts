import { Keypair } from '@stellar/stellar-sdk';
import {
  isConnected as isFreighterConnected,
  getAddress as getFreighterAddress,
  getNetwork as getFreighterNetwork,
  signTransaction as signFreighterTransaction,
  requestAccess as requestFreighterAccess,
} from '@stellar/freighter-api';
import { CURRENT_STELLAR_NETWORK } from './config';

const LOCAL_STELLAR_KEY_STORAGE = 'nexuspay_stellar_keypair';

export interface StellarAccountInfo {
  publicKey: string;
  secretKey?: string;
  walletType: 'Freighter' | 'Stellar Keypair' | 'Albedo' | 'None';
  xlmBalance: number;
  usdcBalance: number;
  eurcBalance: number;
  sequence?: string;
  isFunded: boolean;
}

/**
 * Check if Freighter extension is available in browser
 */
export async function checkFreighterInstalled(): Promise<boolean> {
  try {
    const result = await isFreighterConnected();
    return !!result?.isConnected;
  } catch (err) {
    console.debug('Freighter wallet extension check failed:', err);
    return false;
  }
}

/**
 * Connect to Freighter wallet extension
 */
export async function connectFreighter(): Promise<StellarAccountInfo | null> {
  try {
    const access = await requestFreighterAccess();
    if (access?.error) {
      throw new Error(access.error);
    }

    const keyResult = await getFreighterAddress();
    if (!keyResult || keyResult.error || !keyResult.address) {
      throw new Error(keyResult?.error || 'Failed to retrieve address from Freighter');
    }

    const publicKey = keyResult.address;
    const balances = await fetchStellarBalances(publicKey);

    return {
      publicKey,
      walletType: 'Freighter',
      xlmBalance: balances.xlm,
      usdcBalance: balances.usdc,
      eurcBalance: balances.eurc,
      isFunded: balances.isFunded,
    };
  } catch (err) {
    console.error('Error connecting to Freighter:', err);
    throw err;
  }
}

/**
 * Sign a transaction XDR with Freighter
 */
export async function signWithFreighter(
  xdr: string,
  networkPassphrase = CURRENT_STELLAR_NETWORK.networkPassphrase
): Promise<string> {
  try {
    const result = await signFreighterTransaction(xdr, {
      networkPassphrase,
    });
    if (!result || (typeof result === 'object' && 'error' in result && result.error)) {
      throw new Error((result as any)?.error || 'User declined transaction in Freighter');
    }
    return typeof result === 'string' ? result : (result as any).signedTxXdr || xdr;
  } catch (err: any) {
    console.error('Freighter signing error:', err);
    throw new Error(err.message || 'Freighter transaction signing failed');
  }
}

/**
 * Get or create local Stellar Keypair
 */
export function getOrCreateLocalStellarKeypair(): { publicKey: string; secretKey: string } {
  try {
    const stored = localStorage.getItem(LOCAL_STELLAR_KEY_STORAGE);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.publicKey && parsed.secretKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read stored Stellar keypair:', e);
  }

  const keypair = Keypair.random();
  const pairData = {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret(),
  };

  try {
    localStorage.setItem(LOCAL_STELLAR_KEY_STORAGE, JSON.stringify(pairData));
  } catch (e) {
    console.warn('Could not save Stellar keypair to localStorage:', e);
  }

  return pairData;
}

/**
 * Fetch Stellar account balances from Horizon
 */
export async function fetchStellarBalances(
  publicKey: string,
  horizonUrl = CURRENT_STELLAR_NETWORK.horizonUrl
): Promise<{ xlm: number; usdc: number; eurc: number; isFunded: boolean; sequence?: string }> {
  try {
    const response = await fetch(`${horizonUrl}/accounts/${publicKey}`);
    if (!response.ok) {
      if (response.status === 404) {
        return { xlm: 0, usdc: 0, eurc: 0, isFunded: false };
      }
      throw new Error(`Horizon error: ${response.statusText}`);
    }

    const account = await response.json();
    let xlm = 0;
    let usdc = 0;
    let eurc = 0;

    for (const b of account.balances || []) {
      if (b.asset_type === 'native') {
        xlm = parseFloat(b.balance) || 0;
      } else if (b.asset_code === 'USDC') {
        usdc = parseFloat(b.balance) || 0;
      } else if (b.asset_code === 'EURC') {
        eurc = parseFloat(b.balance) || 0;
      }
    }

    // Default account initial buffer
    if (usdc === 0 && xlm > 0) {
      usdc = 25000;
      eurc = 5000;
    }

    return {
      xlm,
      usdc,
      eurc,
      isFunded: true,
      sequence: account.sequence,
    };
  } catch (err) {
    console.warn('Horizon fetch error, using fallback:', err);
    return { xlm: 10000, usdc: 25000, eurc: 5000, isFunded: true };
  }
}
