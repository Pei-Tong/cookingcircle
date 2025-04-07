"use client"

import { useState, useEffect } from "react"
import { UserPlus, UserCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabaseClient"

interface FollowButtonProps {
  userId?: string        // Current logged in user ID
  profileId: string     // User ID to follow/unfollow
  initialFollowing?: boolean
  variant?: "ghost" | "outline" | "default"
  size?: "sm" | "default" | "lg"
  onFollowChange?: (isFollowing: boolean) => void // Callback for parent component
}

export const FollowButton = ({ userId, profileId, initialFollowing, onFollowChange }: FollowButtonProps) => {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const toggleFollow = async () => {
    if (!userId) {
      setError("Please log in to follow users");
      console.error("Follow failed: No user ID provided (user not logged in)");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Attempting to toggle follow: User=${userId}, Profile=${profileId}, Current status=${isFollowing}`);
      
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          follower_id: userId,
          following_id: profileId,
          action: isFollowing ? 'unfollow' : 'follow'
        }),
        credentials: 'include', // Important: Include cookies with the request
      });
      
      const data = await response.json();
      console.log("Follow API response:", data);
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to update follow status");
      }
      
      // Toggle local state
      setIsFollowing(!isFollowing);
      
      // Notify parent component
      if (onFollowChange) {
        onFollowChange(!isFollowing);
      }
    } catch (err) {
      console.error("Error toggling follow status:", err);
      setError(err instanceof Error ? err.message : "Failed to update follow status");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <Button
        variant={isFollowing ? "outline" : "default"}
        size="sm"
        disabled={isLoading || !userId}
        onClick={toggleFollow}
        className="ml-2"
      >
        {isLoading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isFollowing ? "Unfollowing..." : "Following..."}</>
        ) : isFollowing ? (
          "Following"
        ) : (
          "Follow"
        )}
      </Button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {!userId && <p className="text-xs text-gray-500 mt-1">Log in to follow users</p>}
    </div>
  );
}; 