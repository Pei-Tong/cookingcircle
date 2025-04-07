"use client"
import Image from "next/image"
import Link from "next/link"
import { Bookmark, Eye, Heart, BadgeCheck, MoreVertical, Pencil, Trash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState, useEffect } from "react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "@/components/ui/use-toast"

interface RecipeCardProps {
  recipe_id: string
  title: string
  description: string
  image_url?: string
  tags?: string[]
  likes_count?: number
  views_count?: number
  username?: string
  isOwner?: boolean
  onDelete?: (id: string) => void
}

export default function RecipeCard({
  recipe_id,
  title,
  description,
  image_url,
  tags = [],
  likes_count = 0,
  views_count = 0,
  username = "Anonymous",
  isOwner = false,
  onDelete,
}: RecipeCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isCollected, setIsCollected] = useState(false)
  const [currentLikes, setCurrentLikes] = useState(likes_count)
  const [isLoading, setIsLoading] = useState(false)

  // Check user auth status and like/collect status
  useEffect(() => {
    async function checkAuthAndStatus() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(session.user)
          
          // Check if user liked the recipe
          const { data: likeData } = await supabase
            .from('recipe_likes')
            .select('*')
            .eq('recipe_id', recipe_id)
            .eq('user_id', session.user.id)
            .single()
            
          setIsLiked(!!likeData)
          
          // Check if user collected the recipe
          const { data: collectData } = await supabase
            .from('recipe_collections')
            .select('*')
            .eq('recipe_id', recipe_id)
            .eq('user_id', session.user.id)
            .single()
            
          setIsCollected(!!collectData)
        }
      } catch (error) {
        console.error("Error checking auth status:", error)
      }
    }
    
    checkAuthAndStatus()
  }, [recipe_id])

  const handleDelete = async () => {
    try {
      await onDelete?.(recipe_id)
      setShowDeleteDialog(false)
    } catch (error) {
      console.error("Failed to delete recipe:", error)
    }
  }

  const handleEdit = () => {
    router.push(`/recipes/${recipe_id}/edit`)
  }
  
  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to log in to like recipes",
        variant: "destructive"
      })
      
      // 增加 alert 提示確保用戶看到
      alert("Please sign in to like recipes")
      return
    }
    
    setIsLoading(true)
    
    try {
      if (isLiked) {
        // Unlike recipe
        const { error } = await supabase
          .from('recipe_likes')
          .delete()
          .eq('recipe_id', recipe_id)
          .eq('user_id', user.id)
        
        if (error) throw error
        
        setIsLiked(false)
        setCurrentLikes(prev => Math.max(0, prev - 1))
      } else {
        // Like recipe
        const { error } = await supabase
          .from('recipe_likes')
          .insert({
            recipe_id: recipe_id,
            user_id: user.id
          })
        
        if (error) throw error
        
        setIsLiked(true)
        setCurrentLikes(prev => prev + 1)
      }
    } catch (error) {
      console.error("Error toggling like:", error)
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleCollect = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to log in to collect recipes",
        variant: "destructive"
      })
      
      // 增加 alert 提示確保用戶看到
      alert("Please sign in to collect recipes")
      return
    }
    
    setIsLoading(true)
    
    try {
      if (isCollected) {
        // Remove from collection
        const { error } = await supabase
          .from('recipe_collections')
          .delete()
          .eq('recipe_id', recipe_id)
          .eq('user_id', user.id)
        
        if (error) throw error
        
        setIsCollected(false)
        toast({
          title: "Removed from collection",
          description: "Recipe removed from your collection"
        })
      } else {
        // Add to collection
        const { error } = await supabase
          .from('recipe_collections')
          .insert({
            recipe_id: recipe_id,
            user_id: user.id
          })
        
        if (error) throw error
        
        setIsCollected(true)
        toast({
          title: "Added to collection",
          description: "Recipe added to your collection"
        })
      }
    } catch (error) {
      console.error("Error toggling collection:", error)
      toast({
        title: "Error",
        description: "Failed to update collection. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Link href={`/recipes/${recipe_id}`} className="block">
        <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-md border border-gray-200 bg-white group">
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={image_url || "/placeholder.svg"}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="p-4 h-full flex flex-col justify-center relative">
                <Button
                  variant="secondary"
                  size="icon"
                  className={`absolute top-2 right-2 bg-white hover:bg-white/90 ${isCollected ? "text-primary" : ""}`}
                  onClick={handleCollect}
                  disabled={isLoading}
                >
                  <Bookmark className={`h-4 w-4 ${isCollected ? "fill-current" : ""}`} />
                  <span className="sr-only">Add to collection</span>
                </Button>
                <p className="text-white text-sm line-clamp-4 text-center">{description}</p>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg line-clamp-1 text-black">{title}</h3>
              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault()
                        handleEdit()
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => {
                        e.preventDefault()
                        setShowDeleteDialog(true)
                      }}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="default" className="text-xs font-medium bg-black text-white">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between text-gray-500 text-sm">
            <div className="flex items-center gap-3">
              <span 
                className="font-medium hover:text-gray-900 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  if (username && username !== "Anonymous") {
                    router.push(`/profile/${username}`);
                  }
                }}
              >{username}</span>
              {username === "Chef Mario" && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <BadgeCheck className="h-4 w-4 text-blue-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Verified Chef</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-2 ${isLiked ? "text-red-500" : ""}`}
                onClick={handleLike}
                disabled={isLoading}
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                <span className="ml-1">{currentLikes}</span>
              </Button>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{views_count}</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </Link>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Recipe"
        description="Are you sure you want to delete this recipe? This action cannot be undone."
      />
    </>
  )
}

