import { supabase } from './client';
import type { Recipe } from './types';

export async function getRecipes(limit: number = 10, userId?: string): Promise<Recipe[]> {
  try {
    let query = supabase
      .from('recipes')
      .select(`
        *,
        users (
          user_id,
          username,
          profile_image
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Recipe[];
  } catch (error) {
    console.error('Error fetching recipes:', error);
    throw error;
  }
}

export async function getRecipeById(recipeId: string): Promise<Recipe | null> {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      users (
        user_id,
        username,
        profile_image
      )
    `)
    .eq('recipe_id', recipeId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error("Error fetching recipe:", error);
    throw error;
  }

  return data as Recipe;
}

export async function createRecipe(recipeData: Partial<Recipe>): Promise<Recipe> {
  const { data, error } = await supabase
    .from('recipes')
    .insert(recipeData)
    .select()
    .single();

  if (error) {
    console.error("Error creating recipe:", error);
    throw error;
  }

  return data as Recipe;
}

export async function updateRecipe(recipeId: string, updates: Partial<Recipe>): Promise<Recipe> {
  const { data, error } = await supabase
    .from('recipes')
    .update(updates)
    .eq('recipe_id', recipeId)
    .select()
    .single();

  if (error) {
    console.error("Error updating recipe:", error);
    throw error;
  }

  return data as Recipe;
}

export async function deleteRecipe(recipeId: string): Promise<void> {
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('recipe_id', recipeId);

  if (error) {
    console.error("Error deleting recipe:", error);
    throw error;
  }
} 