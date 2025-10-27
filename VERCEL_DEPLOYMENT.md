# Sellify - Vercel Deployment Guide

## Prerequisites

Before deploying, make sure you have:
- ✅ A GitHub account with your code pushed
- ✅ A Vercel account (sign up at vercel.com)
- ✅ Clerk account set up (clerk.com)
- ✅ Supabase project created (supabase.com)
- ✅ WalletConnect Project ID (cloud.walletconnect.com)
- ✅ Smart contract deployed to Base (if using mainnet)

---

## Method 1: Deploy via Vercel Dashboard (Recommended for First Time)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### Step 2: Import to Vercel
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `sellify` repository
4. Vercel will auto-detect Next.js settings

### Step 3: Configure Project
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (leave as default)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)

### Step 4: Add Environment Variables
Click "Environment Variables" and add all variables from the list below.

### Step 5: Deploy
Click "Deploy" and wait 2-3 minutes for the build to complete.

---

## Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```
This will open your browser to authenticate.

### Step 3: Link Project (First Time)
```bash
cd /path/to/sellify
vercel link
```
Answer the prompts:
- Set up and deploy? **Y**
- Scope: Select your account
- Link to existing project? **N** (first time)
- Project name: **sellify** (or your preferred name)

### Step 4: Add Environment Variables via CLI
```bash
# Add production environment variables
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID production
vercel env add NEXT_PUBLIC_PAY_SPLITTER_CONTRACT_ADDRESS production
vercel env add PLATFORM_RECEIVER production

# Add preview/development variables (optional)
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY preview
vercel env add CLERK_SECRET_KEY preview
# ... repeat for other variables
```

### Step 5: Deploy to Preview (Test First)
```bash
vercel
```
This creates a preview deployment with a temporary URL.

### Step 6: Deploy to Production
```bash
vercel --prod
```

### Step 7: View Deployment
```bash
vercel inspect
```

---

## Required Environment Variables

### 🔐 Authentication (Clerk)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/signin
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 💾 Database (Supabase)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 🔗 Web3 & Blockchain
```
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=abc123...
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_USDC_BASE=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
NEXT_PUBLIC_USDC_BASE_SEPOLIA=0x036CbD53842c5426634e7929541eC2318f3dCF7e
NEXT_PUBLIC_PAY_SPLITTER_CONTRACT_ADDRESS=0x... (your deployed contract)
```

### ⚙️ Platform Settings
```
PLATFORM_RECEIVER=0x... (your platform wallet address)
PLATFORM_FEE_BPS=200
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 🛠️ Optional (for contract deployment/verification)
```
BASESCAN_API_KEY=your_basescan_api_key
PRIVATE_KEY=0x... (keep this secure!)
```

---

## Post-Deployment Checklist

### 1. Update Clerk Settings
- Go to Clerk Dashboard → Your App → Settings
- Add your production domain to **Allowed Origins**:
  - `https://your-app.vercel.app`
- Update **Redirect URLs**

### 2. Update WalletConnect Settings
- Go to WalletConnect Cloud Dashboard
- Add your production URL to **Allowed Origins**

### 3. Test Critical Flows
- [ ] Sign up new user
- [ ] Sign in existing user
- [ ] Connect wallet
- [ ] Create product
- [ ] View product page
- [ ] Make test payment (with testnet)

### 4. Update DNS (Custom Domain - Optional)
```bash
# If you want a custom domain like sellify.com
vercel domains add sellify.com
```
Then update your DNS records as instructed.

---

## Useful Vercel CLI Commands

```bash
# Check deployment status
vercel inspect

# View logs
vercel logs

# List all deployments
vercel list

# Remove a deployment
vercel remove [deployment-url]

# Pull environment variables locally
vercel env pull .env.local

# Open project in browser
vercel open
```

---

## Troubleshooting

### Build Fails
```bash
# Check build logs in Vercel dashboard or via CLI
vercel logs --follow
```

Common issues:
- Missing environment variables
- TypeScript errors (run `npm run build` locally first)
- Missing dependencies

### Environment Variables Not Working
- Make sure they're added to the correct environment (Production/Preview/Development)
- Redeploy after adding new variables
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser

### Database Connection Issues
- Verify Supabase URLs are correct
- Check Supabase service is running
- Verify API keys have correct permissions

---

## Monitoring & Analytics

### View Analytics
```bash
vercel analytics
```

Or visit: https://vercel.com/your-username/sellify/analytics

### Speed Insights
Enable in Vercel Dashboard → Analytics → Speed Insights

---

## Automatic Deployments

Once connected to GitHub:
- **Production**: Pushes to `main` branch auto-deploy
- **Preview**: PRs and other branches get preview URLs
- **Rollback**: Use Vercel dashboard to rollback to previous deployments

---

## Support Resources

- Vercel Documentation: https://vercel.com/docs
- Next.js on Vercel: https://vercel.com/docs/frameworks/nextjs
- Vercel CLI Reference: https://vercel.com/docs/cli

---

## Security Best Practices

1. ✅ **Never commit `.env` files** - Already in `.gitignore`
2. ✅ **Use Vercel Environment Variables** - Store secrets securely
3. ✅ **Rotate keys regularly** - Especially `CLERK_SECRET_KEY`
4. ✅ **Use separate keys for dev/prod** - Different Clerk projects for testing
5. ✅ **Enable Vercel Authentication** - Add password protection for preview deployments (optional)

---

Happy Deploying! 🚀



