"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUserProfile, getFollowerCount, getFollowingCount, checkIsFollowing, toggleFollow } from "@/lib/db/profile"
import type { User, UserWithRecipes, Recipe } from "@/lib/db/types"
import { getRecipes } from "@/lib/db/recipes"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

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

interface ProfilePageProps {
  params: Promise<{ id: string }>
}

interface UserData {
  user_id: string;
  username: string;
}

export default function UserProfile({ params }: ProfilePageProps) {
  const router = useRouter()
  const { id } = use(params)
  const [profile, setProfile] = useState<UserWithRecipes | null>(null)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [followerCount, setFollowerCount] = useState<number>(0)
  const [followingCount, setFollowingCount] = useState<number>(0)
  const [isFollowing, setIsFollowing] = useState<boolean>(false)
  const [sortOption, setSortOption] = useState<string>("newest")

  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])
  const [likedRecipes, setLikedRecipes] = useState<Recipe[]>([])

  const filterCategories = [
    "All", "Main Course", "Appetizers", "Desserts", "Vegetarian",
    "Quick & Easy", "Italian", "Asian", "Baking", "Healthy",
    "Under 30 mins", "Gluten-Free",
  ]

  useEffect(() => {
    const fetchProfileAndRecipes = async () => {
      if (!id) {
        setError("Invalid user profile ID.")
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        // 先檢查 ID 是否為有效的 UUID
        const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
        
        let userId = id;
        
        if (!isValidUUID) {
          // 解碼 URL 編碼的用戶名
          const decodedUsername = decodeURIComponent(id);
          console.log('Attempting to find user by username:', decodedUsername);
          
          // 如果不是 UUID，嘗試通過用戶名查找用戶
          const { data: userData, error: userError } = await supabase!
            .from('users')
            .select('user_id, username')
            .or(`username.eq.${decodedUsername},username.ilike.${decodedUsername}`)
            .maybeSingle();

          if (userError) {
            console.error('User lookup error:', userError);
            throw new Error(`Failed to find user: ${userError.message}`);
          }

          if (!userData) {
            console.error('No user found with username:', decodedUsername);
            throw new Error(`User "${decodedUsername}" not found`);
          }

          const typedUserData = userData as UserData;
          userId = typedUserData.user_id;
          console.log('Found user:', typedUserData);
        } else {
          console.log('Using UUID directly:', id);
        }

        try {
          console.log('Fetching profile data for user ID:', userId);
          // 使用找到的或提供的 user_id 繼續查詢
          const [profileData, recipesData] = await Promise.all([
            getUserProfile(userId),
            getRecipes(10, userId)
          ]);

          if (!profileData) {
            console.error('Profile not found for user ID:', userId);
            throw new Error('User profile not found');
          }

          console.log('Successfully fetched profile data:', {
            userId: profileData.user_id,
            username: profileData.username,
            recipesCount: recipesData.length
          });

          // 獲取關注者和被關注者數量
          const [followerCountData, followingCountData, isFollowingData] = await Promise.all([
            getFollowerCount(userId),
            getFollowingCount(userId),
            checkIsFollowing(userId, userId)
          ]);

          console.log('Profile stats:', {
            followerCount: followerCountData,
            followingCount: followingCountData,
            isFollowing: isFollowingData
          });

          setProfile(profileData);
          setAvatarUrl(profileData.profile_image || null);
          setRecipes(recipesData);
          setFollowerCount(followerCountData);
          setFollowingCount(followingCountData);
          setIsFollowing(isFollowingData);

        } catch (err: any) {
          console.error("Error fetching profile data:", err);
          setError(err.message || "Failed to load profile data.");
        } finally {
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Error fetching profile data:", err);
        setError(err.message || "Failed to load profile data.");
      }
    }

    fetchProfileAndRecipes()
  }, [id])

  const sortRecipes = (recipesToSort: Recipe[], option: string) => {
    const sorted = [...recipesToSort]
    switch (option) {
      case "recent": return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case "likes": return sorted.sort((a, b) => (b.likes_count ?? 0) - (a.likes_count ?? 0))
      case "views": return sorted.sort((a, b) => (b.views_count ?? 0) - (a.views_count ?? 0))
      default: return sorted
    }
  }

  const handleEditProfile = () => {
    router.push("/settings/profile")
  }

  const handleToggleFollow = async () => {
    if (!id) return
    
    try {
      const newIsFollowing = await toggleFollow(id, id)
      setFollowerCount(prev => newIsFollowing ? prev + 1 : prev - 1)
      setIsFollowing(newIsFollowing)
    } catch (err) {
      console.error("Error toggling follow status:", err)
    }
  }

  const formatFollowerCount = (count: number) =>
    count >= 1000 ? (count / 1000).toFixed(1) + "k" : count.toString()

  const handleDeleteRecipe = (recipe_id: string) => {
    console.log(`Delete recipe action for ${recipe_id} (Backend not implemented yet)`)
    setRecipes((prev) => prev.filter((r) => r.recipe_id !== recipe_id))
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="max-w-5xl mx-auto">
             <div className="flex flex-col md:flex-row gap-6 items-start mb-10">
                <Skeleton className="w-32 h-32 rounded-full" />
                <div className="flex-1 space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex gap-6">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                </div>
             </div>
             <Skeleton className="h-10 w-full mb-6" />
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full" />)}
             </div>
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

  if (!profile) {
    return (
       <>
         <Navigation />
         <main className="max-w-[1200px] mx-auto px-4 py-6">
           <Alert variant="default">
             <AlertDescription>User profile could not be loaded.</AlertDescription>
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
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 items-start mb-10">
            <div className="relative w-32 h-32">
              <Avatar className="w-32 h-32">
                <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={profile.username || "User"} />
                <AvatarFallback>{profile.username?.slice(0, 2).toUpperCase() || "??"}</AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold">{profile.username || `User ${id?.substring(0, 6) || ''}`}</h1>
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
                  <Button onClick={handleToggleFollow}> {isFollowing ? "Following" : "Follow"} </Button>
                  <Button variant="outline" onClick={handleEditProfile}> <Edit className="h-4 w-4 mr-2" /> Edit Profile </Button>
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
                  <p className="font-semibold">{followingCount}</p>
                  <p className="text-sm text-muted-foreground">Following</p>
                </div>
              </div>

              <p className="text-muted-foreground">{profile.bio || "No bio available."}</p>
            </div>
          </div>

          <Tabs defaultValue="recipes">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recipes"><Grid className="h-4 w-4 mr-2" />Recipes</TabsTrigger>
              <TabsTrigger value="saved"><Bookmark className="h-4 w-4 mr-2" />Saved</TabsTrigger>
              <TabsTrigger value="liked"><Heart className="h-4 w-4 mr-2" />Liked</TabsTrigger>
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
                    active={filter === "All"}
                    onClick={() => console.log(`Filter clicked: ${filter}`)}
                  />
                ))}
              </div>
              */}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {recipes.length === 0 ? (
                  <p>This user hasn't published any recipes yet.</p>
                ) : (
                  sortRecipes(recipes, sortOption).map((recipe) => (
                    <RecipeCard
                      key={recipe.recipe_id}
                      recipe_id={recipe.recipe_id}
                      title={recipe.title}
                      description={recipe.description}
                      image_url={recipe.image_url || "/placeholder-recipe.jpg"}
                      tags={recipe.tags || []}
                      likes_count={recipe.likes_count || 0}
                      views_count={recipe.views_count || 0}
                      username={recipe.user?.username || 'Unknown'}
                      onDelete={() => handleDeleteRecipe(recipe.recipe_id)}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="saved" className="pt-6">
               <p>Saved recipes will be shown here (Not implemented yet).</p>
            </TabsContent>

            <TabsContent value="liked" className="pt-6">
               <p>Liked recipes will be shown here (Not implemented yet).</p>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  )
}
