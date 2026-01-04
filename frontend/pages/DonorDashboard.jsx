import React, { useState, useEffect } from "react";

const DonorDashboard = ({ user }) => {
  const [disasters, setDisasters] = useState([]);
  const [donations, setDonations] = useState([]);
  const [selectedDisaster, setSelectedDisaster] = useState("");
  const [donationAmount, setDonationAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch active disasters
      const disastersResponse = await fetch("/api/disaster/active", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (disastersResponse.ok) {
        const disastersData = await disastersResponse.json();
        setDisasters(disastersData);
      }

      // Fetch donor's donations
      const donationsResponse = await fetch("/api/donation/donor", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (donationsResponse.ok) {
        const donationsData = await donationsResponse.json();
        setDonations(donationsData);
      }
    } catch (error) {
      console.error("Error fetching donor dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    if (!selectedDisaster || !donationAmount) {
      alert("Please select a disaster and enter an amount");
      return;
    }

    setDonating(true);
    try {
      // First, make the donation
      const donationResponse = await fetch("/api/donation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          disasterId: selectedDisaster,
          amount: parseFloat(donationAmount),
          currency: "ETH", // Could be ETH or ERC-20
        }),
      });

      const donationData = await donationResponse.json();

      if (donationResponse.ok) {
        // If donation is successful, log the transaction
        if (donationData.txHash) {
          // assuming txHash is returned from donation
          const transactionData = {
            txHash: donationData.txHash,
            fromAddress: user.walletAddress || "", // Assuming user has wallet address
            toAddress: "0x0000000000000000000000000000000000000000", // This would be the contract address
            amount: parseFloat(donationAmount),
            purpose: "donation",
            contractAddress: "0x0000000000000000000000000000000000000000", // The actual contract address
          };

          await fetch("/api/transaction", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(transactionData),
          });
        }

        alert("Donation successful!");
        setDonationAmount("");
        fetchDashboardData(); // Refresh data
      } else {
        alert(donationData.message || "Donation failed");
      }
    } catch (error) {
      console.error("Error making donation:", error);
      alert("Error making donation");
    } finally {
      setDonating(false);
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-md p-6 border border-blue-100">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-500 rounded-xl text-white">
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">
                Total Donations
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                ${donations.reduce((sum, d) => sum + d.amount, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-md p-6 border border-green-100">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-500 rounded-xl text-white">
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">
                Active Campaigns
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {disasters.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-md p-6 border border-purple-100">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-500 rounded-xl text-white">
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
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">
                Blockchain Records
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {donations.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Form */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg text-white">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Make a Donation</h3>
        </div>
        <form onSubmit={handleDonate} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Disaster
            </label>
            <select
              value={selectedDisaster}
              onChange={(e) => setSelectedDisaster(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition duration-200 bg-white"
              required
            >
              <option value="">Select a disaster event</option>
              {disasters.map((disaster) => (
                <option key={disaster.id} value={disaster.id}>
                  {disaster.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition duration-200 bg-white"
              placeholder="Enter donation amount"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition duration-200 bg-white">
              <option value="ETH">ETH</option>
              <option value="RELIEF">RELIEF Token</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={donating}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {donating ? "Processing..." : "Donate Now"}
          </button>
        </form>
      </div>

      {/* Donation History */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg text-white">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2m-3 7h3m-3 4h3m-6-4h.01M9 13h.01M9 17h.01M12 13h.01M12 17h.01M15 13h.01M15 17h.01"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Donation History
            </h3>
          </div>
          <div className="text-sm text-gray-500">
            {donations.length} donations
          </div>
        </div>
        {donations.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Disaster
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Transaction
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donations.map((donation, index) => (
                  <tr
                    key={donation.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(donation.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {donation.disasterName}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {donation.disasterId?.substring(0, 8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {donation.amount} {donation.currency}
                      </div>
                      <div className="text-sm text-gray-500">
                        ${(donation.amount * 0.02).toFixed(2)} USD
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                        ${
                          donation.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : donation.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        <span
                          className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            donation.status === "completed"
                              ? "bg-green-500"
                              : donation.status === "pending"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        ></span>
                        {donation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        {donation.txHash ? (
                          <>
                            <span className="text-gray-900 mr-2">
                              {donation.txHash.substring(0, 6)}...
                              {donation.txHash.substring(
                                donation.txHash.length - 4
                              )}
                            </span>
                            <a
                              href={`https://sepolia.etherscan.io/tx/${donation.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </a>
                          </>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No donations
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Make your first donation to start helping people in need.
            </p>
            <div className="mt-6">
              <button
                onClick={() =>
                  document
                    .querySelector("form")
                    .scrollIntoView({ behavior: "smooth" })
                }
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                Make a Donation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorDashboard;
