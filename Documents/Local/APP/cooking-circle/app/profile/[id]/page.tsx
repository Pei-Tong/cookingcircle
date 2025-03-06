"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import RecipeCard from "@/components/recipe-card"
import { Edit, Settings, Grid, Bookmark, Heart } from "lucide-react"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { BadgeCheck } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface FilterPillProps {
  label: string
  active: boolean
  onClick: () => void
}

function FilterPill({ label, active, onClick }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm transition-colors whitespace-nowrap ${
        active ? "bg-primary text-primary-foreground" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  )
}

export default function UserProfile({ params }: { params: { id: string } }) {
  const filterCategories = [
    "All",
    "Main Course",
    "Appetizers",
    "Desserts",
    "Vegetarian",
    "Quick & Easy",
    "Italian",
    "Asian",
    "Baking",
    "Healthy",
    "Under 30 mins",
    "Gluten-Free",
  ]

  const [sortOption, setSortOption] = useState("recent")

  const sortRecipes = (recipes: any[], option: string) => {
    const sortedRecipes = [...recipes]
    switch (option) {
      case "recent":
        return sortedRecipes.reverse() // Assuming the array is in chronological order
      case "likes":
        return sortedRecipes.sort((a, b) => b.likes - a.likes)
      case "views":
        return sortedRecipes.sort((a, b) => b.views - a.views)
      default:
        return sortedRecipes
    }
  }

  const [recipes, setRecipes] = useState([
    {
      id: "1",
      title: "Homemade Margherita Pizza",
      image: "/placeholder.svg?height=300&width=400",
      description: "Classic Italian pizza with fresh mozzarella, tomatoes, and basil",
      tags: ["Italian", "Vegetarian"],
      likes: 128,
      views: 1024,
      createdAt: "2024-03-01",
      poster: "Chef Mario",
    },
    {
      id: "5",
      title: "Spaghetti Carbonara",
      image: "/placeholder.svg?height=300&width=400",
      description: "Creamy pasta with pancetta, eggs, and parmesan cheese",
      tags: ["Italian", "Pasta"],
      likes: 95,
      views: 876,
      createdAt: "2024-03-02",
      poster: "Chef Mario",
    },
    {
      id: "6",
      title: "Tiramisu",
      image: "/placeholder.svg?height=300&width=400",
      description: "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone cream",
      tags: ["Italian", "Dessert"],
      likes: 156,
      views: 1432,
      createdAt: "2024-03-03",
      poster: "Chef Mario",
    },
    {
      id: "7",
      title: "Risotto ai Funghi",
      image: "/placeholder.svg?height=300&width=400",
      description: "Creamy mushroom risotto with parmesan and white wine",
      tags: ["Italian", "Rice"],
      likes: 87,
      views: 743,
      createdAt: "2024-03-04",
      poster: "Chef Mario",
    },
    {
      id: "8",
      title: "Bruschetta",
      image: "/placeholder.svg?height=300&width=400",
      description: "Toasted bread topped with fresh tomatoes, basil, and garlic",
      tags: ["Italian", "Appetizer"],
      likes: 64,
      views: 532,
      createdAt: "2024-03-05",
      poster: "Chef Mario",
    },
    {
      id: "9",
      title: "Panna Cotta",
      image: "/placeholder.svg?height=300&width=400",
      description: "Silky Italian dessert with vanilla and berry sauce",
      tags: ["Italian", "Dessert"],
      likes: 112,
      views: 921,
      createdAt: "2024-03-06",
      poster: "Chef Mario",
    },
  ])

  const handleDeleteRecipe = async (recipeId: string) => {
    // Here you would typically make an API call to delete the recipe
    setRecipes(recipes.filter((recipe) => recipe.id !== recipeId))
  }

  return (
    <>
      <Navigation />
      <main className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 items-start mb-10">
            <div className="relative w-32 h-32">
              <Avatar className="w-32 h-32">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold">Chef Mario</h1>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="inline-flex items-center justify-center rounded-full bg-blue-100 p-1">
                          <BadgeCheck className="h-5 w-5 text-blue-500" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Verified Chef</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex gap-2">
                  <Button>Follow</Button>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-6 mb-4">
                <div className="text-center">
                  <p className="font-semibold">128</p>
                  <p className="text-sm text-muted-foreground">Recipes</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">1.2k</p>
                  <p className="text-sm text-muted-foreground">Followers</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">245</p>
                  <p className="text-sm text-muted-foreground">Following</p>
                </div>
              </div>

              <p className="text-muted-foreground">
                Passionate home cook specializing in Italian cuisine. I love creating simple, delicious recipes that
                anyone can make at home. Join me on my culinary journey!
              </p>
            </div>
          </div>

          <Tabs defaultValue="recipes">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recipes">
                <Grid className="h-4 w-4 mr-2" />
                Recipes
              </TabsTrigger>
              <TabsTrigger value="saved">
                <Bookmark className="h-4 w-4 mr-2" />
                Saved
              </TabsTrigger>
              <TabsTrigger value="liked">
                <Heart className="h-4 w-4 mr-2" />
                Liked
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recipes" className="pt-6">
              {/* Filter Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <h2 className="text-sm font-medium">Filter Recipes</h2>
                    <Select value={sortOption} onValueChange={setSortOption}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Most Recent</SelectItem>
                        <SelectItem value="likes">Most Liked</SelectItem>
                        <SelectItem value="views">Most Viewed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="ghost" size="sm" className="text-sm">
                    Clear Filters
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filterCategories.map((filter) => (
                    <FilterPill
                      key={filter}
                      label={filter}
                      active={filter === "All"}
                      onClick={() => console.log(`Filter clicked: ${filter}`)}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {sortRecipes(recipes, sortOption).map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    {...recipe}
                    isOwner={true} // You would typically check if the current user is the owner
                    onDelete={handleDeleteRecipe}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="saved" className="pt-6">
              {/* Filter Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <h2 className="text-sm font-medium">Filter Saved Recipes</h2>
                    <Select value={sortOption} onValueChange={setSortOption}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Most Recent</SelectItem>
                        <SelectItem value="likes">Most Liked</SelectItem>
                        <SelectItem value="views">Most Viewed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="ghost" size="sm" className="text-sm">
                    Clear Filters
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filterCategories.map((filter) => (
                    <FilterPill
                      key={filter}
                      label={filter}
                      active={filter === "All"}
                      onClick={() => console.log(`Filter clicked: ${filter}`)}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {sortRecipes(
                  [
                    {
                      id: "10",
                      title: "Korean Bibimbap",
                      image: "/placeholder.svg?height=300&width=400",
                      description: "Colorful rice bowl with vegetables, meat, and spicy gochujang sauce",
                      tags: ["Korean", "Spicy"],
                      likes: 178,
                      views: 1532,
                      createdAt: "2024-03-01",
                      poster: "Chef Mario",
                    },
                    {
                      id: "11",
                      title: "Beef Wellington",
                      image: "/placeholder.svg?height=300&width=400",
                      description: "Tender beef fillet wrapped in puff pastry with mushroom duxelles",
                      tags: ["British", "Special Occasion"],
                      likes: 132,
                      views: 1245,
                      createdAt: "2024-03-02",
                      poster: "Chef Mario",
                    },
                  ],
                  sortOption,
                ).map((recipe) => (
                  <RecipeCard key={recipe.id} {...recipe} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="liked" className="pt-6">
              {/* Filter Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <h2 className="text-sm font-medium">Filter Liked Recipes</h2>
                    <Select value={sortOption} onValueChange={setSortOption}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Most Recent</SelectItem>
                        <SelectItem value="likes">Most Liked</SelectItem>
                        <SelectItem value="views">Most Viewed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="ghost" size="sm" className="text-sm">
                    Clear Filters
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filterCategories.map((filter) => (
                    <FilterPill
                      key={filter}
                      label={filter}
                      active={filter === "All"}
                      onClick={() => console.log(`Filter clicked: ${filter}`)}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {sortRecipes(
                  [
                    {
                      id: "12",
                      title: "Vegan Mushroom Risotto",
                      image: "/placeholder.svg?height=300&width=400",
                      description: "Creamy Italian rice dish with mushrooms and herbs",
                      tags: ["Italian", "Vegan"],
                      likes: 87,
                      views: 943,
                      createdAt: "2024-03-01",
                      poster: "Chef Mario",
                    },
                    {
                      id: "13",
                      title: "Lemon Blueberry Pancakes",
                      image: "/placeholder.svg?height=300&width=400",
                      description: "Fluffy pancakes with fresh blueberries and lemon zest",
                      tags: ["Breakfast", "Sweet"],
                      likes: 104,
                      views: 987,
                      createdAt: "2024-03-02",
                      poster: "Chef Mario",
                    },
                    {
                      id: "14",
                      title: "Thai Green Curry",
                      image: "/placeholder.svg?height=300&width=400",
                      description: "Aromatic and spicy Thai curry with vegetables and coconut milk",
                      tags: ["Thai", "Spicy"],
                      likes: 156,
                      views: 1432,
                      createdAt: "2024-03-03",
                      poster: "Chef Mario",
                    },
                  ],
                  sortOption,
                ).map((recipe) => (
                  <RecipeCard key={recipe.id} {...recipe} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  )
}

