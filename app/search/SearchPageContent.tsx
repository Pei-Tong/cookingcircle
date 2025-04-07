'use client'

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { RecipeCard } from "@/components/recipe/RecipeCard"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { supabase } from "@/lib/supabaseClient"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface Ingredient {
  ingredient_id: string
  amount: number
  unit: string
}

interface IngredientName {
  ingredient_id: string
  name: string
}

interface RecipeIngredient {
  ingredient_id: string
  amount: number
  unit: string
}

interface User {
  user_id: string
  username: string
}

interface Recipe {
  recipe_id: string
  title: string
  description: string
  image_url: string
  tags: string[]
  likes_count: number
  views_count: number
  user_id?: string
  username?: string
  ingredients?: RecipeIngredient[]
}

export default function SearchPageContent() {
  const searchParams = useSearchParams()
  const query = searchParams?.get("query") || ""
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRecipes() {
      if (!query.trim()) {
        setFilteredRecipes([])
        return
      }
      
      setLoading(true)
      setError(null)
      
      try {
        const queryKeywords = query.toLowerCase().split(/[\,\s]+/).filter(q => q.trim().length > 0)
        
        if (queryKeywords.length === 0) {
          setFilteredRecipes([])
          setLoading(false)
          return
        }

        console.log('Searching for keywords:', queryKeywords)
        
        // 簡化獲取食譜的查詢，移除可能有問題的關聯查詢
        const { data: recipesData, error: recipesError } = await supabase
          .from("recipes")
          .select(`
            recipe_id,
            title,
            description,
            image_url,
            tags,
            likes_count,
            views_count,
            user_id
          `)
          .order("likes_count", { ascending: false })
        
        if (recipesError) {
          console.error("Error fetching recipes:", recipesError.message)
          setError("Failed to fetch recipes. Please try again.")
          setLoading(false)
          return
        }
        
        if (!recipesData) {
          setFilteredRecipes([])
          setLoading(false)
          return
        }
        
        // 獲取所有食譜的配料，使用單獨的查詢
        const recipeIds = recipesData.map(recipe => recipe.recipe_id)
        let recipeIngredientsMap: Record<string, RecipeIngredient[]> = {}
        
        if (recipeIds.length > 0) {
          const { data: ingredientsData, error: ingredientsError } = await supabase
            .from("recipe_ingredients")
            .select("recipe_id, ingredient_id, amount, unit")
            .in("recipe_id", recipeIds)
          
          if (!ingredientsError && ingredientsData) {
            // 將配料按食譜ID分組
            recipeIngredientsMap = ingredientsData.reduce((acc: Record<string, RecipeIngredient[]>, item: any) => {
              if (!acc[item.recipe_id]) {
                acc[item.recipe_id] = []
              }
              acc[item.recipe_id].push({
                ingredient_id: item.ingredient_id,
                amount: item.amount,
                unit: item.unit
              })
              return acc
            }, {})
          } else if (ingredientsError) {
            console.error("Error fetching ingredients:", ingredientsError.message)
          }
        }
        
        // 獲取用戶信息
        const userIds = recipesData
          .map(recipe => recipe.user_id)
          .filter(Boolean) as string[]
          
        const usersMap: Record<string, string> = {}
        
        if (userIds.length > 0) {
          const { data: usersData, error: usersError } = await supabase
            .from("users")
            .select("user_id, username")
            .in("user_id", userIds)
          
          if (!usersError && usersData) {
            usersData.forEach((user: User) => {
              usersMap[user.user_id] = user.username
            })
          }
        }
        
        // 獲取所有食材名稱
        const ingredientIds: string[] = []
        Object.values(recipeIngredientsMap).forEach(ingredients => {
          ingredients.forEach(ing => {
            if (ing.ingredient_id && !ingredientIds.includes(ing.ingredient_id)) {
              ingredientIds.push(ing.ingredient_id)
            }
          })
        })
        
        const ingredientsMap: Record<string, string> = {}
        
        if (ingredientIds.length > 0) {
          const { data: ingredientsData, error: ingredientsError } = await supabase
            .from("ingredients")
            .select("ingredient_id, name")
            .in("ingredient_id", ingredientIds)
          
          if (!ingredientsError && ingredientsData) {
            ingredientsData.forEach((ingredient: IngredientName) => {
              ingredientsMap[ingredient.ingredient_id] = ingredient.name.toLowerCase()
            })
          }
        }
        
        // 組合食譜數據
        const recipesWithDetails = recipesData.map((recipeData: any) => {
          return {
            ...recipeData,
            username: recipeData.user_id ? usersMap[recipeData.user_id] || 'Anonymous' : 'Anonymous',
            tags: recipeData.tags || [],
            ingredients: recipeIngredientsMap[recipeData.recipe_id] || []
          } as Recipe
        })
        
        // 過濾並排序食譜
        const results = recipesWithDetails
          .map((recipe) => {
            // 獲取食材名稱
            const ingredientNames = (recipe.ingredients || [])
              .map(ing => ing.ingredient_id ? ingredientsMap[ing.ingredient_id] : '')
              .filter(Boolean)
            
            // 計算匹配分數
            const matchCount = queryKeywords.filter(q => {
              return recipe.title.toLowerCase().includes(q) ||
                recipe.description?.toLowerCase().includes(q) ||
                (recipe.tags || []).some(tag => tag.toLowerCase().includes(q)) ||
                ingredientNames.some(ing => ing.includes(q))
            }).length
            
            return { recipe, matchCount }
          })
          .filter(({ matchCount }) => matchCount > 0)
          .sort((a, b) => b.matchCount - a.matchCount)
          .map(({ recipe }) => recipe)
        
        setFilteredRecipes(results)
      } catch (err) {
        console.error("Search error:", err)
        setError("An error occurred while searching. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchRecipes()
  }, [query])

  return (
    <main className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-grow p-6 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl font-semibold mb-6">Search Results for: "{query}"</h1>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3 shadow-sm">
                <Skeleton className="h-48 w-full rounded-md" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.recipe_id}
                id={recipe.recipe_id}
                title={recipe.title}
                description={recipe.description}
                image={recipe.image_url || '/placeholder-recipe.jpg'}
                tags={recipe.tags || []}
                likes={recipe.likes_count}
                views={recipe.views_count}
                user_id={recipe.user_id}
                username={recipe.username}
              />
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No recipes found</h3>
            <p className="text-gray-500">
              We couldn't find any recipes matching "{query}". Try different keywords or check your spelling.
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Enter a search term</h3>
            <p className="text-gray-500">
              Search for recipes by name, ingredient, or tag to get started.
            </p>
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
