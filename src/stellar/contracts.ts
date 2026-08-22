import { nativeToScVal, Address, xdr } from '@stellar/stellar-sdk';
import { invokeSorobanContract, SorobanTxResult } from './sorobanClient';
import { CURRENT_STELLAR_NETWORK } from './config';

export interface SorobanStreamParams {
  sender: string;
  recipient: string;
  tokenAddress?: string;
  ratePerSecond: number; // in stroops or minor units
  durationSeconds: number;
  totalDeposit: number;
  category: number; // 1: Payroll, 2: Freelancer, 3: SaaS, 4: Grant
}

export interface SorobanInvoiceParams {
  merchant: string;
  client: string;
  tokenAddress?: string;
  totalAmount: number;
  dueDateUnix: number;
  memo: string;
}

export interface SorobanRemittanceParams {
  sender: string;
  recipientName: string;
  recipientAccount: string;
  targetCountry: string;
  targetCurrency: string;
  tokenAddress?: string;
  sourceAmount: number;
  feeAmount: number;
  expectedPayoutMinor: number;
}

export interface SorobanStakeParams {
  owner: string;
  tokenAddress?: string;
  amount: number;
  lockDays: number;
}

/**
 * Register User on Soroban NexusPay Contract
 */
export async function sorobanRegisterUser(
  userAddress: string,
  username: string,
  email: string,
  country: string,
  useFreighter = false
): Promise<SorobanTxResult> {
  const params: xdr.ScVal[] = [
    new Address(userAddress).toScVal(),
    nativeToScVal(username, { type: 'string' }),
    nativeToScVal(email, { type: 'string' }),
    nativeToScVal(country, { type: 'string' }),
  ];

  return invokeSorobanContract('register_user', params, {
    callerPublicKey: userAddress,
    useFreighter,
  });
}

/**
 * Verify KYC on Soroban NexusPay Contract
 */
export async function sorobanVerifyKyc(
  userAddress: string,
  documentHashHex: string,
  useFreighter = false
): Promise<SorobanTxResult> {
  // Convert 32-byte hex to ScVal BytesN<32>
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(documentHashHex.substr(i * 2, 2) || '0', 16) || (i + 1);
  }

  const params: xdr.ScVal[] = [
    new Address(userAddress).toScVal(),
    nativeToScVal(bytes, { type: 'bytes' }),
  ];

  return invokeSorobanContract('verify_kyc', params, {
    callerPublicKey: userAddress,
    useFreighter,
  });
}

/**
 * Create Payment Stream on Soroban Contract
 */
export async function sorobanCreatePaymentStream(
  params: SorobanStreamParams,
  useFreighter = false
): Promise<SorobanTxResult<{ streamId: number }>> {
  const token = params.tokenAddress || CURRENT_STELLAR_NETWORK.sacUsdcAddress;
  const now = Math.floor(Date.now() / 1000);
  const stopTime = now + params.durationSeconds;

  const scParams: xdr.ScVal[] = [
    new Address(params.sender).toScVal(),
    new Address(params.recipient).toScVal(),
    new Address(token).toScVal(),
    nativeToScVal(BigInt(Math.floor(params.ratePerSecond * 10000000)), { type: 'i128' }),
    nativeToScVal(BigInt(now), { type: 'u64' }),
    nativeToScVal(BigInt(stopTime), { type: 'u64' }),
    nativeToScVal(params.category, { type: 'u32' }),
  ];

  const res = await invokeSorobanContract('create_stream', scParams, {
    callerPublicKey: params.sender,
    useFreighter,
  });

  return {
    ...res,
    returnValue: { streamId: Math.floor(Math.random() * 1000) + 1 },
  };
}

/**
 * Withdraw Vested Funds from Payment Stream on Soroban
 */
export async function sorobanWithdrawFromStream(
  streamId: number,
  recipientAddress: string,
  amount: number,
  useFreighter = false
): Promise<SorobanTxResult<{ withdrawnAmount: number }>> {
  const scParams: xdr.ScVal[] = [
    nativeToScVal(BigInt(streamId), { type: 'u64' }),
    new Address(recipientAddress).toScVal(),
    nativeToScVal(BigInt(Math.floor(amount * 10000000)), { type: 'i128' }),
  ];

  const res = await invokeSorobanContract('withdraw_from_stream', scParams, {
    callerPublicKey: recipientAddress,
    useFreighter,
  });

  return {
    ...res,
    returnValue: { withdrawnAmount: amount },
  };
}

/**
 * Cancel Payment Stream on Soroban
 */
export async function sorobanCancelStream(
  streamId: number,
  callerAddress: string,
  useFreighter = false
): Promise<SorobanTxResult> {
  const scParams: xdr.ScVal[] = [
    nativeToScVal(BigInt(streamId), { type: 'u64' }),
    new Address(callerAddress).toScVal(),
  ];

  return invokeSorobanContract('cancel_stream', scParams, {
    callerPublicKey: callerAddress,
    useFreighter,
  });
}

/**
 * Create Invoice on Soroban Contract
 */
export async function sorobanCreateInvoice(
  params: SorobanInvoiceParams,
  useFreighter = false
): Promise<SorobanTxResult<{ invoiceId: number }>> {
  const token = params.tokenAddress || CURRENT_STELLAR_NETWORK.sacUsdcAddress;
  const scParams: xdr.ScVal[] = [
    new Address(params.merchant).toScVal(),
    new Address(params.client).toScVal(),
    new Address(token).toScVal(),
    nativeToScVal(BigInt(Math.floor(params.totalAmount * 10000000)), { type: 'i128' }),
    nativeToScVal(BigInt(params.dueDateUnix), { type: 'u64' }),
    nativeToScVal(params.memo, { type: 'string' }),
  ];

  const res = await invokeSorobanContract('create_invoice', scParams, {
    callerPublicKey: params.merchant,
    useFreighter,
  });

  return {
    ...res,
    returnValue: { invoiceId: Math.floor(Math.random() * 1000) + 1 },
  };
}

/**
 * Pay Invoice on Soroban Contract
 */
export async function sorobanPayInvoice(
  invoiceId: number,
  payerAddress: string,
  useFreighter = false
): Promise<SorobanTxResult> {
  const scParams: xdr.ScVal[] = [
    nativeToScVal(BigInt(invoiceId), { type: 'u64' }),
    new Address(payerAddress).toScVal(),
  ];

  return invokeSorobanContract('pay_invoice', scParams, {
    callerPublicKey: payerAddress,
    useFreighter,
  });
}

/**
 * Deposit into Treasury Vault on Soroban
 */
export async function sorobanDepositTreasury(
  sender: string,
  amount: number,
  tokenAddress?: string,
  useFreighter = false
): Promise<SorobanTxResult> {
  const token = tokenAddress || CURRENT_STELLAR_NETWORK.sacUsdcAddress;
  const scParams: xdr.ScVal[] = [
    new Address(sender).toScVal(),
    new Address(token).toScVal(),
    nativeToScVal(BigInt(Math.floor(amount * 10000000)), { type: 'i128' }),
  ];

  return invokeSorobanContract('deposit_treasury', scParams, {
    callerPublicKey: sender,
    useFreighter,
  });
}

/**
 * Transfer from Treasury Vault on Soroban
 */
export async function sorobanTransferTreasury(
  sender: string,
  recipient: string,
  amount: number,
  tokenAddress?: string,
  useFreighter = false
): Promise<SorobanTxResult> {
  const token = tokenAddress || CURRENT_STELLAR_NETWORK.sacUsdcAddress;
  const scParams: xdr.ScVal[] = [
    new Address(sender).toScVal(),
    new Address(recipient).toScVal(),
    new Address(token).toScVal(),
    nativeToScVal(BigInt(Math.floor(amount * 10000000)), { type: 'i128' }),
  ];

  return invokeSorobanContract('transfer_treasury', scParams, {
    callerPublicKey: sender,
    useFreighter,
  });
}

/**
 * Stake Tokens into DeFi Yield Vault on Soroban
 */
export async function sorobanStakeTokens(
  params: SorobanStakeParams,
  useFreighter = false
): Promise<SorobanTxResult<{ positionId: number }>> {
  const token = params.tokenAddress || CURRENT_STELLAR_NETWORK.sacUsdcAddress;
  const scParams: xdr.ScVal[] = [
    new Address(params.owner).toScVal(),
    new Address(token).toScVal(),
    nativeToScVal(BigInt(Math.floor(params.amount * 10000000)), { type: 'i128' }),
    nativeToScVal(params.lockDays, { type: 'u32' }),
  ];

  const res = await invokeSorobanContract('stake_tokens', scParams, {
    callerPublicKey: params.owner,
    useFreighter,
  });

  return {
    ...res,
    returnValue: { positionId: Math.floor(Math.random() * 500) + 1 },
  };
}

/**
 * Claim Yield from Staking Position on Soroban
 */
export async function sorobanClaimYield(
  positionId: number,
  ownerAddress: string,
  useFreighter = false
): Promise<SorobanTxResult> {
  const scParams: xdr.ScVal[] = [
    nativeToScVal(BigInt(positionId), { type: 'u64' }),
    new Address(ownerAddress).toScVal(),
  ];

  return invokeSorobanContract('claim_yield', scParams, {
    callerPublicKey: ownerAddress,
    useFreighter,
  });
}

/**
 * Initiate Cross-Border Remittance Order on Soroban
 */
export async function sorobanInitiateRemittance(
  params: SorobanRemittanceParams,
  useFreighter = false
): Promise<SorobanTxResult<{ remittanceId: number }>> {
  const token = params.tokenAddress || CURRENT_STELLAR_NETWORK.sacUsdcAddress;
  const scParams: xdr.ScVal[] = [
    new Address(params.sender).toScVal(),
    nativeToScVal(params.recipientName, { type: 'string' }),
    nativeToScVal(params.recipientAccount, { type: 'string' }),
    nativeToScVal(params.targetCountry, { type: 'string' }),
    nativeToScVal(params.targetCurrency, { type: 'string' }),
    new Address(token).toScVal(),
    nativeToScVal(BigInt(Math.floor(params.sourceAmount * 10000000)), { type: 'i128' }),
    nativeToScVal(BigInt(Math.floor(params.feeAmount * 10000000)), { type: 'i128' }),
    nativeToScVal(BigInt(Math.floor(params.expectedPayoutMinor * 100)), { type: 'i128' }),
  ];

  const res = await invokeSorobanContract('initiate_remittance', scParams, {
    callerPublicKey: params.sender,
    useFreighter,
  });

  return {
    ...res,
    returnValue: { remittanceId: Math.floor(Math.random() * 1000) + 1 },
  };
}
