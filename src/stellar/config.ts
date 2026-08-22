import { Networks } from '@stellar/stellar-sdk';

export interface StellarNetworkConfig {
  networkId: 'mainnet' | 'public';
  networkName: string;
  networkPassphrase: string;
  rpcUrl: string;
  horizonUrl: string;
  explorerUrl: string;
  contractId: string;
  sacUsdcAddress: string;
  nativeXlmAddress: string;
}

export const STELLAR_NETWORKS: Record<'mainnet' | 'public', StellarNetworkConfig> = {
  mainnet: {
    networkId: 'mainnet',
    networkName: 'Stellar Public Network (Mainnet)',
    networkPassphrase: Networks.PUBLIC,
    rpcUrl: 'https://soroban-rpc.mainnet.stellar.org',
    horizonUrl: 'https://horizon.stellar.org',
    explorerUrl: 'https://stellar.expert/explorer/public',
    contractId: 'CPAYMENTNEXUSTREASURYSTREAMINGMAINETSOROBANV2',
    sacUsdcAddress: 'CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75',
    nativeXlmAddress: 'CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA',
  },
  public: {
    networkId: 'public',
    networkName: 'Stellar Public Network',
    networkPassphrase: Networks.PUBLIC,
    rpcUrl: 'https://soroban-rpc.mainnet.stellar.org',
    horizonUrl: 'https://horizon.stellar.org',
    explorerUrl: 'https://stellar.expert/explorer/public',
    contractId: 'CPAYMENTNEXUSTREASURYSTREAMINGMAINETSOROBANV2',
    sacUsdcAddress: 'CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75',
    nativeXlmAddress: 'CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA',
  },
};

export const CURRENT_STELLAR_NETWORK: StellarNetworkConfig = STELLAR_NETWORKS.mainnet;

export const getStellarExplorerTxUrl = (txHash: string, network: 'mainnet' | 'public' = CURRENT_STELLAR_NETWORK.networkId) => {
  return `${STELLAR_NETWORKS[network].explorerUrl}/tx/${txHash}`;
};

export const getStellarExplorerAccountUrl = (address: string, network: 'mainnet' | 'public' = CURRENT_STELLAR_NETWORK.networkId) => {
  return `${STELLAR_NETWORKS[network].explorerUrl}/account/${address}`;
};

export const getStellarExplorerContractUrl = (contractId: string, network: 'mainnet' | 'public' = CURRENT_STELLAR_NETWORK.networkId) => {
  return `${STELLAR_NETWORKS[network].explorerUrl}/contract/${contractId}`;
};

