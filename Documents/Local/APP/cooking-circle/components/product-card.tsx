import Image from "next/image"
import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ProductCardProps {
  image: string
  name: string
  description: string
  rating: number
  purchases: number
  price: string
}

export default function ProductCard({ image, name, description, rating, purchases, price }: ProductCardProps) {
  return (
    <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-md border border-gray-200">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-lg line-clamp-1">{name}</h3>
          <span className="text-lg font-semibold">{price}</span>
        </div>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between">
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
      </CardContent>
    </Card>
  )
}

