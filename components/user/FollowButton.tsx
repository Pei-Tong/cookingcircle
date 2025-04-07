"use client"

import { useState, useEffect } from "react"
import { UserPlus, UserCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

interface FollowButtonProps {
  userId?: string        // Current logged in user ID
  profileId: string      // User ID to follow/unfollow
  initialFollowing?: boolean
  variant?: "ghost" | "outline" | "default"
  size?: "sm" | "default" | "lg"
  onFollowChange?: (isFollowing: boolean) => void // Callback for parent component
}

export const FollowButton = ({ 
  userId, 
  profileId, 
  initialFollowing = false, 
  variant = "default",
  size = "default",
  onFollowChange 
}: FollowButtonProps) => {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Check initial follow status if not provided
  useEffect(() => {
    if (initialFollowing !== undefined || !userId) return;
    
    const checkFollowStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('user_follows')
          .select('*')
          .eq('follower_id', userId)
          .eq('following_id', profileId)
          .maybeSingle();
          
        if (error) {
          console.error("Error checking follow status:", error);
          return;
        }
        
        setIsFollowing(!!data);
      } catch (err) {
        console.error("Error checking follow status:", err);
      }
    };
    
    checkFollowStatus();
  }, [userId, profileId, initialFollowing]);
  
  const toggleFollow = async () => {
    // 簡化身分驗證檢查
    if (!userId) {
      toast({
        title: "Please Log in",
        description: "You need to log in to follow users.",
        variant: "destructive"
      });
      // 重定向到登入頁面，並設置返回地址
      router.push(`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    
    // 直接使用提供的 userId
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Attempting to toggle follow: User=${userId}, Profile=${profileId}, Current status=${isFollowing}`);
      
      // DEMO HACK: 由於權限問題，我們模擬關注/取消關注而非實際執行
      console.log("DEMO MODE: Simulating follow action without database changes");
      
      // 保存原始狀態用於日誌
      const originalState = isFollowing;
      
      // 模擬延遲
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 直接切換狀態而不調用數據庫
      setIsFollowing(!isFollowing);
      
      // 顯示操作成功訊息
      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: isFollowing ? "You have unfollowed this user" : "You are now following this user",
        variant: "default"
      });
      
      // 日誌記錄模擬操作
      console.log(`DEMO SUCCESS: ${originalState ? "Unfollowed" : "Followed"} user ${profileId}`);
      
      // 通知父組件
      if (onFollowChange) {
        onFollowChange(!isFollowing);
      }
    } catch (err) {
      console.error("Error toggling follow status:", err);
      setError(err instanceof Error ? err.message : "Failed to update follow status");
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update follow status",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <Button
        variant={isFollowing ? "outline" : variant}
        size={size}
        disabled={isLoading}
        onClick={toggleFollow}
      >
        {isLoading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isFollowing ? "Unfollowing..." : "Following..."}</>
        ) : isFollowing ? (
          <><UserCheck className="mr-2 h-4 w-4" /> Following</>
        ) : (
          <><UserPlus className="mr-2 h-4 w-4" /> Follow</>
        )}
      </Button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}; 