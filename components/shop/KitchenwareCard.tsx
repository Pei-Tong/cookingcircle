'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/components/ui/use-toast"

interface KitchenwareCardProps {
  id: string
  name: string
  price: string
  image: string
  description: string
  rating: number
  purchased: number
}

export function KitchenwareCard({ id, name, price, description, rating, purchased, image }: KitchenwareCardProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // 檢查用戶是否已登入
  const checkUserAuth = async () => {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error("Error checking auth status:", error)
      return false
    }
    return !!data.session
  }

  // 處理加入購物車
  const handleAddToCart = async () => {
    setLoading(true)
    
    try {
      // 檢查用戶是否已登入
      const isAuthenticated = await checkUserAuth()
      
      if (!isAuthenticated) {
        // 用戶未登入，導向登入頁面
        toast({
          title: "請先登入",
          description: "您需要登入才能將商品加入購物車",
          variant: "destructive"
        })
        router.push(`/login?redirectTo=${encodeURIComponent('/shopping-list')}`)
        return
      }
      
      // 獲取用戶ID
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: "錯誤",
          description: "無法識別用戶",
          variant: "destructive"
        })
        return
      }
      
      // 將商品加入購物車
      const { error } = await supabase
        .from('shopping_list')
        .insert({
          user_id: user.id,
          item_name: name,
          item_type: 'kitchenware',
          item_id: id,
          quantity: 1,
          price: parseFloat(price.replace('$', '')),
          checked: false
        })
      
      if (error) {
        console.error("Error adding to cart:", error)
        toast({
          title: "錯誤",
          description: "加入購物車失敗: " + error.message,
          variant: "destructive"
        })
      } else {
        toast({
          title: "已加入購物車",
          description: `${name} 已加入您的購物清單`,
        })
      }
    } catch (err) {
      console.error("Error:", err)
      toast({
        title: "錯誤",
        description: "發生未知錯誤",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden h-full border border-gray-200 hover:shadow-md transition-all duration-200">
      <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-kitchen.jpg'
          }}
        />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between mb-2">
          <h3 className="font-bold">{name}</h3>
          <span className="font-bold text-lg">{price}</span>
        </div>
        <p className="text-gray-600 text-sm mb-3">{description}</p>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(rating) 
                    ? "text-yellow-400" 
                    : i + 0.5 <= rating 
                    ? "text-yellow-300" 
                    : "text-gray-300"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>
          </div>
          <span className="text-sm text-gray-500">{purchased} purchased</span>
        </div>
        <Button 
          className="w-full"
          onClick={handleAddToCart}
          disabled={loading}
        >
          {loading ? (
            "Adding..."
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
} 