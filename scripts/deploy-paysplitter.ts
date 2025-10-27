import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying PaySplitter Contract...\n");

  // Get the contract factory
  const PaySplitter = await ethers.getContractFactory("PaySplitter");

  // Configuration
  const platformFeeBps = 200; // 2% platform fee
  const platformReceiver = process.env.PLATFORM_RECEIVER || "0x0000000000000000000000000000000000000000";
  
  // USDC addresses for different networks
  const usdcAddresses = {
    base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base Mainnet USDC
    baseSepolia: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia USDC
    ethereum: "0xA0b86a33E6441b8c4C8C0d4e8C0d4e8C0d4e8C0d", // Ethereum USDC (placeholder)
  };

  // Get network name
  const network = await ethers.provider.getNetwork();
  const networkName = network.name;
  
  console.log(`📡 Network: ${networkName} (${network.chainId})`);
  
  // Select USDC address based on network
  let usdcAddress: string;
  if (networkName === "base") {
    usdcAddress = usdcAddresses.base;
  } else if (networkName === "base-sepolia") {
    usdcAddress = usdcAddresses.baseSepolia;
  } else {
    console.log("⚠️  Unknown network, using Base Sepolia USDC address");
    usdcAddress = usdcAddresses.baseSepolia;
  }

  console.log(`💰 USDC Address: ${usdcAddress}`);
  console.log(`📊 Platform Fee: ${platformFeeBps} bps (${platformFeeBps / 100}%)`);
  console.log(`🏦 Platform Receiver: ${platformReceiver}`);

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
  console.log(`🔗 Explorer: https://basescan.org/address/${paySplitter.address}`);

  // Verify contract on Basescan
  if (process.env.BASESCAN_API_KEY) {
    console.log("\n🔍 Verifying contract on Basescan...");
    try {
      await paySplitter.deployTransaction.wait(6); // Wait for 6 confirmations
      await hre.run("verify:verify", {
        address: paySplitter.address,
        constructorArguments: [platformFeeBps, platformReceiver, usdcAddress],
      });
      console.log("✅ Contract verified on Basescan!");
    } catch (error) {
      console.log("⚠️  Contract verification failed:", error);
    }
  } else {
    console.log("⚠️  BASESCAN_API_KEY not set, skipping verification");
  }

  // Save deployment info
  const deploymentInfo = {
    network: networkName,
    chainId: network.chainId.toString(),
    contractAddress: paySplitter.address,
    platformFeeBps,
    platformReceiver,
    usdcAddress,
    deployer: await paySplitter.signer.getAddress(),
    transactionHash: paySplitter.deployTransaction.hash,
    blockNumber: paySplitter.deployTransaction.blockNumber,
    timestamp: new Date().toISOString(),
  };

  console.log("\n📋 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Save to file
  const fs = require('fs');
  const deploymentsDir = './deployments';
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  const filename = `${deploymentsDir}/paysplitter-${networkName}-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Deployment info saved to: ${filename}`);

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📝 Next steps:");
  console.log("1. Update your .env.local with the contract address");
  console.log("2. Update your frontend to use the new contract");
  console.log("3. Test the payment flow with real USDC");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
