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
import { FollowButton } from "@/components/user/FollowButton"

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
  const [authChecked, setAuthChecked] = useState<boolean>(false)

  const filterCategories = [
    "All", "Main Course", "Appetizers", "Desserts", "Vegetarian",
    "Quick & Easy", "Italian", "Asian", "Baking", "Healthy",
    "Under 30 mins", "Gluten-Free",
  ]

  // Check authentication directly when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking auth status...");
        
        // Try to get Supabase session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session retrieval error:", sessionError);
          return false;
        }
        
        if (session) {
          console.log("Session found, user is authenticated");
          return true;
        } else {
          console.log("No session found, user is NOT authenticated");
          
          // Try refreshing the session
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error("Session refresh error:", refreshError);
            return false;
          }
          
          if (refreshData.session) {
            console.log("Session refreshed successfully");
            return true;
          }
        }
        
        return false;
      } catch (err) {
        console.error("Auth check error:", err);
        return false;
      }
    };
    
    checkAuth().then(isAuth => {
      setAuthChecked(true);
      console.log("Auth check completed, authenticated:", isAuth);
    });
  }, []);

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
          console.log("Current user is authenticated:", currentUserData?.username || session.user.id)
        } else {
          console.log("No active session - user not authenticated")
          
          // Even if user is not logged in, set currentUser to null
          setCurrentUser(null)
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
          console.log("Found user by username:", usernameMatch.username)
        } else {
          // If not found by username, try by user_id
          const { data: userIdMatch } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', params.id)
            .single()
            
          userData = userIdMatch
          console.log("Found user by ID:", userIdMatch?.username || params.id)
        }
        
        if (userData) {
          setUser(userData)
          await fetchUserContent(userData.user_id)
          
          // Fetch fresh follower and following counts directly from the database
          try {
            const { data: latestUser, error: fetchError } = await supabase
              .from('users')
              .select('followers_count, following_count')
              .eq('user_id', userData.user_id)
              .single();
              
            if (fetchError) {
              console.error("Error fetching fresh counts:", fetchError);
            } else if (latestUser) {
              console.log("Latest counts from DB:", latestUser.followers_count, latestUser.following_count);
              setFollowerCount(latestUser.followers_count || 0);
              setFollowingCount(latestUser.following_count || 0);
            }
          } catch (countError) {
            console.error("Error in fetching counts:", countError);
          }
          
          // Check if current user is following this profile
          if (currentUser?.user_id) {
            const isFollowing = await checkIsFollowing(currentUser.user_id, userData.user_id)
            console.log("Current user following status:", isFollowing)
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
        console.log("Fetching content for user ID:", userId);
        
        // Directly query all recipes to check for data integrity
        const { data: allRecipes, error: allRecipesError } = await supabase
          .from('recipes')
          .select('recipe_id, title, user_id')
          .limit(10);
          
        console.log("Sample of all recipes in database:", allRecipes);
        
        if (allRecipesError) {
          console.error("Error fetching all recipes:", allRecipesError);
        }
        
        // Fetch user's recipes
        const { data: recipes, error: recipesError } = await supabase
          .from('recipes')
          .select('*')
          .eq('user_id', userId);
        
        if (recipesError) {
          console.error("Error fetching recipes:", recipesError);
        }
        
        console.log("User recipes:", recipes);
        
        // Fallback to fetch recipes by username if user_id query returns no results
        if (!recipes || recipes.length === 0) {
          console.log("No recipes found with user_id, trying to get user info to verify");
          
          // Get user info to double-check
          const { data: userData } = await supabase
            .from('users')
            .select('username, user_id')
            .eq('user_id', userId)
            .single();
            
            console.log("User verification data:", userData);
            
            // Try to get recipes that might not have user_id but can be matched by other means
            if (userData && userData.username) {
              console.log("Attempting to find recipes by other means for username:", userData.username);
              
              // This is a fallback if required - can be customized based on your database structure
              // For example, if recipes have a creator_name field instead of user_id
              const { data: alternativeRecipes, error } = await supabase
                .from('recipes')
                .select('*');
                
                if (error) {
                  console.error("Error in fallback recipe fetch:", error);
                } else {
                  console.log("All available recipes:", alternativeRecipes);
                  
                  // Manually find recipes that might belong to this user through other means
                  // This is just an example - adjust based on your actual data structure
                  const potentialUserRecipes = alternativeRecipes?.filter(recipe => 
                    !recipe.user_id || recipe.user_id === ""
                  ) || [];
                  
                  console.log("Potential unassigned recipes:", potentialUserRecipes);
                  
                  if (potentialUserRecipes.length > 0) {
                    console.log("Found some unassigned recipes that could belong to this user");
                    setUserRecipes(potentialUserRecipes);
                  } else {
                    setUserRecipes([]);
                  }
                }
            } else {
              setUserRecipes([]);
            }
        } else {
          setUserRecipes(recipes);
        }
        
        // Fetch saved recipes
        const { data: savedRecipesData, error: savedError } = await supabase
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
              users (
                username
              )
            )
          `)
          .eq('user_id', userId);
        
        if (savedError) {
          console.error("Error fetching saved recipes:", savedError);
        }
        
        console.log("Saved recipes data:", savedRecipesData);
        
        if (savedRecipesData && savedRecipesData.length > 0) {
          const savedRecipes: RecipeCardData[] = savedRecipesData
            .filter(item => item.recipes)
            .map(item => {
              const recipe = item.recipes as any;
              return {
                id: recipe.recipe_id,
                title: recipe.title,
                description: recipe.description,
                image: recipe.image_url,
                tags: recipe.tags || [],
                likes: recipe.likes_count || 0,
                views: recipe.views_count || 0,
                user_id: recipe.user_id,
                username: recipe.users?.username
              };
            });
          
          setSavedRecipes(savedRecipes);
        } else {
          setSavedRecipes([]);
        }
        
        // Fetch liked recipes
        const { data: likedRecipesData, error: likedError } = await supabase
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
              users (
                username
              )
            )
          `)
          .eq('user_id', userId);
        
        if (likedError) {
          console.error("Error fetching liked recipes:", likedError);
        }
        
        console.log("Liked recipes data:", likedRecipesData);
        
        if (likedRecipesData && likedRecipesData.length > 0) {
          const likedRecipes: RecipeCardData[] = likedRecipesData
            .filter(item => item.recipes)
            .map(item => {
              const recipe = item.recipes as any;
              return {
                id: recipe.recipe_id,
                title: recipe.title,
                description: recipe.description,
                image: recipe.image_url,
                tags: recipe.tags || [],
                likes: recipe.likes_count || 0,
                views: recipe.views_count || 0,
                user_id: recipe.user_id,
                username: recipe.users?.username
              };
            });
          
          setLikedRecipes(likedRecipes);
        } else {
          setLikedRecipes([]);
        }
      } catch (err) {
        console.error("Error fetching user content:", err);
        setError(err instanceof Error ? err.message : "Failed to load user content");
      }
    }
    
    fetchUsers()
  }, [params.id, authChecked])

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
                    <FollowButton 
                      userId={currentUser?.user_id}
                      profileId={user.user_id}
                      initialFollowing={isFollowing}
                      onFollowChange={(following) => {
                        // Update follower count immediately in UI
                        setIsFollowing(following);
                        setFollowerCount(prev => following ? prev + 1 : Math.max(0, prev - 1));
                        
                        // Fetch fresh counts from the database after a short delay
                        setTimeout(async () => {
                          try {
                            const { data: refreshedUser, error: refreshError } = await supabase
                              .from('users')
                              .select('followers_count, following_count')
                              .eq('user_id', user.user_id)
                              .single();
                              
                            if (!refreshError && refreshedUser) {
                              console.log("Refreshed counts:", refreshedUser.followers_count, refreshedUser.following_count);
                              setFollowerCount(refreshedUser.followers_count || 0);
                              setFollowingCount(refreshedUser.following_count || 0);
                            }
                          } catch (e) {
                            console.error("Error refreshing counts:", e);
                          }
                        }, 500);
                      }}
                    />
                  )}
                </div>
                {currentUser?.user_id === user.user_id && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/settings/profile`)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => router.push("/settings/security")}>
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

                {userRecipes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {userRecipes.map((recipe) => (
                      <RecipeCard 
                        key={recipe.recipe_id || `recipe-${Math.random()}`}
                        id={recipe.recipe_id || `temp-${Math.random()}`}
                        title={recipe.title || 'Untitled Recipe'}
                        description={recipe.description || 'No description available'}
                        image={recipe.image_url || '/placeholder.jpg'}
                        tags={recipe.tags || []}
                        likes={recipe.likes_count || 0}
                        views={recipe.views_count || 0}
                        user_id={recipe.user_id || user.user_id}
                        username={user.username || 'Unknown user'}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No recipes found</p>
                    {currentUser?.user_id === user.user_id && (
                      <Button onClick={() => router.push('/create-recipe')}>
                        Create Your First Recipe
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="saved" className="pt-6">
                {savedRecipes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {savedRecipes.map((recipe) => (
                      <RecipeCard 
                        key={recipe.id}
                        {...recipe}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No saved recipes found</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="liked" className="pt-6">
                {likedRecipes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {likedRecipes.map((recipe) => (
                      <RecipeCard 
                        key={recipe.id}
                        {...recipe}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No liked recipes found</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
