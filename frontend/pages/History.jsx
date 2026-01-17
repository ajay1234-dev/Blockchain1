import React, { useState, useEffect } from "react";

const History = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDonationHistory();
  }, []);

  const fetchDonationHistory = async () => {
    try {
      const response = await fetch("/api/donation/donor", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const donationsData = await response.json();
        // Sort by date descending (newest first)
        const sortedDonations = donationsData.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setDonations(sortedDonations);
      } else {
        setError("Failed to fetch donation history");
      }
    } catch (error) {
      console.error("Error fetching donation history:", error);
      setError("An error occurred while fetching donation history");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
      case "pending":
        return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
      case "failed":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl text-white shadow-lg shadow-blue-500/20">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Donation History
            </h1>
            <p className="text-gray-400">
              View your past donations and contributions
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-400 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700/50">
          {donations.length} donations
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 text-red-300 rounded-xl text-sm flex items-start border border-red-500/30">
          <svg
            className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-700/50">
        {donations.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-700/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-gray-600/50">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-1">
              No donation history
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              You haven't made any donations yet. Visit the Donate page to
              support disaster relief efforts.
            </p>
            <button
              onClick={() => (window.location.href = "/donate")}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg shadow-emerald-500/20 font-medium"
            >
              Make Your First Donation
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm p-4 rounded-xl border border-emerald-500/30">
                <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  {donations.length}
                </div>
                <div className="text-sm text-emerald-400">Total Donations</div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-sm p-4 rounded-xl border border-blue-500/30">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  {formatAmount(
                    donations.reduce(
                      (sum, donation) => sum + donation.amount,
                      0
                    )
                  )}
                </div>
                <div className="text-sm text-blue-400">
                  Total Amount (RELIEF)
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm p-4 rounded-xl border border-purple-500/30">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {new Set(donations.map((d) => d.disasterId)).size}
                </div>
                <div className="text-sm text-purple-400">
                  Disasters Supported
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-700/50 bg-gray-800/30">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Disaster
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Transaction Hash
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {donations.map((donation) => (
                    <tr
                      key={donation.id}
                      className="transition-colors duration-150 hover:bg-gray-700/30"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {new Date(donation.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(donation.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-300">
                          {donation.disasterName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {donation.disasterId?.substring(0, 8)}...
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-300">
                          {formatAmount(donation.amount)} RELIEF
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            donation.status
                          )}`}
                        >
                          {donation.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 font-mono">
                          {donation.txHash
                            ? `${donation.txHash.substring(
                                0,
                                6
                              )}...${donation.txHash.substring(
                                donation.txHash.length - 4
                              )}`
                            : "N/A"}
                        </div>
                        {donation.txHash && (
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(donation.txHash)
                            }
                            className="text-xs text-indigo-400 hover:text-indigo-300 mt-1"
                          >
                            Copy Hash
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
