const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying PaySplitter Contract...\n");

  // Get the contract factory using hre.ethers
  const PaySplitter = await hre.ethers.getContractFactory("PaySplitter");

  // Configuration
  const platformFeeBps = 200; // 2%
  const platformReceiver = "0x0000000000000000000000000000000000000000";
  const usdcAddress = "0x0000000000000000000000000000000000000000";

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

  await paySplitter.deployed();

  console.log("✅ PaySplitter deployed successfully!");
  console.log(`📍 Contract Address: ${paySplitter.address}`);

  // Test the contract
  console.log("\n🧪 Testing contract...");
  const fee = await paySplitter.platformFeeBps();
  console.log(`✅ Platform fee: ${fee} bps`);

  const amount = hre.ethers.utils.parseUnits("100", 6); // 100 USDC
  const [platformFee, creatorAmount] = await paySplitter.calculateFees(amount);
  console.log(`✅ Fee calculation test: ${hre.ethers.utils.formatUnits(platformFee, 6)} USDC platform fee, ${hre.ethers.utils.formatUnits(creatorAmount, 6)} USDC to creator`);

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
