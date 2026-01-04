import React, { useState, useEffect } from "react";
import {
  UserCircleIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import WalletConnect from "../src/components/WalletConnect";
import TransactionHistory from "../src/components/TransactionHistory";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", walletAddress: "" });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setFormData({
          name: userData.name,
          walletAddress: userData.walletAddress || "",
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/user/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: formData.name,
          walletAddress: formData.walletAddress,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser.user);
        setEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center mb-8">
          <UserCircleIcon className="h-10 w-10 text-indigo-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        </div>

        {editing ? (
          <form onSubmit={handleUpdateProfile} className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <UserCircleIcon className="h-5 w-5 mr-2 text-indigo-600" />
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm focus:shadow-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <WalletIcon className="h-5 w-5 mr-2 text-indigo-600" />
                Wallet Address
              </label>
              <input
                type="text"
                value={formData.walletAddress}
                onChange={(e) =>
                  setFormData({ ...formData, walletAddress: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm focus:shadow-md"
                placeholder="Enter your Ethereum wallet address"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-800 transition shadow-md hover:shadow-lg flex items-center"
              >
                <CheckIcon className="h-5 w-5 mr-2" />
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    name: user.name,
                    walletAddress: user.walletAddress || "",
                  });
                }}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 transition shadow-md hover:shadow-lg flex items-center"
              >
                <XMarkIcon className="h-5 w-5 mr-2" />
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center space-x-6">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full w-20 h-20 flex items-center justify-center">
                <UserCircleIcon className="h-12 w-12 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user?.name}
                </h2>
                <p className="text-gray-600 text-lg">{user?.email}</p>
                <span
                  className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium mt-2
                  ${
                    user?.role === "admin"
                      ? "bg-red-100 text-red-800"
                      : user?.role === "donor"
                      ? "bg-green-100 text-green-800"
                      : user?.role === "beneficiary"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {user?.role}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <UserCircleIcon className="h-5 w-5 mr-2 text-indigo-600" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <p className="text-sm font-medium text-gray-600">
                      Full Name
                    </p>
                    <p className="text-gray-900 font-medium">{user?.name}</p>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-gray-900 font-medium">{user?.email}</p>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <p className="text-sm font-medium text-gray-600">Role</p>
                    <p className="text-gray-900 font-medium capitalize">
                      {user?.role}
                    </p>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <p className="text-sm font-medium text-gray-600">
                      Wallet Address
                    </p>
                    <p className="text-gray-900 font-medium">
                      {user?.walletAddress || "Not provided"}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-600">
                      Member Since
                    </p>
                    <p className="text-gray-900 font-medium">
                      {new Date(user?.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <WalletConnect user={user} setUser={setUser} />
                <TransactionHistory />
              </div>
            </div>

            <div>
              <button
                onClick={() => setEditing(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-800 transition shadow-md hover:shadow-lg flex items-center"
              >
                <PencilIcon className="h-5 w-5 mr-2" />
                Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
