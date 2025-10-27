const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying SimplePaySplitter...");

  // Get the contract factory
  const SimplePaySplitter = await ethers.getContractFactory("SimplePaySplitter");

  // Contract parameters
  const platformReceiver = "0x070e0dF20b5eDf669292342F1F3af114fB98c43d"; // Your wallet
  const usdcToken = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Base Sepolia USDC
  const platformFeeBps = 200; // 2%

  console.log("Deploying with parameters:");
  console.log("- Platform Receiver:", platformReceiver);
  console.log("- USDC Token:", usdcToken);
  console.log("- Platform Fee (bps):", platformFeeBps);

  // Deploy the contract
  const contract = await SimplePaySplitter.deploy(
    platformReceiver,
    usdcToken,
    platformFeeBps
  );

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("SimplePaySplitter deployed to:", contractAddress);

  // Test the contract
  console.log("\nTesting contract...");
  
  try {
    const platformFeeBpsResult = await contract.platformFeeBps();
    console.log("✓ platformFeeBps():", platformFeeBpsResult.toString());
    
    const platformReceiverResult = await contract.platformReceiver();
    console.log("✓ platformReceiver():", platformReceiverResult);
    
    const usdcTokenResult = await contract.usdcToken();
    console.log("✓ usdcToken():", usdcTokenResult);
    
    // Test calculateFees
    const testAmount = ethers.parseUnits("100", 6); // 100 USDC
    const [platformFee, creatorAmount] = await contract.calculateFees(testAmount);
    console.log("✓ calculateFees(100 USDC):");
    console.log("  Platform fee:", ethers.formatUnits(platformFee, 6), "USDC");
    console.log("  Creator amount:", ethers.formatUnits(creatorAmount, 6), "USDC");
    
    console.log("\n✅ Contract deployed and tested successfully!");
    console.log("Contract Address:", contractAddress);
    
  } catch (error) {
    console.error("❌ Contract test failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
