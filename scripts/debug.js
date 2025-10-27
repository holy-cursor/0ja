const hre = require("hardhat");

async function main() {
  console.log("🔍 Debugging Hardhat Environment...\n");
  
  console.log("Available in hre:", Object.keys(hre));
  console.log("hre.ethers:", hre.ethers);
  console.log("hre.network:", hre.network);
  console.log("hre.config:", hre.config);
  
  // Try to get accounts
  try {
    const accounts = await hre.ethers.getSigners();
    console.log("✅ Accounts found:", accounts.length);
    console.log("First account:", accounts[0].address);
  } catch (error) {
    console.log("❌ Error getting accounts:", error.message);
  }
  
  // Try to get contract factory
  try {
    const PaySplitter = await hre.ethers.getContractFactory("PaySplitter");
    console.log("✅ Contract factory found");
  } catch (error) {
    console.log("❌ Error getting contract factory:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Debug failed:", error);
    process.exit(1);
  });
