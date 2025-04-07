"use client"

import React from 'react'
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Menu, Bell, LogIn, ShoppingCart, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { NewRecipeButton } from "@/components/new-recipe-button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Plus } from "lucide-react"

interface AuthChangeEvent {
  event: string;
  session: any;
}

interface NavItem {
  label: string;
  href: string;
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<{ email: string; username?: string } | null>(null)
  const [loading, setLoading] = useState(true) 
  const [cartCount, setCartCount] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const handleAuthChanges = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Check if user exists in the users table
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
          
        // If user doesn't exist in our users table, create a record
        if (!existingUser) {
          console.log("Creating new user record in users table");
          
          // Get username from email by removing the domain part
          const username = session.user.email ? session.user.email.split('@')[0] : null;
          
          const { error } = await supabase
            .from('users')
            .insert([
              { 
                user_id: session.user.id,
                email: session.user.email,
                username: username,
                created_at: new Date().toISOString()
              }
            ]);
            
          if (error) {
            console.error("Error creating user record:", error);
          }
        }
        
        // Get user profile from users table
        const { data: profile } = await supabase
          .from("users")
          .select("username")
          .eq("user_id", session.user.id)
          .single();
          
        setUser({
          email: session.user.email ?? "",
          username: profile?.username ?? undefined,
        });
        
        // Fetch cart count when user is loaded
        fetchCartCount(session.user.id);
      }
      
      setLoading(false);
    };

    handleAuthChanges();

    const { data: listener } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      if (event === "SIGNED_IN" && session?.user) {
        handleAuthChanges()
      }
      if (event === "SIGNED_OUT") {
        setUser(null)
        setCartCount(0)
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])
  
  // Function to fetch cart count from database
  const fetchCartCount = async (userId: string) => {
    const { data, error } = await supabase
      .from('shopping_cart')
      .select('*')
      .eq('user_id', userId)
    
    if (error) {
      console.error("Error fetching cart items:", error)
      return
    }
    
    setCartCount(data?.length || 0)
  }

  // Listen for changes to the shopping cart
  useEffect(() => {
    if (!user) return
    
    let subscription: any = null;
    
    // Get the user ID from Supabase session
    const setupSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id
      
      if (!userId) return
      
      // Subscribe to changes in the shopping cart
      subscription = supabase
        .channel(`shopping_cart_changes_${userId}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'shopping_cart',
          filter: `user_id=eq.${userId}` 
        }, () => {
          // Refresh cart count whenever the cart changes
          fetchCartCount(userId)
        })
        .subscribe()
    }
    
    setupSubscription()
    
    // Cleanup function that will always run when component unmounts or when dependencies change
    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [user])

  const handleLogout = async () => {
    // First, clear all local storage and session storage to be absolutely sure
    localStorage.clear();
    sessionStorage.clear();
    
    // Then sign out from Supabase
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Logout Error:", error.message)
      return
    }

    console.log("Logged out successfully")
    setUser(null)
    
    // Force a complete page reload instead of just a refresh
    window.location.href = '/'
  }

  const handleAuthRequiredAction = (actionName: string) => {
    if (!user) {
      // 新增英文警告訊息
      alert(`Please login to ${actionName}`)
      
      // 保留原有的 toast 通知
      toast({
        title: "Login Required",
        description: `You need to login to ${actionName}`,
        variant: "destructive"
      })
      return false
    }
    return true
  }

  const handleCartClick = (e?: React.MouseEvent) => {
    // 防止事件冒泡和默認行為
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    // 新增日誌輸出
    console.log("Cart button clicked")
    
    if (!user) {
      // 使用英文警告訊息
      alert("Please login to view your shopping cart")
      
      // 同時顯示 toast 消息
      toast({
        title: "Login Required",
        description: "You need to login to view your shopping cart",
        variant: "destructive",
        duration: 3000
      })
    } else {
      // 用戶已登入，導向購物車頁面
      console.log("User is logged in, navigating to shopping cart")
      router.push("/shopping-list")
    }
  }

  const handleMyRecipesClick = () => {
    // 檢查用戶是否已登入
    if (!user) {
      // 使用英文警告訊息
      alert("Please login to view your recipes")
      
      // 同時顯示 toast 消息
      toast({
        title: "Login Required",
        description: "You need to login to view your recipes",
        variant: "destructive",
        duration: 3000
      })
      return
    }
    
    // 已登入用戶，導向到個人頁面
    router.push(`/profile/${user.username || user.email?.split('@')[0]}`)
  }

  const getNavItems = (): (NavItem | { label: string; onClick: () => void })[] => [
    { label: "Explore", href: "/explore" },
    { 
      label: "My Recipes", 
      onClick: handleMyRecipesClick
    },
    { 
      label: "My Cart", 
      onClick: handleCartClick
    },
    { label: "Shop", href: "/shop" }
  ];

  return (
    <header className="w-full bg-white border-b border-zinc-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-semibold tracking-tight">Cooking Circle</Link>
          <nav className="hidden md:flex gap-6">
            {getNavItems().map((item, index) => 
              'href' in item ? (
                <Link key={item.label} href={item.href} className="text-sm font-medium hover:text-zinc-600 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <button 
                  key={item.label} 
                  onClick={item.onClick} 
                  className="text-sm font-medium hover:text-zinc-600 transition-colors text-left"
                >
                  {item.label}
                </button>
              )
            )}
          </nav>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <NewRecipeButton onAuthNeeded={() => handleAuthRequiredAction("create recipe")} />
          
          {/* Admin link only visible when logged in */}
          {user && (
            <Link
              href="/tables-basic.html"
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
              target="_blank"
            >
              <Settings className="w-4 h-4" /> 
              <span>Admin</span>
            </Link>
          )}
          
          {loading ? (
            <Skeleton className="w-20 h-8 rounded-md" />
          ) : user ? (
            <>
              <Link href={`/profile/${user.username || user.email?.split('@')[0] || 'anonymous'}`} className="text-sm text-gray-700 hover:text-zinc-600 transition-colors cursor-pointer">
                👤 {user.username || user.email}
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm">
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
            </Link>
          )}
          <button 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9 relative"
            onClick={handleCartClick}
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-3">
          <button 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9 relative"
            onClick={handleCartClick}
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <Button className="w-full justify-start" variant="ghost" onClick={() => {
                  if (handleAuthRequiredAction("create recipe")) {
                    router.push("/create-recipe")
                    setIsOpen(false)
                  }
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Recipe
                </Button>
                
                {/* Admin link only visible when logged in */}
                {user && (
                  <Button className="w-full justify-start" variant="ghost" asChild>
                    <Link
                      href="/tables-basic.html"
                      className="flex items-center gap-2"
                      onClick={() => setIsOpen(false)}
                      target="_blank"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Admin</span>
                    </Link>
                  </Button>
                )}
                <div className="space-y-3">
                  {getNavItems().map((item, index) => 
                    'href' in item ? (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="block text-sm font-medium hover:text-zinc-600 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <button
                        key={item.label}
                        onClick={() => {
                          item.onClick()
                          setIsOpen(false)
                        }}
                        className="block text-sm font-medium hover:text-zinc-600 transition-colors text-left w-full"
                      >
                        {item.label}
                      </button>
                    )
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
