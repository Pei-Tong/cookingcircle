"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Upload, Plus, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";

// Import supabase client from our client file to avoid duplicate instances
import { supabase as supabaseClient } from "@/lib/supabaseClient";

// Add missing imports for shadcn/ui components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from 'react'; // Import React for event types

// Types for our recipe data
interface Nutrition {
  calories: string;
  protein: string;
  carbohydrates: string;
  fat: string;
  fiber: string;
  sugar: string;
}

interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

interface Recipe {
  title: string;
  description: string;
  "prep-time": string;
  cooking_time: string;
  servings: string;
  difficulty: string;
  totalTime?: string;
  cuisine?: string;
  mealType?: string;
  tags: string[];
}

export default function CreateRecipe() {
  const router = useRouter();
  // Use the imported supabase client instead of creating a new one
  const supabase = supabaseClient;

  // Tab control state
  const [activeTab, setActiveTab] = useState("details");
  // Toggle nutrition fields
  const [showNutrition, setShowNutrition] = useState(false);
  // Recipe details state
  const [recipe, setRecipe] = useState({
    title: "",
    description: "",
    "prep-time": "",
    cooking_time: "",
    servings: "",
    difficulty: "",
    totalTime: "",
    cuisine: "",
    mealType: "",
    tags: [] as string[],
  });
  // Nutrition state
  const [nutrition, setNutrition] = useState({
      calories: "",
      protein: "",
    carbohydrates: "",
      fat: "",
      fiber: "",
      sugar: "",
  });
  // Ingredients and instructions as arrays
  const [ingredients, setIngredients] = useState([{ name: "", amount: "", unit: "" }]);
  const [instructions, setInstructions] = useState([""]);
  // For handling image uploads - Explicitly type as File[]
  const [images, setImages] = useState<File[]>([]);
  // States for adding a new tag
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState("");
  // Add auth state
  const [authStatus, setAuthStatus] = useState<{
    loading: boolean;
    authenticated: boolean;
    user: any | null;
    error: string | null;
  }>({
    loading: true,
    authenticated: false,
    user: null,
    error: null
  });
  
  // Check authentication status when component mounts
  useEffect(() => {
    async function checkAuth() {
      try {
        console.log("Checking authentication status...");
        
        // Get all cookies to help debug
        document.cookie.split(';').forEach(cookie => {
          console.log("Cookie:", cookie.trim());
        });
        
        // Simple session check - similar to other components
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking auth status:", error);
          setAuthStatus({
            loading: false,
            authenticated: false,
            user: null,
            error: error.message
          });
          return;
        }
        
        if (data.session) {
          console.log("User is authenticated with ID:", data.session.user.id);
          setAuthStatus({
            loading: false,
            authenticated: true,
            user: data.session.user,
            error: null
          });
        } else {
          console.log("No active session found, trying to refresh session...");
          
          // Try to refresh the session
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error("Error refreshing session:", refreshError);
            setAuthStatus({
              loading: false,
              authenticated: false,
              user: null,
              error: refreshError.message
            });
            return;
          }
          
          if (refreshData.session) {
            console.log("Session refreshed successfully with user ID:", refreshData.session.user.id);
            setAuthStatus({
              loading: false,
              authenticated: true,
              user: refreshData.session.user,
              error: null
            });
          } else {
            console.log("No session after refresh, user is not authenticated");
            setAuthStatus({
              loading: false,
              authenticated: false,
              user: null,
              error: null
            });
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setAuthStatus({
          loading: false,
          authenticated: false,
          user: null,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
    
    checkAuth();
  }, []); // Remove supabase.auth dependency
  
  // Force login function
  const forceLogin = async () => {
    try {
      // Redirect to login page with return URL
      const currentPath = encodeURIComponent('/create-recipe');
      console.log(`Redirecting to login with return URL: ${currentPath}`);
      router.push(`/login?redirectTo=${currentPath}`);
    } catch (error) {
      console.error("Error during force login:", error);
      alert("Failed to redirect to login page. Please try again.");
    }
  };

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
  const handleRecipeChange = (field: keyof Recipe, value: string | string[]) => {
    setRecipe((prev) => ({ ...prev, [field]: value }));
  };

  // Update nutrition fields
  const handleNutritionChange = (field: keyof Nutrition, value: string) => {
    setNutrition((prev) => ({ ...prev, [field]: value }));
  };

  // Ingredients handlers
  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const addIngredient = () => {
    setIngredients((prev) => [...prev, { name: "", amount: "", unit: "" }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  // Instructions handlers
  const handleInstructionChange = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const addInstruction = () => {
    setInstructions((prev) => [...prev, ""]);
  };

  const removeInstruction = (index: number) => {
    setInstructions((prev) => prev.filter((_, i) => i !== index));
  };

  // Correctly type the event handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      setImages(prevImages => [...prevImages, ...files]);
    }
  };

  const removeImage = (index: number) => {
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

  // On publish, save to Supabase
  const handlePublish = async () => {
    // Check if user is authenticated before proceeding
    if (!authStatus.authenticated) {
      console.log("User not authenticated, redirecting to login");
      alert("Please log in to publish your recipe");
      forceLogin();
      return;
    }

    // Helper function to parse string to number or null
    const parseNumberOrNull = (value: string): number | null => {
      if (value === "") return null;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? null : parsed;
    };

    // Helper function to parse string to integer or null
    const parseIntOrNull = (value: string): number | null => {
      if (value === "") return null;
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? null : parsed;
    };

    try {
      // First, upload images to Supabase Storage and get the first image URL
      let image_url = null;
      if (images.length > 0) {
        console.log("Uploading image...");
        const file = images[0];
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `recipe-images/${fileName}`;

        // Log the image information
        console.log(`Uploading image: ${file.name} (${file.size} bytes) to ${filePath}`);

        try {
          const { error: uploadError, data: uploadData } = await supabase.storage
            .from('recipe-images')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error("Error uploading image:", uploadError);
            throw new Error(`Image upload failed: ${uploadError.message}`);
          }

          console.log("Image uploaded successfully:", uploadData);

          const { data: urlData } = supabase.storage
            .from('recipe-images')
            .getPublicUrl(filePath);

          image_url = urlData?.publicUrl ?? null;
          console.log("Public image URL:", image_url);
        } catch (uploadError) {
          console.error("Error in image upload process:", uploadError);
          // Continue with recipe creation but with no image
          alert("Could not upload image, but will continue creating recipe.");
          image_url = '/placeholder.jpg';
        }
      } else {
        console.log("No images to upload, using placeholder");
        image_url = '/placeholder.jpg';
      }

      // Get current user id
      const userId = authStatus.user?.id;
      
      if (!userId) {
        throw new Error("User ID is required to create a recipe");
      }
      
      // Always use default user ID for database consistency
      const useDefaultUser = userId.toString().startsWith('temp-user-');
      const dbUserId = useDefaultUser ? 1 : userId;
      
      console.log("Creating recipe with user ID:", dbUserId, "(original:", userId, ")");

      // Prepare recipe data with type conversion and correct DB field name 'prep-time'
      const recipeData = {
        title: recipe.title,
        description: recipe.description,
        user_id: dbUserId, // Always use default user ID if temp user
        servings: parseIntOrNull(recipe.servings),
        // Use the exact field name as seen in the database (with hyphen)
        "prep-time": parseIntOrNull(recipe["prep-time"]), 
        cooking_time: parseIntOrNull(recipe.cooking_time),
        difficulty: recipe.difficulty,
        tags: recipe.tags,
        image_url: image_url,
        created_at: new Date().toISOString(),
      };

      // Insert recipe into Supabase and get the inserted recipe
      const { data: insertedRecipe, error: insertError } = await supabase
        .from('recipes')
        .insert([recipeData])
        .select()
        .single();

      if (insertError) throw insertError;
      if (!insertedRecipe) throw new Error("Failed to retrieve inserted recipe after insert.");
      
      console.log("Inserted recipe:", insertedRecipe);

      // Get the correct recipe ID field name
      const recipeId = insertedRecipe.recipe_id;
      
      if (!recipeId) {
        throw new Error("Could not get recipe ID from the inserted recipe. Fields: " + 
          Object.keys(insertedRecipe).join(", "));
      }

      // Insert ingredients into the ingredients table with type conversion
      if (ingredients.length > 0 && ingredients.some(ing => ing.name || ing.amount || ing.unit)) {
        const ingredientsData = ingredients
          .filter(ing => ing.name || ing.amount || ing.unit)
          .map(ingredient => ({
            recipe_id: recipeId,
            name: ingredient.name,
            quantity: parseNumberOrNull(ingredient.amount),
            unit: ingredient.unit
          }));

        const { error: ingredientsError } = await supabase
          .from('ingredients')
          .insert(ingredientsData);

        if (ingredientsError) throw ingredientsError;
      }

      // Insert instructions into the instructions table
      if (instructions.length > 0 && instructions.some(inst => inst.trim())) {
        const instructionsData = instructions
          .filter(inst => inst.trim())
          .map((description, index) => ({
            recipe_id: recipeId,
            step_number: index + 1,
            description
          }));

        if (instructionsData.length > 0) {
          const { error: instructionsError } = await supabase
            .from('instructions')
            .insert(instructionsData);

          if (instructionsError) throw instructionsError;
        }
      }

      // If nutrition data is provided, insert it into the recipe_nutrition table with type conversion
      if (showNutrition && Object.values(nutrition).some(value => value !== "")) {
        const nutritionData = {
          recipe_id: recipeId,
          calories: parseIntOrNull(nutrition.calories),
          protein: parseNumberOrNull(nutrition.protein),
          carbohydrates: parseNumberOrNull(nutrition.carbohydrates),
          fat: parseNumberOrNull(nutrition.fat),
          fiber: parseNumberOrNull(nutrition.fiber),
          sugar: parseNumberOrNull(nutrition.sugar)
        };

        if (Object.values(nutritionData).some(v => v !== null && v !== recipeId)) {
            const { error: nutritionError } = await supabase
              .from('recipe_nutrition')
              .insert([nutritionData]);

            if (nutritionError) throw nutritionError;
        }
      }

      alert('Recipe added successfully!');
      router.push(`/recipes/${recipeId}`);

    } catch (error) {
      console.error('Error publishing recipe:', error);
      let errorMessage = 'Failed to publish recipe. Please try again.';
      if (error instanceof Error) {
        errorMessage = `Failed to publish recipe: ${error.message}`;
      }
      alert(errorMessage);
    }
  };

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Create New Recipe</h1>
          
          {/* Recipe form - always shown */}
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRecipeChange("title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Briefly describe your recipe"
                      className="min-h-[100px]"
                      value={recipe.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleRecipeChange("description", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prep-time">Prep Time (minutes)</Label>
                      <Input
                        id="prep-time"
                        type="number"
                        placeholder="15"
                        value={recipe["prep-time"]}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRecipeChange("prep-time", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cook-time">Cook Time (minutes)</Label>
                      <Input
                        id="cook-time"
                        type="number"
                        placeholder="30"
                        value={recipe.cooking_time}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRecipeChange("cooking_time", e.target.value)}
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRecipeChange("servings", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select
                        value={recipe.difficulty}
                        onValueChange={(val: string) => handleRecipeChange("difficulty", val)}
                      >
                        <SelectTrigger id="difficulty">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Easy">Easy</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Hard">Hard</SelectItem>
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
                            placeholder="New tag"
                            value={newTag}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTag(e.target.value)}
                            className="text-sm"
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
                        <div key={index} className="relative aspect-video h-40 w-full">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Upload Preview ${index}`}
                            className="object-cover w-full h-full rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              console.error(`Error loading image preview for ${file.name}`);
                              target.onerror = null;
                              target.src = '/placeholder.jpg';
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 bg-black/30 hover:bg-black/50 text-white"
                            onClick={() => removeImage(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {/* Upload box - Add check for element existence */}
                      <div
                        className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center h-40 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => document.getElementById("file-input")?.click()}
                      >
                        <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
                        <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 10MB</p>
                        <input
                          id="file-input"
                          type="file"
                          className="hidden"
                          multiple
                          accept="image/jpeg,image/png,image/jpg"
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
                            value={nutrition.calories}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNutritionChange("calories", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="protein">Protein (g)</Label>
                          <Input
                            id="protein"
                            type="number"
                            placeholder="12"
                            value={nutrition.protein}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNutritionChange("protein", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="carbohydrates">Carbohydrates (g)</Label>
                          <Input
                            id="carbohydrates"
                            type="number"
                            placeholder="42"
                            value={nutrition.carbohydrates}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNutritionChange("carbohydrates", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fat">Fat (g)</Label>
                          <Input
                            id="fat"
                            type="number"
                            placeholder="10"
                            value={nutrition.fat}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNutritionChange("fat", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fiber">Fiber (g)</Label>
                          <Input
                            id="fiber"
                            type="number"
                            placeholder="2"
                            value={nutrition.fiber}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNutritionChange("fiber", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sugar">Sugar (g)</Label>
                          <Input
                            id="sugar"
                            type="number"
                            placeholder="5"
                            value={nutrition.sugar}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNutritionChange("sugar", e.target.value)}
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
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              handleIngredientChange(index, "name", e.target.value)
                            }
                          />
                        </div>
                        <div className="w-24">
                          <Input
                            placeholder="Amount"
                            type="text" // Keep as text input, parsing happens on submit
                            value={ingredient.amount}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              handleIngredientChange(index, "amount", e.target.value)
                            }
                          />
                        </div>
                        <div className="w-28">
                          <Select
                            value={ingredient.unit}
                            onValueChange={(val: string) => handleIngredientChange(index, "unit", val)}
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
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInstructionChange(index, e.target.value)}
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