const { ethers } = require("hardhat");

async function main() {
  const privateKey = "0xe132cd406cf9d56f6959dd6d40a6b85c4a175be755577d442654aa393896847f";
  const wallet = new ethers.Wallet(privateKey);
  
  console.log("🔑 Private Key:", privateKey);
  console.log("📍 Wallet Address:", wallet.address);
  console.log("\n✅ Use this address as your platform receiver!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
