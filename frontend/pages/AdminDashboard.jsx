import React, { useState, useEffect } from "react";

const AdminDashboard = ({ user }) => {
  const [disasters, setDisasters] = useState([]);
  const [disasterRequests, setDisasterRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [newDisaster, setNewDisaster] = useState({ name: "", description: "" });
  const [approveForm, setApproveForm] = useState({
    type: "beneficiary",
    id: "",
    eventId: "",
  });

  useEffect(() => {
    fetchDashboardData();
    fetchDisasterRequests();
  }, []);

  // Check for new disaster requests and show notification
  useEffect(() => {
    if (disasterRequests.length > 0) {
      const pendingRequests = disasterRequests.filter(
        (request) => request.status === "pending"
      );
      if (pendingRequests.length > 0) {
        // Show a notification for new disaster requests
        const notificationText = `You have ${pendingRequests.length} new disaster request(s) to review`;
        // In a real app, you might use a proper notification library, but for now we'll use alert
        // Only show the notification if we just loaded the requests (not on every render)
        if (requestsLoading === false && disasterRequests.length > 0) {
          // We'll show the notification in the UI rather than using alert to be less intrusive
        }
      }
    }
  }, [disasterRequests, requestsLoading]);

  const fetchDashboardData = async () => {
    try {
      // Fetch user count
      const usersResponse = await fetch("/api/user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUserCount(usersData.length);
      }

      // Fetch disasters
      const disastersResponse = await fetch("/api/disaster", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (disastersResponse.ok) {
        const disastersData = await disastersResponse.json();
        setDisasters(disastersData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDisaster = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/blockchain/disaster", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newDisaster),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Disaster event created successfully");
        setNewDisaster({ name: "", description: "" });
        fetchDashboardData(); // Refresh data
      } else {
        alert(data.message || "Failed to create disaster event");
      }
    } catch (error) {
      alert("Error creating disaster event");
      console.error("Error creating disaster:", error);
    }
  };

  const fetchDisasterRequests = async () => {
    try {
      setRequestsLoading(true);
      const response = await fetch("/api/disaster-request", {
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

  const handleUpdateDisasterRequest = async (requestId, status) => {
    if (
      !window.confirm(
        `Are you sure you want to update this request status to ${status}?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/disaster-request/${requestId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(`Request status updated to ${status}`);
        fetchDisasterRequests(); // Refresh requests
      } else {
        alert(data.message || `Failed to update request status`);
      }
    } catch (error) {
      alert(`Error updating request status`);
      console.error(`Error updating request status:`, error);
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

  const handleApproveEntity = async (e) => {
    e.preventDefault();

    // Only beneficiary approval is supported after vendor role removal
    if (approveForm.type !== "beneficiary") {
      alert("Only beneficiary approval is supported");
      return;
    }

    try {
      const endpoint = "/api/blockchain/approve/beneficiary";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          [approveForm.type + "Id"]: approveForm.id,
          eventId: approveForm.eventId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`${approveForm.type} approved successfully`);
        setApproveForm({ type: "beneficiary", id: "", eventId: "" });
      } else {
        alert(data.message || `Failed to approve ${approveForm.type}`);
      }
    } catch (error) {
      alert(`Error approving ${approveForm.type}`);
      console.error(`Error approving ${approveForm.type}:`, error);
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
      {/* Notification Banner for Pending Disaster Requests */}
      {disasterRequests.length > 0 &&
        (() => {
          const pendingRequests = disasterRequests.filter(
            (request) => request.status === "pending"
          );
          if (pendingRequests.length > 0) {
            return (
              <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 backdrop-blur-sm rounded-xl p-4 border border-amber-500/30">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-amber-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-amber-300">
                      <span className="font-medium">Attention!</span> You have{" "}
                      {pendingRequests.length} pending disaster request
                      {pendingRequests.length > 1 ? "s" : ""} to review.
                    </p>
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })()}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-700/50">
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                Total Users
              </h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                {userCount}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl text-white shadow-lg shadow-red-500/20">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                Active Disasters
              </h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                {disasters.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white shadow-lg shadow-purple-500/20">
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
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                Blockchain Records
              </h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                0
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Disaster Event Form */}
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-700/50">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg text-white shadow-lg shadow-red-500/20">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Create Disaster Event
          </h3>
        </div>
        <form onSubmit={handleCreateDisaster} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Event Name
            </label>
            <input
              type="text"
              value={newDisaster.name}
              onChange={(e) =>
                setNewDisaster({ ...newDisaster, name: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition shadow-sm focus:shadow-lg text-white placeholder-gray-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              value={newDisaster.description}
              onChange={(e) =>
                setNewDisaster({ ...newDisaster, description: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition shadow-sm focus:shadow-lg text-white placeholder-gray-400"
              rows="3"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-orange-700 transition-all duration-200 shadow-lg shadow-red-500/20 font-medium"
          >
            Create Disaster Event
          </button>
        </form>
      </div>

      {/* Approve Beneficiaries/Vendors */}
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-700/50">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg text-white shadow-lg shadow-emerald-500/20">
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Approve Beneficiaries
          </h3>
        </div>
        <form
          onSubmit={handleApproveEntity}
          className="grid grid-cols-1 md:grid-cols-4 gap-5"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Type
            </label>
            <select
              value={approveForm.type}
              onChange={(e) =>
                setApproveForm({ ...approveForm, type: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-sm focus:shadow-lg text-white placeholder-gray-400"
            >
              <option value="beneficiary">Beneficiary</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Note: Vendor approval is no longer available
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
              User ID
            </label>
            <input
              type="text"
              value={approveForm.id}
              onChange={(e) =>
                setApproveForm({ ...approveForm, id: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-sm focus:shadow-lg text-white placeholder-gray-400"
              placeholder="Enter user ID"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Event ID
            </label>
            <input
              type="text"
              value={approveForm.eventId}
              onChange={(e) =>
                setApproveForm({ ...approveForm, eventId: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-sm focus:shadow-lg text-white placeholder-gray-400"
              placeholder="Enter event ID"
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg shadow-emerald-500/20 font-medium"
            >
              Approve
            </button>
          </div>
        </form>
      </div>

      {/* Disaster Requests */}
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg text-white shadow-lg shadow-amber-500/20">
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
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Disaster Requests
            </h3>
          </div>
          <div className="text-sm text-gray-400">
            {disasterRequests.length} requests
          </div>
        </div>
        {requestsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : disasterRequests.length === 0 ? (
          <div className="text-center py-8">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-1">
              No disaster requests
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              There are currently no disaster requests from beneficiaries.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-700/50 bg-gray-800/30">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Requested By
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {disasterRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="transition-colors duration-150 hover:bg-gray-700/30"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-300">
                        {request.name}
                      </div>
                      <div
                        className="text-sm text-gray-500 max-w-xs truncate"
                        title={request.description}
                      >
                        {request.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {request.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      <span className="capitalize">{request.severity}</span>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-300">
                        {request.requestedByName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.requestedByEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            handleUpdateDisasterRequest(request.id, "approved")
                          }
                          disabled={request.status !== "pending"}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            request.status === "pending"
                              ? "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-600/30"
                              : "bg-gray-700/50 text-gray-500 cursor-not-allowed border border-gray-600/50"
                          }`}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateDisasterRequest(request.id, "rejected")
                          }
                          disabled={request.status !== "pending"}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            request.status === "pending"
                              ? "bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/30"
                              : "bg-gray-700/50 text-gray-500 cursor-not-allowed border border-gray-600/50"
                          }`}
                        >
                          Reject
                        </button>
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
  );
};

export default AdminDashboard;
