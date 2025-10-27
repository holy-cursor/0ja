const { ethers } = require("hardhat");

async function main() {
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  
  console.log("Checking USDC contract at:", USDC_ADDRESS);
  
  try {
    // Check if contract has code
    const code = await ethers.provider.getCode(USDC_ADDRESS);
    console.log("USDC contract code length:", code.length);
    console.log("USDC contract has code:", code !== "0x");
    
    if (code === "0x") {
      console.log("❌ USDC contract has no code - address is incorrect");
      
      // Try some common USDC addresses for Base Sepolia
      const commonAddresses = [
        "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base mainnet USDC
        "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", // Base mainnet DAI
        "0x4200000000000000000000000000000000000006", // WETH
        "0x0000000000000000000000000000000000000000"  // Zero address
      ];
      
      console.log("\nTrying common addresses...");
      for (const addr of commonAddresses) {
        const addrCode = await ethers.provider.getCode(addr);
        console.log(`${addr}: ${addrCode.length} bytes`);
      }
      
      return;
    }
    
    console.log("✅ USDC contract has code");
    
    // Try to call balanceOf function
    const USDC_ABI = [
      "function balanceOf(address account) external view returns (uint256)",
      "function decimals() external view returns (uint8)",
      "function symbol() external view returns (string)",
      "function name() external view returns (string)"
    ];
    
    const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, ethers.provider);
    
    try {
      const symbol = await usdcContract.symbol();
      console.log("✅ Symbol:", symbol);
    } catch (error) {
      console.error("❌ Symbol error:", error.message);
    }
    
    try {
      const name = await usdcContract.name();
      console.log("✅ Name:", name);
    } catch (error) {
      console.error("❌ Name error:", error.message);
    }
    
    try {
      const decimals = await usdcContract.decimals();
      console.log("✅ Decimals:", decimals);
    } catch (error) {
      console.error("❌ Decimals error:", error.message);
    }
    
    // Test with a random address
    const testAddress = "0x1234567890123456789012345678901234567890";
    try {
      const balance = await usdcContract.balanceOf(testAddress);
      console.log("✅ Balance of test address:", balance.toString());
    } catch (error) {
      console.error("❌ Balance error:", error.message);
    }
    
  } catch (error) {
    console.error("Error checking USDC contract:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
