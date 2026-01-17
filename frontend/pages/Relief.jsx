import React, { useState, useEffect } from "react";
import {
  PlusCircleIcon,
  DocumentTextIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

const Relief = () => {
  const [categories, setCategories] = useState([
    { id: "food", name: "Food", description: "Food assistance and supplies" },
    {
      id: "medical",
      name: "Medical",
      description: "Medical care and supplies",
    },
    {
      id: "shelter",
      name: "Shelter",
      description: "Temporary housing and shelter",
    },
    {
      id: "education",
      name: "Education",
      description: "Educational support and materials",
    },
    {
      id: "emergency",
      name: "Disaster Emergency",
      description: "Immediate emergency assistance",
    },
    { id: "other", name: "Other", description: "Other assistance needs" },
  ]);

  const [formData, setFormData] = useState({
    category: "",
    description: "",
    amount: "",
    location: "",
    supportingProof: null,
    walletAddress: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [connectedWallet, setConnectedWallet] = useState("");
  const [filePreview, setFilePreview] = useState(null);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setConnectedWallet(accounts[0]);
          setFormData((prev) => ({ ...prev, walletAddress: accounts[0] }));
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
        setConnectedWallet(accounts[0]);
        setFormData((prev) => ({ ...prev, walletAddress: accounts[0] }));
      } catch (err) {
        setError("Failed to connect wallet. Please try again.");
      }
    } else {
      setError("MetaMask not detected. Please install MetaMask extension.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      setFormData((prev) => ({ ...prev, supportingProof: file }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.category) {
      setError("Please select a relief category");
      return false;
    }
    if (!formData.description.trim()) {
      setError("Please provide a description of your need");
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError("Please enter a valid amount");
      return false;
    }
    if (!formData.location.trim()) {
      setError("Please provide your location");
      return false;
    }
    if (!connectedWallet) {
      setError("Please connect your MetaMask wallet");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch("/api/relief/request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(
          "Relief request submitted successfully! Request ID: " + data.requestId
        );
        // Reset form
        setFormData({
          category: "",
          description: "",
          amount: "",
          location: "",
          supportingProof: null,
          walletAddress: connectedWallet,
        });
        setFilePreview(null);
      } else {
        setError(data.message || "Failed to submit relief request");
      }
    } catch (err) {
      setError("An error occurred while submitting your request");
      console.error("Error submitting relief request:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-3">
            Request Relief Assistance
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Submit your relief request with detailed information. Our team will
            review and process your request as quickly as possible.
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30 flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 text-red-300 rounded-xl border border-red-500/30 flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Relief Categories */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-6">
                Relief Categories
              </h2>
              <div className="space-y-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        category: category.id,
                      }))
                    }
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                      formData.category === category.id
                        ? "bg-indigo-500/20 border-indigo-500/50 shadow-lg"
                        : "bg-gray-700/30 border-gray-600/50 hover:bg-gray-700/50"
                    }`}
                  >
                    <h3 className="font-semibold text-gray-200">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {category.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Request Form */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-6">
                Relief Request Form
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Wallet Connection */}
                <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-amber-400">
                        Wallet Connection
                      </h3>
                      <p className="text-sm text-amber-300 mt-1">
                        Connect your MetaMask wallet to receive funds
                      </p>
                    </div>
                    {!connectedWallet ? (
                      <button
                        type="button"
                        onClick={connectWallet}
                        className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-200 flex items-center"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Connect Wallet
                      </button>
                    ) : (
                      <div className="flex items-center text-emerald-400">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                        Connected: {connectedWallet.substring(0, 6)}...
                        {connectedWallet.substring(38)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Description of Need *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm focus:shadow-lg text-white placeholder-gray-400"
                    placeholder="Describe your situation and what type of assistance you need..."
                    required
                  />
                </div>

                {/* Amount and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Amount Requested (ETH) *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      step="0.001"
                      min="0"
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm focus:shadow-lg text-white placeholder-gray-400"
                      placeholder="0.000"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Location (City/State) *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm focus:shadow-lg text-white placeholder-gray-400"
                      placeholder="Enter your city and state"
                      required
                    />
                  </div>
                </div>

                {/* Supporting Proof Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Supporting Proof (Image/PDF)
                  </label>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors duration-200">
                    <input
                      type="file"
                      id="proof-upload"
                      onChange={handleFileChange}
                      accept="image/*,.pdf"
                      className="hidden"
                    />
                    <label htmlFor="proof-upload" className="cursor-pointer">
                      {filePreview ? (
                        <div>
                          {filePreview.startsWith("data:image") ? (
                            <img
                              src={filePreview}
                              alt="Preview"
                              className="max-h-32 mx-auto rounded-lg"
                            />
                          ) : (
                            <div className="flex flex-col items-center">
                              <DocumentTextIcon className="w-12 h-12 text-indigo-400 mb-2" />
                              <p className="text-gray-300">
                                PDF Document Uploaded
                              </p>
                            </div>
                          )}
                          <p className="text-sm text-gray-400 mt-2">
                            Click to change file
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <ArrowUpTrayIcon className="w-12 h-12 text-gray-400 mb-2" />
                          <p className="text-gray-300 mb-1">
                            Drag and drop or click to upload
                          </p>
                          <p className="text-sm text-gray-500">
                            Supports images and PDFs (Max 5MB)
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !connectedWallet}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 font-medium flex items-center justify-center"
                >
                  {loading ? (
                    <>
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
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <PlusCircleIcon className="w-5 h-5 mr-2" />
                      Submit Relief Request
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-blue-500/30">
          <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-4">
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start">
              <div className="bg-blue-500/20 text-blue-400 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-200">Submit Request</h4>
                <p className="text-sm text-gray-400 mt-1">
                  Fill out the form with your details and upload supporting
                  documents
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-indigo-500/20 text-indigo-400 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-200">Review Process</h4>
                <p className="text-sm text-gray-400 mt-1">
                  Our team reviews your request and verifies the information
                  provided
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-purple-500/20 text-purple-400 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-200">Receive Funds</h4>
                <p className="text-sm text-gray-400 mt-1">
                  Once approved, funds are transferred directly to your
                  connected wallet
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Relief;
