import React, { useState, useEffect } from "react";
import {
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  QueueListIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

const BeneficiaryDashboard = ({ user }) => {
  const [relief, setRelief] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Relief Allocated Card */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white transform transition hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">
                Total Relief Allocated
              </p>
              <p className="text-3xl font-bold mt-2">
                ${totalRelief.toFixed(2)}
              </p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <ArrowTrendingUpIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Active Disasters Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white transform transition hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">
                Active Disasters
              </p>
              <p className="text-3xl font-bold mt-2">{relief.length}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <ExclamationTriangleIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Relief Categories Card */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white transform transition hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">
                Relief Categories
              </p>
              <p className="text-3xl font-bold mt-2">{categories.length}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <QueueListIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Beneficiary Status Card */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white transform transition hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">
                Beneficiary Status
              </p>
              <p className="text-3xl font-bold mt-2">Active</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <UserGroupIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Relief by Category */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <QueueListIcon className="h-5 w-5 mr-2 text-indigo-600" />
          Relief by Category
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const categoryRelief = relief.filter(
              (item) => item.category === category.name
            );
            const categoryTotal = categoryRelief.reduce(
              (sum, item) => sum + parseFloat(item.amount),
              0
            );

            return (
              <div
                key={category.id}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow duration-200"
              >
                <h4 className="font-semibold text-gray-800 text-lg">
                  {category.name}
                </h4>
                <p className="text-2xl font-bold text-indigo-600 mt-3">
                  ${categoryTotal.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {categoryRelief.length} items
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Relief History */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <QueueListIcon className="h-5 w-5 mr-2 text-indigo-600" />
          Relief History
        </h3>
        {relief.length > 0 ? (
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
                    Category
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
                {relief.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.disasterName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      ${item.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          item.status === "received"
                            ? "bg-green-100 text-green-800"
                            : item.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.txHash ? (
                        <div className="flex items-center">
                          <span className="mr-2">
                            {item.txHash.substring(0, 10) + "..."}
                          </span>
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(item.txHash)
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
              No relief allocations yet
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              You haven't received any relief allocations. Please contact your
              administrator for assistance.
            </p>
          </div>
        )}
      </div>

      {/* Request Additional Assistance */}
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Request Additional Assistance
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Contact your administrator to request additional assistance or if
            you need help with your current allocations.
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            Request Assistance
          </button>
        </div>
      </div>
    </div>
  );
};

export default BeneficiaryDashboard;
