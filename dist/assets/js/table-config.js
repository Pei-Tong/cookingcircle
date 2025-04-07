const tableConfigurations={recipes:{tableName:"recipes",idField:"recipe_id",title:"Recipes",columns:[{key:"title",header:"Recipe",render:e=>{var t=Array.isArray(e.tags)?e.tags.join(", "):"";return`
            <div class="flex items-center">
              ${e.image_url?`
                <div class="flex-shrink-0 h-10 w-10 mr-3">
                  <img class="h-10 w-10 rounded-md object-cover" src="${e.image_url}" alt="">
                </div>
              `:""}
              <div>
                ${e.title||"Untitled Recipe"}
                ${t?`<p class="text-xs text-gray-500">${t}</p>`:""}
              </div>
            </div>
          `}},{key:"difficulty",header:"Difficulty",fallback:"N/A"},{key:"cooking_time",header:"Cooking Time",render:e=>e.cooking_time?e.cooking_time+" mins":"N/A"},{key:"likes_count",header:"Likes",fallback:0},{key:"views_count",header:"Views",fallback:0},{key:"created_at",header:"Created",render:e=>e.created_at?new Date(e.created_at).toLocaleDateString():""}],actions:[{text:"Edit",class:"text-primary hover:text-sky-700 mr-3 edit-recipe-btn",action:"edit",handler:"editRecipeDetail"},{text:"Delete",class:"text-red-500 hover:text-red-700 delete-recipe-btn",action:"delete",confirmMessage:"Are you sure you want to delete this recipe?"}],orderBy:{column:"created_at",ascending:!1}},products:{tableName:"products",idField:"product_id",title:"Products",columns:[{key:"name",header:"Product",render:e=>`
            <div class="flex items-center">
              ${e.image_url?`
                <div class="flex-shrink-0 h-10 w-10 mr-3">
                  <img class="h-10 w-10 rounded-md object-cover" src="${e.image_url}" alt="">
                </div>
              `:""}
              <div>
                ${e.name||"Untitled Product"}
                ${e.category?`<p class="text-xs text-gray-500">${e.category}</p>`:""}
              </div>
            </div>
          `},{key:"price",header:"Price",render:e=>e.price?"$"+parseFloat(e.price).toFixed(2):"$0.00"},{key:"rating",header:"Rating",render:e=>e.rating?e.rating.toFixed(1)+"/5":"N/A"},{key:"in_stock",header:"Stock",render:e=>e.in_stock?'<span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">In Stock</span>':'<span class="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Out of Stock</span>'},{key:"purchases",header:"Purchases",fallback:0},{key:"created_at",header:"Added",render:e=>e.created_at?new Date(e.created_at).toLocaleDateString():""}],actions:[{text:"Edit",class:"text-primary hover:text-sky-700 mr-3",action:"edit",handler:"editProductDetail"},{text:"Delete",class:"text-red-500 hover:text-red-700",action:"delete",confirmMessage:"Are you sure you want to delete this product?"}],orderBy:{column:"created_at",ascending:!1}},instructions:{tableName:"instructions",idField:"instruction_id",title:"Instructions",columns:[{key:"recipe_id",header:"Recipe",render:async t=>{try{var{data:e,error:r}=await supabase.from("recipes").select("title").eq("recipe_id",t.recipe_id).single();if(r)throw r;return e.title||"Unknown Recipe"}catch(e){return console.error("Error fetching recipe:",e),"Recipe ID: "+t.recipe_id}}},{key:"step_number",header:"Step"},{key:"description",header:"Description"}],actions:[{text:"Edit",class:"text-primary hover:text-sky-700 mr-3",action:"edit",handler:"showInstructionDetail"},{text:"Delete",class:"text-red-500 hover:text-red-700",action:"delete",confirmMessage:"Are you sure you want to delete this instruction?"}],orderBy:{column:"recipe_id",ascending:!0}}};