// Simple script to check USDT balance on Base mainnet
// Run this in browser console

async function checkUSDTOnBase() {
  try {
    if (!window.ethereum) {
      console.error('No wallet found');
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();
    
    console.log('Wallet address:', address);
    console.log('Current network:', network);
    
    // Check if we're on Base mainnet
    if (network.chainId !== 8453n) {
      console.error('❌ Not on Base mainnet! Current chain ID:', network.chainId);
      console.log('Please switch to Base mainnet (Chain ID: 8453)');
      return;
    }
    
    console.log('✅ On Base mainnet');
    
    // USDT contract on Base mainnet
    const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
    const USDT_ABI = [
      "function balanceOf(address account) external view returns (uint256)",
      "function decimals() external view returns (uint8)",
      "function symbol() external view returns (string)",
      "function name() external view returns (string)"
    ];
    
    const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, provider);
    
    console.log('Checking USDT contract...');
    
    try {
      const symbol = await usdtContract.symbol();
      console.log('✅ USDT Symbol:', symbol);
    } catch (error) {
      console.error('❌ Error getting symbol:', error.message);
    }
    
    try {
      const name = await usdtContract.name();
      console.log('✅ USDT Name:', name);
    } catch (error) {
      console.error('❌ Error getting name:', error.message);
    }
    
    try {
      const balance = await usdtContract.balanceOf(address);
      const decimals = await usdtContract.decimals();
      const formattedBalance = ethers.formatUnits(balance, decimals);
      
      console.log('✅ USDT Balance:', formattedBalance, 'USDT');
      
      if (balance === 0n) {
        console.log('⚠️ You have 0 USDT on Base mainnet');
        console.log('You need to:');
        console.log('1. Bridge USDT to Base mainnet, or');
        console.log('2. Buy USDT on Base mainnet, or');
        console.log('3. Use a different token');
      } else {
        console.log('✅ You have USDT! Ready to test payments.');
      }
      
    } catch (error) {
      console.error('❌ Error getting balance:', error.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the check
checkUSDTOnBase();
