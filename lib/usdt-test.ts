import { ethers } from 'ethers';

// Simple USDT balance checker
export async function checkUSDTBalanceDirectly(walletAddress: string) {
  try {
    if (!window.ethereum) {
      throw new Error('No wallet found');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7'; // USDT on Base mainnet
    
    // USDT ABI
    const USDT_ABI = [
      "function balanceOf(address account) external view returns (uint256)",
      "function decimals() external view returns (uint8)"
    ];

    const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, provider);
    
    console.log('Checking USDT balance directly...');
    console.log('Wallet address:', walletAddress);
    console.log('USDT contract:', USDT_ADDRESS);
    
    const balance = await usdtContract.balanceOf(walletAddress);
    const decimals = await usdtContract.decimals();
    const formattedBalance = ethers.formatUnits(balance, decimals);
    
    console.log('Raw balance:', balance.toString());
    console.log('Decimals:', decimals);
    console.log('Formatted balance:', formattedBalance);
    
    return {
      raw: balance.toString(),
      formatted: formattedBalance,
      decimals: decimals
    };
  } catch (error) {
    console.error('Error checking USDT balance:', error);
    throw error;
  }
}
