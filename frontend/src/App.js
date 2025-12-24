import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { AuthProvider } from "./contexts/AuthContext";
import { WalletProvider } from "./contexts/WalletContext";

// Import components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Import pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DonorDashboard from "./pages/DonorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import BeneficiaryDashboard from "./pages/BeneficiaryDashboard";
import Profile from "./pages/Profile";

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#e57373",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 500,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <WalletProvider>
          <Router>
            <div className="App">
              <Navbar />
              <main style={{ minHeight: "calc(100vh - 120px)" }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/donor-dashboard" element={<DonorDashboard />} />
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  <Route
                    path="/beneficiary-dashboard"
                    element={<BeneficiaryDashboard />}
                  />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </WalletProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
