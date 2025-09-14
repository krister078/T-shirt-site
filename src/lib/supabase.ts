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
  created_at: string
  updated_at: string
}

export interface Shirt {
  id: string
  user_id: string
  title: string
  description: string
  price: number
  image_url?: string
  created_at: string
  updated_at: string
}
