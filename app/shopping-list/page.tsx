"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Plus, ShoppingCart, Loader2, MinusCircle, PlusCircle, Trash } from "lucide-react"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface CartItem {
  id: string
  user_id: string
  product_id: string
  product_type: string
  quantity: number
  created_at: string
  updated_at: string
  product: {
    product_id: string
    name: string
    description: string
    price: number
    image_url: string
    category: string
    unit?: string
    amount?: string
  }
}

export default function ShoppingList() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [newItemName, setNewItemName] = useState("")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const { toast } = useToast()
  const router = useRouter()

  // Get user and shopping cart data
  useEffect(() => {
    const fetchUserAndCartItems = async () => {
      try {
        setLoading(true)
        
        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          setLoading(false)
          return
        }
        
        setUser(session.user)
        console.log("Fetching cart items for user:", session.user.id)
        
        // Try a simpler query first to debug
        try {
          const { data: checkData, error: checkError } = await supabase
            .from('shopping_cart')
            .select('*')
            .eq('user_id', session.user.id)
            .limit(10)
          
          if (checkError) {
            console.error("Error in preliminary cart check:", checkError)
          } else {
            console.log("Cart check result:", checkData)
          }
        } catch (checkErr) {
          console.error("Exception in cart check:", checkErr)
        }
        
        // Fetch shopping cart data without the join
        const { data: cartData, error: cartError } = await supabase
          .from('shopping_cart')
          .select(`
            id,
            user_id,
            product_id,
            product_type,
            quantity,
            created_at,
            updated_at
          `)
          .eq('user_id', session.user.id)
        
        if (cartError) {
          console.error("Error fetching cart items:", cartError)
          toast({
            title: "Error",
            description: "Failed to load shopping cart items",
            variant: "destructive"
          })
          return
        }
        
        console.log("Cart items fetched successfully:", cartData ? cartData.length : 0, "items")
        
        if (!cartData || cartData.length === 0) {
          setCartItems([])
          setLoading(false)
          return
        }
        
        // Extract product IDs from cart items
        const productIds = cartData.map(item => item.product_id)
        
        // Fetch product details for all products in the cart
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('product_id', productIds)
        
        if (productsError) {
          console.error("Error fetching product details:", productsError)
          toast({
            title: "Error",
            description: "Failed to load product details",
            variant: "destructive"
          })
          setLoading(false)
          return
        }
        
        console.log("Products fetched successfully:", productsData ? productsData.length : 0, "products")
        console.log("Product IDs in cart:", productIds)
        console.log("Product details from database:", productsData)
        
        // Check for products that could not be found
        const foundProductIds = productsData ? productsData.map(p => p.product_id) : []
        const missingProductIds = productIds.filter(id => !foundProductIds.includes(id))
        
        if (missingProductIds.length > 0) {
          console.warn("Could not find details for these products:", missingProductIds)
        }
        
        // Query the ingredients table for any items that might be ingredients instead of products
        const { data: ingredientsData, error: ingredientsError } = await supabase
          .from('ingredients')
          .select('*')
          .in('ingredient_id', missingProductIds)
        
        if (ingredientsError) {
          console.error("Error fetching ingredient details:", ingredientsError)
        } else if (ingredientsData && ingredientsData.length > 0) {
          console.log("Found some items as ingredients:", ingredientsData)
        }
        
        // Combine cart items with product details
        const combinedCartItems = cartData.map(cartItem => {
          // Try to find the product in products table
          const productDetails = productsData?.find(product => product.product_id === cartItem.product_id)
          
          // If not found in products, try to find in ingredients
          const ingredientDetails = !productDetails && ingredientsData?.find(
            ingredient => ingredient.ingredient_id === cartItem.product_id
          )
          
          // Create a final product object with fallbacks
          const finalProduct = {
            product_id: cartItem.product_id,
            name: productDetails?.name || 
                 ingredientDetails?.name || 
                 `Item ${cartItem.product_id.substring(0, 8)}`,
            description: productDetails?.description || ingredientDetails?.description || "",
            price: productDetails?.price || ingredientDetails?.price || 0,
            image_url: productDetails?.image_url || "/placeholder.jpg",
            category: productDetails?.category || ingredientDetails?.category || "other",
            unit: productDetails?.unit || ingredientDetails?.unit || "item",
            amount: productDetails?.amount || ingredientDetails?.quantity || ""
          }
          
          // Log the price source for debugging
          if (!productDetails?.price && ingredientDetails?.price) {
            console.log(`Using ingredient price for ${ingredientDetails.name}: $${ingredientDetails.price}`)
          }
          
          return {
            ...cartItem,
            product: finalProduct
          }
        })
        
        setCartItems(combinedCartItems as CartItem[])
      } catch (error) {
        console.error("Error in fetchUserAndCartItems:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserAndCartItems()
    
    // Set up real-time subscription to listen for cart changes
    const setupSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      
      const userId = session.user.id
      
      const subscription = supabase
        .channel(`shopping_cart_${userId}`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'shopping_cart',
            filter: `user_id=eq.${userId}` 
          }, 
          () => {
            fetchUserAndCartItems()
          }
        )
        .subscribe()
      
      return () => {
        subscription.unsubscribe()
      }
    }
    
    const unsubscribe = setupSubscription()
    
    return () => {
      if (unsubscribe) {
        unsubscribe.then(fn => fn && fn())
      }
    }
  }, [toast])
  
  // Manually add item to cart
  const addNewItem = async () => {
    if (!newItemName.trim() || !user) return
    
    try {
      // First create a new product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert({
          name: newItemName, 
          description: 'Manually added item',
          price: 0,
          category: 'other',
          image_url: '/placeholder.jpg'
        })
        .select('product_id, name, description, price, image_url, category')
      
      if (productError) {
        console.error("Error creating product:", productError)
        toast({
          title: "Error",
          description: "Failed to add item to cart",
          variant: "destructive"
        })
        return
      }
      
      // Add to cart
      const newProduct = productData[0]
      console.log("Adding new product to cart:", newProduct)
      
      // Check if the item already exists in the cart
      const { data: existingItem } = await supabase
        .from('shopping_cart')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', newProduct.product_id)
        .eq('product_type', 'product')
        .maybeSingle()
      
      let cartError
      
      if (existingItem) {
        // Update quantity if item already exists
        const { error } = await supabase
          .from('shopping_cart')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id)
          
        cartError = error
      } else {
        // Insert new item if it doesn't exist
        const { error } = await supabase
          .from('shopping_cart')
          .insert({
            user_id: user.id,
            product_id: newProduct.product_id,
            quantity: 1,
            product_type: 'product'
          })
          
        cartError = error
      }
      
      if (cartError) {
        console.error("Error adding to cart:", cartError)
        toast({
          title: "Error",
          description: "Failed to add item to cart",
          variant: "destructive"
        })
        return
      }
      
      toast({
        title: "Success",
        description: "Item added to cart",
      })
      
      // Clear input field
      setNewItemName("")
    } catch (error) {
      console.error("Error in addNewItem:", error)
    }
  }
  
  // Remove item from cart
  const removeFromCart = async (itemId: string) => {
    try {
      console.log(`Removing item with ID: ${itemId} from cart`)
      
      const { error } = await supabase
        .from('shopping_cart')
        .delete()
        .eq('id', itemId)
      
      if (error) {
        console.error("Error removing item from cart:", error)
        toast({
          title: "Error",
          description: "Failed to remove item from cart",
          variant: "destructive"
        })
        return
      }
      
      // Update local state
      setCartItems(cartItems.filter(item => item.id !== itemId))
      
      toast({
        title: "Success",
        description: "Item removed from cart",
      })
    } catch (error) {
      console.error("Error in removeFromCart:", error)
    }
  }
  
  // Update item quantity
  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    
    try {
      console.log(`Updating quantity for item ${itemId} to ${newQuantity}`)
      
      const { error } = await supabase
        .from('shopping_cart')
        .update({ quantity: newQuantity })
        .eq('id', itemId)
      
      if (error) {
        console.error("Error updating quantity:", error)
        toast({
          title: "Error",
          description: "Failed to update quantity",
          variant: "destructive"
        })
        return
      }
      
      // Update local state
      setCartItems(cartItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ))
      
      toast({
        title: "Success",
        description: "Quantity updated",
      })
    } catch (error) {
      console.error("Error in updateQuantity:", error)
    }
  }
  
  // Categorize cart items
  const getItemsByCategory = () => {
    const categories: {[key: string]: CartItem[]} = {}
    
    cartItems.forEach(item => {
      const category = item.product?.category || 'other'
      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push(item)
    })
    
    return categories
  }
  
  // Clear shopping cart
  const clearCart = async () => {
    if (!user) return;
    
    if (!confirm("Are you sure you want to clear your shopping cart?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('shopping_cart')
        .delete()
        .eq('user_id', user.id)
      
      if (error) {
        console.error("Error clearing cart:", error)
        toast({
          title: "Error",
          description: "Failed to clear shopping cart",
          variant: "destructive"
        })
        return
      }
      
      // Update local state
      setCartItems([])
      
      toast({
        title: "Success",
        description: "Shopping cart cleared",
      })
    } catch (error) {
      console.error("Error in clearCart:", error)
    }
  }
  
  // Calculate total price
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  }
  
  // Toggle item selection
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId)
      } else {
        return [...prev, itemId]
      }
    })
  }
  
  // Toggle all items selection
  const toggleAllItems = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(cartItems.map(item => item.id))
    }
  }
  
  // Delete selected items
  const deleteSelectedItems = async () => {
    if (selectedItems.length === 0) return
    
    if (!confirm(`Are you sure you want to delete ${selectedItems.length} selected items?`)) {
      return
    }
    
    try {
      console.log(`Deleting ${selectedItems.length} selected items`, selectedItems)
      
      // Handle errors in batch
      let successCount = 0
      let errorCount = 0
      
      // Delete items one by one - Supabase doesn't support IN operator in delete
      for (const itemId of selectedItems) {
        const { error } = await supabase
          .from('shopping_cart')
          .delete()
          .eq('id', itemId)
        
        if (error) {
          console.error(`Error deleting item ${itemId}:`, error)
          errorCount++
        } else {
          successCount++
        }
      }
      
      if (errorCount > 0) {
        toast({
          title: "Partial Success",
          description: `Deleted ${successCount} items, but failed to delete ${errorCount} items`,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Success",
          description: `Deleted ${successCount} items from your cart`,
        })
      }
      
      // Update local state
      setCartItems(cartItems.filter(item => !selectedItems.includes(item.id)))
      setSelectedItems([])
      
    } catch (error) {
      console.error("Error in deleteSelectedItems:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting items",
        variant: "destructive"
      })
    }
  }
  
  // If user is not logged in, show login prompt
  if (!loading && !user) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-6">Shopping List</h1>
            <Card>
              <CardContent className="pt-6 pb-6">
                <p className="mb-4">Please log in to view your shopping list.</p>
                <Button onClick={() => router.push('/login')}>Go to Login</Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Shopping List</h1>
            {cartItems.length > 0 && (
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={clearCart} className="flex items-center gap-2">
                  <Trash className="h-4 w-4" />
                  Clear Cart
                </Button>
                <Button>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Order from Walmart
                </Button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading your shopping list...</span>
            </div>
          ) : (
            <>
              {cartItems.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 pb-6 text-center">
                    <p className="mb-4">Your shopping cart is empty.</p>
                    <Button onClick={() => router.push('/shop')}>Go to Shop</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="pt-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>All Items ({cartItems.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {cartItems.length > 0 && (
                        <div className="flex items-center justify-between mb-4 pb-2 border-b">
                          <div className="flex items-center gap-2">
                            <Checkbox 
                              id="select-all" 
                              checked={selectedItems.length === cartItems.length}
                              onCheckedChange={toggleAllItems}
                            />
                            <label htmlFor="select-all" className="text-sm font-medium">
                              Select All
                            </label>
                          </div>
                          
                          {selectedItems.length > 0 && (
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={deleteSelectedItems}
                              className="flex items-center gap-1"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete Selected ({selectedItems.length})
                            </Button>
                          )}
                        </div>
                      )}
                      
                      <div className="space-y-4">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-2 border-b">
                            <div className="flex items-center gap-2">
                              <Checkbox 
                                id={`item-${item.id}`} 
                                checked={selectedItems.includes(item.id)}
                                onCheckedChange={() => toggleItemSelection(item.id)}
                              />
                              <label
                                htmlFor={`item-${item.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex gap-2"
                              >
                                <div className="flex items-center gap-4 w-full">
                                  <span className="font-medium w-48 truncate" title={item.product?.name}>
                                    {item.product?.name || `Item ${item.product_id.slice(0, 6)}`}
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-right w-16 truncate text-gray-600">
                                      {item.product?.amount || item.quantity}
                                    </span>
                                    <span className="w-24 truncate text-gray-600">
                                      {item.product?.unit || 'item(s)'}
                                    </span>
                                    <span className="w-20 text-right font-medium text-green-600">
                                      ${(item.product?.price || 0).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </label>
                            </div>
                            <div className="flex flex-col gap-2 items-center">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                >
                                  <MinusCircle className="h-4 w-4" />
                                </Button>
                                <span className="w-6 text-center">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <PlusCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500"
                                  onClick={() => removeFromCart(item.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                              <span className="text-xs text-gray-500">
                                Subtotal: ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {/* Show total at the bottom of items list */}
              {cartItems.length > 0 && (
                <div className="mt-6 pt-4 border-t flex justify-end">
                  <div className="text-right">
                    <div className="flex items-center justify-between gap-8">
                      <span className="text-gray-600">Total items:</span>
                      <span className="font-medium">{cartItems.length} items</span>
                    </div>
                    <div className="flex items-center justify-between gap-8 mt-1">
                      <span className="text-gray-600">Total quantity:</span>
                      <span className="font-medium">
                        {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-8 mt-1">
                      <span className="text-gray-600">Total amount:</span>
                      <span className="font-bold text-lg text-green-600">
                        ${calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

