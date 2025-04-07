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
        
        // Combine cart items with product details
        const combinedCartItems = cartData.map(cartItem => {
          const productDetails = productsData.find(product => product.product_id === cartItem.product_id) || {
            product_id: cartItem.product_id,
            name: "Unknown Product",
            description: "",
            price: 0,
            image_url: "/placeholder.jpg",
            category: "other"
          }
          
          return {
            ...cartItem,
            product: productDetails
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
                <Tabs defaultValue="all">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All Items</TabsTrigger>
                    <TabsTrigger value="categories">By Category</TabsTrigger>
                    <TabsTrigger value="add">Add Items</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="pt-6">
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
                                    <span className="font-medium w-48">{item.product?.name}</span>
                                    <span className="text-muted-foreground w-20 text-right">{item.product?.amount || item.quantity}</span>
                                    <span className="text-muted-foreground w-24">{item.product?.unit || 'item(s)'}</span>
                                    <span className="text-muted-foreground text-xs">{item.product_type}</span>
                                  </div>
                                </label>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center border rounded px-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                    className="h-8 px-2"
                                  >
                                    <MinusCircle className="h-4 w-4" />
                                  </Button>
                                  <span className="mx-2">{item.quantity}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="h-8 px-2"
                                  >
                                    <PlusCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="categories" className="pt-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle>Items by Category</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {Object.entries(getItemsByCategory()).map(([category, items]) => (
                            <div key={category}>
                              <h3 className="font-semibold mb-4 capitalize">{category}</h3>
                              
                              {items.length > 0 && (
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Checkbox 
                                      id={`select-cat-${category}`} 
                                      checked={items.every(item => selectedItems.includes(item.id))}
                                      onCheckedChange={() => {
                                        if (items.every(item => selectedItems.includes(item.id))) {
                                          setSelectedItems(prev => prev.filter(id => !items.some(item => item.id === id)))
                                        } else {
                                          setSelectedItems(prev => [...prev, ...items.map(item => item.id).filter(id => !prev.includes(id))])
                                        }
                                      }}
                                    />
                                    <label htmlFor={`select-cat-${category}`} className="text-sm font-medium">
                                      Select All in {category}
                                    </label>
                                  </div>
                                </div>
                              )}
                              
                              <div className="space-y-2">
                                {items.map((item) => (
                                  <div key={item.id} className="flex items-center justify-between p-2 border-b">
                                    <div className="flex items-center gap-2">
                                      <Checkbox 
                                        id={`cat-${item.id}`} 
                                        checked={selectedItems.includes(item.id)}
                                        onCheckedChange={() => toggleItemSelection(item.id)}
                                      />
                                      <label htmlFor={`cat-${item.id}`} className="flex gap-2">
                                        <span>{item.product?.name}</span>
                                        {item.product?.amount && (
                                          <span className="text-muted-foreground">
                                            {item.product.amount} {item.product.unit || ''}
                                          </span>
                                        )}
                                        <span className="text-muted-foreground text-xs">({item.product_type})</span>
                                      </label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center border rounded px-1">
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                          className="h-8 px-2"
                                        >
                                          <MinusCircle className="h-4 w-4" />
                                        </Button>
                                        <span className="mx-2">{item.quantity}</span>
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                          className="h-8 px-2"
                                        >
                                          <PlusCircle className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.id)}>
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="add" className="pt-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle>Add New Item</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center mb-4">
                          <Input 
                            placeholder="Add new item" 
                            className="mr-2" 
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addNewItem()}
                          />
                          <Button size="sm" onClick={addNewItem}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Add any additional items you need to your shopping list.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
              
              {cartItems.length > 0 && (
                <Card className="mt-6">
                  <CardHeader className="pb-3">
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Shipping</span>
                        <span>Calculated at checkout</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Tax</span>
                        <span>Calculated at checkout</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>Total</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">
                      Proceed to Checkout
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

