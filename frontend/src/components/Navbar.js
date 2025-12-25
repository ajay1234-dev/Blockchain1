// src/components/Navbar.js
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useWallet } from "../contexts/WalletContext";

function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const { currentUser, logout } = useAuth();
  const { isConnected, connectWallet, userAddress, balance } = useWallet();
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
    handleClose();
  };

  return (
    <AppBar position="static" sx={{ marginBottom: 2 }}>
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: "none",
            color: "inherit",
            fontWeight: "bold",
          }}
        >
          Disaster Relief Platform
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {isConnected ? (
            <Button
              color="inherit"
              size="small"
              sx={{
                textTransform: "none",
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar sx={{ width: 24, height: 24, fontSize: "0.75rem" }}>
                  {userAddress ? userAddress.substring(0, 2) : "?"}
                </Avatar>
                <span>
                  {userAddress
                    ? `${userAddress.substring(0, 6)}...${userAddress.substring(
                        userAddress.length - 4
                      )}`
                    : "Connected"}
                </span>
              </Box>
              {balance && (
                <Typography variant="caption" sx={{ mt: 0.5 }}>
                  {parseFloat(balance).toFixed(4)} ETH
                </Typography>
              )}
            </Button>
          ) : (
            <Button
              color="inherit"
              onClick={connectWallet}
              variant="outlined"
              size="small"
            >
              Connect Wallet
            </Button>
          )}

          {currentUser ? (
            <>
              <Button color="inherit" component={Link} to="/profile">
                Profile
              </Button>
              <IconButton color="inherit" onClick={handleClick}>
                <Typography variant="body2">
                  {currentUser.email?.split("@")[0] || "User"}
                </Typography>
              </IconButton>
              <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                <MenuItem
                  onClick={() => {
                    navigate("/profile");
                    handleClose();
                  }}
                >
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
