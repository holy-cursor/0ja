const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying PaySplitter Contract...\n");

  // Get the contract factory
  const PaySplitter = await ethers.getContractFactory("PaySplitter");

  // Configuration
  const platformFeeBps = 200; // 2%
  const platformReceiver = "0x070e0dF20b5eDf669292342F1F3af114fB98c43d"; // Your actual wallet address
  const usdcAddress = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // USDC on Base Sepolia

  console.log(`📊 Platform Fee: ${platformFeeBps} bps (${platformFeeBps / 100}%)`);
  console.log(`🏦 Platform Receiver: ${platformReceiver}`);
  console.log(`💰 USDC Address: ${usdcAddress}`);

  // Deploy the contract
  console.log("\n⏳ Deploying contract...");
  const paySplitter = await PaySplitter.deploy(
    platformFeeBps,
    platformReceiver,
    usdcAddress
  );

  await paySplitter.waitForDeployment();

  const contractAddress = await paySplitter.getAddress();
  console.log("✅ PaySplitter deployed successfully!");
  console.log(`📍 Contract Address: ${contractAddress}`);

  // Test the contract
  console.log("\n🧪 Testing contract...");
  const fee = await paySplitter.platformFeeBps();
  console.log(`✅ Platform fee: ${fee} bps`);

  const amount = ethers.parseUnits("100", 6); // 100 USDC
  const [platformFee, creatorAmount] = await paySplitter.calculateFees(amount);
  console.log(`✅ Fee calculation test: ${ethers.formatUnits(platformFee, 6)} USDC platform fee, ${ethers.formatUnits(creatorAmount, 6)} USDC to creator`);

  console.log("\n🎉 Deployment and testing completed successfully!");
  console.log("\n📝 Next steps:");
  console.log("1. Copy the contract address above");
  console.log("2. Update your frontend to use this contract");
  console.log("3. Test with real USDC on Base Sepolia");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
