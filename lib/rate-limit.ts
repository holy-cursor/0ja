import { NextRequest } from 'next/server';

// Simple in-memory rate limiting (for Vercel serverless, consider Redis/Vercel KV for distributed)
type RateLimitStore = {
  [key: string]: {
    count: number;
    resetAt: number;
  };
};

const store: RateLimitStore = {};

// Clean up expired entries every 5 minutes
if (typeof global !== 'undefined') {
  const cleanup = () => {
    const now = Date.now();
    Object.keys(store).forEach(key => {
      if (store[key].resetAt < now) {
        delete store[key];
      }
    });
  };
  
  // Run cleanup every 5 minutes
  if (typeof setInterval !== 'undefined') {
    setInterval(cleanup, 5 * 60 * 1000);
  }
}

export interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds
  maxRequests?: number; // Max requests per window
}

const defaultOptions: RateLimitOptions = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
};

export function rateLimit(request: NextRequest, options: RateLimitOptions = {}) {
  const opts = { ...defaultOptions, ...options };
  
  // Get client identifier (IP address or custom header)
  const clientId = 
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  
  const key = `rate_limit:${clientId}`;
  const now = Date.now();
  
  // Get or create rate limit entry
  let entry = store[key];
  
  if (!entry || entry.resetAt < now) {
    // Create new window
    entry = {
      count: 0,
      resetAt: now + opts.windowMs!,
    };
    store[key] = entry;
  }
  
  // Increment count
  entry.count++;
  
  // Check if limit exceeded
  if (entry.count > opts.maxRequests!) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return {
      success: false,
      retryAfter,
      limit: opts.maxRequests!,
      remaining: 0,
    };
  }
  
  return {
    success: true,
    limit: opts.maxRequests!,
    remaining: Math.max(0, opts.maxRequests! - entry.count),
    resetAt: entry.resetAt,
  };
}

