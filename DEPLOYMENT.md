# Sellify Deployment Guide

## Quick Setup Checklist

### 1. Environment Variables
Create a `.env.local` file with the following variables:

```env
# Database (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Blockchain (Required)
NEXT_PUBLIC_PAY_SPLITTER_CONTRACT_ADDRESS=your_deployed_contract_address
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# USDC Token Addresses
NEXT_PUBLIC_USDC_BASE=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
NEXT_PUBLIC_USDC_BASE_SEPOLIA=0x036CbD53842c5426634e7929541eC2318f3dCF7e

# Platform (Required for deployment)
PLATFORM_RECEIVER=your_platform_wallet_address_here
PRIVATE_KEY=your_private_key_here
BASESCAN_API_KEY=your_basescan_api_key_here
```

### 2. Database Setup (Supabase)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Run Database Schema**
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `db/schema.sql`
   - Execute the SQL to create tables and policies

3. **Get API Keys**
   - Go to Settings > API
   - Copy the Project URL and anon public key
   - Copy the service_role key (keep this secret!)

### 3. Smart Contract Deployment

#### Option A: Deploy to Base Sepolia (Testnet)
```bash
# Set your private key in .env.local
PRIVATE_KEY=your_private_key_here

# Deploy to testnet
npm run deploy

# Note the deployed contract address
# Update NEXT_PUBLIC_PAY_SPLITTER_CONTRACT_ADDRESS in .env.local
```

#### Option B: Deploy to Base Mainnet
```bash
# Deploy to mainnet
npm run deploy:mainnet

# Verify contract on BaseScan
npm run verify
```

### 4. Frontend Deployment (Vercel)

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set all environment variables in Vercel dashboard

2. **Deploy**
   - Vercel will automatically deploy on push to main branch
   - Your app will be available at your Vercel URL

### 5. Testing the Application

1. **Test Product Creation**
   - Connect your wallet
   - Go to `/create`
   - Create a test product
   - Copy the generated pay link

2. **Test Payment Flow**
   - Open the pay link in a different browser/incognito
   - Connect a different wallet
   - Complete the payment flow
   - Verify download works

3. **Test Dashboard**
   - Go to `/dashboard`
   - Verify your product appears
   - Check earnings and analytics

## Troubleshooting

### Smart Contract Issues
- Make sure OpenZeppelin contracts are installed: `npm install @openzeppelin/contracts`
- Check that your private key has enough ETH for gas fees
- Verify RPC URLs are correct

### Database Issues
- Ensure all environment variables are set correctly
- Check that RLS policies are properly configured
- Verify API keys have correct permissions

### Frontend Issues
- Check browser console for errors
- Verify wallet connection is working
- Ensure all environment variables are set

## Production Checklist

- [ ] Smart contract deployed and verified
- [ ] Database schema applied
- [ ] All environment variables set
- [ ] Frontend deployed to Vercel
- [ ] Tested with real transactions
- [ ] Domain configured (optional)
- [ ] Analytics tracking set up (optional)

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Test with Base Sepolia testnet first
4. Check Supabase logs for database issues
5. Verify smart contract deployment on BaseScan

## Next Steps

After successful deployment:
1. Create your first product
2. Test the complete flow
3. Share with early users
4. Monitor transactions and earnings
5. Iterate based on feedback
