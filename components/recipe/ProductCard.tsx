'use client'

import { useState } from "react"
import Image from "next/image"
import { Star, ShoppingCart, Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCartActions } from "@/lib/cartUtils"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabaseClient"

interface ProductCardProps {
  id: string
  image: string
  name: string
  description: string
  rating: number
  purchases: number
  price: string
  productType?: string
  onAddToCart?: () => void
}

export function ProductCard({ 
  id, 
  image, 
  name, 
  description, 
  rating, 
  purchases, 
  price, 
  productType = "product",
  onAddToCart 
}: ProductCardProps) {
  const [loading, setLoading] = useState(false)
  const { addToCart, isItemInCart, cartItems } = useCartActions()
  const localToast = useToast()
  
  // 判斷商品是否已在購物車中
  const inCart = isItemInCart(id)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    
    // 如果有外部的onAddToCart函數，優先使用
    if (onAddToCart) {
      onAddToCart()
      return
    }

    // 如果已在購物車中，不執行任何操作
    if (inCart) return
    
    // 先檢查登入狀態
    setLoading(true)
    const { data } = await supabase.auth.getSession()
    
    if (!data.session) {
      localToast.toast({
        title: "請先登入",
        description: "您需要登入才能將商品加入購物車",
        variant: "destructive"
      })
      setLoading(false)
      return
    }

    // 否則使用默認的購物車功能
    await addToCart({
      id,
      name,
      price: parseFloat(price.replace('$', '')),
      type: productType,
      quantity: 1
    }, setLoading)
  }

  return (
    <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-md border border-gray-200">
      <div className="relative aspect-video overflow-hidden">
        <div className="w-full h-full bg-gray-200">
          <Image 
            src={image || "/placeholder.jpg"} 
            alt={name} 
            fill 
            className="object-cover" 
            onError={(e) => {
              // 圖片載入失敗時使用備用圖片
              const target = e.target as HTMLImageElement;
              if (!target.src.includes('placeholder.jpg')) {
                target.src = '/placeholder.jpg';
              }
            }}
          />
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg tracking-tight line-clamp-1">{name}</h3>
          <span className="text-lg font-semibold tracking-tight">{price}</span>
        </div>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < rating ? "fill-yellow-400 stroke-yellow-400" : "fill-gray-200 stroke-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">({rating})</span>
            </div>
            <span className="text-sm text-gray-600">{purchases} purchased</span>
          </div>
          <Button
            variant={inCart ? "default" : "outline"}
            size="icon"
            className={`h-8 w-8 transition-colors ${inCart ? "bg-green-600 hover:bg-green-700" : ""}`}
            onClick={handleAddToCart}
            disabled={loading}
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-current"></span>
            ) : inCart ? (
              <Check className="h-4 w-4 text-white" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
            <span className="sr-only">Add to Cart</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

