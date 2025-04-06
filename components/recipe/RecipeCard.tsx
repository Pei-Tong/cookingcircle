import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Eye, Bookmark } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface RecipeCardProps {
  id: string
  title: string
  image: string
  description: string
  tags: string[]
  likes: number
  views: number
  poster?: string
  user_id?: string
  username?: string
  onAddToFavorite?: () => void
}

export function RecipeCard({
  id,
  title,
  image,
  description,
  tags,
  likes: initialLikes,
  views: initialViews,
  poster = "Anonymous",
  user_id,
  username,
  onAddToFavorite,
}: RecipeCardProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isCollected, setIsCollected] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [viewsCount, setViewsCount] = useState(initialViews);
  
  const displayName = username || poster;
  
  useEffect(() => {
    const checkAuth = async () => {
      // Reset states first
      setUser(null);
      setIsCollected(false);
      setIsLiked(false);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        const { data: collectionData } = await supabase
          .from('recipe_collections')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('recipe_id', id)
          .single();
          
        setIsCollected(!!collectionData);
        
        const { data: likeData } = await supabase
          .from('recipe_likes')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('recipe_id', id)
          .single();
          
        setIsLiked(!!likeData);
      }
    };
    
    checkAuth();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          // Reset states on sign out
          setUser(null);
          setIsCollected(false);
          setIsLiked(false);
        } else if (session && event === 'SIGNED_IN') {
          // Refresh auth state on sign in
          checkAuth();
        }
      }
    );
    
    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  const handleViewRecipe = async (e: React.MouseEvent) => {
    try {
      setViewsCount(prev => prev + 1);
      
      const viewData = {
        recipe_id: id,
        user_id: user?.id || null,
        ip_address: '0.0.0.0',
        viewed_at: new Date().toISOString()
      };
      
      supabase.from('recipe_views').insert([viewData]).then(({ error }) => {
        if (error) {
          console.error("Error recording view:", error);
        }
      });
      
      e.preventDefault();
      router.push(`/recipes/${id}`);
    } catch (error) {
      console.error("Error recording view:", error);
      router.push(`/recipes/${id}`);
    }
  };

  const handleAddToCollection = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Force check current auth state before proceeding
    const { data: { session } } = await supabase.auth.getSession();
    const currentUser = session?.user || null;
    setUser(currentUser);
    
    if (!currentUser) {
      console.log("User not logged in, showing login prompt");
      
      // Show toast notification
      toast({
        title: "Please log in",
        description: "You need to log in to add recipes to your collection",
        variant: "destructive",
      });
      
      // Backup alert in case toast doesn't appear
      alert("Please log in to add recipes to your collection");
      return;
    }
    
    try {
      if (isCollected) {
        await supabase
          .from('recipe_collections')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('recipe_id', id);
          
        setIsCollected(false);
        toast({
          title: "Removed from collection",
          description: "Recipe removed from your collection",
        });
      } else {
        await supabase
          .from('recipe_collections')
          .insert([
            { 
              user_id: currentUser.id, 
              recipe_id: id,
              created_at: new Date().toISOString()
            }
          ]);
          
        setIsCollected(true);
        toast({
          title: "Added to collection",
          description: "Recipe added to your collection",
        });
      }
      
      onAddToFavorite?.();
    } catch (error) {
      console.error("Error updating collection:", error);
      toast({
        title: "Error",
        description: "There was an error updating your collection",
        variant: "destructive",
      });
    }
  };
  
  const handleLikeClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Force check current auth state before proceeding
    const { data: { session } } = await supabase.auth.getSession();
    const currentUser = session?.user || null;
    setUser(currentUser);
    
    if (!currentUser) {
      console.log("User not logged in, showing login prompt");
      
      // Show toast notification
      toast({
        title: "Please log in",
        description: "You need to log in to like recipes",
        variant: "destructive",
      });
      
      // Backup alert in case toast doesn't appear
      alert("Please log in to like recipes");
      return;
    }
    
    try {
      if (isLiked) {
        await supabase
          .from('recipe_likes')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('recipe_id', id);
          
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
        toast({
          title: "Unliked",
          description: "Recipe removed from your likes",
        });
      } else {
        await supabase
          .from('recipe_likes')
          .insert([
            { 
              user_id: currentUser.id, 
              recipe_id: id,
              created_at: new Date().toISOString()
            }
          ]);
          
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        toast({
          title: "Liked",
          description: "Recipe added to your likes",
        });
      }
    } catch (error) {
      console.error("Error updating like:", error);
      toast({
        title: "Error",
        description: "There was an error updating your like",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-md border border-gray-300" onClick={handleViewRecipe}>
      <div className="relative aspect-video overflow-hidden group">
        <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover" />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="p-4 h-full flex flex-col justify-center relative">
            <Button
              variant="secondary"
              size="icon"
              className={`absolute top-2 right-2 bg-white hover:bg-white/90 border-gray-300 ${isCollected ? 'text-blue-500' : ''}`}
              onClick={handleAddToCollection}
            >
              <Bookmark className={`h-4 w-4 ${isCollected ? 'fill-current' : ''}`} />
              <span className="sr-only">Save recipe</span>
            </Button>
            <p className="text-white text-sm line-clamp-4 text-center">{description}</p>
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg tracking-tight mb-2 line-clamp-1">{title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="default" className="text-xs font-medium bg-black text-white">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-3">
          <span 
            className="font-medium hover:text-gray-900 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/profile/${username || user_id || 'anonymous'}`);
            }}
          >{displayName}</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLikeClick} 
            className="flex items-center gap-1 hover:text-gray-900"
          >
            <Heart className={`h-4 w-4 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            <span>{likesCount}</span>
          </button>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{viewsCount}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

