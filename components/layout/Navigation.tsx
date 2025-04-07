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

  const getNavItems = (): NavItem[] => [
    { label: "Explore", href: "/explore" },
    { label: "My Recipes", href: user ? `/profile/${user.username || user.email?.split('@')[0]}` : "/login" },
    { label: "My Cart", href: "/shopping-list" },
    { label: "Shop", href: "/shop" }
  ];

  return (
    <header className="w-full bg-white border-b border-zinc-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-semibold tracking-tight">Cooking Circle</Link>
          <nav className="hidden md:flex gap-6">
            {getNavItems().map((item) => (
              <Link key={item.label} href={item.href} className="text-sm font-medium hover:text-zinc-600 transition-colors">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <NewRecipeButton />
          
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
          <Button variant="ghost" size="icon" className="relative" href="/shopping-list">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-3">
          <Button variant="ghost" size="icon" className="relative" href="/shopping-list">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Button>
          
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
                <Button className="w-full justify-start" variant="ghost" asChild>
                  <Link href="/new-recipe">
                    Create Recipe
                  </Link>
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
                  {getNavItems().map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="block text-sm font-medium hover:text-zinc-600 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
