"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export function NewRecipeButton() {
  const router = useRouter()
  const [isMac, setIsMac] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Detect if user is on Mac
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0)
  }, [])

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault()
        await handleNewRecipeClick()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [router])

  const handleNewRecipeClick = async () => {
    try {
      setIsLoading(true)
      
      // 檢查用戶是否已登入
      const { data } = await supabase.auth.getSession()
      
      if (!data.session) {
        // 用戶未登入，顯示原生的瀏覽器提醒
        window.alert("Please log in to create a new recipe");
        return
      }
      
      // 用戶已登入，直接導向到 create-recipe 頁面
      router.push("/create-recipe")
    } catch (error) {
      console.error("Error checking auth state:", error)
      window.alert("Error: Unable to check login status. Please try again later");
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Desktop button with tooltip */}
      <div className="hidden md:block">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleNewRecipeClick} className="gap-2" disabled={isLoading}>
                <Plus className="h-4 w-4" />
                {isLoading ? "Loading..." : "New Recipe"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isMac ? "⌘" : "Ctrl"} + N</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Mobile floating action button */}
      <Button
        onClick={handleNewRecipeClick}
        className="md:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        disabled={isLoading}
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">New Recipe</span>
      </Button>
    </>
  )
}

