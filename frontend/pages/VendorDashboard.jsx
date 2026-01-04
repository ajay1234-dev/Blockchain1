import React, { useState, useEffect } from "react";
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  QueueListIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

const VendorDashboard = ({ user }) => {
  const [transactions, setTransactions] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch user's transactions
      const transactionsResponse = await fetch("/api/transaction/user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData);
      }

      // Fetch vendor services
      const servicesResponse = await fetch("/api/service/vendor", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        setServices(servicesData);
      }
    } catch (error) {
      console.error("Error fetching vendor dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Calculate total received
  const totalReceived = transactions.reduce(
    (sum, tx) => sum + parseFloat(tx.amount),
    0
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Received Card */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white transform transition hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">
                Total Received
              </p>
              <p className="text-3xl font-bold mt-2">
                ${totalReceived.toFixed(2)}
              </p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <CurrencyDollarIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Active Transactions Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white transform transition hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">
                Active Transactions
              </p>
              <p className="text-3xl font-bold mt-2">{transactions.length}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <ArrowTrendingUpIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Services Offered Card */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white transform transition hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">
                Services Offered
              </p>
              <p className="text-3xl font-bold mt-2">{services.length}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <ShoppingBagIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Vendor Status Card */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white transform transition hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">
                Vendor Status
              </p>
              <p className="text-3xl font-bold mt-2">Active</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <QueueListIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Services Management */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <ShoppingBagIcon className="h-5 w-5 mr-2 text-indigo-600" />
          Your Services
        </h3>
        {services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow duration-200"
              >
                <h4 className="font-semibold text-gray-800 text-lg">
                  {service.name}
                </h4>
                <p className="text-sm text-gray-600 mt-2">
                  {service.description}
                </p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xl font-bold text-indigo-600">
                    ${service.price}
                  </span>
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${
                      service.status === "active"
                        ? "bg-green-100 text-green-800"
                        : service.status === "inactive"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {service.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No services listed yet
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              You haven't added any services yet. Add services to start
              receiving payments from relief operations.
            </p>
            <button className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-md hover:shadow-lg">
              Add Service
            </button>
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <QueueListIcon className="h-5 w-5 mr-2 text-indigo-600" />
          Transaction History
        </h3>
        {transactions.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Disaster
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.disasterName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {transaction.serviceName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      ${transaction.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          transaction.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : transaction.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {transaction.txHash ? (
                        <div className="flex items-center">
                          <span className="mr-2">
                            {transaction.txHash.substring(0, 10) + "..."}
                          </span>
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(transaction.txHash)
                            }
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Copy transaction hash"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <QueueListIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No transactions yet
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              You haven't received any transactions yet. Once you start
              providing services, transactions will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Accept Payment */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8 border border-blue-100">
        <div className="text-center">
          <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Accept Payment
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Accept payments for your services. Ensure your wallet is connected
            to receive payments directly to your account.
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            Accept Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
