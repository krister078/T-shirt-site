import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Profile {
  id: string
  email: string
  first_name: string
  last_name: string
  created_at: string
  updated_at: string
}

export interface Address {
  id: string
  user_id: string
  street: string
  city: string
  state: string
  zip_code: string
  country: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface Shirt {
  id: string
  user_id: string
  title: string
  label?: string
  description: string
  price: number
  image_url?: string
  color?: string
  designs?: Record<string, unknown>
  status?: string
  preview_front_url?: string
  preview_back_url?: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  order_number: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  subtotal: number
  shipping_cost: number
  total: number
  shipping_street: string
  shipping_city: string
  shipping_state: string
  shipping_zip_code: string
  shipping_country: string
  shipping_phone?: string
  payment_method_last4?: string
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  created_at: string
  updated_at: string
  shipped_at?: string
  delivered_at?: string
}

export interface OrderItem {
  id: string
  order_id: string
  shirt_id?: string
  shirt_title: string
  shirt_description?: string
  shirt_price: number
  shirt_color?: string
  shirt_designs?: Record<string, unknown>
  shirt_preview_front_url?: string
  shirt_preview_back_url?: string
  size: string
  quantity: number
  item_total: number
  created_at: string
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[]
}
