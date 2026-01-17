import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowPathIcon,
  DocumentMagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const ReliefHistory = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchReliefHistory();
  }, []);

  const fetchReliefHistory = async () => {
    try {
      const response = await fetch("/api/relief/history", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Error fetching relief history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
      case "approved":
        return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
      case "funded":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      food: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
      medical: "bg-red-500/20 text-red-400 border border-red-500/30",
      shelter: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
      education: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
      emergency: "bg-red-500/20 text-red-400 border border-red-500/30",
      other: "bg-gray-500/20 text-gray-400 border border-gray-500/30",
    };
    return colors[category.toLowerCase()] || colors.other;
  };

  const filteredRequests = requests.filter((request) => {
    if (filter === "all") return true;
    return request.status.toLowerCase() === filter;
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === "amount") {
      return b.amount - a.amount;
    }
    return 0;
  });

  const refileRequest = (request) => {
    // Navigate to relief page with prefilled data
    const url = new URL("/relief", window.location.origin);
    url.searchParams.set("refile", request.id);
    navigate(`/relief?refile=${request.id}`);
  };

  const verifyOnBlockchain = (txHash) => {
    if (txHash) {
      const sepoliaUrl = `https://sepolia.etherscan.io/tx/${txHash}`;
      window.open(sepoliaUrl, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Relief History
          </h1>
          <p className="text-gray-400">
            Track your past relief requests and re-file if needed
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-700/50">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl mr-4 border border-blue-500/30">
                <svg
                  className="w-6 h-6 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Requests</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  {requests.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-700/50">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl mr-4 border border-emerald-500/30">
                <svg
                  className="w-6 h-6 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Approved</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  {
                    requests.filter(
                      (r) => r.status === "approved" || r.status === "funded"
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-700/50">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl mr-4 border border-amber-500/30">
                <svg
                  className="w-6 h-6 text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  {requests.filter((r) => r.status === "pending").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-700/50">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl mr-4 border border-purple-500/30">
                <svg
                  className="w-6 h-6 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total ETH</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {requests
                    .reduce((sum, r) => sum + (r.amount || 0), 0)
                    .toFixed(4)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-700/50 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="funded">Funded</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
              </select>
            </div>

            <button
              onClick={fetchReliefHistory}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-700/50 overflow-hidden">
          {sortedRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-700/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-gray-600/50">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-300 mb-1">
                No relief requests yet
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                You haven't submitted any relief requests. Click below to make
                your first request.
              </p>
              <button
                onClick={() => navigate("/relief")}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
              >
                Request Relief
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Amount (ETH)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {sortedRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="hover:bg-gray-700/30 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div>
                          <div>
                            {new Date(request.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {new Date(request.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(
                            request.category
                          )}`}
                        >
                          {request.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300 max-w-xs">
                        <div className="truncate" title={request.description}>
                          {request.description}
                        </div>
                        <div className="text-gray-500 text-xs mt-1">
                          {request.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {request.amount ? request.amount.toFixed(4) : "0.0000"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {request.status}
                        </span>
                        {request.adminRemarks && (
                          <div
                            className="text-xs text-gray-500 mt-1"
                            title={request.adminRemarks}
                          >
                            Remarks: {request.adminRemarks.substring(0, 30)}...
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {request.txHash ? (
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs">
                              {request.txHash.substring(0, 8)}...
                              {request.txHash.substring(58)}
                            </span>
                            <button
                              onClick={() => verifyOnBlockchain(request.txHash)}
                              className="text-indigo-400 hover:text-indigo-300"
                              title="Verify on Blockchain"
                            >
                              <DocumentMagnifyingGlassIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {(request.status === "rejected" ||
                            request.status === "approved") && (
                            <button
                              onClick={() => refileRequest(request)}
                              className="text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1 rounded-lg border border-emerald-500/30 transition-colors duration-200"
                              title="Refile this request"
                            >
                              Refile
                            </button>
                          )}
                          {request.supportingProof && (
                            <button
                              onClick={() =>
                                window.open(request.supportingProof, "_blank")
                              }
                              className="text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1 rounded-lg border border-blue-500/30 transition-colors duration-200"
                            >
                              View Proof
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReliefHistory;
