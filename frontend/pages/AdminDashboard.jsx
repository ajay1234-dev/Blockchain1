import React, { useState, useEffect } from "react";

const AdminDashboard = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newDisaster, setNewDisaster] = useState({ name: "", description: "" });
  const [approveForm, setApproveForm] = useState({
    type: "beneficiary",
    id: "",
    eventId: "",
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch users
      const usersResponse = await fetch("/api/user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
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
      toast.error("Error creating disaster event");
      console.error("Error creating disaster:", error);
    }
  };

  const handleApproveEntity = async (e) => {
    e.preventDefault();
    try {
      const endpoint =
        approveForm.type === "beneficiary"
          ? "/api/blockchain/approve/beneficiary"
          : "/api/blockchain/approve/vendor";

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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">
                Total Users
              </h3>
              <p className="text-3xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl shadow-md p-6 border border-red-100">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-500 rounded-xl text-white">
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
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">
                Active Disasters
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
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Disaster Event Form */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg text-white">
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
          <h3 className="text-lg font-bold text-gray-900">
            Create Disaster Event
          </h3>
        </div>
        <form onSubmit={handleCreateDisaster} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Name
            </label>
            <input
              type="text"
              value={newDisaster.name}
              onChange={(e) =>
                setNewDisaster({ ...newDisaster, name: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition duration-200 bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={newDisaster.description}
              onChange={(e) =>
                setNewDisaster({ ...newDisaster, description: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition duration-200 bg-white"
              rows="3"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
          >
            Create Disaster Event
          </button>
        </form>
      </div>

      {/* Approve Beneficiaries/Vendors */}
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            Approve Beneficiaries/Vendors
          </h3>
        </div>
        <form
          onSubmit={handleApproveEntity}
          className="grid grid-cols-1 md:grid-cols-4 gap-5"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={approveForm.type}
              onChange={(e) =>
                setApproveForm({ ...approveForm, type: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition duration-200 bg-white"
            >
              <option value="beneficiary">Beneficiary</option>
              <option value="vendor">Vendor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User ID
            </label>
            <input
              type="text"
              value={approveForm.id}
              onChange={(e) =>
                setApproveForm({ ...approveForm, id: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition duration-200 bg-white"
              placeholder="Enter user ID"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event ID
            </label>
            <input
              type="text"
              value={approveForm.eventId}
              onChange={(e) =>
                setApproveForm({ ...approveForm, eventId: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition duration-200 bg-white"
              placeholder="Enter event ID"
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
            >
              Approve
            </button>
          </div>
        </form>
      </div>

      {/* User Management */}
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">User Management</h3>
          </div>
          <div className="text-sm text-gray-500">{users.length} users</div>
        </div>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Wallet
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user, index) => (
                <tr
                  key={user.uid}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-dashed border-blue-300 rounded-xl flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {user.name?.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {user.uid?.substring(0, 8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                      ${
                        user.role === "admin"
                          ? "bg-red-100 text-red-800"
                          : user.role === "donor"
                          ? "bg-green-100 text-green-800"
                          : user.role === "beneficiary"
                          ? "bg-blue-100 text-blue-800"
                          : user.role === "vendor"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                      {user.walletAddress
                        ? user.walletAddress.substring(0, 6) +
                          "..." +
                          user.walletAddress.substring(
                            user.walletAddress.length - 4
                          )
                        : "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded-lg transition-colors duration-200">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-lg transition-colors duration-200">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
