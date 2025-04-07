'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import DynamicTable from './components/DynamicTable';
import { Recipe, User } from './types';

export default function AdminDashboard() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  const recipeColumns = [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'image_url', label: 'Image URL', type: 'text' },
    { name: 'difficulty', label: 'Difficulty', type: 'select', options: ['Easy', 'Medium', 'Hard'] },
    { name: 'cooking_time', label: 'Cooking Time (mins)', type: 'number' },
    { name: 'servings', label: 'Servings', type: 'number' },
    { name: 'tags', label: 'Tags', type: 'text' }
  ];

  const userColumns = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'role', label: 'Role', type: 'select', options: ['user', 'admin'], required: true }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching data from Supabase...');
      
      // Fetch recipes with explicit format
      const recipesResponse = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Fetch users with explicit format
      const usersResponse = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (recipesResponse.error) {
        console.error('Error fetching recipes:', recipesResponse.error);
        throw recipesResponse.error;
      }
      
      if (usersResponse.error) {
        console.error('Error fetching users:', usersResponse.error);
        throw usersResponse.error;
      }

      // Log success
      console.log('Supabase fetch success! Recipes:', recipesResponse.data);
      console.log('Supabase fetch success! Users:', usersResponse.data);

      setRecipes(recipesResponse.data || []);
      setUsers(usersResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      alert(`Failed to fetch data: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="space-y-8">
        <section>
          <DynamicTable
            tableName="recipes"
            columns={recipeColumns}
            items={recipes}
            onRefresh={fetchData}
            actions={{
              edit: true,
              delete: true,
              confirmDelete: true
            }}
          />
        </section>

        <section>
          <DynamicTable
            tableName="users"
            columns={userColumns}
            items={users}
            onRefresh={fetchData}
            actions={{
              edit: true,
              delete: true,
              confirmDelete: true
            }}
          />
        </section>
      </div>
    </div>
  );
} 