import React, { useState, useEffect } from "react";

const Donate = () => {
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDisaster, setSelectedDisaster] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("RELIEF");
  const [donating, setDonating] = useState(false);

  useEffect(() => {
    fetchDisasters();
  }, []);

  const fetchDisasters = async () => {
    try {
      const response = await fetch("/api/disaster", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const disastersData = await response.json();
        // Filter for active disasters only
        const activeDisasters = disastersData.filter(
          (disaster) => disaster.status === "active"
        );
        setDisasters(activeDisasters);
      } else {
        setError("Failed to fetch disasters");
      }
    } catch (error) {
      console.error("Error fetching disasters:", error);
      setError("An error occurred while fetching disasters");
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async (e) => {
    e.preventDefault();

    if (!selectedDisaster || !amount) {
      setError("Please select a disaster and enter an amount");
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    setDonating(true);
    setError("");

    try {
      const response = await fetch("/api/donation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          disasterId: selectedDisaster,
          amount: parseFloat(amount),
          currency,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Donation successful!");
        setAmount("");
        setSelectedDisaster("");
        // Refresh disasters to update any relevant data
        fetchDisasters();
      } else {
        setError(data.message || "Donation failed");
      }
    } catch (error) {
      console.error("Error making donation:", error);
      setError("An error occurred while processing your donation");
    } finally {
      setDonating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
      case "completed":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "inactive":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white shadow-lg shadow-emerald-500/20">
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
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Make a Donation
            </h1>
            <p className="text-gray-400">Support disaster relief efforts</p>
          </div>
        </div>
        <div className="text-sm text-gray-400 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700/50">
          {disasters.length} active disasters
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donation Form */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-700/50">
            <h2 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-6">
              Donation Details
            </h2>

            {error && (
              <div className="mb-5 p-3 bg-red-500/20 text-red-300 rounded-lg text-sm flex items-start border border-red-500/30">
                <svg
                  className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"
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

            <form onSubmit={handleDonate} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Select Disaster *
                </label>
                <select
                  value={selectedDisaster}
                  onChange={(e) => setSelectedDisaster(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-sm focus:shadow-lg text-white"
                  required
                >
                  <option value="">Choose a disaster to support</option>
                  {disasters.map((disaster) => (
                    <option key={disaster.id} value={disaster.id}>
                      {disaster.name} - {disaster.location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Amount *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0.01"
                    step="0.01"
                    className="w-full pl-4 pr-16 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-sm focus:shadow-lg text-white"
                    placeholder="Enter amount"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-400 text-sm font-medium">
                      RELIEF
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-sm focus:shadow-lg text-white"
                  disabled
                >
                  <option value="RELIEF">RELIEF Tokens</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Currently only RELIEF tokens are accepted
                </p>
              </div>

              <button
                type="submit"
                disabled={donating || !selectedDisaster || !amount}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-lg hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 font-medium flex items-center justify-center"
              >
                {donating ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Processing Donation...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    Make Donation
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Active Disasters List */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-700/50">
            <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-6">
              Active Disasters
            </h2>

            {disasters.length === 0 ? (
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-1">
                  No active disasters
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  There are currently no active disasters requiring donations.
                  Check back later for new relief opportunities.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {disasters.map((disaster) => (
                  <div
                    key={disaster.id}
                    className={`bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-sm rounded-xl p-5 border transition-all duration-200 hover:from-gray-700/70 hover:to-gray-800/70 ${
                      selectedDisaster === disaster.id
                        ? "ring-2 ring-emerald-500/50 border-emerald-500/30"
                        : "border-gray-600/50"
                    }`}
                    onClick={() => setSelectedDisaster(disaster.id)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-gray-200 text-lg">
                        {disaster.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          disaster.status
                        )}`}
                      >
                        {disaster.status}
                      </span>
                    </div>

                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {disaster.description}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Location:</span>
                        <span className="text-gray-300 font-medium">
                          {disaster.location}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Created by:</span>
                        <span className="text-gray-300 font-medium">
                          {disaster.createdBy}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Created:</span>
                        <span className="text-gray-300 font-medium">
                          {new Date(disaster.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {selectedDisaster === disaster.id && (
                      <div className="mt-3 p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <p className="text-emerald-400 text-xs text-center font-medium">
                          Selected for donation
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donate;
