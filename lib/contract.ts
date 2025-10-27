import { ethers } from 'ethers';

// Contract ABI for SimplePaySplitter
const PAY_SPLITTER_ABI = [
  "function payUSDC(bytes32 productId, address creator, uint256 amount) external",
  "function calculateFees(uint256 amount) external view returns (uint256 platformFee, uint256 creatorAmount)",
  "function platformFeeBps() external view returns (uint256)",
  "function platformReceiver() external view returns (address)",
  "function usdcToken() external view returns (address)",
  "event PaymentReceived(bytes32 indexed productId, address indexed buyer, address indexed creator, uint256 amount, address token, uint256 platformFee, uint256 creatorAmount, bytes32 txHash)"
];

// USDC ABI for approvals
const USDC_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PAY_SPLITTER_CONTRACT_ADDRESS || '0x985DDCDeA0362D6eeCE5c2f96d33b4F06b41ca89';
export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // USDC on Base mainnet

console.log('Contract configuration:');
console.log('- Environment variable:', process.env.NEXT_PUBLIC_PAY_SPLITTER_CONTRACT_ADDRESS);
console.log('- Final contract address:', CONTRACT_ADDRESS);
console.log('- USDC address:', USDC_ADDRESS);

export class PaymentContract {
  private contract: ethers.Contract;
  private usdcContract: ethers.Contract;
  private signer: ethers.Signer;

  constructor(signer: ethers.Signer) {
    this.signer = signer;
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, PAY_SPLITTER_ABI, signer);
    this.usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
  }

  async getUSDCBalance(): Promise<string> {
    try {
      const address = await this.signer.getAddress();
      const network = await this.signer.provider.getNetwork();
      
      console.log('Getting USDC balance for address:', address);
      console.log('Current network:', network);
      console.log('USDC contract address:', USDC_ADDRESS);
      
      // Check if we're on the right network
      if (network.chainId !== 8453n) { // Base mainnet chain ID
        console.warn('⚠️ Not on Base mainnet! Current chain ID:', network.chainId);
        console.warn('Expected chain ID: 8453 (Base mainnet)');
      }
      
      // Add retry logic for rate limiting
      let balance, decimals;
      let retries = 3;
      
      while (retries > 0) {
        try {
          balance = await this.usdcContract.balanceOf(address);
          decimals = await this.usdcContract.decimals();
          break;
        } catch (error: any) {
          if (error.code === -32000 && error.message?.includes('429')) {
            console.warn(`Rate limited, retrying... (${4 - retries}/3)`);
            retries--;
            await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries))); // Exponential backoff
            continue;
          }
          throw error;
        }
      }
      
      if (!balance || !decimals) {
        throw new Error('Failed to get USDC balance after retries');
      }
      
      console.log('Raw balance:', balance.toString());
      console.log('Decimals:', decimals);
      
      const formattedBalance = ethers.formatUnits(balance, decimals);
      console.log('Formatted balance:', formattedBalance);
      
      return formattedBalance;
    } catch (error) {
      console.error('Error getting USDC balance:', error);
      return '0';
    }
  }

  async getUSDCAllowance(): Promise<string> {
    const owner = await this.signer.getAddress();
    const allowance = await this.usdcContract.allowance(owner, CONTRACT_ADDRESS);
    const decimals = await this.usdcContract.decimals();
    return ethers.formatUnits(allowance, decimals);
  }

  async approveUSDC(amount: string): Promise<ethers.TransactionResponse> {
    const decimals = await this.usdcContract.decimals();
    const amountWei = ethers.parseUnits(amount, decimals);
    return await this.usdcContract.approve(CONTRACT_ADDRESS, amountWei);
  }

  async payWithUSDC(productId: string, creatorAddress: string, amount: string): Promise<ethers.TransactionResponse> {
    const decimals = await this.usdcContract.decimals();
    const amountWei = ethers.parseUnits(amount, decimals);
    
    // Convert productId to bytes32
    const productIdBytes32 = ethers.keccak256(ethers.toUtf8Bytes(productId));
    
    return await this.contract.payUSDC(productIdBytes32, creatorAddress, amountWei);
  }


  async calculateFees(amount: string): Promise<{ platformFee: string; creatorAmount: string }> {
    const decimals = await this.usdcContract.decimals();
    const amountWei = ethers.parseUnits(amount, decimals);
    const [platformFee, creatorAmount] = await this.contract.calculateFees(amountWei);
    
    return {
      platformFee: ethers.formatUnits(platformFee, decimals),
      creatorAmount: ethers.formatUnits(creatorAmount, decimals)
    };
  }

  async getContractInfo() {
    try {
      const network = await this.signer.provider.getNetwork();
      console.log('Getting contract info...');
      console.log('Contract address:', CONTRACT_ADDRESS);
      console.log('Current network:', network);
      console.log('Environment variable:', process.env.NEXT_PUBLIC_PAY_SPLITTER_CONTRACT_ADDRESS);
      
      // Check if we're on the right network
      if (network.chainId !== 8453n) { // Base mainnet chain ID
        console.warn('⚠️ Not on Base mainnet! Current chain ID:', network.chainId);
        console.warn('Expected chain ID: 8453 (Base mainnet)');
        throw new Error(`Wrong network! Please switch to Base mainnet (Chain ID: 8453). Current: ${network.chainId}`);
      }
      
      const [platformFeeBps, platformReceiver, usdcToken] = await Promise.all([
        this.contract.platformFeeBps(),
        this.contract.platformReceiver(),
        this.contract.usdcToken()
      ]);

      console.log('Contract info loaded:', { platformFeeBps, platformReceiver, usdcToken });

      return {
        platformFeeBps: platformFeeBps.toString(),
        platformFeePercent: (Number(platformFeeBps) / 100).toFixed(2),
        platformReceiver,
        usdcToken
      };
    } catch (error) {
      console.error('Error getting contract info:', error);
      // Return default values if contract calls fail
      return {
        platformFeeBps: "200", // 2% default
        platformFeePercent: "2.00",
        platformReceiver: "0x0000000000000000000000000000000000000000",
        usdcToken: USDC_ADDRESS
      };
    }
  }
}
