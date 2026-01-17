import React, { useState, useEffect } from "react";
import {
  LockClosedIcon,
  UserGroupIcon,
  CogIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Profile state
  const [profile, setProfile] = useState({
    email: "",
    uid: "",
    role: "",
    name: "",
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // User management settings
  const [userManagement, setUserManagement] = useState({
    donorsEnabled: true,
    beneficiariesEnabled: true,
    totalUsers: { donors: 0, beneficiaries: 0 },
  });

  // Platform configuration
  const [platformConfig, setPlatformConfig] = useState({
    maintenanceMode: false,
    donationsEnabled: true,
    reliefRequestsEnabled: true,
  });

  // Blockchain controls
  const [blockchainControls, setBlockchainControls] = useState({
    transactionsEnabled: true,
    walletAddress: "",
  });

  // Content management
  const [content, setContent] = useState({
    termsAndConditions: "",
    privacyPolicy: "",
    emergencyGuidelines: "",
  });

  // Audit logs
  const [auditLogs, setAuditLogs] = useState([]);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);

      // Load admin profile
      const user = JSON.parse(localStorage.getItem("user"));
      setProfile({
        email: user.email,
        uid: user.uid,
        role: user.role,
        name: user.name,
      });

      // Load platform configuration
      const configResponse = await fetch("/api/settings/config", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (configResponse.ok) {
        const configData = await configResponse.json();
        setPlatformConfig(configData);
      }

      // Load blockchain controls
      const blockchainResponse = await fetch("/api/settings/blockchain", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (blockchainResponse.ok) {
        const blockchainData = await blockchainResponse.json();
        setBlockchainControls(blockchainData);
      }

      // Load content
      const contentResponse = await fetch("/api/settings/content", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        setContent(contentData);
      }

      // Load audit logs
      const logsResponse = await fetch("/api/settings/logs", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (logsResponse.ok) {
        const logsData = await logsResponse.json();
        setAuditLogs(logsData);
      }

      // Load user management settings
      const userResponse = await fetch("/api/settings/user-management", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUserManagement(userData);
      }
    } catch (err) {
      setError("Failed to load settings");
      console.error("Error loading settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    try {
      const response = await fetch("/api/settings/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Password changed successfully");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setError(data.message || "Failed to change password");
      }
    } catch (err) {
      setError("An error occurred while changing password");
      console.error("Error changing password:", err);
    }
  };

  const handlePlatformConfigChange = async (field, value) => {
    try {
      const response = await fetch("/api/settings/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ [field]: value }),
      });

      if (response.ok) {
        setPlatformConfig((prev) => ({ ...prev, [field]: value }));
        setSuccess(
          `${field
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())} updated successfully`
        );
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Failed to update configuration");
      }
    } catch (err) {
      setError("An error occurred while updating configuration");
    }
  };

  const handleBlockchainControlChange = async (field, value) => {
    try {
      const response = await fetch("/api/settings/blockchain", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ [field]: value }),
      });

      if (response.ok) {
        setBlockchainControls((prev) => ({ ...prev, [field]: value }));
        setSuccess(
          `${field
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())} updated successfully`
        );
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Failed to update blockchain controls");
      }
    } catch (err) {
      setError("An error occurred while updating blockchain controls");
    }
  };

  const handleContentUpdate = async (field, value) => {
    try {
      const response = await fetch("/api/settings/content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ [field]: value }),
      });

      if (response.ok) {
        setContent((prev) => ({ ...prev, [field]: value }));
        setSuccess(
          `${field
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())} updated successfully`
        );
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Failed to update content");
      }
    } catch (err) {
      setError("An error occurred while updating content");
    }
  };

  const handleUserManagementChange = async (field, value) => {
    try {
      const response = await fetch("/api/settings/user-management", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ [field]: value }),
      });

      if (response.ok) {
        setUserManagement((prev) => ({ ...prev, [field]: value }));
        setSuccess(
          `${field
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())} updated successfully`
        );
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Failed to update user management settings");
      }
    } catch (err) {
      setError("An error occurred while updating user management settings");
    }
  };

  const handleLogoutAllDevices = async () => {
    if (
      !window.confirm(
        "Are you sure you want to logout from all devices? This will require all users to re-login."
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/settings/logout-all", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        setSuccess("Logged out from all devices successfully");
        setTimeout(() => {
          localStorage.clear();
          window.location.href = "/login";
        }, 2000);
      } else {
        setError("Failed to logout from all devices");
      }
    } catch (err) {
      setError("An error occurred while logging out from all devices");
    }
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-600/50">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
          Admin Profile
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={profile.name}
              readOnly
              className="w-full px-3 py-2 bg-gray-700/30 border border-gray-600/50 rounded-lg text-gray-300 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              readOnly
              className="w-full px-3 py-2 bg-gray-700/30 border border-gray-600/50 rounded-lg text-gray-300 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <input
              type="text"
              value={profile.role}
              readOnly
              className="w-full px-3 py-2 bg-gray-700/30 border border-gray-600/50 rounded-lg text-gray-300 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User ID
            </label>
            <input
              type="text"
              value={profile.uid}
              readOnly
              className="w-full px-3 py-2 bg-gray-700/30 border border-gray-600/50 rounded-lg text-gray-300 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-600/50">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
          Change Password
        </h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                required
                className="w-full px-3 py-2 bg-gray-700/30 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                required
                className="w-full px-3 py-2 bg-gray-700/30 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white"
                placeholder="Enter new password (min 6 characters)"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                required
                className="w-full px-3 py-2 bg-gray-700/30 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-800 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Change Password
          </button>
        </form>
      </div>

      <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-600/50">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
          Session Management
        </h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLogoutAllDevices}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Logout from All Devices
          </button>
          <p className="text-sm text-gray-400">
            This will log out all sessions and require re-authentication
          </p>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-600/50">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
          User Registration Controls
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50">
            <div>
              <h4 className="font-medium text-gray-300">Donor Registration</h4>
              <p className="text-sm text-gray-400">
                Allow new donor accounts to be created
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={userManagement.donorsEnabled}
                onChange={(e) =>
                  handleUserManagementChange("donorsEnabled", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50">
            <div>
              <h4 className="font-medium text-gray-300">
                Beneficiary Registration
              </h4>
              <p className="text-sm text-gray-400">
                Allow new beneficiary accounts to be created
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={userManagement.beneficiariesEnabled}
                onChange={(e) =>
                  handleUserManagementChange(
                    "beneficiariesEnabled",
                    e.target.checked
                  )
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-600/50">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
          User Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm p-4 rounded-xl border border-indigo-500/30">
            <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {userManagement.totalUsers?.donors || 0}
            </div>
            <div className="text-sm text-indigo-400">Total Donors</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm p-4 rounded-xl border border-emerald-500/30">
            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              {userManagement.totalUsers?.beneficiaries || 0}
            </div>
            <div className="text-sm text-emerald-400">Total Beneficiaries</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlatformConfiguration = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-600/50">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
          Platform-wide Controls
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50">
            <div>
              <h4 className="font-medium text-gray-300">Maintenance Mode</h4>
              <p className="text-sm text-gray-400">
                Temporarily disable platform access for all users
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={platformConfig.maintenanceMode}
                onChange={(e) =>
                  handlePlatformConfigChange(
                    "maintenanceMode",
                    e.target.checked
                  )
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50">
            <div>
              <h4 className="font-medium text-gray-300">Donations Enabled</h4>
              <p className="text-sm text-gray-400">
                Allow users to make donations through blockchain
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={platformConfig.donationsEnabled}
                onChange={(e) =>
                  handlePlatformConfigChange(
                    "donationsEnabled",
                    e.target.checked
                  )
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50">
            <div>
              <h4 className="font-medium text-gray-300">
                Relief Requests Enabled
              </h4>
              <p className="text-sm text-gray-400">
                Allow beneficiaries to submit disaster requests
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={platformConfig.reliefRequestsEnabled}
                onChange={(e) =>
                  handlePlatformConfigChange(
                    "reliefRequestsEnabled",
                    e.target.checked
                  )
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBlockchainControls = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-600/50">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
          Blockchain Network Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Network
            </label>
            <input
              type="text"
              value="Ethereum Mainnet (Simulated)"
              readOnly
              className="w-full px-3 py-2 bg-gray-700/30 border border-gray-600/50 rounded-lg text-gray-300 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Platform Wallet Address
            </label>
            <input
              type="text"
              value={blockchainControls.walletAddress || "Loading..."}
              readOnly
              className="w-full px-3 py-2 bg-gray-700/30 border border-gray-600/50 rounded-lg text-gray-300 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-600/50">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
          Transaction Controls
        </h3>
        <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <div>
            <h4 className="font-medium text-gray-300">Allow Transactions</h4>
            <p className="text-sm text-gray-400">
              Enable/disable all blockchain transactions
            </p>
            <p className="text-xs text-amber-400 mt-1">
              ⚠️ Warning: Disabling transactions affects all donation flows
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={blockchainControls.transactionsEnabled}
              onChange={(e) =>
                handleBlockchainControlChange(
                  "transactionsEnabled",
                  e.target.checked
                )
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderContentManagement = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-600/50">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
          Terms & Conditions
        </h3>
        <textarea
          value={content.termsAndConditions}
          onChange={(e) =>
            handleContentUpdate("termsAndConditions", e.target.value)
          }
          rows={8}
          className="w-full px-3 py-2 bg-gray-700/30 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white"
          placeholder="Enter terms and conditions..."
        />
      </div>

      <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-600/50">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
          Privacy Policy
        </h3>
        <textarea
          value={content.privacyPolicy}
          onChange={(e) => handleContentUpdate("privacyPolicy", e.target.value)}
          rows={8}
          className="w-full px-3 py-2 bg-gray-700/30 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white"
          placeholder="Enter privacy policy..."
        />
      </div>

      <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-600/50">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
          Emergency Guidelines
        </h3>
        <textarea
          value={content.emergencyGuidelines}
          onChange={(e) =>
            handleContentUpdate("emergencyGuidelines", e.target.value)
          }
          rows={8}
          className="w-full px-3 py-2 bg-gray-700/30 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white"
          placeholder="Enter emergency guidelines for users..."
        />
      </div>
    </div>
  );

  const renderAuditLogs = () => (
    <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-600/50">
      <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
        System Activity Logs
      </h3>
      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700/30">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {auditLogs.length > 0 ? (
              auditLogs.map((log, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {log.user}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {log.details}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No activity logs available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 flex flex-col relative overflow-hidden p-4">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        </div>
        <div className="flex items-center justify-center flex-1 relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 flex flex-col relative overflow-hidden p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Admin Settings
          </h1>
          <p className="text-gray-400 mt-2">
            Manage platform configuration, security settings, and system
            controls
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 text-red-300 rounded-xl text-sm flex items-start border border-red-500/30">
            <svg
              className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
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

        {success && (
          <div className="mb-6 p-4 bg-emerald-500/20 text-emerald-300 rounded-xl text-sm flex items-start border border-emerald-500/30">
            <svg
              className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>{success}</span>
          </div>
        )}

        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-gray-700/50">
          {/* Tab Navigation */}
          <div className="border-b border-gray-700/50">
            <nav className="flex space-x-0">
              {[
                {
                  id: "profile",
                  label: "Profile & Security",
                  icon: LockClosedIcon,
                },
                { id: "users", label: "User Management", icon: UserGroupIcon },
                { id: "platform", label: "Platform Config", icon: CogIcon },
                {
                  id: "blockchain",
                  label: "Blockchain",
                  icon: ShieldCheckIcon,
                },
                { id: "content", label: "Content", icon: DocumentTextIcon },
                { id: "logs", label: "Audit Logs", icon: EyeIcon },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 -mb-px ${
                    activeTab === tab.id
                      ? "border-indigo-500 text-indigo-400 bg-indigo-500/10"
                      : "border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-700/50"
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "profile" && renderProfileSection()}
            {activeTab === "users" && renderUserManagement()}
            {activeTab === "platform" && renderPlatformConfiguration()}
            {activeTab === "blockchain" && renderBlockchainControls()}
            {activeTab === "content" && renderContentManagement()}
            {activeTab === "logs" && renderAuditLogs()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
