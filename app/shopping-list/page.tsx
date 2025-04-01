"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Plus, ShoppingCart } from "lucide-react"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"

export default function ShoppingList() {
  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Shopping List</h1>
            <Button>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Order from Walmart
            </Button>
          </div>

          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="recipes">By Recipe</TabsTrigger>
              <TabsTrigger value="categories">By Category</TabsTrigger>
              <TabsTrigger value="kitchenware">Kitchenware</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="pt-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>All Ingredients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-4">
                    <Input placeholder="Add new item" className="mr-2" />
                    <Button size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {[
                      "2 1/4 cups (280g) all-purpose flour",
                      "1 teaspoon salt",
                      "1 teaspoon instant yeast",
                      "3/4 cup (180ml) warm water",
                      "1 tablespoon olive oil",
                      "1 can (14oz) crushed tomatoes",
                      "2 cloves garlic",
                      "1 teaspoon dried oregano",
                      "8oz fresh mozzarella cheese",
                      "Fresh basil leaves",
                      "1 lb chicken breast",
                      "2 bell peppers",
                      "1 onion",
                    ].map((item, index) => {
                      // Parse the item string into components
                      const amount = item.match(/^\d+(\s*\d*\/?\d*)?/)?.[0] || ""
                      const unit = item.match(/(?:cups?|teaspoons?|tablespoons?|oz|g|ml|lb|cloves?|can)/)?.[0] || ""
                      const parenthetical = item.match(/$$([^)]*)$$/)?.[0] || ""
                      const name = item
                        .replace(/^\d+(\s*\d*\/?\d*)?/, "") // Remove amount
                        .replace(/(?:cups?|teaspoons?|tablespoons?|oz|g|ml|lb|cloves?|can)/, "") // Remove unit
                        .replace(/$$[^)]*g$$|$$[^)]*ml$$|$$[^)]*oz$$/g, "") // Remove measurement parentheticals
                        .replace(/^\s+|\s+$/g, "") // Trim whitespace

                      return (
                        <div key={index} className="flex items-center justify-between p-2 border-b">
                          <div className="flex items-center gap-2">
                            <Checkbox id={`item-${index}`} />
                            <label
                              htmlFor={`item-${index}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex gap-2"
                            >
                              <div className="flex items-center gap-4 w-full">
                                <span className="font-medium w-48">{name.replace(/$$[^)]*$$/g, "").trim()}</span>
                                <span className="text-muted-foreground w-20 text-right">{amount}</span>
                                <span className="text-muted-foreground w-24">{unit}</span>
                                <span className="text-muted-foreground">{parenthetical}</span>
                              </div>
                            </label>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recipes" className="pt-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Items by Recipe</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Margherita Pizza */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Margherita Pizza</h3>
                        <Button variant="outline" size="sm">
                          Add All to Cart
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {[
                          "2 1/4 cups all-purpose flour",
                          "1 teaspoon salt",
                          "1 teaspoon instant yeast",
                          "3/4 cup warm water",
                          "1 tablespoon olive oil",
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border-b">
                            <div className="flex items-center gap-2">
                              <Checkbox id={`pizza-${index}`} />
                              <label htmlFor={`pizza-${index}`}>{item}</label>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Chicken Stir Fry */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Chicken Stir Fry</h3>
                        <Button variant="outline" size="sm">
                          Add All to Cart
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {[
                          "1 lb chicken breast",
                          "2 bell peppers",
                          "1 onion",
                          "3 cloves garlic",
                          "2 tablespoons soy sauce",
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border-b">
                            <div className="flex items-center gap-2">
                              <Checkbox id={`stirfry-${index}`} />
                              <label htmlFor={`stirfry-${index}`}>{item}</label>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
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
                    {/* Produce */}
                    <div>
                      <h3 className="font-semibold mb-4">Produce</h3>
                      <div className="space-y-2">
                        {["2 bell peppers", "1 onion", "Fresh basil leaves", "3 tomatoes", "1 head of garlic"].map(
                          (item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border-b">
                              <div className="flex items-center gap-2">
                                <Checkbox id={`produce-${index}`} />
                                <label htmlFor={`produce-${index}`}>{item}</label>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    {/* Pantry */}
                    <div>
                      <h3 className="font-semibold mb-4">Pantry</h3>
                      <div className="space-y-2">
                        {["All-purpose flour", "Salt", "Instant yeast", "Olive oil", "Soy sauce"].map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border-b">
                            <div className="flex items-center gap-2">
                              <Checkbox id={`pantry-${index}`} />
                              <label htmlFor={`pantry-${index}`}>{item}</label>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="kitchenware" className="pt-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Kitchen Equipment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      "Pizza Stone",
                      "Rolling Pin",
                      "Mixing Bowls",
                      "Measuring Cups",
                      "Chef's Knife",
                      "Cutting Board",
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border-b">
                        <div className="flex items-center gap-2">
                          <Checkbox id={`kitchenware-${index}`} />
                          <label htmlFor={`kitchenware-${index}`}>{item}</label>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  )
}

