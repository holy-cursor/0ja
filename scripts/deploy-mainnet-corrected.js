const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying PaySplitter to Base mainnet...");
  
  // Get the deployer account
  const signers = await ethers.getSigners();
  console.log("Available signers:", signers.length);
  
  if (signers.length === 0) {
    throw new Error("No signers available. Please check your private key and network configuration.");
  }
  
  const deployer = signers[0];
  console.log("Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    throw new Error("Insufficient balance for deployment");
  }
  
  // Get the contract factory
  const PaySplitter = await ethers.getContractFactory("PaySplitter");
  
  // Deployment parameters - USDC on Base mainnet
  const platformReceiver = "0x070e0dF20b5eDf669292342F1F3af114fB98c43d";
  const usdcToken = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // USDC on Base mainnet
  const platformFeeBps = 200; // 2%
  
  console.log("Deploying with parameters:");
  console.log("- Platform Receiver:", platformReceiver);
  console.log("- USDC Token:", usdcToken);
  console.log("- Platform Fee (bps):", platformFeeBps);
  
  // Deploy the contract
  console.log("Deploying contract...");
  const paySplitter = await PaySplitter.deploy(
    platformFeeBps,
    platformReceiver,
    usdcToken
  );
  
  console.log("Waiting for deployment...");
  await paySplitter.waitForDeployment();
  
  const contractAddress = await paySplitter.getAddress();
  console.log("✅ PaySplitter deployed to:", contractAddress);
  
  // Verify deployment
  console.log("Verifying deployment...");
  const platformFee = await paySplitter.platformFeeBps();
  const platformReceiverAddr = await paySplitter.platformReceiver();
  const usdcTokenAddr = await paySplitter.usdcToken();
  
  console.log("✅ Platform Fee:", platformFee.toString(), "bps");
  console.log("✅ Platform Receiver:", platformReceiverAddr);
  console.log("✅ USDC Token:", usdcTokenAddr);
  
  console.log("\n🎉 Deployment successful!");
  console.log("Contract Address:", contractAddress);
  console.log("Base Explorer:", `https://basescan.org/address/${contractAddress}`);
  
  // Save the address to a file
  const fs = require('fs');
  const config = {
    contractAddress: contractAddress,
    platformReceiver: platformReceiver,
    usdcToken: usdcToken,
    platformFeeBps: platformFeeBps,
    deployedAt: new Date().toISOString()
  };
  
  fs.writeFileSync('deployment-config.json', JSON.stringify(config, null, 2));
  console.log("✅ Deployment config saved to deployment-config.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
