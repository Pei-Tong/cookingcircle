"use client"

import Image from "next/image"
import Link from "next/link"
import {
  Heart,
  Share2,
  Bookmark,
  Clock,
  ChefHat,
  ShoppingCart,
  MessageCircle,
  Plus,
  Minus,
  BadgeCheck,
  Eye,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import RecipeCard from "@/components/recipe-card"
import { useState, useEffect } from "react"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { ProductCard } from "@/components/recipe/ProductCard"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getRecipeById } from "@/lib/db/recipes"
import type { Recipe } from "@/lib/db/types"

class Fraction {
  constructor(decimal: number) {
    const tolerance = 1.0e-6
    let h1 = 1
    let h2 = 0
    let k1 = 0
    let k2 = 1
    let b = decimal
    do {
      const a = Math.floor(b)
      let aux = h1
      h1 = a * h1 + h2
      h2 = aux
      aux = k1
      k1 = a * k1 + k2
      k2 = aux
      b = 1 / (b - a)
    } while (Math.abs(decimal - h1 / k1) > decimal * tolerance)

    this.numerator = h1
    this.denominator = k1
  }

  numerator: number
  denominator: number
}

export default function RecipeDetail({ params }: { params: { id: string } }) {
  const [servings, setServings] = useState(4)
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const recipeData = await getRecipeById(params.id)
        setRecipe(recipeData)
      } catch (err: any) {
        setError(err.message || "Failed to load recipe")
      } finally {
        setLoading(false)
      }
    }

    fetchRecipe()
  }, [params.id])

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="max-w-[1200px] mx-auto px-4 py-6">
          <div>Loading...</div>
        </main>
        <Footer />
      </>
    )
  }

  if (error || !recipe) {
    return (
      <>
        <Navigation />
        <main className="max-w-[1200px] mx-auto px-4 py-6">
          <div>{error || "Recipe not found"}</div>
        </main>
        <Footer />
      </>
    )
  }

  const calculateAmount = (baseAmount: string, originalServings = 4) => {
    if (!baseAmount) return baseAmount

    // Handle fractions
    let baseNumeric: number
    if (baseAmount.includes("/")) {
      const [num, denom] = baseAmount.split("/")
      baseNumeric = Number(num) / Number(denom)
    } else {
      baseNumeric = Number(baseAmount)
    }

    // Calculate new amount
    const newAmount = (baseNumeric * servings) / originalServings

    // Format the result
    let formattedAmount: string
    if (newAmount < 1 && newAmount > 0) {
      // Convert to fraction if less than 1
      const fraction = new Fraction(newAmount)
      formattedAmount = `${fraction.numerator}/${fraction.denominator}`
    } else {
      formattedAmount = newAmount.toFixed(newAmount % 1 === 0 ? 0 : 2)
    }

    return formattedAmount
  }

  return (
    <>
      <Navigation />
      <main className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Homemade Margherita Pizza</h1>
              <p className="text-muted-foreground mb-4">
                A classic Italian pizza with fresh mozzarella, tomatoes, and basil on a crispy homemade crust.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge>Italian</Badge>
                <Badge>Vegetarian</Badge>
                <Badge variant="outline">30 min</Badge>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <Link href={`/profile/${recipe.user?.username || recipe.user_id}`} className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={recipe.user?.profile_image || "/placeholder.svg"} alt={recipe.user?.username || "Chef"} />
                    <AvatarFallback>{recipe.user?.username?.slice(0, 2).toUpperCase() || "??"}</AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{recipe.user?.username || "Unknown Chef"}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="inline-flex items-center justify-center rounded-full bg-blue-100 p-0.5">
                            <BadgeCheck className="h-4 w-4 text-blue-500" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Verified Chef</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <span
                      className="text-xs text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                      title={`Follow ${recipe.user?.username || "this chef"}`}
                    >
                      • Follow
                    </span>
                  </div>
                </Link>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Heart className="h-4 w-4" />
                  <span>128</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Eye className="h-4 w-4" />
                  <span>1.2k</span>
                </Button>
                <Button variant="ghost" size="sm">
                  <Bookmark className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
              <Image
                src="/placeholder.svg?height=600&width=1200"
                alt="Margherita Pizza"
                fill
                className="object-cover"
              />
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Prep Time</p>
                    <p className="text-sm text-muted-foreground">15 mins</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Cook Time</p>
                    <p className="text-sm text-muted-foreground">15 mins</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Difficulty</p>
                    <p className="text-sm text-muted-foreground">Medium</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Servings:</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setServings(Math.max(1, servings - 1))}
                  disabled={servings <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm font-medium">{servings}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setServings(servings + 1)}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <Tabs defaultValue="ingredients" className="mb-10">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                <TabsTrigger value="instructions">Instructions</TabsTrigger>
              </TabsList>
              <TabsContent value="ingredients" className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Ingredients</h2>
                  <Button>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add All to Shopping List
                  </Button>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  {/* Header */}
                  <div className="bg-gray-50 p-3 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <span className="w-48 font-semibold text-sm">Ingredient</span>
                        <span className="w-16 text-center font-semibold text-sm">Amount</span>
                        <span className="w-24 font-semibold text-sm">Unit</span>
                        <span className="font-semibold text-sm">Notes</span>
                      </div>
                      <span className="w-12"></span> {/* Space for shopping cart button */}
                    </div>
                  </div>

                  {/* Ingredients List */}
                  <ul className="divide-y">
                    {[
                      { name: "All-purpose flour", amount: "2 1/4", unit: "cups", additional: "(280g)" },
                      { name: "Salt", amount: "1", unit: "teaspoon" },
                      { name: "Instant yeast", amount: "1", unit: "teaspoon" },
                      { name: "Warm water", amount: "3/4", unit: "cup", additional: "(180ml)" },
                      { name: "Olive oil", amount: "1", unit: "tablespoon", note: "plus more for brushing" },
                      { name: "Crushed tomatoes", amount: "1", unit: "can", additional: "(14oz)" },
                      { name: "Garlic", amount: "2", unit: "cloves", note: "minced" },
                      { name: "Dried oregano", amount: "1", unit: "teaspoon" },
                      { name: "Fresh mozzarella cheese", amount: "8", unit: "oz", note: "sliced" },
                      { name: "Fresh basil leaves", amount: "", unit: "to taste" },
                      { name: "Salt and pepper", amount: "", unit: "to taste" },
                    ].map((ingredient, index) => (
                      <li key={index} className="flex items-center justify-between p-3 hover:bg-gray-50">
                        <div className="flex items-center gap-6">
                          <span className="w-48 font-medium">{ingredient.name}</span>
                          <span className="w-16 text-center">{calculateAmount(ingredient.amount)}</span>
                          <span className="w-24">{ingredient.unit}</span>
                          {(ingredient.additional || ingredient.note) && (
                            <span className="text-gray-500 text-sm">
                              {ingredient.additional} {ingredient.note}
                            </span>
                          )}
                        </div>
                        <Button variant="ghost" size="sm">
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>

                  {/* Footer */}
                  <div className="bg-gray-50 p-3 border-t">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Total Ingredients: 11</span>
                      <span>All measurements are Canadian Standard</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="instructions" className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Instructions</h2>
                <ol className="space-y-6">
                  {[
                    "In a large bowl, mix flour, salt, and yeast. Add warm water and olive oil, and stir until a dough forms.",
                    "Knead the dough on a floured surface for about 5 minutes until smooth and elastic. Place in an oiled bowl, cover, and let rise for 1 hour.",
                    "Preheat your oven to 475°F (245°C) with a pizza stone or baking sheet inside.",
                    "Mix crushed tomatoes with minced garlic, dried oregano, salt, and pepper to make the sauce.",
                    "Punch down the dough and roll it out on a floured surface to your desired thickness.",
                    "Transfer the dough to a piece of parchment paper. Spread the tomato sauce evenly, leaving a border for the crust.",
                    "Arrange mozzarella slices on top of the sauce.",
                    "Carefully transfer the pizza with the parchment paper onto the preheated stone or baking sheet.",
                    "Bake for 12-15 minutes until the crust is golden and the cheese is bubbly.",
                    "Remove from the oven, top with fresh basil leaves, drizzle with olive oil, and serve hot.",
                  ].map((step, index) => (
                    <li key={index} className="flex">
                      <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium mr-3">
                        {index + 1}
                      </span>
                      <p>{step}</p>
                    </li>
                  ))}
                </ol>
              </TabsContent>
            </Tabs>

            {/* Comments Section */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Comments (12)</h2>
                <Button showCommentDialog>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Add Comment
                </Button>
              </div>
              <div className="space-y-6">
                {[
                  {
                    name: "Julia Chen",
                    avatar: "/placeholder.svg",
                    date: "2 days ago",
                    comment:
                      "I made this last night and it was absolutely delicious! The crust came out perfectly crispy. I added some red pepper flakes for a bit of heat.",
                  },
                  {
                    name: "Mark Johnson",
                    avatar: "/placeholder.svg",
                    date: "1 week ago",
                    comment:
                      "Great recipe! I substituted the all-purpose flour with 00 flour and it made the crust even better. Will definitely make again.",
                  },
                  {
                    name: "Sarah Williams",
                    avatar: "/placeholder.svg",
                    date: "2 weeks ago",
                    comment:
                      "My family loved this pizza! It was so much better than takeout. I'm wondering if I can prepare the dough ahead of time and refrigerate it?",
                  },
                ].map((comment, index) => (
                  <div key={index} className="flex gap-4">
                    <Avatar>
                      <AvatarImage src={comment.avatar} alt={comment.name} />
                      <AvatarFallback>{comment.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{comment.name}</h4>
                        <span className="text-xs text-muted-foreground">{comment.date}</span>
                      </div>
                      <p className="text-sm">{comment.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-1 md:pt-[200px]">
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Nutrition Facts</h3>
                <div className="space-y-2">
                  <div className="flex py-1 border-b">
                    <span className="flex-1">Calories</span>
                    <span className="w-12 text-right font-medium">320</span>
                    <span className="w-8 text-right text-gray-500 ml-2">kcal</span>
                  </div>
                  <div className="flex py-1 border-b">
                    <span className="flex-1">Protein</span>
                    <span className="w-12 text-right font-medium">12</span>
                    <span className="w-8 text-right text-gray-500 ml-2">g</span>
                  </div>
                  <div className="flex py-1 border-b">
                    <span className="flex-1">Carbohydrates</span>
                    <span className="w-12 text-right font-medium">42</span>
                    <span className="w-8 text-right text-gray-500 ml-2">g</span>
                  </div>
                  <div className="flex py-1 border-b">
                    <span className="flex-1">Fat</span>
                    <span className="w-12 text-right font-medium">10</span>
                    <span className="w-8 text-right text-gray-500 ml-2">g</span>
                  </div>
                  <div className="flex py-1">
                    <span className="flex-1">Fiber</span>
                    <span className="w-12 text-right font-medium">2</span>
                    <span className="w-8 text-right text-gray-500 ml-2">g</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Featured Products</h3>
                <div className="space-y-4">
                  <ProductCard
                    image="/placeholder.svg?height=200&width=200"
                    name="Professional Pizza Stone"
                    description="Heavy-duty ceramic stone for perfectly crispy pizza crust"
                    rating={4.8}
                    purchases={1234}
                    price="$39.99"
                    onAddToCart={() => console.log("Added pizza stone to cart")}
                  />
                  <ProductCard
                    image="/placeholder.svg?height=200&width=200"
                    name="Italian '00' Pizza Flour"
                    description="Premium fine-ground flour for authentic Neapolitan pizza"
                    rating={4.9}
                    purchases={2156}
                    price="$12.99"
                    onAddToCart={() => console.log("Added flour to cart")}
                  />
                  <ProductCard
                    image="/placeholder.svg?height=200&width=200"
                    name="Pizza Cutter Wheel"
                    description="Professional stainless steel pizza cutter for clean slices"
                    rating={4.7}
                    purchases={876}
                    price="$14.99"
                    onAddToCart={() => console.log("Added pizza cutter to cart")}
                  />
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Products
                </Button>
              </CardContent>
            </Card>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Similar Recipes</h3>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>

              <div className="space-y-4">
                <RecipeCard
                  id="10"
                  title="Focaccia Bread"
                  image="/placeholder.svg?height=200&width=300"
                  description="Italian flatbread with olive oil, herbs and sea salt"
                  tags={["Italian", "Bread"]}
                  likes={87}
                  views={756}
                />
                <RecipeCard
                  id="11"
                  title="Caprese Salad"
                  image="/placeholder.svg?height=200&width=300"
                  description="Fresh tomatoes, mozzarella and basil with balsamic glaze"
                  tags={["Italian", "Salad"]}
                  likes={65}
                  views={543}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

