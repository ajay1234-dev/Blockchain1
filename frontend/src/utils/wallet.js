import { ethers } from "ethers";

// Function to connect to MetaMask
export const connectWallet = async () => {
  if (typeof window !== "undefined" && window.ethereum) {
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      return {
        address,
        provider,
        signer,
        isConnected: true,
      };
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw new Error("Wallet connection failed");
    }
  } else {
    throw new Error("MetaMask is not installed");
  }
};

// Function to sign a message to verify wallet ownership
export const signMessage = async (signer, message) => {
  try {
    const signature = await signer.signMessage(message);
    return signature;
  } catch (error) {
    console.error("Error signing message:", error);
    throw new Error("Message signing failed");
  }
};

// Function to link wallet to user account
export const linkWalletToAccount = async (walletAddress, signature) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch("/api/wallet/link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        walletAddress,
        signature,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to link wallet");
    }

    // Update the token in localStorage
    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    return data;
  } catch (error) {
    console.error("Error linking wallet:", error);
    throw error;
  }
};

// Function to get user's wallet info
export const getUserWalletInfo = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch("/api/wallet/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to get wallet info");
    }

    return data;
  } catch (error) {
    console.error("Error getting wallet info:", error);
    throw error;
  }
};
