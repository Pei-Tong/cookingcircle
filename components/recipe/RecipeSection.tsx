import RecipeCard from "@/components/recipe-card"

interface Recipe {
  id: string
  title: string
  image: string
  description: string
  tags: string[]
  likes: number
  views: number
}

interface RecipeSectionProps {
  title: string
  recipes: Recipe[]
  onViewAll: () => void
}

export function RecipeSection({ title, recipes, onViewAll }: RecipeSectionProps) {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-gray-900">{title}</h2>
        <button onClick={onViewAll} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
          View all
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} {...recipe} />
        ))}
      </div>
    </section>
  )
}

