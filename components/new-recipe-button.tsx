"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function NewRecipeButton() {
  const router = useRouter()
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    // Detect if user is on Mac
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault()
        router.push("/create-recipe")
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [router])

  return (
    <>
      {/* Desktop button with tooltip */}
      <div className="hidden md:block">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => router.push("/create-recipe")} className="gap-2">
                <Plus className="h-4 w-4" />
                New Recipe
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
        onClick={() => router.push("/create-recipe")}
        className="md:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">New Recipe</span>
      </Button>
    </>
  )
}

