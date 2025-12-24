// firebase/ethereumSync.js
const { db, admin } = require("./config");
const { COLLECTIONS } = require("./firestore_schema");
const UserManager = require("./userManager");
const DisasterManager = require("./disasterManager");
const VendorManager = require("./vendorManager");
const CategoryManager = require("./categoryManager");

// Import contract ABIs (these would typically be imported from a separate file)
// For this example, we'll define minimal ABI structures
const CONTRACT_ABIS = {
  stablecoin: [
    // ERC20 events
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)",
    // Custom events
    "event SpendingLimitSet(address indexed beneficiary, uint256 limit)",
    "event CategoryLimitSet(bytes32 indexed category, uint256 limit)",
    "event CategorySpent(address indexed beneficiary, address indexed vendor, bytes32 indexed category, uint256 amount)",
    "event BeneficiaryWhitelisted(address indexed beneficiary, bool status)",
    "event VendorWhitelisted(address indexed vendor, bool status)",
    "event FundsDonated(address indexed donor, address indexed token, uint256 amount)",
  ],
  manager: [
    // Custom events
    "event DonorAdded(address indexed donor)",
    "event BeneficiaryAdded(address indexed beneficiary)",
    "event VendorAdded(address indexed vendor)",
    "event FundsDeposited(address indexed donor, uint256 amount)",
    "event BeneficiaryWhitelisted(address indexed beneficiary, uint256 eventId, bool status)",
    "event VendorWhitelisted(address indexed vendor, bool status)",
    "event FundsDistributed(address indexed beneficiary, uint256 amount, uint256 eventId)",
    "event EmergencyEventCreated(uint256 indexed eventId, string name, uint256 targetFunding)",
    "event FundsSpent(address indexed beneficiary, address indexed vendor, uint256 amount, bytes32 category)",
    "event ERC20DonationReceived(address indexed donor, address indexed token, uint256 amount)",
  ],
};

class EthereumSync {
  constructor(providerUrl, stablecoinAddress, managerAddress) {
    this.providerUrl = providerUrl;
    this.stablecoinAddress = stablecoinAddress;
    this.managerAddress = managerAddress;
    this.provider = null;
    this.stablecoinContract = null;
    this.managerContract = null;
  }

  // Initialize Web3 provider and contracts
  async initialize() {
    try {
      // Import ethers dynamically to avoid hard dependencies
      const ethers = await import("ethers");

      // Create provider
      this.provider = new ethers.JsonRpcProvider(this.providerUrl);

      // Create contract instances
      this.stablecoinContract = new ethers.Contract(
        this.stablecoinAddress,
        CONTRACT_ABIS.stablecoin,
        this.provider
      );

      this.managerContract = new ethers.Contract(
        this.managerAddress,
        CONTRACT_ABIS.manager,
        this.provider
      );

      console.log("Ethereum sync initialized successfully");
    } catch (error) {
      console.error("Error initializing Ethereum sync:", error);
      throw error;
    }
  }

  // Sync all events from a specific block
  async syncEvents(fromBlock, toBlock = "latest") {
    try {
      console.log(`Syncing events from block ${fromBlock} to ${toBlock}`);

      // Sync manager contract events
      await this.syncManagerEvents(fromBlock, toBlock);

      // Sync stablecoin contract events
      await this.syncStablecoinEvents(fromBlock, toBlock);

      console.log("Event sync completed successfully");
    } catch (error) {
      console.error("Error syncing events:", error);
      throw error;
    }
  }

  // Sync manager contract events
  async syncManagerEvents(fromBlock, toBlock) {
    try {
      // Sync EmergencyEventCreated events
      const eventFilter = this.managerContract.filters.EmergencyEventCreated();
      const events = await this.managerContract.queryFilter(
        eventFilter,
        fromBlock,
        toBlock
      );

      for (const event of events) {
        const { args } = event;
        const eventData = {
          id: args.eventId.toString(),
          name: args.name,
          targetFunding: parseFloat(args.targetFunding.toString()),
          status: "active",
          currentFunding: 0,
          createdAt: new Date(event.blockTimestamp * 1000),
          updatedAt: new Date(event.blockTimestamp * 1000),
        };

        // Create disaster event in Firestore
        await db
          .collection(COLLECTIONS.DISASTERS)
          .doc(eventData.id)
          .set(
            {
              ...eventData,
              metadata: {
                stats: {
                  beneficiariesCount: 0,
                  fundsDistributed: 0,
                  vendorsActive: 0,
                },
              },
            },
            { merge: true }
          );

        console.log(`Synced EmergencyEventCreated: ${args.eventId}`);
      }

      // Sync FundsDistributed events
      const fundsDistributedFilter =
        this.managerContract.filters.FundsDistributed();
      const fundsDistributedEvents = await this.managerContract.queryFilter(
        fundsDistributedFilter,
        fromBlock,
        toBlock
      );

      for (const event of fundsDistributedEvents) {
        const { args } = event;
        const transactionData = {
          id: `tx_${event.transactionHash}_${event.logIndex}`,
          type: "distribution",
          from: { type: "contract", id: this.managerAddress },
          to: { type: "beneficiary", id: args.beneficiary },
          amount: parseFloat(args.amount.toString()),
          eventId: args.eventId.toString(),
          description: "Fund distribution to beneficiary",
          ethereumTxHash: event.transactionHash,
          status: "completed",
          timestamp: new Date(event.blockTimestamp * 1000),
          createdBy: "system",
        };

        // Add to transactions collection
        await db.collection(COLLECTIONS.TRANSACTIONS).add(transactionData);

        // Update disaster funding
        await DisasterManager.updateDisasterFunding(
          args.eventId.toString(),
          args.amount.toString(),
          "add"
        );

        console.log(
          `Synced FundsDistributed: ${args.beneficiary} - ${args.amount}`
        );
      }

      // Sync FundsSpent events
      const fundsSpentFilter = this.managerContract.filters.FundsSpent();
      const fundsSpentEvents = await this.managerContract.queryFilter(
        fundsSpentFilter,
        fromBlock,
        toBlock
      );

      for (const event of fundsSpentEvents) {
        const { args } = event;
        const transactionData = {
          id: `tx_${event.transactionHash}_${event.logIndex}`,
          type: "spending",
          from: { type: "beneficiary", id: args.beneficiary },
          to: { type: "vendor", id: args.vendor },
          amount: parseFloat(args.amount.toString()),
          category: ethers.decodeBytes32String(args.category),
          description: "Vendor spending on behalf of beneficiary",
          ethereumTxHash: event.transactionHash,
          status: "completed",
          timestamp: new Date(event.blockTimestamp * 1000),
          createdBy: "system",
        };

        // Add to transactions collection
        await db.collection(COLLECTIONS.TRANSACTIONS).add(transactionData);

        console.log(
          `Synced FundsSpent: ${args.beneficiary} -> ${args.vendor} - ${args.amount}`
        );
      }

      // Sync BeneficiaryWhitelisted events
      const beneficiaryWhitelistFilter =
        this.managerContract.filters.BeneficiaryWhitelisted();
      const beneficiaryWhitelistEvents = await this.managerContract.queryFilter(
        beneficiaryWhitelistFilter,
        fromBlock,
        toBlock
      );

      for (const event of beneficiaryWhitelistEvents) {
        const { args } = event;
        const userId = args.beneficiary; // Using Ethereum address as user ID for now

        // Update user profile to set role
        const userData = {
          ethereumAddress: userId,
          role: "beneficiary",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await UserManager.createUserProfile(userId, userData);

        console.log(`Synced BeneficiaryWhitelisted: ${args.beneficiary}`);
      }

      // Sync VendorWhitelisted events
      const vendorWhitelistFilter =
        this.managerContract.filters.VendorWhitelisted();
      const vendorWhitelistEvents = await this.managerContract.queryFilter(
        vendorWhitelistFilter,
        fromBlock,
        toBlock
      );

      for (const event of vendorWhitelistEvents) {
        const { args } = event;
        const userId = args.vendor; // Using Ethereum address as user ID for now

        // Create or update vendor profile
        const vendorData = {
          userId: userId,
          ethereumAddress: userId,
          businessName: `Vendor ${userId.substring(0, 8)}`, // Default name
          verificationStatus: "verified",
          whitelisted: args.status,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // Check if vendor already exists, if not create a new one
        const existingVendor = await this.getVendorByEthereumAddress(userId);
        if (!existingVendor) {
          await db.collection(COLLECTIONS.VENDORS).add(vendorData);
        } else {
          await db
            .collection(COLLECTIONS.VENDORS)
            .doc(existingVendor.id)
            .update({
              whitelisted: args.status,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }

        // Update user role
        const userData = {
          ethereumAddress: userId,
          role: "vendor",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await UserManager.createUserProfile(userId, userData);

        console.log(
          `Synced VendorWhitelisted: ${args.vendor} - ${args.status}`
        );
      }
    } catch (error) {
      console.error("Error syncing manager events:", error);
      throw error;
    }
  }

  // Sync stablecoin contract events
  async syncStablecoinEvents(fromBlock, toBlock) {
    try {
      // Sync CategorySpent events
      const categorySpentFilter =
        this.stablecoinContract.filters.CategorySpent();
      const categorySpentEvents = await this.stablecoinContract.queryFilter(
        categorySpentFilter,
        fromBlock,
        toBlock
      );

      for (const event of categorySpentEvents) {
        const { args } = event;
        const category = ethers.decodeBytes32String(args.category);
        const transactionData = {
          id: `tx_${event.transactionHash}_${event.logIndex}`,
          type: "category_spending",
          from: { type: "beneficiary", id: args.beneficiary },
          to: { type: "vendor", id: args.vendor },
          amount: parseFloat(args.amount.toString()),
          category: category,
          description: `Spending in ${category} category`,
          ethereumTxHash: event.transactionHash,
          status: "completed",
          timestamp: new Date(event.blockTimestamp * 1000),
          createdBy: "system",
        };

        // Add to transactions collection
        await db.collection(COLLECTIONS.TRANSACTIONS).add(transactionData);

        console.log(
          `Synced CategorySpent: ${args.beneficiary} -> ${args.vendor} - ${category} - ${args.amount}`
        );
      }

      // Sync FundsDonated events
      const fundsDonatedFilter = this.stablecoinContract.filters.FundsDonated();
      const fundsDonatedEvents = await this.stablecoinContract.queryFilter(
        fundsDonatedFilter,
        fromBlock,
        toBlock
      );

      for (const event of fundsDonatedEvents) {
        const { args } = event;
        const donationData = {
          id: `donation_${event.transactionHash}_${event.logIndex}`,
          donorId: args.donor,
          ethereumAddress: args.donor,
          amount: parseFloat(args.amount.toString()),
          currency: "ERC20", // Could be expanded to detect token type
          status: "completed",
          ethereumTxHash: event.transactionHash,
          timestamp: new Date(event.blockTimestamp * 1000),
          metadata: {
            paymentMethod: "ERC20",
          },
        };

        // Add to donations collection
        await db.collection(COLLECTIONS.DONATIONS).add(donationData);

        console.log(`Synced FundsDonated: ${args.donor} - ${args.amount}`);
      }
    } catch (error) {
      console.error("Error syncing stablecoin events:", error);
      throw error;
    }
  }

  // Get vendor by Ethereum address
  async getVendorByEthereumAddress(ethereumAddress) {
    try {
      const snapshot = await db
        .collection(COLLECTIONS.VENDORS)
        .where("ethereumAddress", "==", ethereumAddress)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting vendor by Ethereum address:", error);
      return null;
    }
  }

  // Start listening for new events (continuous sync)
  async startEventListener() {
    try {
      if (!this.managerContract) {
        throw new Error("Ethereum sync not initialized");
      }

      // Listen for new EmergencyEventCreated events
      this.managerContract.on(
        "EmergencyEventCreated",
        async (eventId, name, targetFunding, event) => {
          try {
            const eventData = {
              id: eventId.toString(),
              name: name,
              targetFunding: parseFloat(targetFunding.toString()),
              status: "active",
              currentFunding: 0,
              createdAt: new Date(event.blockTimestamp * 1000),
              updatedAt: new Date(event.blockTimestamp * 1000),
            };

            await db
              .collection(COLLECTIONS.DISASTERS)
              .doc(eventData.id)
              .set(
                {
                  ...eventData,
                  metadata: {
                    stats: {
                      beneficiariesCount: 0,
                      fundsDistributed: 0,
                      vendorsActive: 0,
                    },
                  },
                },
                { merge: true }
              );

            console.log(`Real-time sync: EmergencyEventCreated: ${eventId}`);
          } catch (error) {
            console.error(
              "Error processing EmergencyEventCreated event:",
              error
            );
          }
        }
      );

      // Listen for new FundsDistributed events
      this.managerContract.on(
        "FundsDistributed",
        async (beneficiary, amount, eventId, event) => {
          try {
            const transactionData = {
              id: `tx_${event.transactionHash}_${event.logIndex}`,
              type: "distribution",
              from: { type: "contract", id: this.managerAddress },
              to: { type: "beneficiary", id: beneficiary },
              amount: parseFloat(amount.toString()),
              eventId: eventId.toString(),
              description: "Fund distribution to beneficiary",
              ethereumTxHash: event.transactionHash,
              status: "completed",
              timestamp: new Date(event.blockTimestamp * 1000),
              createdBy: "system",
            };

            await db.collection(COLLECTIONS.TRANSACTIONS).add(transactionData);

            await DisasterManager.updateDisasterFunding(
              eventId.toString(),
              amount.toString(),
              "add"
            );

            console.log(
              `Real-time sync: FundsDistributed: ${beneficiary} - ${amount}`
            );
          } catch (error) {
            console.error("Error processing FundsDistributed event:", error);
          }
        }
      );

      // Listen for new FundsSpent events
      this.managerContract.on(
        "FundsSpent",
        async (beneficiary, vendor, amount, category, event) => {
          try {
            const categoryName = ethers.decodeBytes32String(category);
            const transactionData = {
              id: `tx_${event.transactionHash}_${event.logIndex}`,
              type: "spending",
              from: { type: "beneficiary", id: beneficiary },
              to: { type: "vendor", id: vendor },
              amount: parseFloat(amount.toString()),
              category: categoryName,
              description: "Vendor spending on behalf of beneficiary",
              ethereumTxHash: event.transactionHash,
              status: "completed",
              timestamp: new Date(event.blockTimestamp * 1000),
              createdBy: "system",
            };

            await db.collection(COLLECTIONS.TRANSACTIONS).add(transactionData);

            console.log(
              `Real-time sync: FundsSpent: ${beneficiary} -> ${vendor} - ${amount}`
            );
          } catch (error) {
            console.error("Error processing FundsSpent event:", error);
          }
        }
      );

      console.log("Started real-time event listener");
    } catch (error) {
      console.error("Error starting event listener:", error);
      throw error;
    }
  }

  // Stop listening for events
  stopEventListener() {
    if (this.managerContract) {
      this.managerContract.removeAllListeners();
      console.log("Stopped event listeners");
    }
  }
}

module.exports = EthereumSync;
