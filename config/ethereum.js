const { ethers } = require("ethers");

let provider;
let signer;
let emergencyReliefStablecoinContract;
let emergencyReliefManagerContract;

// Contract ABIs (simplified for this example)
const emergencyReliefStablecoinABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

const emergencyReliefManagerABI = [
  "function createDisasterEvent(string calldata name, string calldata description) returns (uint256)",
  "function approveBeneficiary(address beneficiary, uint256 eventId) returns (bool)",
];

function initializeEthereum() {
  try {
    // Initialize provider
    provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);

    // Initialize signer with private key
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    signer = wallet;

    // Initialize contracts with placeholder addresses
    const stablecoinAddress =
      process.env.EMERGENCY_RELIEF_STABLECOIN_ADDRESS ||
      "0x0000000000000000000000000000000000000000";
    const managerAddress =
      process.env.EMERGENCY_RELIEF_MANAGER_ADDRESS ||
      "0x0000000000000000000000000000000000000000";

    emergencyReliefStablecoinContract = new ethers.Contract(
      stablecoinAddress,
      emergencyReliefStablecoinABI,
      signer
    );
    emergencyReliefManagerContract = new ethers.Contract(
      managerAddress,
      emergencyReliefManagerABI,
      signer
    );

    console.log("Ethereum initialized");
  } catch (error) {
    console.error("Error initializing Ethereum:", error.message);
  }
}

// Function to interact with Emergency Relief Stablecoin contract
function getStablecoinContract() {
  if (!signer) {
    throw new Error(
      "Ethereum not initialized. Call initializeEthereum() first."
    );
  }
  return emergencyReliefStablecoinContract;
}

// Function to interact with Emergency Relief Manager contract
function getManagerContract() {
  if (!signer) {
    throw new Error(
      "Ethereum not initialized. Call initializeEthereum() first."
    );
  }
  return emergencyReliefManagerContract;
}

// Function to get token balance
async function getTokenBalance(address) {
  if (!emergencyReliefStablecoinContract) {
    throw new Error("Stablecoin contract not initialized");
  }
  try {
    const balance = await emergencyReliefStablecoinContract.balanceOf(address);
    return balance;
  } catch (error) {
    console.error("Error getting token balance:", error);
    throw error;
  }
}

// Function to transfer tokens
async function transferTokens(to, amount) {
  if (!emergencyReliefStablecoinContract) {
    throw new Error("Stablecoin contract not initialized");
  }
  try {
    const tx = await emergencyReliefStablecoinContract.transfer(to, amount);
    await tx.wait(); // Wait for transaction to be mined
    return tx;
  } catch (error) {
    console.error("Error transferring tokens:", error);
    throw error;
  }
}

module.exports = {
  initializeEthereum,
  getProvider: () => provider,
  getSigner: () => signer,
  getStablecoinContract,
  getManagerContract,
  getTokenBalance,
  transferTokens,
};
