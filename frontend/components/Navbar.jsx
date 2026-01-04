import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BellIcon,
  UserCircleIcon,
  ChevronDownIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";

const Navbar = ({ user, setIsAuthenticated }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletBalance, setWalletBalance] = useState("0");

  useEffect(() => {
    // Check if wallet is connected (from localStorage or other state)
    const connected = localStorage.getItem("walletConnected") === "true";
    const address = localStorage.getItem("walletAddress");

    setWalletConnected(connected);
    setWalletAddress(address || "");

    if (address) {
      fetchWalletBalance(address);
    }
  }, []);

  const fetchWalletBalance = async (address) => {
    try {
      const response = await fetch(`/api/blockchain/balance/${address}`);
      const data = await response.json();
      if (response.ok) {
        setWalletBalance(data.balance);
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        // Request account access
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const address = accounts[0];

        setWalletConnected(true);
        setWalletAddress(address);
        localStorage.setItem("walletConnected", "true");
        localStorage.setItem("walletAddress", address);

        // Update user profile with wallet address
        if (user) {
          await updateUserWallet(address);
        }

        fetchWalletBalance(address);
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert("Please install MetaMask to connect your wallet");
    }
  };

  const updateUserWallet = async (address) => {
    try {
      const response = await fetch("/api/user/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ walletAddress: address }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        // Update user in localStorage
        localStorage.setItem("user", JSON.stringify(updatedUser.user));
      }
    } catch (error) {
      console.error("Error updating user wallet:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("walletConnected");
    localStorage.removeItem("walletAddress");
    setIsAuthenticated(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2.5 rounded-xl shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Emergency Relief
              </span>
              <p className="text-xs text-gray-500 hidden md:block -mt-1">
                Blockchain Platform
              </p>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {/* Wallet Connection */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={connectWallet}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center ${
                  walletConnected
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md hover:shadow-lg"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                }`}
              >
                <WalletIcon className="h-4 w-4" />
                <span>
                  {walletConnected
                    ? `${walletAddress.substring(
                        0,
                        6
                      )}...${walletAddress.substring(walletAddress.length - 4)}`
                    : "Connect Wallet"}
                </span>
              </button>
            </div>

            {walletConnected && (
              <div className="text-sm text-gray-600 hidden md:flex items-center space-x-1.5 bg-gray-100 px-3 py-1.5 rounded-xl">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>{walletBalance} RELIEF</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-lg">
                  Sepolia
                </span>
              </div>
            )}
          </div>

          <button className="p-2 text-gray-500 hover:text-blue-600 relative transition-colors duration-200">
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 border border-white"></span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 focus:outline-none transition-transform duration-200 hover:scale-105"
            >
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-dashed border-blue-300 rounded-xl w-10 h-10 flex items-center justify-center">
                  <UserCircleIcon className="h-6 w-6 text-blue-600" />
                </div>
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                  {user?.role?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name}
                </p>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 capitalize">
                    {user?.role}
                  </span>
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl py-2 z-50 border border-gray-100 overflow-hidden">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    Account
                  </p>
                </div>
                <Link
                  to="/dashboard"
                  className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r from-blue-50 to-indigo-50 transition-colors duration-150"
                >
                  <svg
                    className="h-5 w-5 mr-3 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r from-blue-50 to-indigo-50 transition-colors duration-150"
                >
                  <svg
                    className="h-5 w-5 mr-3 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r from-red-50 to-pink-50 transition-colors duration-150"
                >
                  <svg
                    className="h-5 w-5 mr-3 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
