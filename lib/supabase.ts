import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface Recipe {
  id: string
  title: string
  image: string
  description: string
  tags: string[]
  likes: number
  views: number
  created_at: string
  user_id: string
}

export interface Product {
  id: string
  name: string
  price: string
  image: string
  description: string
  rating: number
  purchases: number
  category: 'ingredients' | 'kitchenware'
} 