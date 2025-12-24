// src/contexts/WalletContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";

const WalletContext = createContext();

export function useWallet() {
  return useContext(WalletContext);
}

export function WalletProvider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState(null);

  // Initialize wallet connection
  useEffect(() => {
    const initWallet = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          // Create provider
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(web3Provider);

          // Request account access
          await window.ethereum.request({ method: "eth_requestAccounts" });

          // Get signer
          const web3Signer = await web3Provider.getSigner();
          setSigner(web3Signer);

          // Get user address
          const address = await web3Signer.getAddress();
          setUserAddress(address);

          // Get chain ID
          const network = await web3Provider.getNetwork();
          setChainId(network.chainId);

          // Get balance
          const balanceBN = await web3Provider.getBalance(address);
          setBalance(ethers.formatEther(balanceBN));

          setIsConnected(true);
        } catch (error) {
          console.error("Error initializing wallet:", error);
        }
      } else {
        console.log("Please install MetaMask!");
      }
    };

    initWallet();
  }, []);

  // Refresh balance
  const refreshBalance = async () => {
    if (provider && userAddress) {
      try {
        const balanceBN = await provider.getBalance(userAddress);
        setBalance(ethers.formatEther(balanceBN));
      } catch (error) {
        console.error("Error refreshing balance:", error);
      }
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });

        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(web3Provider);

        const web3Signer = await web3Provider.getSigner();
        setSigner(web3Signer);

        const address = await web3Signer.getAddress();
        setUserAddress(address);

        const network = await web3Provider.getNetwork();
        setChainId(network.chainId);

        const balanceBN = await web3Provider.getBalance(address);
        setBalance(ethers.formatEther(balanceBN));

        setIsConnected(true);

        return true;
      } catch (error) {
        console.error("Error connecting wallet:", error);
        return false;
      }
    } else {
      alert("Please install MetaMask!");
      return false;
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setUserAddress(null);
    setChainId(null);
    setBalance(null);
    setIsConnected(false);
  };

  const value = {
    provider,
    signer,
    userAddress,
    chainId,
    isConnected,
    balance,
    connectWallet,
    disconnectWallet,
    refreshBalance,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
