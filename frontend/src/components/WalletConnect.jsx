import React, { useState, useEffect } from "react";
import {
  connectWallet,
  signMessage,
  linkWalletToAccount,
  getUserWalletInfo,
} from "../utils/wallet";
import { toast } from "react-toastify";

const WalletConnect = ({ user, setUser }) => {
  const [walletInfo, setWalletInfo] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    fetchWalletInfo();
  }, []);

  const fetchWalletInfo = async () => {
    try {
      const info = await getUserWalletInfo();
      setWalletInfo(info);
    } catch (error) {
      console.error("Error fetching wallet info:", error);
    }
  };

  const handleConnectWallet = async () => {
    if (!user) {
      toast.error("Please log in first");
      return;
    }

    setIsConnecting(true);
    try {
      const wallet = await connectWallet();

      // Create a message to sign for verification
      const message = `Link wallet to account: ${user.uid}`;

      setIsVerifying(true);
      const signature = await signMessage(wallet.signer, message);

      // Link the wallet to the user account
      const result = await linkWalletToAccount(wallet.address, signature);

      setWalletInfo(result);
      toast.success("Wallet connected and linked successfully!");

      // Update user context with new wallet info
      if (setUser && user) {
        setUser({
          ...user,
          walletAddress: result.walletAddress,
        });
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error(error.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
      setIsVerifying(false);
    }
  };

  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Wallet Connection
        </h3>
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        </div>
      </div>

      {walletInfo?.walletAddress ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Connected Wallet:</span>
            <span className="font-mono text-sm font-medium text-green-600">
              {truncateAddress(walletInfo.walletAddress)}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Your wallet is successfully linked to your account.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-gray-600 text-sm">
            Connect your MetaMask wallet to interact with the blockchain.
          </p>
          <button
            onClick={handleConnectWallet}
            disabled={isConnecting || isVerifying}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting || isVerifying ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {isVerifying ? "Verifying..." : "Connecting..."}
              </span>
            ) : (
              "Connect MetaMask"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
