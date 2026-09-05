import certivaultAbi from '../abi/CertiVault.json';

export const NETWORK_CONFIG = {
  chainId: 421614,
  chainIdHex: '0x66eee',
  chainName: 'Arbitrum Sepolia',
  rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
  nativeCurrency: {
    name: 'Arbitrum Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  blockExplorerUrl: 'https://sepolia.arbiscan.io',
};

// Contract Address strictly from environment variable — NO fake or hardcoded address
export const CERTIVAULT_CONTRACT_ADDRESS = import.meta.env.VITE_CERTIVAULT_CONTRACT_ADDRESS || '';

export const IS_CONTRACT_CONFIGURED = Boolean(
  CERTIVAULT_CONTRACT_ADDRESS && CERTIVAULT_CONTRACT_ADDRESS.trim().startsWith('0x') && CERTIVAULT_CONTRACT_ADDRESS.trim().length === 42
);

export const CERTIVAULT_ABI = certivaultAbi;
