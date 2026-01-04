module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying contracts with account:", deployer);

  // Deploy EmergencyReliefStablecoin
  console.log("\nDeploying EmergencyReliefStablecoin...");
  const stablecoinResult = await deploy("EmergencyReliefStablecoin", {
    from: deployer,
    log: true,
  });
  console.log(
    "EmergencyReliefStablecoin deployed to:",
    stablecoinResult.address
  );

  // Deploy EmergencyReliefManager
  console.log("\nDeploying EmergencyReliefManager...");
  const managerResult = await deploy("EmergencyReliefManager", {
    from: deployer,
    args: [stablecoinResult.address],
    log: true,
  });
  console.log("EmergencyReliefManager deployed to:", managerResult.address);

  console.log("\nDeployment completed successfully!");
  console.log("\nUpdate your .env file with these addresses:");
  console.log(
    `EMERGENCY_RELIEF_STABLECOIN_ADDRESS=${stablecoinResult.address}`
  );
  console.log(`EMERGENCY_RELIEF_MANAGER_ADDRESS=${managerResult.address}`);
};

module.exports.tags = ["EmergencyRelief"];
