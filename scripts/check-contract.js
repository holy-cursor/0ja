const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0xF45761002AD8b2Cf6f73D03F4d5b826E0c210017";
  
  console.log("Checking contract at:", contractAddress);
  
  try {
    // Get the contract factory
    const PaySplitter = await ethers.getContractFactory("PaySplitter");
    
    // Attach to the deployed contract
    const contract = PaySplitter.attach(contractAddress);
    
    console.log("Contract attached successfully");
    
    // Try to call some functions
    try {
      const platformFeeBps = await contract.platformFeeBps();
      console.log("platformFeeBps:", platformFeeBps.toString());
    } catch (error) {
      console.error("Error calling platformFeeBps:", error.message);
    }
    
    try {
      const platformReceiver = await contract.platformReceiver();
      console.log("platformReceiver:", platformReceiver);
    } catch (error) {
      console.error("Error calling platformReceiver:", error.message);
    }
    
    try {
      const usdcToken = await contract.usdcToken();
      console.log("usdcToken:", usdcToken);
    } catch (error) {
      console.error("Error calling usdcToken:", error.message);
    }
    
    // Check if contract has code
    const code = await ethers.provider.getCode(contractAddress);
    console.log("Contract code length:", code.length);
    console.log("Contract has code:", code !== "0x");
    
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
