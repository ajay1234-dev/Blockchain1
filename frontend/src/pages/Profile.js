// src/pages/Profile.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Paper,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useWallet } from "../contexts/WalletContext";
import { db } from "../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

function Profile() {
  const { currentUser } = useAuth();
  const { userAddress, isConnected } = useWallet();
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    organization: "",
    location: {
      address: "",
      city: "",
      state: "",
      country: "",
    },
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setProfile({
              firstName: userData.profile?.firstName || "",
              lastName: userData.profile?.lastName || "",
              organization: userData.profile?.organization || "",
              location: {
                address: userData.profile?.location?.address || "",
                city: userData.profile?.location?.city || "",
                state: userData.profile?.location?.state || "",
                country: userData.profile?.location?.country || "",
              },
            });
          }
        } catch (error) {
          setError("Failed to load profile: " + error.message);
        }
      }
    };

    loadProfile();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setSuccess("");
      setLoading(true);

      // Update profile in Firestore
      await setDoc(
        doc(db, "users", currentUser.uid),
        {
          uid: currentUser.uid,
          email: currentUser.email,
          ethereumAddress: userAddress || "",
          profile: {
            firstName: profile.firstName,
            lastName: profile.lastName,
            organization: profile.organization,
            location: profile.location,
          },
          updatedAt: new Date(),
        },
        { merge: true }
      );

      setSuccess("Profile updated successfully!");
    } catch (error) {
      setError("Failed to update profile: " + error.message);
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setProfile((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setProfile((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography component="h1" variant="h4" gutterBottom>
        User Profile
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            id="firstName"
            label="First Name"
            name="firstName"
            value={profile.firstName}
            onChange={handleChange}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            id="lastName"
            label="Last Name"
            name="lastName"
            value={profile.lastName}
            onChange={handleChange}
          />

          <TextField
            margin="normal"
            fullWidth
            id="organization"
            label="Organization"
            name="organization"
            value={profile.organization}
            onChange={handleChange}
          />

          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            Location
          </Typography>

          <TextField
            margin="normal"
            fullWidth
            id="location.address"
            label="Address"
            name="location.address"
            value={profile.location.address}
            onChange={handleChange}
          />

          <TextField
            margin="normal"
            fullWidth
            id="location.city"
            label="City"
            name="location.city"
            value={profile.location.city}
            onChange={handleChange}
          />

          <TextField
            margin="normal"
            fullWidth
            id="location.state"
            label="State/Province"
            name="location.state"
            value={profile.location.state}
            onChange={handleChange}
          />

          <TextField
            margin="normal"
            fullWidth
            id="location.country"
            label="Country"
            name="location.country"
            value={profile.location.country}
            onChange={handleChange}
          />

          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            Account Information
          </Typography>

          <TextField
            margin="normal"
            fullWidth
            id="email"
            label="Email"
            name="email"
            value={currentUser?.email || ""}
            disabled
          />

          <TextField
            margin="normal"
            fullWidth
            id="ethereumAddress"
            label="Ethereum Address"
            name="ethereumAddress"
            value={userAddress || "Not connected"}
            disabled
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            Update Profile
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Profile;
