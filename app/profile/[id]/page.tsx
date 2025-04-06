"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RecipeCard } from "@/components/recipe/RecipeCard"
import { Edit, Settings, Grid, Bookmark, Heart, Loader2 } from "lucide-react"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { BadgeCheck } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

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
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRecipes, setUserRecipes] = useState<any[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);
  const [likedRecipes, setLikedRecipes] = useState<any[]>([]);
  
  const [sortOption, setSortOption] = useState("recent");
  const [activeFilter, setActiveFilter] = useState("All");

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

  // Get current user and profile user
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      
      // Get current logged in user
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: currentUserData } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
          
        setCurrentUser(currentUserData);
      }
      
      // Get profile user (from URL parameter)
      let userData;
      
      // First try to find by username
      const { data: usernameMatch } = await supabase
        .from('users')
        .select('*')
        .eq('username', params.id)
        .single();
        
      if (usernameMatch) {
        userData = usernameMatch;
      } else {
        // If not found by username, try by user_id
        const { data: userIdMatch } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', params.id)
          .single();
          
        userData = userIdMatch;
      }
      
      if (userData) {
        setUser(userData);
        fetchUserContent(userData.user_id);
      } else {
        console.error("User not found");
        // Consider redirecting to a 404 page
      }
    }
    
    async function fetchUserContent(userId: string) {
      // Fetch user's recipes
      const { data: recipes } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', userId);
        
      if (recipes) {
        setUserRecipes(recipes);
      }
      
      // Fetch saved recipes (from recipe_collections)
      const { data: saved } = await supabase
        .from('recipe_collections')
        .select('recipes(*)')
        .eq('user_id', userId);
        
      if (saved) {
        const savedRecipesData = saved.map(item => item.recipes);
        setSavedRecipes(savedRecipesData.filter(Boolean));
      }
      
      // Fetch liked recipes (from recipe_likes)
      const { data: liked } = await supabase
        .from('recipe_likes')
        .select('recipes(*)')
        .eq('user_id', userId);
        
      if (liked) {
        const likedRecipesData = liked.map(item => item.recipes);
        setLikedRecipes(likedRecipesData.filter(Boolean));
      }
      
      setLoading(false);
    }
    
    fetchUsers();
  }, [params.id]);

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

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading profile...</span>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // If user not found after loading
  if (!user) {
    return (
      <>
        <Navigation />
        <main className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="flex flex-col justify-center items-center h-64">
            <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
            <p className="text-muted-foreground mb-4">We couldn't find a user with the profile "{params.id}"</p>
            <Button onClick={() => router.push('/')}>Return to Home</Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Generate user's initials for avatar fallback
  const initials = user.username 
    ? user.username.substring(0, 2).toUpperCase() 
    : user.email 
      ? user.email.substring(0, 2).toUpperCase()
      : "UC"; // UC = User Cooking (default)

  return (
    <>
      <Navigation />
      <main className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 items-start mb-10">
            <div className="relative w-32 h-32">
              <Avatar className="w-32 h-32">
                <AvatarImage src={user.profile_image || "/placeholder.svg"} alt={user.username || "User"} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold">{user.username || user.email}</h1>
                  {user.is_verified && (
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
                  )}
                </div>
                <div className="flex gap-2">
                  {currentUser && currentUser.user_id !== user.user_id && (
                    <Button>Follow</Button>
                  )}
                  {currentUser && currentUser.user_id === user.user_id && (
                    <>
                      <Button variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Settings className="h-5 w-5" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-6 mb-4">
                <div className="text-center">
                  <p className="font-semibold">{userRecipes.length}</p>
                  <p className="text-sm text-muted-foreground">Recipes</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">0</p>
                  <p className="text-sm text-muted-foreground">Followers</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">0</p>
                  <p className="text-sm text-muted-foreground">Following</p>
                </div>
              </div>

              <p className="text-muted-foreground">
                {user.bio || "This user hasn't added a bio yet."}
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

              {userRecipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  {userRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      id={recipe.id}
                      title={recipe.title}
                      image={recipe.image || "/placeholder.svg"}
                      description={recipe.description || ""}
                      tags={recipe.categories || []}
                      likes={recipe.likes || 0}
                      views={recipe.views || 0}
                      user_id={recipe.user_id}
                      username={user.username || ""}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No recipes yet</p>
                  {currentUser && currentUser.user_id === user.user_id && (
                    <Button className="mt-4" onClick={() => router.push('/new-recipe')}>
                      Create Your First Recipe
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="saved" className="pt-6">
              {savedRecipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  {savedRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      id={recipe.id}
                      title={recipe.title}
                      image={recipe.image || "/placeholder.svg"}
                      description={recipe.description || ""}
                      tags={recipe.categories || []}
                      likes={recipe.likes || 0}
                      views={recipe.views || 0}
                      user_id={recipe.user_id}
                      username={user.username || ""}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No saved recipes yet</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="liked" className="pt-6">
              {likedRecipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  {likedRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      id={recipe.id}
                      title={recipe.title}
                      image={recipe.image || "/placeholder.svg"}
                      description={recipe.description || ""}
                      tags={recipe.categories || []}
                      likes={recipe.likes || 0}
                      views={recipe.views || 0}
                      user_id={recipe.user_id}
                      username={user.username || ""}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No liked recipes yet</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  )
}

