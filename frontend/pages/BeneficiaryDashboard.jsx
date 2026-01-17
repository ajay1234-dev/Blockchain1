import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  QueueListIcon,
  UserGroupIcon,
  PlusCircleIcon,
  WalletIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

const BeneficiaryDashboard = ({ user }) => {
  const [relief, setRelief] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disasterRequests, setDisasterRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(" ");
  const [balance, setBalance] = useState("0.0000");

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    fetchMyDisasterRequests();
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setWalletConnected(true);
          setWalletAddress(accounts[0]);
          fetchBalance(accounts[0]);
        }
      } catch (err) {
        console.error("Error checking wallet connection:", err);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletConnected(true);
        setWalletAddress(accounts[0]);
        fetchBalance(accounts[0]);
      } catch (err) {
        console.error("Error connecting wallet:", err);
      }
    }
  };

  const fetchBalance = async (address) => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const balanceWei = await window.ethereum.request({
          method: "eth_getBalance",
          params: [address, "latest"],
        });
        const balanceEth = (parseInt(balanceWei) / 1e18).toFixed(4);
        setBalance(balanceEth);
      } catch (err) {
        console.error("Error fetching balance:", err);
      }
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch allocated relief
      const reliefResponse = await fetch("/api/relief/beneficiary", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (reliefResponse.ok) {
        const reliefData = await reliefResponse.json();
        setRelief(reliefData);
      }

      // Fetch relief categories
      const categoriesResponse = await fetch("/api/category", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error("Error fetching beneficiary dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyDisasterRequests = async () => {
    try {
      setRequestsLoading(true);
      const response = await fetch("/api/disaster-request/my-requests", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDisasterRequests(data);
      }
    } catch (error) {
      console.error("Error fetching disaster requests:", error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderMyDisasterRequests = () => {
    if (requestsLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (disasterRequests.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <QueueListIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No disaster requests yet
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            You haven't submitted any disaster requests yet. Click the button
            above to submit your first request.
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Severity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estimated Aid
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {disasterRequests.map((request) => (
              <tr
                key={request.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {new Date(request.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {request.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {request.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <span className="capitalize">{request.severity}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      request.status
                    )}`}
                  >
                    {request.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  $
                  {request.estimatedAidNeeded
                    ? request.estimatedAidNeeded.toLocaleString()
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const refreshRequests = () => {
    fetchMyDisasterRequests();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Calculate total allocated relief
  const totalRelief = relief.reduce(
    (sum, item) => sum + parseFloat(item.amount),
    0
  );

  return (
    <div className="space-y-6 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Beneficiary Dashboard
          </h1>
          <p className="text-gray-400">
            Track your relief requests and blockchain transactions
          </p>
        </div>

        {/* Wallet Connection Card */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-700/50 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl mr-4 border border-amber-500/30">
                <WalletIcon className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  Wallet Connection
                </h3>
                <p className="text-gray-400 text-sm">
                  Connect your MetaMask wallet for fund transfers
                </p>
              </div>
            </div>

            {!walletConnected ? (
              <button
                onClick={connectWallet}
                className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 flex items-center shadow-lg shadow-amber-500/20"
              >
                <WalletIcon className="w-5 h-5 mr-2" />
                Connect Wallet
              </button>
            ) : (
              <div className="text-right">
                <div className="flex items-center justify-end mb-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-emerald-400 font-medium">
                    Connected
                  </span>
                </div>
                <div className="text-sm text-gray-400 font-mono">
                  {walletAddress.substring(0, 6)}...
                  {walletAddress.substring(38)}
                </div>
                <div className="text-sm text-amber-400">
                  Balance: {balance} ETH
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Relief Requested */}
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-700/50 transform transition hover:scale-105 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">
                  Total Relief Requested
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mt-2">
                  {requestsLoading ? "Loading..." : disasterRequests.length}
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 p-3 rounded-xl border border-blue-500/30">
                <DocumentTextIcon className="h-8 w-8 text-blue-400" />
              </div>
            </div>
          </div>

          {/* Relief Received Card */}
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-700/50 transform transition hover:scale-105 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">
                  Relief Received
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mt-2">
                  {relief.length}
                </p>
              </div>
              <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 p-3 rounded-xl border border-emerald-500/30">
                <ArrowTrendingUpIcon className="h-8 w-8 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Pending Requests Card */}
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-700/50 transform transition hover:scale-105 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">
                  Pending Requests
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mt-2">
                  {
                    disasterRequests.filter((r) => r.status === "pending")
                      .length
                  }
                </p>
              </div>
              <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-3 rounded-xl border border-amber-500/30">
                <ExclamationTriangleIcon className="h-8 w-8 text-amber-400" />
              </div>
            </div>
          </div>

          {/* Last Transaction Card */}
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-700/50 transform transition hover:scale-105 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">
                  Last Transaction
                </p>
                <p className="text-sm font-mono text-gray-300 mt-2">
                  {relief.length > 0
                    ? `${relief[0].txHash?.substring(0, 10) || "N/A"}...`
                    : "No transactions yet"}
                </p>
              </div>
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-3 rounded-xl border border-purple-500/30">
                <QueueListIcon className="h-8 w-8 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Relief Requests */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2 text-indigo-400" />
              Recent Relief Requests
            </h3>
            <button
              onClick={() => navigate("/relief-history")}
              className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center"
            >
              View All History
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {requestsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : disasterRequests.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-gray-700/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-gray-600/50">
                <DocumentTextIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-300 mb-1">
                No requests yet
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                You haven't submitted any relief requests yet.
              </p>
              <button
                onClick={() => navigate("/relief")}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-indigo-500/20 flex items-center"
              >
                <PlusCircleIcon className="w-5 h-5 mr-2" />
                Request Relief
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-700/50 bg-gray-800/30">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {disasterRequests.slice(0, 5).map((request) => (
                    <tr
                      key={request.id}
                      className="transition-colors duration-150 hover:bg-gray-700/30"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">
                        {request.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {request.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {request.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        ${request.estimatedAidNeeded?.toLocaleString() || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Request Relief Card */}
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-indigo-500/30">
            <div className="text-center">
              <div className="mx-auto bg-gradient-to-r from-indigo-500/20 to-purple-500/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-indigo-500/30">
                <PlusCircleIcon className="h-8 w-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                Request Relief
              </h3>
              <p className="text-gray-400 mb-6">
                Submit a new relief request with detailed information and
                supporting documents.
              </p>
              <button
                onClick={() => navigate("/relief")}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-indigo-500/20 font-medium flex items-center justify-center"
              >
                <PlusCircleIcon className="w-5 h-5 mr-2" />
                Create Request
              </button>
            </div>
          </div>

          {/* View History Card */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-emerald-500/30">
            <div className="text-center">
              <div className="mx-auto bg-gradient-to-r from-emerald-500/20 to-teal-500/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
                <DocumentTextIcon className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
                Relief History
              </h3>
              <p className="text-gray-400 mb-6">
                Track all your past requests, view transaction details, and
                refile rejected requests.
              </p>
              <button
                onClick={() => navigate("/relief-history")}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg shadow-emerald-500/20 font-medium flex items-center justify-center"
              >
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                View History
              </button>
            </div>
          </div>
        </div>

        {/* Blockchain Verification */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            Blockchain Transparency
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-xl p-5 border border-gray-600/50">
              <h4 className="font-semibold text-gray-300 mb-2">
                Total Transactions
              </h4>
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {relief.filter((r) => r.txHash).length}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Verified on blockchain
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-xl p-5 border border-gray-600/50">
              <h4 className="font-semibold text-gray-300 mb-2">Network</h4>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Sepolia
              </p>
              <p className="text-sm text-gray-400 mt-2">Testnet Environment</p>
            </div>

            <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-xl p-5 border border-gray-600/50">
              <h4 className="font-semibold text-gray-300 mb-2">Verification</h4>
              <p className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Live
              </p>
              <p className="text-sm text-gray-400 mt-2">Real-time updates</p>
            </div>
          </div>

          {relief.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-700/50">
              <h4 className="font-medium text-gray-300 mb-3">
                Recent Transactions
              </h4>
              <div className="space-y-3">
                {relief.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-gray-700/30 rounded-lg p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-300">
                        {item.disasterName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                      {item.txHash && (
                        <button
                          onClick={() => {
                            const url = `https://sepolia.etherscan.io/tx/${item.txHash}`;
                            window.open(url, "_blank");
                          }}
                          className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                          Verify
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BeneficiaryDashboard;
