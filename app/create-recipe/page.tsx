"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Plus, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";

export default function CreateRecipe() {
  // Tab control state
  const [activeTab, setActiveTab] = useState("details");
  // Toggle nutrition fields
  const [showNutrition, setShowNutrition] = useState(false);
  // Recipe details state
  const [recipe, setRecipe] = useState({
    title: "",
    description: "",
    prepTime: "",
    cookTime: "",
    servings: "",
    difficulty: "",
    tags: [],
    nutrition: {
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
      fiber: "",
      sugar: "",
    },
  });
  // Ingredients and instructions as arrays
  const [ingredients, setIngredients] = useState([{ name: "", amount: "", unit: "" }]);
  const [instructions, setInstructions] = useState([""]);
  // For handling image uploads
  const [images, setImages] = useState([]);
  // States for adding a new tag
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState("");

  // Define default tags
  const defaultTags = [
    "Vegetarian",
    "Vegan",
    "Gluten-Free",
    "Dairy-Free",
    "Nut-Free",
    "Low-Carb",
    "Keto",
    "Paleo",
  ];

  // Update recipe detail fields
  const handleRecipeChange = (field, value) => {
    setRecipe((prev) => ({ ...prev, [field]: value }));
  };

  // Update nutrition fields
  const handleNutritionChange = (field, value) => {
    setRecipe((prev) => ({
      ...prev,
      nutrition: { ...prev.nutrition, [field]: value },
    }));
  };

  // Ingredients handlers
  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const addIngredient = () => {
    setIngredients((prev) => [...prev, { name: "", amount: "", unit: "" }]);
  };

  const removeIngredient = (index) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  // Instructions handlers
  const handleInstructionChange = (index, value) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const addInstruction = () => {
    setInstructions((prev) => [...prev, ""]);
  };

  const removeInstruction = (index) => {
    setInstructions((prev) => prev.filter((_, i) => i !== index));
  };

  // File upload handler – now allows multiple files
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) {
      setImages((prev) => [...prev, ...files]);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // New tag handlers
  const handleAddTag = () => {
    if (newTag.trim() && !recipe.tags.includes(newTag.trim())) {
      handleRecipeChange("tags", [...recipe.tags, newTag.trim()]);
      setNewTag("");
    }
    setIsAddingTag(false);
  };

  // On publish, gather all data (this example logs to console)
  const handlePublish = () => {
    const recipeData = {
      ...recipe,
      ingredients,
      instructions,
      images,
    };
    console.log("Publishing recipe:", recipeData);
    alert("Recipe published! Check the console for details.");
  };

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Create New Recipe</h1>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-10">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-xs font-medium">
                  1
                </span>
                Recipe Details
              </TabsTrigger>
              <TabsTrigger value="ingredients" className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-xs font-medium">
                  2
                </span>
                Ingredients
              </TabsTrigger>
              <TabsTrigger value="instructions" className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-xs font-medium">
                  3
                </span>
                Instructions
              </TabsTrigger>
            </TabsList>

            {/* Recipe Details Tab */}
            <TabsContent value="details" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Add the basic details about your recipe</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Recipe Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter recipe title"
                      value={recipe.title}
                      onChange={(e) => handleRecipeChange("title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Briefly describe your recipe"
                      className="min-h-[100px]"
                      value={recipe.description}
                      onChange={(e) => handleRecipeChange("description", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prep-time">Prep Time (minutes)</Label>
                      <Input
                        id="prep-time"
                        type="number"
                        placeholder="15"
                        value={recipe.prepTime}
                        onChange={(e) => handleRecipeChange("prepTime", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cook-time">Cook Time (minutes)</Label>
                      <Input
                        id="cook-time"
                        type="number"
                        placeholder="30"
                        value={recipe.cookTime}
                        onChange={(e) => handleRecipeChange("cookTime", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="servings">Servings</Label>
                      <Input
                        id="servings"
                        type="number"
                        placeholder="4"
                        value={recipe.servings}
                        onChange={(e) => handleRecipeChange("servings", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select
                        value={recipe.difficulty}
                        onValueChange={(val) => handleRecipeChange("difficulty", val)}
                      >
                        <SelectTrigger id="difficulty">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Dietary Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {/* Render default tags */}
                      {defaultTags.map((tag) => (
                        <Button
                          key={tag}
                          variant={recipe.tags.includes(tag) ? "default" : "outline"}
                          size="sm"
                          className="rounded-full"
                          onClick={() => {
                            if (recipe.tags.includes(tag)) {
                              handleRecipeChange("tags", recipe.tags.filter((t) => t !== tag));
                            } else {
                              handleRecipeChange("tags", [...recipe.tags, tag]);
                            }
                          }}
                        >
                          {tag}
                        </Button>
                      ))}
                      {/* Render custom tags */}
                      {recipe.tags
                        .filter((tag) => !defaultTags.includes(tag))
                        .map((tag) => (
                          <Button
                            key={tag}
                            variant="default"
                            size="sm"
                            className="rounded-full"
                            onClick={() =>
                              handleRecipeChange("tags", recipe.tags.filter((t) => t !== tag))
                            }
                          >
                            {tag}
                          </Button>
                        ))}
                      {/* New tag input */}
                      {isAddingTag ? (
                        <div className="flex gap-2">
                          <Input
                            size="sm"
                            placeholder="New tag"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                          />
                          <Button size="sm" onClick={handleAddTag}>
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setIsAddingTag(false);
                              setNewTag("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setIsAddingTag(true)}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Tag
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Recipe Photos or Videos</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Render uploaded image/video previews */}
                      {images.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Upload Preview ${index}`}
                            className="object-cover w-full h-40 rounded-lg"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1"
                            onClick={() => removeImage(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {/* Upload box */}
                      <div
                        className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center h-40 cursor-pointer"
                        onClick={() => document.getElementById("file-input").click()}
                      >
                        <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
                        <input
                          id="file-input"
                          type="file"
                          className="hidden"
                          multiple
                          onChange={handleImageUpload}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 border-t pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Nutrition Facts</Label>
                        <p className="text-sm text-muted-foreground">
                          Add nutritional information to your recipe
                        </p>
                      </div>
                      <Switch
                        checked={showNutrition}
                        onCheckedChange={(checked) => setShowNutrition(checked)}
                      />
                    </div>
                    {showNutrition && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="calories">Calories (kcal)</Label>
                          <Input
                            id="calories"
                            type="number"
                            placeholder="320"
                            value={recipe.nutrition.calories}
                            onChange={(e) => handleNutritionChange("calories", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="protein">Protein (g)</Label>
                          <Input
                            id="protein"
                            type="number"
                            placeholder="12"
                            value={recipe.nutrition.protein}
                            onChange={(e) => handleNutritionChange("protein", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="carbs">Carbohydrates (g)</Label>
                          <Input
                            id="carbs"
                            type="number"
                            placeholder="42"
                            value={recipe.nutrition.carbs}
                            onChange={(e) => handleNutritionChange("carbs", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fat">Fat (g)</Label>
                          <Input
                            id="fat"
                            type="number"
                            placeholder="10"
                            value={recipe.nutrition.fat}
                            onChange={(e) => handleNutritionChange("fat", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fiber">Fiber (g)</Label>
                          <Input
                            id="fiber"
                            type="number"
                            placeholder="2"
                            value={recipe.nutrition.fiber}
                            onChange={(e) => handleNutritionChange("fiber", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sugar">Sugar (g)</Label>
                          <Input
                            id="sugar"
                            type="number"
                            placeholder="5"
                            value={recipe.nutrition.sugar}
                            onChange={(e) => handleNutritionChange("sugar", e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="pt-4 flex justify-end">
                    <Button onClick={() => setActiveTab("ingredients")}>Next: Ingredients</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Ingredients Tab */}
            <TabsContent value="ingredients" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recipe Ingredients</CardTitle>
                  <CardDescription>List all ingredients needed for your recipe</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {ingredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex-1">
                          <Input
                            placeholder="Ingredient name (e.g., All-purpose flour)"
                            value={ingredient.name}
                            onChange={(e) =>
                              handleIngredientChange(index, "name", e.target.value)
                            }
                          />
                        </div>
                        <div className="w-24">
                          <Input
                            placeholder="Amount"
                            type="text"
                            value={ingredient.amount}
                            onChange={(e) =>
                              handleIngredientChange(index, "amount", e.target.value)
                            }
                          />
                        </div>
                        <div className="w-28">
                          <Select
                            value={ingredient.unit}
                            onValueChange={(val) => handleIngredientChange(index, "unit", val)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="g">grams</SelectItem>
                              <SelectItem value="kg">kilograms</SelectItem>
                              <SelectItem value="ml">milliliters</SelectItem>
                              <SelectItem value="l">liters</SelectItem>
                              <SelectItem value="cup">cups</SelectItem>
                              <SelectItem value="tbsp">tablespoons</SelectItem>
                              <SelectItem value="tsp">teaspoons</SelectItem>
                              <SelectItem value="piece">pieces</SelectItem>
                              <SelectItem value="whole">whole</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeIngredient(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full" onClick={addIngredient}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Ingredient
                  </Button>
                  <div className="pt-4 flex justify-between">
                    <Button variant="outline" onClick={() => setActiveTab("details")}>
                      Back: Details
                    </Button>
                    <Button onClick={() => setActiveTab("instructions")}>
                      Next: Instructions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Instructions Tab */}
            <TabsContent value="instructions" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cooking Instructions</CardTitle>
                  <CardDescription>Add step-by-step instructions for your recipe</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {instructions.map((instruction, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium mt-1">
                          {index + 1}
                        </div>
                        <Textarea
                          placeholder={`Step ${index + 1} instructions`}
                          className="flex-1 min-h-[100px]"
                          value={instruction}
                          onChange={(e) => handleInstructionChange(index, e.target.value)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="mt-1"
                          onClick={() => removeInstruction(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full" onClick={addInstruction}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Step
                  </Button>
                  <div className="pt-4 flex justify-between">
                    <Button variant="outline" onClick={() => setActiveTab("ingredients")}>
                      Back: Ingredients
                    </Button>
                    <Button onClick={handlePublish}>Publish Recipe</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
}
