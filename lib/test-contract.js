// Test script to run in browser console
// Copy and paste this into your browser console to test the contract

async function testContract() {
  try {
    console.log('Testing contract connection...');
    
    // Check if we have a wallet
    if (!window.ethereum) {
      console.error('No wallet found');
      return;
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    console.log('Wallet address:', address);
    
    // Contract details
    const CONTRACT_ADDRESS = '0x92b1Bb5DE7CE0C98A66e6350cE8e0B383878c21d';
    const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
    
    console.log('Contract address:', CONTRACT_ADDRESS);
    console.log('USDC address:', USDC_ADDRESS);
    
    // Contract ABI
    const PAY_SPLITTER_ABI = [
      "function platformFeeBps() external view returns (uint256)",
      "function platformReceiver() external view returns (address)",
      "function usdcToken() external view returns (address)",
      "function calculateFees(uint256 amount) external view returns (uint256 platformFee, uint256 creatorAmount)"
    ];
    
    const USDC_ABI = [
      "function balanceOf(address account) external view returns (uint256)",
      "function decimals() external view returns (uint8)"
    ];
    
    // Create contracts
    const contract = new ethers.Contract(CONTRACT_ADDRESS, PAY_SPLITTER_ABI, signer);
    const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
    
    console.log('Contracts created');
    
    // Test contract functions
    try {
      const platformFeeBps = await contract.platformFeeBps();
      console.log('✅ platformFeeBps():', platformFeeBps.toString());
    } catch (error) {
      console.error('❌ platformFeeBps error:', error.message);
    }
    
    try {
      const platformReceiver = await contract.platformReceiver();
      console.log('✅ platformReceiver():', platformReceiver);
    } catch (error) {
      console.error('❌ platformReceiver error:', error.message);
    }
    
    try {
      const usdcToken = await contract.usdcToken();
      console.log('✅ usdcToken():', usdcToken);
    } catch (error) {
      console.error('❌ usdcToken error:', error.message);
    }
    
    // Test USDC balance
    try {
      const balance = await usdcContract.balanceOf(address);
      const decimals = await usdcContract.decimals();
      const formattedBalance = ethers.formatUnits(balance, decimals);
      console.log('✅ USDC Balance:', formattedBalance, 'USDC');
    } catch (error) {
      console.error('❌ USDC balance error:', error.message);
    }
    
    // Test calculateFees
    try {
      const testAmount = ethers.parseUnits("100", 6); // 100 USDC
      const [platformFee, creatorAmount] = await contract.calculateFees(testAmount);
      console.log('✅ calculateFees(100 USDC):');
      console.log('  Platform fee:', ethers.formatUnits(platformFee, 6), 'USDC');
      console.log('  Creator amount:', ethers.formatUnits(creatorAmount, 6), 'USDC');
    } catch (error) {
      console.error('❌ calculateFees error:', error.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testContract();
