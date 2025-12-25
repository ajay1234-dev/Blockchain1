import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  EmergencyReliefStablecoin__factory,
  EmergencyReliefManager__factory,
} from "../contracts";

const BlockchainContext = createContext();

export function useBlockchain() {
  return useContext(BlockchainContext);
}

export function BlockchainProvider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [stablecoinContract, setStablecoinContract] = useState(null);
  const [managerContract, setManagerContract] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize contracts
  useEffect(() => {
    const initBlockchain = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          // Request account access
          await window.ethereum.request({ method: "eth_requestAccounts" });

          // Create provider
          const web3Provider = new ethers.providers.Web3Provider(
            window.ethereum
          );
          setProvider(web3Provider);

          // Get signer
          const web3Signer = web3Provider.getSigner();
          setSigner(web3Signer);

          // Get user address
          const address = await web3Signer.getAddress();
          setUserAddress(address);

          // Get chain ID
          const network = await web3Provider.getNetwork();
          setChainId(network.chainId);

          // Initialize contracts
          const stablecoinAddress = process.env.REACT_APP_STABLECOIN_ADDRESS; // Should be deployed address
          const managerAddress = process.env.REACT_APP_MANAGER_ADDRESS; // Should be deployed address

          if (stablecoinAddress) {
            const stablecoin = EmergencyReliefStablecoin__factory.connect(
              stablecoinAddress,
              web3Signer
            );
            setStablecoinContract(stablecoin);
          }

          if (managerAddress) {
            const manager = EmergencyReliefManager__factory.connect(
              managerAddress,
              web3Signer
            );
            setManagerContract(manager);
          }

          setIsConnected(true);
        } catch (error) {
          console.error("Error initializing blockchain:", error);
        }
      } else {
        console.log("Please install MetaMask!");
      }
    };

    initBlockchain();
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });

        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);

        const web3Signer = web3Provider.getSigner();
        setSigner(web3Signer);

        const address = await web3Signer.getAddress();
        setUserAddress(address);

        const network = await web3Provider.getNetwork();
        setChainId(network.chainId);

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

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setStablecoinContract(null);
    setManagerContract(null);
    setUserAddress(null);
    setChainId(null);
    setIsConnected(false);
  };

  const value = {
    provider,
    signer,
    stablecoinContract,
    managerContract,
    userAddress,
    chainId,
    isConnected,
    connectWallet,
    disconnectWallet,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
}
