# Scalability Setup Guide

This document outlines the scalability improvements made and required setup steps.

## ✅ Implemented Fixes

### 1. Persistent File Access Storage
- **Before**: In-memory Map (lost on server restart)
- **After**: Supabase database table `file_access`
- **Status**: ✅ Complete

### 2. File Storage Migration
- **Before**: Local filesystem (`public/uploads/`) - doesn't work on Vercel
- **After**: Supabase Storage bucket `product-files`
- **Status**: ✅ Complete

### 3. Database Indexes
- **Before**: Basic indexes only
- **After**: Optimized indexes for high-traffic queries
- **Status**: ✅ Complete

### 4. Rate Limiting
- **Before**: No rate limiting
- **After**: Rate limiting on payment and file access endpoints
- **Status**: ✅ Complete

## 🔧 Required Setup Steps

### Step 1: Run Database Migrations

1. **Create file_access table:**
   ```sql
   -- Run db/migration-add-file-access.sql in your Supabase SQL editor
   ```

2. **Add performance indexes:**
   ```sql
   -- Run db/migration-add-indexes.sql in your Supabase SQL editor
   ```

### Step 2: Create Supabase Storage Bucket

1. Go to your Supabase Dashboard → Storage
2. Create a new bucket named `product-files`
3. Set it to **Public** (or use signed URLs for private files)
4. Configure CORS if needed:
   ```json
   {
     "allowed_origins": ["https://yourdomain.com", "http://localhost:3000"],
     "allowed_methods": ["GET", "POST", "PUT"],
     "allowed_headers": ["*"],
     "max_age_seconds": 3600
   }
   ```

### Step 3: Environment Variables

Ensure these are set in Vercel (production) and `.env.local` (development):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 4: Update Existing Products (Optional)

If you have existing products with local file URLs (`/uploads/...`), you'll need to migrate them:
- Upload files to Supabase Storage
- Update `file_url` in products table to new Supabase Storage URLs

## 📊 Expected Capacity

- **Before fixes**: ~50-100 concurrent users
- **After fixes**: 1,000+ concurrent users (with proper Supabase plan)

## 🔍 Monitoring Recommendations

1. **Supabase Dashboard**: Monitor connection pool usage
2. **Vercel Analytics**: Track function execution times
3. **Error Tracking**: Set up Sentry or similar for production errors
4. **Rate Limit Monitoring**: Watch for 429 responses in logs

## 🚀 Further Optimizations (Optional)

1. **Redis/KV Caching**: Replace in-memory cache with Vercel KV or Redis
2. **CDN**: Files are served from Supabase CDN (already optimized)
3. **Database Connection Pooling**: Configure Supabase connection pooling
4. **Edge Functions**: Move static responses to Vercel Edge Functions

## ⚠️ Important Notes

- **File Storage**: All new files uploaded will be stored in Supabase Storage
- **Rate Limits**: 
  - Payment endpoint: 10 requests/minute per IP
  - File access: 20 requests/minute per IP
- **Database**: File access tokens now persist across deployments
- **Backward Compatibility**: Legacy local file URLs will need migration

