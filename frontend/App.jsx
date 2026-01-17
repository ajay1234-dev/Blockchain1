import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import RequestDisaster from "./pages/RequestDisaster.jsx";
import Disasters from "./pages/Disasters.jsx";
import CreateDisaster from "./pages/CreateDisaster.jsx";
import Settings from "./pages/Settings.jsx";
import Users from "./pages/Users.jsx";
import Donate from "./pages/Donate.jsx";
import History from "./pages/History.jsx";
import Relief from "./pages/Relief.jsx";
import ReliefHistory from "./pages/ReliefHistory.jsx";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  // Check if user is authenticated on app load
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // In a real app, you would validate the token with your backend
      setIsAuthenticated(true);
      // Get user data from localStorage or API
      const userData = localStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 flex flex-col relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      </div>

      <div className="flex flex-1 overflow-hidden relative z-10">
        {isAuthenticated && <Sidebar user={user} />}
        <div
          className={
            isAuthenticated ? "flex-1 flex flex-col overflow-hidden" : ""
          }
        >
          {isAuthenticated && (
            <Navbar user={user} setIsAuthenticated={setIsAuthenticated} />
          )}
          <main
            className={
              isAuthenticated
                ? "flex-1 overflow-auto p-4 md:p-6 bg-gradient-to-b from-gray-900/50 to-indigo-900/50"
                : "min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-indigo-900 flex items-center justify-center relative overflow-hidden"
            }
          >
            <div
              className={
                isAuthenticated ? "max-w-7xl mx-auto w-full" : "w-full"
              }
            >
              <Routes>
                <Route
                  path="/login"
                  element={
                    isAuthenticated ? (
                      <Navigate to="/dashboard" />
                    ) : (
                      <Login
                        setIsAuthenticated={setIsAuthenticated}
                        setUser={setUser}
                      />
                    )
                  }
                />
                <Route
                  path="/register"
                  element={
                    isAuthenticated ? (
                      <Navigate to="/dashboard" />
                    ) : (
                      <Register />
                    )
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    isAuthenticated ? (
                      <Dashboard user={user} />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/profile"
                  element={
                    isAuthenticated ? <Profile /> : <Navigate to="/login" />
                  }
                />
                <Route
                  path="/request-disaster"
                  element={
                    isAuthenticated ? (
                      <RequestDisaster />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/disasters"
                  element={
                    isAuthenticated ? <Disasters /> : <Navigate to="/login" />
                  }
                />
                <Route
                  path="/create-disaster"
                  element={
                    isAuthenticated ? (
                      <CreateDisaster />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/settings"
                  element={
                    isAuthenticated ? <Settings /> : <Navigate to="/login" />
                  }
                />
                <Route
                  path="/users"
                  element={
                    isAuthenticated ? (
                      user?.role === "admin" ? (
                        <Users />
                      ) : (
                        <Navigate to="/dashboard" />
                      )
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/donate"
                  element={
                    isAuthenticated ? (
                      user?.role === "donor" ? (
                        <Donate />
                      ) : (
                        <Navigate to="/dashboard" />
                      )
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/history"
                  element={
                    isAuthenticated ? (
                      user?.role === "donor" ? (
                        <History />
                      ) : (
                        <Navigate to="/dashboard" />
                      )
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/relief"
                  element={
                    isAuthenticated ? (
                      user?.role === "beneficiary" ? (
                        <Relief />
                      ) : (
                        <Navigate to="/dashboard" />
                      )
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/relief-history"
                  element={
                    isAuthenticated ? (
                      user?.role === "beneficiary" ? (
                        <ReliefHistory />
                      ) : (
                        <Navigate to="/dashboard" />
                      )
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/"
                  element={
                    isAuthenticated ? (
                      <Navigate to="/dashboard" />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
              </Routes>
            </div>
          </main>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

export default App;
