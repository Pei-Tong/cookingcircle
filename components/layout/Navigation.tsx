"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Menu, Bell, LogIn, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { NewRecipeButton } from "@/components/new-recipe-button"
import { Skeleton } from "@/components/ui/skeleton"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<{ email: string; username?: string } | null>(null)
  const [loading, setLoading] = useState(true) 
  const router = useRouter()

  useEffect(() => {
    async function fetchUser() {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        const userId = session.user.id

        const { data: profile } = await supabase
          .from("users")
          .select("username")
          .eq("user_id", userId)
          .single()

        setUser({
          email: session.user.email ?? "",
          username: profile?.username ?? undefined,
        })
      }

      setLoading(false)
    }

    fetchUser()

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        fetchUser()
      }
      if (event === "SIGNED_OUT") {
        setUser(null)
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error(" Logout Error:", error.message)
      return
    }

    console.log(" Logged out")
    setUser(null)
    router.refresh()
  }

  const navItems = [
    { label: "Explore", href: "#" },
    { label: "My Recipes", href: "#" },
    { label: "Favorites", href: "#" },
    { label: "Shop", href: "#" },
  ]

  return (
    <header className="w-full bg-white border-b border-zinc-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-semibold tracking-tight">Cooking Circle</Link>
          <nav className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} className="text-sm font-medium hover:text-zinc-600 transition-colors">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <NewRecipeButton />
          {loading ? (
            <Skeleton className="w-20 h-8 rounded-md" />
          ) : user ? (
            <>
              <span className="text-sm text-gray-700">👤 {user.username || user.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="default" size="sm">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
          )}
          <Button variant="ghost" size="icon" className="relative" href="/shopping-list">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">3</span>
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">2</span>
          </Button>
        </div>

      </div>
    </header>
  )
}
