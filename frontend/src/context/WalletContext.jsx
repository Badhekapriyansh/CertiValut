import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { NETWORK_CONFIG } from '../config/contracts';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const checkNetwork = useCallback((currentChainId) => {
    const isMatch = Number(currentChainId) === NETWORK_CONFIG.chainId;
    setIsCorrectNetwork(isMatch);
    return isMatch;
  }, []);

  const switchNetwork = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORK_CONFIG.chainIdHex }],
      });
    } catch (switchError) {
      // 4902 error indicates chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: NETWORK_CONFIG.chainIdHex,
                chainName: NETWORK_CONFIG.chainName,
                rpcUrls: [NETWORK_CONFIG.rpcUrl],
                nativeCurrency: NETWORK_CONFIG.nativeCurrency,
                blockExplorerUrls: [NETWORK_CONFIG.blockExplorerUrl],
              },
            ],
          });
        } catch (addError) {
          setError('Failed to add Arbitrum Sepolia to your wallet.');
        }
      } else {
        setError('Failed to switch to Arbitrum Sepolia.');
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('No EVM wallet detected. Please install MetaMask or Rabby.');
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      const userSigner = await browserProvider.getSigner();
      const network = await browserProvider.getNetwork();

      setProvider(browserProvider);
      setSigner(userSigner);
      setAccount(accounts[0]);
      setChainId(network.chainId);
      checkNetwork(network.chainId);
    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setProvider(null);
    setChainId(null);
    setIsCorrectNetwork(false);
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const browserProvider = new ethers.BrowserProvider(window.ethereum);
          browserProvider.getSigner().then(setSigner);
        } else {
          disconnectWallet();
        }
      });

      window.ethereum.on('chainChanged', (chainHex) => {
        const decChainId = parseInt(chainHex, 16);
        setChainId(BigInt(decChainId));
        checkNetwork(decChainId);
      });
    }
  }, [checkNetwork]);

  return (
    <WalletContext.Provider
      value={{
        account,
        signer,
        provider,
        chainId,
        isCorrectNetwork,
        isConnecting,
        error,
        connectWallet,
        disconnectWallet,
        switchNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
