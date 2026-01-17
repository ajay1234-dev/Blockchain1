import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard.jsx";
import DonorDashboard from "./DonorDashboard.jsx";
import BeneficiaryDashboard from "./BeneficiaryDashboard.jsx";

const Dashboard = ({ user }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch dashboard data based on user role
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/user/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setDashboardData(userData);
      } else {
        // Handle error
        console.error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Dashboard content based on user role
  const renderDashboardContent = () => {
    switch (user?.role) {
      case "admin":
        return <AdminDashboard user={user} />;
      case "donor":
        return <DonorDashboard user={user} />;
      case "beneficiary":
        return <BeneficiaryDashboard user={user} />;

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Emergency Relief Platform
            </h2>
            <p className="text-gray-600">
              Your role is not recognized. Please contact admin.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-700/50">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Dashboard
        </h1>
        <p className="text-gray-400">Welcome back, {user?.name}!</p>
      </div>

      {renderDashboardContent()}
    </div>
  );
};

export default Dashboard;
