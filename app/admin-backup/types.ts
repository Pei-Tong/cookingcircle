export interface Recipe {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  created_at?: string;
  user_id?: string;
  difficulty?: string;
  cooking_time?: number;
  servings?: number;
  tags?: string[];
}

export interface User {
  id: string;
  name?: string;
  email: string;
  created_at?: string;
  role?: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  unit: string;
  created_at: string;
  updated_at: string;
} 