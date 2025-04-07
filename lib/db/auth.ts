import { createClient } from '@supabase/supabase-js';
import { User } from './types';

// 環境變數
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 創建 Supabase 客戶端
export const supabase = createClient(supabaseUrl, supabaseKey);

// 公開 Profile 讀取函數
export async function getPublicProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('user_id, username, description, image_url')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

// 私人 Profile 讀取函數 (需要驗證)
export async function getPrivateProfile(userId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session || session.user.id !== userId) {
    throw new Error('Unauthorized access to private profile');
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

// 更新 Profile 函數 (需要驗證)
export async function updateProfile(userId: string, updates: Partial<User>) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session || session.user.id !== userId) {
    throw new Error('Unauthorized access to update profile');
  }

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 檢查是否為個人資料擁有者
export async function isProfileOwner(userId: string): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user.id === userId;
} 