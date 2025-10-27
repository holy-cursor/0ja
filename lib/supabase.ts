import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For server-side operations that need elevated permissions
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Database types
export interface Database {
  public: {
    Tables: {
      creators: {
        Row: {
          id: string
          wallet_address: string
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          creator_wallet: string
          slug: string
          title: string
          description: string | null
          price_amount: number
          price_token: string
          file_url: string | null
          success_redirect: string | null
          image_url: string | null
          created_at: string
          updated_at: string
          paused: boolean
        }
        Insert: {
          id?: string
          creator_wallet: string
          slug: string
          title: string
          description?: string | null
          price_amount: number
          price_token?: string
          file_url?: string | null
          success_redirect?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
          paused?: boolean
        }
        Update: {
          id?: string
          creator_wallet?: string
          slug?: string
          title?: string
          description?: string | null
          price_amount?: number
          price_token?: string
          file_url?: string | null
          success_redirect?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
          paused?: boolean
        }
      }
      payments: {
        Row: {
          id: string
          product_id: string
          tx_hash: string
          buyer_wallet: string
          amount: number
          token: string
          platform_fee: number
          creator_amount: number
          confirmed_at: string
          block_number: number | null
          gas_used: number | null
        }
        Insert: {
          id?: string
          product_id: string
          tx_hash: string
          buyer_wallet: string
          amount: number
          token: string
          platform_fee: number
          creator_amount: number
          confirmed_at?: string
          block_number?: number | null
          gas_used?: number | null
        }
        Update: {
          id?: string
          product_id?: string
          tx_hash?: string
          buyer_wallet?: string
          amount?: number
          token?: string
          platform_fee?: number
          creator_amount?: number
          confirmed_at?: string
          block_number?: number | null
          gas_used?: number | null
        }
      }
      downloads: {
        Row: {
          id: string
          payment_id: string
          downloaded_at: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          payment_id: string
          downloaded_at?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          payment_id?: string
          downloaded_at?: string
          ip_address?: string | null
          user_agent?: string | null
        }
      }
    }
  }
}
