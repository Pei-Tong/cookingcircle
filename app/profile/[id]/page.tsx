"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import RecipeCard from "@/components/recipe-card"
import { Edit, Grid, Bookmark, Heart, BadgeCheck } from "lucide-react"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
        active
          ? "bg-primary text-primary-foreground"
          : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  )
}

export default function UserProfile({ params }: { params: { id: string } }) {
  const router = useRouter()
  const userId = params.id

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [recipes, setRecipes] = useState<any[]>([])
  const [sortOption, setSortOption] = useState("recent")
  const [isFollowing, setIsFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(1200)

  const [profile] = useState({
    name: "Chef Mario",
    description:
      "Passionate home cook specializing in Italian cuisine. I love creating simple, delicious recipes that anyone can make at home. Join me on my culinary journey!",
  })

  const filterCategories = [
    "All", "Main Course", "Appetizers", "Desserts", "Vegetarian",
    "Quick & Easy", "Italian", "Asian", "Baking", "Healthy",
    "Under 30 mins", "Gluten-Free",
  ]

  useEffect(() => {
    const fetchProfileAndRecipes = async () => {
      // 1. Load avatar from Supabase with cache-busting
      const { data: avatarData, error: avatarError } = supabase
        .storage
        .from("profile-images")
        .getPublicUrl(`${userId}.png`)
  
      if (!avatarError && avatarData?.publicUrl) {
        // Append timestamp to bust cache
        setAvatarUrl(`${avatarData.publicUrl}?v=${Date.now()}`)
      } else {
        setAvatarUrl(null)
      }

      // 2. Load recipe info and image URLs
      const rawRecipes = [
        {
          id: "1",
          title: "Homemade Margherita Pizza",
          description: "Classic Italian pizza with fresh mozzarella, tomatoes, and basil",
          tags: ["Italian", "Vegetarian"],
          likes: 128,
          views: 1024,
          createdAt: "2024-03-01",
          poster: "Chef Mario",
        },
        {
          id: "2",
          title: "Spaghetti Carbonara",
          description: "Creamy pasta with pancetta, eggs, and parmesan cheese",
          tags: ["Italian", "Pasta"],
          likes: 95,
          views: 876,
          createdAt: "2024-03-02",
          poster: "Chef Mario",
        },
      ]

      const recipesWithImages = await Promise.all(
        rawRecipes.map(async (recipe) => {
          const { data, error } = supabase
            .storage
            .from("recipe-images")
            .getPublicUrl(`${recipe.id}.png`)

          return {
            ...recipe,
            image: !error && data?.publicUrl ? data.publicUrl : "/placeholder.svg",
          }
        })
      )

      setRecipes(recipesWithImages)
    }

    fetchProfileAndRecipes()
  }, [userId])

  const sortRecipes = (recipes: any[], option: string) => {
    const sorted = [...recipes]
    switch (option) {
      case "recent": return sorted.reverse()
      case "likes": return sorted.sort((a, b) => b.likes - a.likes)
      case "views": return sorted.sort((a, b) => b.views - a.views)
      default: return sorted
    }
  }

  const handleEditProfile = () => {
    router.push("/settings/profile")
  }

  const handleToggleFollow = () => {
    setFollowerCount((count) => isFollowing ? count - 1 : count + 1)
    setIsFollowing((prev) => !prev)
  }

  const formatFollowerCount = (count: number) =>
    count >= 1000 ? (count / 1000).toFixed(1) + "k" : count.toString()

  const handleDeleteRecipe = (id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <>
      <Navigation />
      <main className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 items-start mb-10">
            <div className="relative w-32 h-32">
              <Avatar className="w-32 h-32">
                <AvatarImage src={avatarUrl || "/placeholder.svg"} alt="User" />
                <AvatarFallback>{profile.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold">{profile.name}</h1>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="inline-flex items-center justify-center rounded-full bg-blue-100 p-1">
                          <BadgeCheck className="h-5 w-5 text-blue-500" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent><p>Verified Chef</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleToggleFollow}>
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                  <Button variant="outline" onClick={handleEditProfile}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>

              <div className="flex gap-6 mb-4">
                <div className="text-center">
                  <p className="font-semibold">{recipes.length}</p>
                  <p className="text-sm text-muted-foreground">Recipes</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">{formatFollowerCount(followerCount)}</p>
                  <p className="text-sm text-muted-foreground">Followers</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">245</p>
                  <p className="text-sm text-muted-foreground">Following</p>
                </div>
              </div>

              <p className="text-muted-foreground">{profile.description}</p>
            </div>
          </div>

          <Tabs defaultValue="recipes">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recipes"><Grid className="h-4 w-4 mr-2" />Recipes</TabsTrigger>
              <TabsTrigger value="saved"><Bookmark className="h-4 w-4 mr-2" />Saved</TabsTrigger>
              <TabsTrigger value="liked"><Heart className="h-4 w-4 mr-2" />Liked</TabsTrigger>
            </TabsList>

            <TabsContent value="recipes" className="pt-6">
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
                <Button variant="ghost" size="sm">Clear Filters</Button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {filterCategories.map((filter) => (
                  <FilterPill
                    key={filter}
                    label={filter}
                    active={filter === "All"}
                    onClick={() => console.log(`Filter clicked: ${filter}`)}
                  />
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {sortRecipes(recipes, sortOption).map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    {...recipe}
                    isOwner={true}
                    onDelete={handleDeleteRecipe}
                  />
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
