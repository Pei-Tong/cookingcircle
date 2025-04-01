import Image from "next/image"
import { Star, ShoppingCart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ProductCardProps {
  image: string
  name: string
  description: string
  rating: number
  purchases: number
  price: string
  onAddToCart?: () => void
}

export function ProductCard({ image, name, description, rating, purchases, price, onAddToCart }: ProductCardProps) {
  return (
    <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-md border border-gray-200">
      <div className="relative aspect-video overflow-hidden">
        <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
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
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.preventDefault()
              onAddToCart?.()
            }}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="sr-only">Add to Cart</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

