"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { RecipeCard } from "@/components/recipe/RecipeCard"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { supabase } from "@/lib/supabaseClient"

interface Recipe {
  recipe_id: string
  title: string
  description: string
  image_url: string
  tags: string[]
  likes_count: number
  views_count: number
  ingredients?: { name: string }[]
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("query") || ""
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])

  useEffect(() => {
    async function fetchRecipes() {
      const queryKeywords = query.toLowerCase().split(/[\,\s]+/).map((q) => q.trim())

      const { data, error } = await supabase
        .from("recipes")
        .select(`
          recipe_id,
          title,
          description,
          image_url,
          tags,
          likes_count,
          views_count,
          ingredients:ingredients(name)
        `)
        .order("likes_count", { ascending: false })

      if (error) {
        console.error("Error fetching recipes:", error.message)
        return
      }

      const results = data
        .map((recipe: Recipe) => {
          const ingredientNames = (recipe.ingredients || []).map((ing) => ing.name.toLowerCase())
          const matchCount = queryKeywords.filter((q) =>
            recipe.title.toLowerCase().includes(q) ||
            (recipe.tags || []).some((tag) => tag.toLowerCase().includes(q)) ||
            ingredientNames.some((ing) => ing.includes(q))
          ).length

          return { recipe, matchCount }
        })
        .filter(({ matchCount }) => matchCount > 0)
        .sort((a, b) => b.matchCount - a.matchCount)
        .map(({ recipe }) => recipe)

      setFilteredRecipes(results)
    }

    if (query.trim()) {
      fetchRecipes()
    } else {
      setFilteredRecipes([])
    }
  }, [query])

  return (
    <main className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-grow p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold">Search Results for: "{query}"</h1>
        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.recipe_id}
                id={recipe.recipe_id}
                title={recipe.title}
                description={recipe.description}
                image={recipe.image_url}
                tags={recipe.tags}
                likes={recipe.likes_count}
                views={recipe.views_count}
              />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-gray-500">No recipes found.</p>
        )}
      </div>
      <Footer />
    </main>
  )
}
