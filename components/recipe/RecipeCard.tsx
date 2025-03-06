import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface RecipeCardProps {
  id: string
  title: string
  image: string
  description: string
  tags: string[]
  likes: number
  views: number
  poster?: string
  onAddToFavorite?: () => void
}

export function RecipeCard({
  id,
  title,
  image,
  description,
  tags,
  likes,
  views,
  poster = "Anonymous",
  onAddToFavorite,
}: RecipeCardProps) {
  const handleAddToFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    onAddToFavorite?.()
  }

  return (
    <Link href={`/recipes/${id}`}>
      <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-md border border-gray-200">
        <div className="relative aspect-video overflow-hidden group">
          <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="p-4 h-full flex flex-col justify-center relative">
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-0 right-0 bg-white hover:bg-white/90"
                onClick={handleAddToFavorite}
              >
                <Heart className="h-4 w-4" />
                <span className="sr-only">Add to favorites</span>
              </Button>
              <p className="text-white text-sm line-clamp-4 text-center">{description}</p>
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg tracking-tight mb-2 line-clamp-1">{title}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs font-medium">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-3">
            <span className="font-medium hover:text-gray-900">{poster}</span>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{likes}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{views}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}

