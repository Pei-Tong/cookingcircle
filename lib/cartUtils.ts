'use client'

import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "./supabaseClient"
import { useState, useEffect } from "react"

interface CartItem {
  id: string
  name: string
  price: number
  type?: string
  quantity?: number
}

export const useCartActions = () => {
  const { toast } = useToast()
  const router = useRouter()
  const [cartItems, setCartItems] = useState<Record<string, boolean>>({})

  // 載入用戶的購物車項目
  useEffect(() => {
    const loadCartItems = async () => {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return
      
      const { data } = await supabase
        .from('shopping_cart')
        .select('item_id')
        .eq('user_id', session.session.user.id)
      
      if (data) {
        const itemsMap: Record<string, boolean> = {}
        data.forEach(item => {
          itemsMap[item.item_id] = true
        })
        setCartItems(itemsMap)
      }
    }
    
    loadCartItems()
  }, [])

  // 檢查項目是否在購物車中
  const isItemInCart = (itemId: string) => {
    return !!cartItems[itemId]
  }

  // 檢查用戶是否已登入
  const checkUserAuth = async () => {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error("Error checking auth status:", error)
      return false
    }
    return !!data.session
  }

  // 加入購物車
  const addToCart = async (item: CartItem, setLoading?: (loading: boolean) => void) => {
    if (setLoading) setLoading(true)
    
    try {
      // 檢查用戶是否已登入
      const isAuthenticated = await checkUserAuth()
      
      if (!isAuthenticated) {
        // 用戶未登入，只顯示提示而不重定向
        toast({
          title: "請先登入",
          description: "您需要登入才能將商品加入購物車",
          variant: "destructive"
        })
        return false
      }
      
      // 獲取用戶ID
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: "錯誤",
          description: "無法識別用戶",
          variant: "destructive"
        })
        return false
      }
      
      // 將商品加入購物車 - 使用正確的表名 shopping_cart
      const { error } = await supabase
        .from('shopping_cart')
        .insert({
          user_id: user.id,
          item_name: item.name,
          item_type: item.type || 'product',
          item_id: item.id,
          quantity: item.quantity || 1,
          price: item.price,
          checked: false
        })
      
      if (error) {
        console.error("Error adding to cart:", error)
        toast({
          title: "錯誤",
          description: "加入購物車失敗: " + error.message,
          variant: "destructive"
        })
        return false
      } else {
        toast({
          title: "已加入購物車",
          description: `${item.name} 已加入您的購物車`,
        })
        
        // 更新本地購物車狀態
        setCartItems(prev => ({
          ...prev,
          [item.id]: true
        }))
        
        return true
      }
    } catch (err) {
      console.error("Error:", err)
      toast({
        title: "錯誤",
        description: "發生未知錯誤",
        variant: "destructive"
      })
      return false
    } finally {
      if (setLoading) setLoading(false)
    }
  }

  // 從購物車移除
  const removeFromCart = async (itemId: string, setLoading?: (loading: boolean) => void) => {
    if (setLoading) setLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false
      
      const { error } = await supabase
        .from('shopping_cart')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', itemId)
      
      if (error) {
        console.error("Error removing from cart:", error)
        return false
      }
      
      // 更新本地購物車狀態
      setCartItems(prev => {
        const updated = { ...prev }
        delete updated[itemId]
        return updated
      })
      
      return true
    } catch (err) {
      console.error("Error:", err)
      return false
    } finally {
      if (setLoading) setLoading(false)
    }
  }

  return { addToCart, removeFromCart, isItemInCart, cartItems }
} 