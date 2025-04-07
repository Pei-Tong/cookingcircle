"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Plus, ShoppingCart, Loader2 } from "lucide-react"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  product: {
    id: string
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
        
        // Fetch shopping cart data
        const { data, error } = await supabase
          .from('shopping_cart')
          .select(`
            *,
            product:product_id (
              id, 
              name, 
              description, 
              price, 
              image_url, 
              category,
              unit,
              amount
            )
          `)
          .eq('user_id', session.user.id)
        
        if (error) {
          console.error("Error fetching cart items:", error)
          toast({
            title: "Error",
            description: "Failed to load shopping cart items",
            variant: "destructive"
          })
          return
        }
        
        setCartItems(data || [])
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
        .insert([
          { 
            name: newItemName, 
            description: 'Manually added item',
            price: 0,
            category: 'other',
            image_url: '/placeholder.jpg'
          }
        ])
        .select()
      
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
      const { error: cartError } = await supabase
        .from('shopping_cart')
        .insert([
          {
            user_id: user.id,
            product_id: newProduct.id,
            quantity: 1
          }
        ])
      
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
              <Button>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Order from Walmart
              </Button>
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
                        <div className="space-y-4">
                          {cartItems.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-2 border-b">
                              <div className="flex items-center gap-2">
                                <Checkbox id={`item-${item.id}`} />
                                <label
                                  htmlFor={`item-${item.id}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex gap-2"
                                >
                                  <div className="flex items-center gap-4 w-full">
                                    <span className="font-medium w-48">{item.product?.name}</span>
                                    <span className="text-muted-foreground w-20 text-right">{item.product?.amount || item.quantity}</span>
                                    <span className="text-muted-foreground w-24">{item.product?.unit || 'item(s)'}</span>
                                  </div>
                                </label>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
                              <div className="space-y-2">
                                {items.map((item) => (
                                  <div key={item.id} className="flex items-center justify-between p-2 border-b">
                                    <div className="flex items-center gap-2">
                                      <Checkbox id={`cat-${item.id}`} />
                                      <label htmlFor={`cat-${item.id}`} className="flex gap-2">
                                        <span>{item.product?.name}</span>
                                        {item.product?.amount && (
                                          <span className="text-muted-foreground">
                                            {item.product.amount} {item.product.unit || ''}
                                          </span>
                                        )}
                                      </label>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.id)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
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
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

