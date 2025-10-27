const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x92b1Bb5DE7CE0C98A66e6350cE8e0B383878c21d";
  
  console.log("Checking contract code at:", contractAddress);
  
  try {
    // Check if contract has code
    const code = await ethers.provider.getCode(contractAddress);
    console.log("Contract code length:", code.length);
    console.log("Contract has code:", code !== "0x");
    
    if (code === "0x") {
      console.log("❌ Contract has no code - deployment failed");
      return;
    }
    
    console.log("✅ Contract has code - deployment successful");
    
    // Try to get the contract factory and attach
    const SimplePaySplitter = await ethers.getContractFactory("SimplePaySplitter");
    const contract = SimplePaySplitter.attach(contractAddress);
    
    console.log("Contract attached successfully");
    
    // Wait a bit for the contract to be fully available
    console.log("Waiting 5 seconds for contract to be fully available...");
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Try to call functions
    try {
      const platformFeeBps = await contract.platformFeeBps();
      console.log("✅ platformFeeBps():", platformFeeBps.toString());
    } catch (error) {
      console.error("❌ Error calling platformFeeBps:", error.message);
    }
    
    try {
      const platformReceiver = await contract.platformReceiver();
      console.log("✅ platformReceiver():", platformReceiver);
    } catch (error) {
      console.error("❌ Error calling platformReceiver:", error.message);
    }
    
    try {
      const usdcToken = await contract.usdcToken();
      console.log("✅ usdcToken():", usdcToken);
    } catch (error) {
      console.error("❌ Error calling usdcToken:", error.message);
    }
    
  } catch (error) {
    console.error("Error checking contract:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
