import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// 使用全局變量來存儲 Supabase 實例
let supabase: ReturnType<typeof createClient> | null = null

if (typeof window !== "undefined") {
  // 只在客戶端初始化一次
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
} else {
  // 服務器端每次都創建新實例
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

if (!supabase) {
  throw new Error('Failed to initialize Supabase client')
}

export { supabase }

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