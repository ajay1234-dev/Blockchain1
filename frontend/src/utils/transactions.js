// Function to get user's transaction history
export const getUserTransactionHistory = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error(
        "No authentication token found. Please log in to view transactions."
      );
    }

    const response = await fetch("/api/transaction/user", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to get transaction history");
    }

    return data;
  } catch (error) {
    console.error("Error getting transaction history:", error);
    throw error;
  }
};

// Function to log a blockchain transaction
export const logBlockchainTransaction = async (transactionData) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch("/api/transaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(transactionData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to log transaction");
    }

    return data;
  } catch (error) {
    console.error("Error logging transaction:", error);
    throw error;
  }
};

// Function to get admin transaction audit
export const getAdminTransactionAudit = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch("/api/transaction/admin", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to get transaction audit");
    }

    return data;
  } catch (error) {
    console.error("Error getting transaction audit:", error);
    throw error;
  }
};
