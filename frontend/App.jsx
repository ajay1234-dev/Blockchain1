import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <div className="flex flex-1 overflow-hidden">
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
                ? "flex-1 overflow-auto p-4 md:p-6 bg-gradient-to-b from-gray-50 to-gray-100"
                : "min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center"
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
        theme="light"
      />
    </div>
  );
}

export default App;
