'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import { Star, ShoppingCart, Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/components/ui/use-toast"

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
  const [inCart, setInCart] = useState(false)
  const { toast } = useToast()

  // Check if the product is already in the cart when the page loads
  useEffect(() => {
    const checkCartStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      console.log(`Checking cart status for product: ${name}, id: ${id}, type: ${productType}`)
      
      // Always use product_id and product_type for consistency
      const { data, error } = await supabase
        .from('shopping_cart')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('product_id', id)
        .eq('product_type', productType || 'product')
        .maybeSingle()

      if (error) {
        console.error(`Error checking cart status:`, error)
        return
      }

      console.log(`Cart status for ${name}: ${data ? 'In cart' : 'Not in cart'}`)
      setInCart(!!data)
    }

    checkCartStatus()
  }, [id, name, productType])

  // Handle cart button click
  const handleCartButtonClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log(`Cart button clicked for product: ${name}, id: ${id}, type: ${productType}`)
    
    // If there's an external onAddToCart function, use that first
    if (onAddToCart) {
      onAddToCart()
      return
    }
    
    // Check login status first
    setLoading(true)
    try {
      const { data } = await supabase.auth.getSession()
      
      if (!data.session) {
        toast({
          title: "Login Required",
          description: "Please log in to add items to your cart",
          variant: "destructive"
        })
        // Show English alert message
        alert("Please login to add items to your cart")
        return
      }

      const userId = data.session.user.id
      
      console.log(`Processing cart action for: ${name}, id: ${id}, type: ${productType}`)
      
      // For simplicity, always use product_id for all product types
      // This ensures consistent behavior across all product cards
      if (!inCart) {
        // Add to cart - first check if user or product ID is valid
        if (!userId || !id) {
          console.error("Invalid user ID or product ID", { userId, productId: id });
          toast({
            title: "Error",
            description: "Invalid user or product information",
            variant: "destructive"
          })
          return;
        }
        
        // Create cart item object with required fields
        const cartItem = {
          user_id: userId,
          product_id: id,
          quantity: 1,
          product_type: productType || 'product' // Include product_type field
        };
        
        console.log("Adding to cart with data:", cartItem);
        
        // Try a different approach by explicitly sending column names
        const { error } = await supabase
          .from('shopping_cart')
          .insert(cartItem)
        
        if (error) {
          console.error("Error adding to cart:", error);
          toast({
            title: "Error",
            description: "Failed to add item to cart",
            variant: "destructive"
          })
          return;
        }
        
        // Update local state
        setInCart(true)
        
        // Show success message
        toast({
          title: "Added to Cart",
          description: `${name} has been added to your cart`
        })
      } else {
        // Remove from cart
        const { error } = await supabase
          .from('shopping_cart')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', id)
          .eq('product_type', productType || 'product');
        
        if (error) {
          console.error("Error removing from cart:", error);
          toast({
            title: "Error",
            description: "Failed to remove item from cart",
            variant: "destructive"
          })
          return;
        }
        
        // Update local state
        setInCart(false)
        
        // Show success message
        toast({
          title: "Removed from Cart",
          description: `${name} has been removed from your cart`
        })
      }
    } catch (err) {
      console.error("Shopping cart operation error:", err)
      toast({
        title: "Error",
        description: "Failed to update your cart",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
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
            priority
            onError={(e) => {
              // Use fallback image when image loading fails
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
            onClick={handleCartButtonClick}
            disabled={loading}
            data-product-id={id}
            data-product-type={productType}
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

