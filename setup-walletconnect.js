#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Sellify WalletConnect Setup Helper\n');

const envPath = path.join(__dirname, '.env.local');

// Check if .env.local already exists
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local already exists');
  
  // Check if it has WalletConnect project ID
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=')) {
    console.log('✅ WalletConnect project ID is already configured');
    console.log('If you\'re still seeing errors, make sure your project ID is valid.');
  } else {
    console.log('⚠️  .env.local exists but missing WalletConnect project ID');
    console.log('Add this line to your .env.local file:');
    console.log('NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here');
  }
} else {
  console.log('📝 Creating .env.local file...');
  
  const envContent = `# WalletConnect Configuration
# Get your project ID from https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file');
  console.log('📋 Next steps:');
  console.log('1. Get a project ID from https://cloud.walletconnect.com/');
  console.log('2. Replace "your_project_id_here" in .env.local with your actual project ID');
  console.log('3. Restart your development server with: npm run dev');
}

console.log('\n🎯 This will eliminate the WalletConnect connection errors in your console!');
