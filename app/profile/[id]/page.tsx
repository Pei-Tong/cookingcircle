"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUserProfile, getFollowerCount, getFollowingCount, checkIsFollowing, toggleFollow } from "@/lib/db/profile"
import type { User, Recipe } from "@/lib/db/types"
import { getRecipes } from "@/lib/db/recipes"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RecipeCard } from "@/components/recipe/RecipeCard"
import { Edit, Settings, Grid, Bookmark, Heart, Loader2, BadgeCheck } from "lucide-react"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabaseClient"

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

interface RecipeCardData {
  id: string
  title: string
  description: string
  image: string
  tags: string[]
  likes: number
  views: number
  user_id: string
  username: string
}

interface RecipeWithUser {
  recipe_id: string
  title: string
  description: string
  image_url: string
  tags: string[]
  likes_count: number
  views_count: number
  user_id: string
  user: {
    username: string
  }
}

interface SavedRecipeData {
  recipe_id: string
  recipes: RecipeWithUser
}

interface LikedRecipeData {
  recipe_id: string
  recipes: RecipeWithUser
}

export default function UserProfile({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([])
  const [savedRecipes, setSavedRecipes] = useState<RecipeCardData[]>([])
  const [likedRecipes, setLikedRecipes] = useState<RecipeCardData[]>([])
  const [followerCount, setFollowerCount] = useState<number>(0)
  const [followingCount, setFollowingCount] = useState<number>(0)
  const [isFollowing, setIsFollowing] = useState<boolean>(false)
  const [sortOption, setSortOption] = useState<string>("recent")
  const [activeFilter, setActiveFilter] = useState("All")

  const filterCategories = [
    "All", "Main Course", "Appetizers", "Desserts", "Vegetarian",
    "Quick & Easy", "Italian", "Asian", "Baking", "Healthy",
    "Under 30 mins", "Gluten-Free",
  ]

  // Get current user and profile user
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true)
      setError(null)
      
      try {
        // Get current logged in user
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const { data: currentUserData } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', session.user.id)
            .single()
            
          setCurrentUser(currentUserData)
        }
        
        // Get profile user (from URL parameter)
        let userData
        
        // First try to find by username
        const { data: usernameMatch } = await supabase
          .from('users')
          .select('*')
          .eq('username', decodeURIComponent(params.id))
          .single()
          
        if (usernameMatch) {
          userData = usernameMatch
        } else {
          // If not found by username, try by user_id
          const { data: userIdMatch } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', params.id)
            .single()
            
          userData = userIdMatch
        }
        
        if (userData) {
          setUser(userData)
          await fetchUserContent(userData.user_id)
          
          // Fetch follower and following counts
          const [followers, following] = await Promise.all([
            getFollowerCount(userData.user_id),
            getFollowingCount(userData.user_id)
          ])
          
          setFollowerCount(followers)
          setFollowingCount(following)
          
          // Check if current user is following this profile
          if (currentUser) {
            const isFollowing = await checkIsFollowing(currentUser.user_id, userData.user_id)
            setIsFollowing(isFollowing)
          }
        } else {
          setError("User not found")
        }
      } catch (err) {
        console.error("Error fetching user data:", err)
        setError(err instanceof Error ? err.message : "Failed to load user profile")
      } finally {
        setLoading(false)
      }
    }
    
    async function fetchUserContent(userId: string) {
      try {
        // Fetch user's recipes
        const { data: recipes } = await supabase
          .from('recipes')
          .select('*, users!inner(*)')
          .eq('user_id', userId)
        
        if (recipes) {
          setUserRecipes(recipes)
        }
        
        // Fetch saved recipes
        const { data: savedRecipesData } = await supabase
          .from('recipe_collections')
          .select(`
            recipe_id,
            recipes (
              recipe_id,
              title,
              description,
              image_url,
              tags,
              likes_count,
              views_count,
              user_id,
              user:profiles (
                username
              )
            )
          `)
          .eq('user_id', userId) as { data: SavedRecipeData[] | null }
        
        if (savedRecipesData) {
          const savedRecipes = savedRecipesData.map(item => ({
            id: item.recipes.recipe_id,
            title: item.recipes.title,
            description: item.recipes.description,
            image: item.recipes.image_url,
            tags: item.recipes.tags || [],
            likes: item.recipes.likes_count,
            views: item.recipes.views_count,
            user_id: item.recipes.user_id,
            username: item.recipes.user?.username
          }))
          setSavedRecipes(savedRecipes)
        }
        
        // Fetch liked recipes
        const { data: likedRecipesData } = await supabase
          .from('recipe_likes')
          .select(`
            recipe_id,
            recipes (
              recipe_id,
              title,
              description,
              image_url,
              tags,
              likes_count,
              views_count,
              user_id,
              user:profiles (
                username
              )
            )
          `)
          .eq('user_id', userId) as { data: LikedRecipeData[] | null }
        
        if (likedRecipesData) {
          const likedRecipes = likedRecipesData.map(item => ({
            id: item.recipes.recipe_id,
            title: item.recipes.title,
            description: item.recipes.description,
            image: item.recipes.image_url,
            tags: item.recipes.tags || [],
            likes: item.recipes.likes_count,
            views: item.recipes.views_count,
            user_id: item.recipes.user_id,
            username: item.recipes.user?.username
          }))
          setLikedRecipes(likedRecipes)
        }
      } catch (err) {
        console.error("Error fetching user content:", err)
        setError(err instanceof Error ? err.message : "Failed to load user content")
      }
    }
    
    fetchUsers()
  }, [params.id])

  const handleFollowToggle = async () => {
    if (!currentUser || !user) return
    
    try {
      await toggleFollow(currentUser.user_id, user.user_id)
      setIsFollowing(!isFollowing)
      setFollowerCount(prev => isFollowing ? prev - 1 : prev + 1)
    } catch (err) {
      console.error("Error toggling follow status:", err)
    }
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="flex flex-col gap-8">
            <Skeleton className="h-48" />
            <Skeleton className="h-24" />
            <Skeleton className="h-[400px]" />
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navigation />
        <main className="max-w-[1200px] mx-auto px-4 py-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </main>
        <Footer />
      </>
    )
  }

  if (!user) {
    return (
      <>
        <Navigation />
        <main className="max-w-[1200px] mx-auto px-4 py-6">
          <Alert>
            <AlertDescription>User not found</AlertDescription>
          </Alert>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navigation />
      <main className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="max-w-[800px] mx-auto flex flex-col gap-8">
          {/* Profile Header */}
          <div className="flex items-start gap-8">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user.profile_image || "/placeholder.svg"} />
              <AvatarFallback>{user.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{user.username}</h1>
                  {user.bio && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <BadgeCheck className="w-5 h-5 text-blue-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Verified Chef</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {currentUser?.user_id !== user.user_id && (
                    <Button 
                      variant={isFollowing ? "outline" : "default"}
                      size="sm"
                      onClick={handleFollowToggle}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                  )}
                </div>
                {currentUser?.user_id === user.user_id && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push("/settings/profile")}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => router.push("/settings")}>
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-6 mb-4">
                <span className="text-sm text-gray-600">{userRecipes.length} Recipes</span>
                <span className="text-sm text-gray-600">{followerCount} Followers</span>
                <span className="text-sm text-gray-600">{followingCount} Following</span>
              </div>
              {user.bio && (
                <p className="text-sm text-gray-600 mb-4">{user.bio}</p>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <Tabs defaultValue="recipes" className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="recipes" className="flex items-center gap-2">
                  <Grid className="w-4 h-4" />
                  Recipes
                </TabsTrigger>
                <TabsTrigger value="saved" className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4" />
                  Saved
                </TabsTrigger>
                <TabsTrigger value="liked" className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Liked
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recipes" className="pt-6">
                {/* Temporarily hidden filter section
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
                      active={filter === activeFilter}
                      onClick={() => setActiveFilter(filter)}
                    />
                  ))}
                </div>
                */}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {userRecipes.map((recipe) => (
                    <RecipeCard 
                      key={recipe.recipe_id}
                      id={recipe.recipe_id}
                      title={recipe.title}
                      description={recipe.description}
                      image={recipe.image_url || ''}
                      tags={recipe.tags || []}
                      likes={recipe.likes_count}
                      views={recipe.views_count}
                      user_id={recipe.user_id}
                      username={user.username}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="saved" className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {savedRecipes.map((recipe) => (
                    <RecipeCard 
                      key={recipe.id}
                      {...recipe}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="liked" className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {likedRecipes.map((recipe) => (
                    <RecipeCard 
                      key={recipe.id}
                      {...recipe}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
