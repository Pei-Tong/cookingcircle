async function fetchRecipes(){try{var{data:e,error:r}=await supabase.from("recipes").select("*").order("created_at",{ascending:!1});if(r)throw r;return e}catch(e){return console.error("Error fetching recipes:",e),[]}}

async function deleteRecipe(e){
  try{
    console.log("Starting to delete recipe with ID:", e);
    
    // Get the recipe first to make sure it exists
    var {data:r, error:t} = await supabase.from("recipes").select("*").eq("recipe_id", e).single();
    if(t) throw t;
    
    console.log("Deleting related data...");
    
    // First handle the tables with foreign key constraints
    const criticalTables = ["recipe_collections", "saved_recipes", "recipe_likes"];
    
    // Try to delete from critical tables first
    for(const table of criticalTables) {
      try {
        console.log(`Deleting from critical table ${table}...`);
        // Try up to 3 times with increasing delays
        for(let attempt = 1; attempt <= 3; attempt++) {
          const {error} = await supabase.from(table).delete().eq("recipe_id", e);
          
          if(!error) {
            console.log(`Successfully deleted related data from ${table}`);
            break; // Success, exit retry loop
          } else if (attempt < 3) {
            console.warn(`Attempt ${attempt} failed for ${table}, retrying after delay...`);
            // Exponential backoff delay
            await new Promise(resolve => setTimeout(resolve, 300 * attempt));
          } else {
            // Log final failure but continue with other tables
            console.warn(`Warning: Failed to delete from ${table} after ${attempt} attempts:`, error);
          }
        }
      } catch(tableError) {
        console.warn(`Error processing ${table}:`, tableError);
      }
    }
    
    // Add a delay after critical tables
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Define other related tables
    const relatedTables = [
      "shopping_list",
      "likes",
      "comments",
      "instructions",
      "ingredients",
      "collections",
      "recipe_ingredients",
      "recipe_tags",
      "recipe_views"
    ];
    
    // Delete from all other related tables
    for(const table of relatedTables) {
      try {
        const {error} = await supabase.from(table).delete().eq("recipe_id", e);
        if(error) {
          // Just log warning but continue - table might not exist or no related records
          console.warn(`Warning deleting from ${table}:`, error);
        } else {
          console.log(`Successfully deleted related data from ${table}`);
        }
      } catch(tableError) {
        console.warn(`Error processing ${table}:`, tableError);
        // Continue with other tables
      }
    }
    
    // Add a small delay to ensure all delete operations are processed
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log("Now deleting the main recipe");
    var {error:c} = await supabase.from("recipes").delete().eq("recipe_id", e);
    
    if(c) {
      console.error("Failed to delete recipe:", c);
      throw c;
    }
    
    console.log("Recipe deleted successfully");
    return true;
  } catch(e) {
    console.error("Error deleting recipe:", e);
    return false;
  }
}

async function incrementRecipeViews(e){try{var{data:r,error:t}=await supabase.from("recipes").select("views_count").eq("recipe_id",e).single();if(t)throw t;var c=r.views_count||0,i=(await supabase.from("recipes").update({views_count:c+1}).eq("recipe_id",e))["error"];if(i)throw i;return!0}catch(e){return console.error("Error updating recipe views:",e),!1}}