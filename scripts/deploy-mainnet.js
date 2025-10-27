const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying PaySplitter to Base mainnet...");

  // Get the contract factory
  const PaySplitter = await ethers.getContractFactory("SimplePaySplitter");

  // Contract parameters for Base mainnet
  const platformReceiver = "0x070e0dF20b5eDf669292342F1F3af114fB98c43d"; // Your wallet
  const usdtToken = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // USDT on Base mainnet
  const platformFeeBps = 200; // 2%

  console.log("Deploying with parameters:");
  console.log("- Platform Receiver:", platformReceiver);
  console.log("- USDT Token:", usdtToken);
  console.log("- Platform Fee (bps):", platformFeeBps);

  // Deploy the contract
  const contract = await PaySplitter.deploy(
    platformReceiver,
    usdtToken,
    platformFeeBps
  );

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("PaySplitter deployed to:", contractAddress);

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
    const testAmount = ethers.parseUnits("100", 6); // 100 USDT
    const [platformFee, creatorAmount] = await contract.calculateFees(testAmount);
    console.log("✓ calculateFees(100 USDT):");
    console.log("  Platform fee:", ethers.formatUnits(platformFee, 6), "USDT");
    console.log("  Creator amount:", ethers.formatUnits(creatorAmount, 6), "USDT");
    
    console.log("\n✅ Contract deployed and tested successfully!");
    console.log("Contract Address:", contractAddress);
    console.log("\n📝 Update your .env.local with:");
    console.log(`NEXT_PUBLIC_PAY_SPLITTER_CONTRACT_ADDRESS=${contractAddress}`);
    
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
