const { ethers, run, network } = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  // Get the signer (deployer)
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log(
    "Account balance:",
    (await deployer.provider.getBalance(deployer.address)).toString()
  );

  // Deploy EmergencyReliefStablecoin
  console.log("\nDeploying EmergencyReliefStablecoin...");
  const EmergencyReliefStablecoin = await ethers.getContractFactory(
    "EmergencyReliefStablecoin"
  );
  const stablecoin = await EmergencyReliefStablecoin.deploy();
  await stablecoin.waitForDeployment();
  console.log(
    "EmergencyReliefStablecoin deployed to:",
    await stablecoin.getAddress()
  );

  // Deploy EmergencyReliefManager
  console.log("\nDeploying EmergencyReliefManager...");
  const EmergencyReliefManager = await ethers.getContractFactory(
    "EmergencyReliefManager"
  );
  const manager = await EmergencyReliefManager.deploy(
    await stablecoin.getAddress()
  );
  await manager.waitForDeployment();
  console.log(
    "EmergencyReliefManager deployed to:",
    await manager.getAddress()
  );

  console.log("\nDeployment completed successfully!");
  console.log("\nUpdate your .env file with these addresses:");
  console.log(
    `EMERGENCY_RELIEF_STABLECOIN_ADDRESS=${await stablecoin.getAddress()}`
  );
  console.log(`EMERGENCY_RELIEF_MANAGER_ADDRESS=${await manager.getAddress()}`);

  // Verify if we're on a live network
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\nWaiting for block confirmations before verification...");

    // Wait for confirmations before trying to verify
    await stablecoin.deploymentTransaction().wait(6);
    await manager.deploymentTransaction().wait(6);

    console.log("\nVerifying contracts on Etherscan...");

    try {
      await run("verify:verify", {
        address: await stablecoin.getAddress(),
        constructorArguments: [],
      });

      await run("verify:verify", {
        address: await manager.getAddress(),
        constructorArguments: [await stablecoin.getAddress()],
      });

      console.log("Verification completed!");
    } catch (error) {
      console.log("Verification failed:", error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
