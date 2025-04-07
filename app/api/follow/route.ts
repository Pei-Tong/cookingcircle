import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * 處理關注用戶的 POST 請求
 */
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { follower_id, following_id } = await request.json();

    // 檢查必要參數
    if (!follower_id || !following_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 檢查是否試圖關注自己
    if (follower_id === following_id) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      );
    }

    // 獲取當前會話以驗證請求
    const { data: { session } } = await supabase.auth.getSession();
    
    // 增強安全性：確保請求者已登入
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 檢查是否已關注 (避免重複)
    const { data: existingFollow } = await supabase
      .from('user_follows')
      .select('*')
      .eq('follower_id', follower_id)
      .eq('following_id', following_id)
      .maybeSingle();

    if (existingFollow) {
      return NextResponse.json(
        { message: 'Already following this user' },
        { status: 200 }
      );
    }

    // 新增關注關係
    const { error: insertError } = await supabase
      .from('user_follows')
      .insert({
        follower_id: follower_id,
        following_id: following_id
      });

    if (insertError) {
      console.error('Error following user:', insertError);
      return NextResponse.json(
        { error: insertError.message || 'Failed to follow user' },
        { status: 500 }
      );
    }

    // 獲取和更新目標用戶的關注者數量
    const { data: targetUser } = await supabase
      .from('users')
      .select('followers_count')
      .eq('user_id', following_id)
      .single();
      
    const { data: currentUser } = await supabase
      .from('users')
      .select('following_count')
      .eq('user_id', follower_id)
      .single();
      
    await supabase
      .from('users')
      .update({ followers_count: (targetUser?.followers_count || 0) + 1 })
      .eq('user_id', following_id);
      
    await supabase
      .from('users')
      .update({ following_count: (currentUser?.following_count || 0) + 1 })
      .eq('user_id', follower_id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in follow API:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

/**
 * 處理取消關注用戶的 DELETE 請求
 */
export async function DELETE(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { follower_id, following_id } = await request.json();

    // 檢查必要參數
    if (!follower_id || !following_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 獲取當前會話以驗證請求
    const { data: { session } } = await supabase.auth.getSession();
    
    // 增強安全性：確保請求者已登入
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 檢查關注關係是否存在
    const { data: existingFollow } = await supabase
      .from('user_follows')
      .select('*')
      .eq('follower_id', follower_id)
      .eq('following_id', following_id)
      .maybeSingle();

    if (!existingFollow) {
      return NextResponse.json(
        { message: 'Not following this user' },
        { status: 200 }
      );
    }

    // 刪除關注關係
    const { error: deleteError } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', follower_id)
      .eq('following_id', following_id);

    if (deleteError) {
      console.error('Error unfollowing user:', deleteError);
      return NextResponse.json(
        { error: deleteError.message || 'Failed to unfollow user' },
        { status: 500 }
      );
    }

    // 獲取和更新目標用戶的關注者數量
    const { data: targetUser } = await supabase
      .from('users')
      .select('followers_count')
      .eq('user_id', following_id)
      .single();
      
    const { data: currentUser } = await supabase
      .from('users')
      .select('following_count')
      .eq('user_id', follower_id)
      .single();
      
    await supabase
      .from('users')
      .update({ followers_count: Math.max(0, (targetUser?.followers_count || 1) - 1) })
      .eq('user_id', following_id);
      
    await supabase
      .from('users')
      .update({ following_count: Math.max(0, (currentUser?.following_count || 1) - 1) })
      .eq('user_id', follower_id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in unfollow API:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
} 