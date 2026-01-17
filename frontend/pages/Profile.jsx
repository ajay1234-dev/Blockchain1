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
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-700/50">
        <div className="flex items-center mb-8">
          <UserCircleIcon className="h-10 w-10 text-indigo-400 mr-3" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Profile
          </h1>
        </div>

        {editing ? (
          <form onSubmit={handleUpdateProfile} className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <UserCircleIcon className="h-5 w-5 mr-2 text-indigo-400" />
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm focus:shadow-md text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <WalletIcon className="h-5 w-5 mr-2 text-indigo-400" />
                Wallet Address
              </label>
              <input
                type="text"
                value={formData.walletAddress}
                onChange={(e) =>
                  setFormData({ ...formData, walletAddress: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm focus:shadow-md text-white"
                placeholder="Enter your Ethereum wallet address"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-800 transition shadow-md hover:shadow-lg flex items-center"
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
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition shadow-md hover:shadow-lg flex items-center"
              >
                <XMarkIcon className="h-5 w-5 mr-2" />
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center space-x-6">
              <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full w-20 h-20 flex items-center justify-center border border-indigo-500/30">
                <UserCircleIcon className="h-12 w-12 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  {user?.name}
                </h2>
                <p className="text-gray-400 text-lg">{user?.email}</p>
                <span
                  className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium mt-2
                  ${
                    user?.role === "admin"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : user?.role === "donor"
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : user?.role === "beneficiary"
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {user?.role}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-600/50">
                <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-6 flex items-center">
                  <UserCircleIcon className="h-5 w-5 mr-2 text-indigo-400" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-gray-700/50 pb-3">
                    <p className="text-sm font-medium text-gray-400">
                      Full Name
                    </p>
                    <p className="text-gray-300 font-medium">{user?.name}</p>
                  </div>
                  <div className="flex justify-between border-b border-gray-700/50 pb-3">
                    <p className="text-sm font-medium text-gray-400">Email</p>
                    <p className="text-gray-300 font-medium">{user?.email}</p>
                  </div>
                  <div className="flex justify-between border-b border-gray-700/50 pb-3">
                    <p className="text-sm font-medium text-gray-400">Role</p>
                    <p className="text-gray-300 font-medium capitalize">
                      {user?.role}
                    </p>
                  </div>
                  <div className="flex justify-between border-b border-gray-700/50 pb-3">
                    <p className="text-sm font-medium text-gray-400">
                      Wallet Address
                    </p>
                    <p className="text-gray-300 font-medium text-right break-all max-w-xs">
                      {user?.walletAddress
                        ? `${user.walletAddress.substring(
                            0,
                            6
                          )}...${user.walletAddress.substring(
                            user.walletAddress.length - 4
                          )}`
                        : "Not provided"}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-400">
                      Member Since
                    </p>
                    <p className="text-gray-300 font-medium">
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
                className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-800 transition shadow-md hover:shadow-lg flex items-center"
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
