# 🚀 Supabase Setup Guide

## ✅ **What's Been Done**

Your app is now fully integrated with Supabase! Here's what I've implemented:

### 🔧 **Code Changes:**
- ✅ Installed `@supabase/supabase-js`
- ✅ Created Supabase client configuration (`src/lib/supabase.ts`)
- ✅ Updated Products API to use Supabase database
- ✅ Updated Payments API to store transaction records
- ✅ Created Dashboard API for analytics
- ✅ Added environment variables to `env.example`

### 🗄️ **Database Schema:**
Your database schema is ready in `db/schema.sql` with these tables:
- **`creators`** - User profiles and wallet addresses
- **`products`** - Product listings and metadata
- **`payments`** - Transaction records and fees
- **`downloads`** - Download tracking and analytics

## 🚀 **Next Steps to Complete Setup**

### 1. **Create Supabase Project**
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login with your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `sellify` (or your preferred name)
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
6. Click "Create new project"
7. Wait for project to be ready (2-3 minutes)

### 2. **Get Your API Keys**
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)
   - **service_role** key (starts with `eyJ`)

### 3. **Set Up Environment Variables**
1. Copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```
2. Update `.env.local` with your Supabase keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

### 4. **Set Up Database Schema**
1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `db/schema.sql`
4. Paste it into the SQL editor
5. Click "Run" to create all tables and policies

### 5. **Test the Integration**
1. Start your development server:
   ```bash
   npm run dev
   ```
2. Go to `http://localhost:3000/create`
3. Sign in and try creating a product
4. Check your Supabase dashboard → **Table Editor** to see the data

## 🎯 **What Now Works**

### ✅ **Data Persistence:**
- Products are stored in Supabase database
- Payments are tracked and recorded
- User analytics are available
- Data survives server restarts

### ✅ **Real Analytics:**
- Total revenue tracking
- Sales count per creator
- Product performance metrics
- Payment history

### ✅ **Security:**
- Row Level Security (RLS) enabled
- User-specific data access
- Secure API endpoints

## 🔍 **Verification Steps**

1. **Check Database Tables:**
   - Go to Supabase → **Table Editor**
   - You should see: `creators`, `products`, `payments`, `downloads`

2. **Test Product Creation:**
   - Create a product via `/create`
   - Check if it appears in `products` table

3. **Test Payment Recording:**
   - Make a test payment
   - Check if it appears in `payments` table

## 🚨 **Important Notes**

- **Never commit `.env.local`** to version control
- **Keep service_role key secret** - it has admin access
- **Test in development first** before deploying
- **Monitor your database usage** in Supabase dashboard

## 🆘 **Troubleshooting**

### **"Invalid API key" error:**
- Check your environment variables are correct
- Make sure you copied the full keys (they're long)

### **"Table doesn't exist" error:**
- Run the SQL schema in Supabase SQL Editor
- Check table names match exactly

### **"Permission denied" error:**
- Check RLS policies are set up correctly
- Verify your service_role key is being used for admin operations

## 🎉 **You're Ready!**

Your app now has real database storage! All products, payments, and user data will persist across server restarts and deployments.

Need help with any of these steps? Let me know!
