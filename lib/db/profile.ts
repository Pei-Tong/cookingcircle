import { supabase } from './client';
import type { User, UserWithRecipes } from './types';

export async function getUserProfile(userId: string): Promise<UserWithRecipes> {
  try {
    console.log('Fetching user profile for ID:', userId);
    
    // 首先檢查用戶是否存在
    const { data: userExists, error: checkError } = await supabase
      .from('users')
      .select('user_id, username')
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking user existence:', checkError);
      throw new Error(`Database error: ${checkError.message}`);
    }

    if (!userExists) {
      console.error('User does not exist:', userId);
      throw new Error('User not found');
    }

    // 獲取完整的用戶資料
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        user_id,
        username,
        profile_image,
        bio,
        created_at,
        followers_count,
        following_count,
        recipes (
          recipe_id,
          title,
          description,
          image_url,
          tags,
          likes_count,
          views_count,
          created_at,
          user_id
        )
      `)
      .eq('user_id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user profile:', userError);
      throw new Error(`Failed to fetch user profile: ${userError.message}`);
    }

    if (!userData) {
      console.error('No profile data found for user:', userId);
      throw new Error('User profile not found');
    }

    console.log('Successfully fetched user profile:', {
      userId: userData.user_id,
      username: userData.username,
      hasProfileImage: !!userData.profile_image,
      recipesCount: userData.recipes?.length || 0
    });

    return userData as UserWithRecipes;
  } catch (error: any) {
    console.error('Error in getUserProfile:', error);
    throw error;
  }
}

export async function updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }

  if (!data) {
    throw new Error('User not found');
  }

  return data as User;
}

export async function getFollowerCount(userId: string): Promise<number> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('followers_count')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return user?.followers_count || 0;
  } catch (error) {
    console.error('Error getting follower count:', error);
    throw error;
  }
}

export async function getFollowingCount(userId: string): Promise<number> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('following_count')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return user?.following_count || 0;
  } catch (error) {
    console.error('Error getting following count:', error);
    throw error;
  }
}

export async function checkIsFollowing(currentUserId: string, targetUserId: string): Promise<boolean> {
  try {
    console.log('Checking following status:', { currentUserId, targetUserId });

    // 檢查用戶是否存在
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('user_id')
      .in('user_id', [currentUserId, targetUserId]);

    if (usersError) {
      console.error('Error checking users:', usersError);
      return false;
    }

    // 如果找不到用戶，返回 false 而不是拋出錯誤
    if (!users || users.length < 2) {
      console.log('One or both users not found:', { users });
      return false;
    }

    // 檢查關注關係
    const { count, error } = await supabase
      .from('user_follows')
      .select('follow_id', { count: 'exact', head: true })
      .eq('follower_id', currentUserId)
      .eq('following_id', targetUserId);

    if (error) {
      console.error('Error checking follow status:', error);
      return false;
    }

    return count ? count > 0 : false;
  } catch (error) {
    console.error('Error in checkIsFollowing:', error);
    return false;
  }
}

export async function toggleFollow(currentUserId: string, targetUserId: string): Promise<boolean> {
  try {
    const isFollowing = await checkIsFollowing(currentUserId, targetUserId);

    if (isFollowing) {
      // Unfollow logic
      const { error: deleteError } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId);

      if (deleteError) throw deleteError;

      // Get current counts
      const { data: targetUser } = await supabase
        .from('users')
        .select('followers_count')
        .eq('user_id', targetUserId)
        .single();

      const { data: currentUser } = await supabase
        .from('users')
        .select('following_count')
        .eq('user_id', currentUserId)
        .single();

      // Update follower count for target user
      const { error: targetError } = await supabase
        .from('users')
        .update({ 
          followers_count: (targetUser?.followers_count || 1) - 1 
        })
        .eq('user_id', targetUserId);

      if (targetError) throw targetError;

      // Update following count for current user
      const { error: currentError } = await supabase
        .from('users')
        .update({ 
          following_count: (currentUser?.following_count || 1) - 1 
        })
        .eq('user_id', currentUserId);

      if (currentError) throw currentError;

      return false;
    } else {
      // Follow logic
      const { error: insertError } = await supabase
        .from('user_follows')
        .insert([
          {
            follower_id: currentUserId,
            following_id: targetUserId
          }
        ]);

      if (insertError) throw insertError;

      // Get current counts
      const { data: targetUser } = await supabase
        .from('users')
        .select('followers_count')
        .eq('user_id', targetUserId)
        .single();

      const { data: currentUser } = await supabase
        .from('users')
        .select('following_count')
        .eq('user_id', currentUserId)
        .single();

      // Update follower count for target user
      const { error: targetError } = await supabase
        .from('users')
        .update({ 
          followers_count: (targetUser?.followers_count || 0) + 1 
        })
        .eq('user_id', targetUserId);

      if (targetError) throw targetError;

      // Update following count for current user
      const { error: currentError } = await supabase
        .from('users')
        .update({ 
          following_count: (currentUser?.following_count || 0) + 1 
        })
        .eq('user_id', currentUserId);

      if (currentError) throw currentError;

      return true;
    }
  } catch (error) {
    console.error('Error toggling follow status:', error);
    throw error;
  }
} 