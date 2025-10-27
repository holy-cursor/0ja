// Simple script to check USDC balance on Base mainnet
// Run this in browser console

export async function checkUSDCBalanceDirectly(walletAddress: string) {
  try {
    if (!window.ethereum) {
      throw new Error('No wallet found');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    
    console.log('Wallet address:', walletAddress);
    console.log('Current network:', network);
    
    // Check if we're on Base mainnet
    if (network.chainId !== 8453n) {
      throw new Error(`Not on Base mainnet! Current chain ID: ${network.chainId}. Please switch to Base mainnet (Chain ID: 8453)`);
    }
    
    console.log('✅ On Base mainnet');
    
    // USDC contract on Base mainnet
    const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
    const USDC_ABI = [
      "function balanceOf(address account) external view returns (uint256)",
      "function decimals() external view returns (uint8)",
      "function symbol() external view returns (string)",
      "function name() external view returns (string)"
    ];
    
    const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
    
    console.log('Checking USDC contract...');
    
    try {
      const symbol = await usdcContract.symbol();
      console.log('✅ USDC Symbol:', symbol);
    } catch (error) {
      console.error('❌ Error getting symbol:', error.message);
    }
    
    try {
      const name = await usdcContract.name();
      console.log('✅ USDC Name:', name);
    } catch (error) {
      console.error('❌ Error getting name:', error.message);
    }
    
    try {
      const balance = await usdcContract.balanceOf(walletAddress);
      const decimals = await usdcContract.decimals();
      const formatted = ethers.formatUnits(balance, decimals);
      
      console.log('✅ USDC Balance:', formatted);
      
      return {
        raw: balance.toString(),
        formatted: formatted,
        decimals: decimals
      };
    } catch (error) {
      console.error('❌ Error getting balance:', error.message);
      throw error;
    }
    
  } catch (error) {
    console.error('Error checking USDC balance:', error);
    throw error;
  }
}