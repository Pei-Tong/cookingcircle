export interface User {
  user_id: string;
  username: string;
  email: string | null;
  profile_image: string | null;
  password_hash: string | null;
  bio: string | null;
  created_at: string;
  followers_count: number;
  following_count: number;
}

export interface Product {
  product_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  rating: number;
  purchases: number;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  recipe_id: string;
  title: string;
  description: string;
  image_url?: string;
  tags?: string[];
  likes_count: number;
  views_count: number;
  created_at: string;
  user_id: string;
  user?: {
    user_id: string;
    username: string;
    profile_image?: string;
  };
}

export interface RecipeLike {
  like_id: string;
  user_id: string;
  recipe_id: string;
  created_at: string;
}

export interface RecipeCollection {
  collection_id: string;
  user_id: string;
  recipe_id: string;
  created_at: string;
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

// Response types
export interface RecipeWithUser extends Recipe {
  user?: User;
}

export interface RecipeWithDetails extends Recipe {
  ingredients: Ingredient[];
  nutrition_facts?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface UserWithRecipes {
  user_id: string;
  username: string;
  profile_image?: string;
  bio?: string;
  created_at: string;
  followers_count: number;
  following_count: number;
  recipes?: Recipe[];
}

export interface CollectionWithRecipes extends RecipeCollection {
  recipes: RecipeWithUser;
}

export interface UserFollow {
  follow_id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

// Main database interface
export interface Database {
  getRecipes: (limit?: number) => Promise<RecipeWithUser[]>;
  getRecipeById: (recipeId: string) => Promise<RecipeWithDetails>;
  createRecipe: (recipeData: Partial<Recipe>) => Promise<Recipe>;
  getUserProfile: (userId: string) => Promise<UserWithRecipes>;
  updateUserProfile: (userId: string, updates: Partial<User>) => Promise<User>;
  getUserCollections: (userId: string) => Promise<CollectionWithRecipes[]>;
  toggleRecipeLike: (userId: string, recipeId: string) => Promise<boolean>;
  getRecipeIngredients: (recipeId: string) => Promise<Ingredient[]>;
  addIngredient: (ingredientData: Partial<Ingredient>) => Promise<Ingredient>;
}

// Database 型別
export type Tables = {
  users: User;
  products: Product;
  recipes: Recipe;
  recipe_likes: RecipeLike;
  recipe_collections: RecipeCollection;
  ingredients: Ingredient;
}; 