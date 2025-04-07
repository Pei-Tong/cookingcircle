async function showRecipeDetail(e){console.log("Show recipe detail called with ID:",e);try{document.querySelectorAll(".recipe-detail-modal").forEach(e=>{e.remove()});const{data:r,error:i}=await supabase.from("recipes").select("*").eq("recipe_id",e).single();if(i)throw i;const s=document.createElement("div");s.classList.add("fixed","inset-0","bg-black","bg-opacity-50","z-50","flex","items-center","justify-center","recipe-detail-modal");var t=`
      <div class="bg-white rounded-lg w-full max-w-3xl mx-4 overflow-hidden">
        <div class="p-4 bg-gray-50 flex justify-between items-center">
          <h3 class="text-lg font-medium">${r.title}</h3>
          <button class="close-modal-btn text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6">
          ${r.image_url?`<img src="${r.image_url}" alt="${r.title}" class="w-full h-64 object-cover rounded-md mb-4">`:""}
          
          <div class="flex flex-wrap gap-2 mb-4">
            ${Array.isArray(r.tags)?r.tags.map(e=>`<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">${e}</span>`).join(""):""}
          </div>
          
          <div class="grid grid-cols-3 gap-4 mb-4 text-sm">
            <div class="flex flex-col items-center p-2 border rounded-md">
              <span class="font-medium">Difficulty</span>
              <span>${r.difficulty||"Not specified"}</span>
            </div>
            <div class="flex flex-col items-center p-2 border rounded-md">
              <span class="font-medium">Cooking Time</span>
              <span>${r.cooking_time||"0"} min</span>
            </div>
            <div class="flex flex-col items-center p-2 border rounded-md">
              <span class="font-medium">Servings</span>
              <span>${r.servings||"0"}</span>
            </div>
          </div>
          
          <div class="mb-4">
            <h4 class="text-md font-medium mb-2">Description</h4>
            <p class="text-gray-700">${r.description||"No description provided."}</p>
          </div>
          
          <div class="flex justify-between text-sm text-gray-500">
            <span>Created: ${new Date(r.created_at).toLocaleDateString()}</span>
            <div class="flex space-x-4">
              <span class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                ${r.likes_count||0}
              </span>
              <span class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                ${r.views_count||0}
              </span>
            </div>
          </div>
        </div>
      </div>
    `;s.innerHTML=t,document.body.appendChild(s);const o=s.querySelector(".close-modal-btn");o.addEventListener("click",()=>{document.body.removeChild(s)}),s.addEventListener("click",e=>{e.target===s&&document.body.removeChild(s)})}catch(e){console.error("Error showing recipe details:",e)}}async function editRecipeDetail(s){console.log("Edit recipe detail called with ID:",s);try{document.querySelectorAll(".recipe-detail-modal").forEach(e=>{e.remove()});const{data:t,error:r}=await supabase.from("recipes").select("*").eq("recipe_id",s).single();if(r)throw r;const o=document.createElement("div");o.classList.add("fixed","inset-0","bg-black","bg-opacity-50","z-50","flex","items-center","justify-center","recipe-detail-modal");var e=`
      <div class="bg-white rounded-lg w-full max-w-3xl mx-4 overflow-hidden">
        <div class="p-4 bg-gray-50 flex justify-between items-center">
          <h3 class="text-lg font-medium">Edit Recipe</h3>
          <button class="close-modal-btn text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form id="edit-recipe-form" class="p-6">
          <input type="hidden" name="recipe_id" value="${t.recipe_id}">
          
          <div class="mb-4">
            <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" id="title" name="title" class="w-full rounded-md border border-gray-300 p-2" value="${t.title||""}">
          </div>
          
          <div class="mb-4">
            <label for="image_url" class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input type="text" id="image_url" name="image_url" class="w-full rounded-md border border-gray-300 p-2" value="${t.image_url||""}">
            ${t.image_url?`<img src="${t.image_url}" alt="${t.title}" class="mt-2 w-full h-32 object-cover rounded-md">`:""}
          </div>
          
          <div class="mb-4">
            <label for="tags" class="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
            <input type="text" id="tags" name="tags" class="w-full rounded-md border border-gray-300 p-2" value="${Array.isArray(t.tags)?t.tags.join(", "):""}">
          </div>
          
          <div class="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label for="difficulty" class="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select id="difficulty" name="difficulty" class="w-full rounded-md border border-gray-300 p-2">
                <option value="">Select Difficulty</option>
                <option value="Easy" ${"Easy"===t.difficulty?"selected":""}>Easy</option>
                <option value="Medium" ${"Medium"===t.difficulty?"selected":""}>Medium</option>
                <option value="Hard" ${"Hard"===t.difficulty?"selected":""}>Hard</option>
              </select>
            </div>
            
            <div>
              <label for="cooking_time" class="block text-sm font-medium text-gray-700 mb-1">Cooking Time (mins)</label>
              <input type="number" id="cooking_time" name="cooking_time" class="w-full rounded-md border border-gray-300 p-2" value="${t.cooking_time||"0"}">
            </div>
            
            <div>
              <label for="servings" class="block text-sm font-medium text-gray-700 mb-1">Servings</label>
              <input type="number" id="servings" name="servings" class="w-full rounded-md border border-gray-300 p-2" value="${t.servings||"0"}">
            </div>
          </div>
          
          <div class="mb-4">
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea id="description" name="description" rows="4" class="w-full rounded-md border border-gray-300 p-2">${t.description||""}</textarea>
          </div>
          
          <div class="flex justify-end gap-2 mt-6">
            <button type="button" class="cancel-btn py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" class="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-700">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    `;o.innerHTML=e,document.body.appendChild(o);const i=o.querySelector(".close-modal-btn"),d=o.querySelector(".cancel-btn"),a=(i.addEventListener("click",()=>{document.body.removeChild(o)}),d.addEventListener("click",()=>{document.body.removeChild(o)}),o.addEventListener("click",e=>{e.target===o&&document.body.removeChild(o)}),o.querySelector("#edit-recipe-form"));a.addEventListener("submit",async e=>{e.preventDefault();try{const i=new FormData(a);var t={title:i.get("title"),image_url:i.get("image_url"),tags:i.get("tags")?i.get("tags").split(",").map(e=>e.trim()).filter(e=>e):[],difficulty:i.get("difficulty"),cooking_time:i.get("cooking_time")?parseInt(i.get("cooking_time")):0,servings:i.get("servings")?parseInt(i.get("servings")):0,description:i.get("description")},r=(await supabase.from("recipes").update(t).eq("recipe_id",s))["error"];if(r)throw r;document.body.removeChild(o),await loadRecipeData(),alert("Recipe updated successfully!")}catch(e){console.error("Error updating recipe:",e),alert("Failed to update recipe: "+e.message)}})}catch(e){console.error("Error showing recipe edit form:",e)}}async function showProductDetail(e){console.log("Show product detail called with ID:",e);try{document.querySelectorAll(".product-detail-modal").forEach(e=>{e.remove()});const{data:r,error:i}=await supabase.from("products").select("*").eq("product_id",e).single();if(i)throw i;const s=document.createElement("div");s.classList.add("fixed","inset-0","bg-black","bg-opacity-50","z-50","flex","items-center","justify-center","product-detail-modal");var t=`
      <div class="bg-white rounded-lg w-full max-w-3xl mx-4 overflow-hidden">
        <div class="p-4 bg-gray-50 flex justify-between items-center">
          <h3 class="text-lg font-medium">${r.name}</h3>
          <button class="close-modal-btn text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6">
          <div class="flex items-start gap-6">
            ${r.image_url?`<div class="w-1/3">
                <img src="${r.image_url}" alt="${r.name}" class="w-full h-48 object-cover rounded-md">
              </div>`:""}
            <div class="flex-1">
              <h2 class="text-xl font-bold">${r.name}</h2>
              <div class="mt-2 flex items-center gap-2">
                <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">${r.category||"Uncategorized"}</span>
                ${r.in_stock?'<span class="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs">In Stock</span>':'<span class="px-2 py-1 bg-red-100 text-red-800 rounded-md text-xs">Out of Stock</span>'}
              </div>
              <div class="mt-3">
                <div class="text-2xl font-bold text-primary">$${parseFloat(r.price).toFixed(2)}</div>
                <div class="mt-1 flex items-center">
                  ${Array(Math.floor(r.rating||0)).fill().map(()=>'<svg class="w-4 h-4 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>').join("")}
                  ${r.rating?`<span class="text-sm text-gray-500 ml-1">(${r.rating.toFixed(1)})</span>`:""}
                </div>
              </div>
              <div class="mt-4">
                <p class="text-gray-700">${r.description||"No description available."}</p>
              </div>
              <div class="mt-4 text-sm text-gray-500">
                <div>Purchases: ${r.purchases||0}</div>
                <div>Added: ${new Date(r.created_at).toLocaleDateString()}</div>
                ${r.updated_at?`<div>Last updated: ${new Date(r.updated_at).toLocaleDateString()}</div>`:""}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;s.innerHTML=t,document.body.appendChild(s);const o=s.querySelector(".close-modal-btn");o.addEventListener("click",()=>{document.body.removeChild(s)}),s.addEventListener("click",e=>{e.target===s&&document.body.removeChild(s)})}catch(e){console.error("Error showing product details:",e)}}async function editProductDetail(o){console.log("Edit product detail called with ID:",o);try{document.querySelectorAll(".product-detail-modal").forEach(e=>{e.remove()});var{data:e,error:t}=await supabase.from("products").select("*").eq("product_id",o).single();if(t)throw t;const d=document.createElement("div");d.classList.add("fixed","inset-0","bg-black","bg-opacity-50","z-50","flex","items-center","justify-center","product-detail-modal");var r=`
      <div class="bg-white rounded-lg w-full max-w-3xl mx-4 overflow-hidden">
        <div class="p-4 bg-gray-50 flex justify-between items-center">
          <h3 class="text-lg font-medium">Edit Product</h3>
          <button class="close-modal-btn text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form id="edit-product-form" class="p-6">
          <input type="hidden" name="product_id" value="${e.product_id}">
          
          <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input type="text" id="name" name="name" class="w-full rounded-md border border-gray-300 p-2" value="${e.name||""}">
          </div>
          
          <div class="mb-4">
            <label for="image_url" class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input type="text" id="image_url" name="image_url" class="w-full rounded-md border border-gray-300 p-2" value="${e.image_url||""}">
            ${e.image_url?`<img src="${e.image_url}" alt="${e.name}" class="mt-2 w-full h-32 object-cover rounded-md">`:""}
          </div>
          
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input type="text" id="category" name="category" class="w-full rounded-md border border-gray-300 p-2" value="${e.category||""}">
            </div>
            
            <div>
              <label for="price" class="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input type="number" id="price" name="price" step="0.01" class="w-full rounded-md border border-gray-300 p-2" value="${e.price||"0.00"}">
            </div>
          </div>
          
          <div class="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label for="rating" class="block text-sm font-medium text-gray-700 mb-1">Rating (0-5)</label>
              <input type="number" id="rating" name="rating" min="0" max="5" step="0.1" class="w-full rounded-md border border-gray-300 p-2" value="${e.rating||"0"}">
            </div>
            
            <div>
              <label for="purchases" class="block text-sm font-medium text-gray-700 mb-1">Purchases</label>
              <input type="number" id="purchases" name="purchases" class="w-full rounded-md border border-gray-300 p-2" value="${e.purchases||"0"}">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">Stock Status</label>
              <label class="inline-flex items-center">
                <input type="checkbox" name="in_stock" class="rounded border-gray-300" ${e.in_stock?"checked":""}>
                <span class="ml-2 text-sm text-gray-700">In Stock</span>
              </label>
            </div>
          </div>
          
          <div class="mb-4">
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea id="description" name="description" rows="4" class="w-full rounded-md border border-gray-300 p-2">${e.description||""}</textarea>
          </div>
          
          <div class="flex justify-end gap-2 mt-6">
            <button type="button" class="cancel-btn py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" class="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-700">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    `;d.innerHTML=r,document.body.appendChild(d);const i=d.querySelector("#image_url"),s=(i.addEventListener("input",function(){const e=this.parentElement,t=e.querySelector("img");var r=this.value.trim();if(r)if(t)t.src=r;else{const i=document.createElement("img");i.src=r,i.alt="Product Image",i.className="mt-2 w-full h-32 object-cover rounded-md",e.appendChild(i)}else t&&t.remove()}),d.querySelector(".close-modal-btn")),a=d.querySelector(".cancel-btn"),n=(s.addEventListener("click",()=>{document.body.removeChild(d)}),a.addEventListener("click",()=>{document.body.removeChild(d)}),d.addEventListener("click",e=>{e.target===d&&document.body.removeChild(d)}),d.querySelector("#edit-product-form"));n.addEventListener("submit",async e=>{e.preventDefault();try{const i=new FormData(n);var t={name:i.get("name"),image_url:i.get("image_url"),category:i.get("category"),price:i.get("price")?parseFloat(i.get("price")):0,rating:i.get("rating")?parseFloat(i.get("rating")):0,purchases:i.get("purchases")?parseInt(i.get("purchases")):0,in_stock:!!i.get("in_stock"),description:i.get("description"),updated_at:(new Date).toISOString()},r=(await supabase.from("products").update(t).eq("product_id",o))["error"];if(r)throw r;document.body.removeChild(d);const s=document.createElement("div");s.className="fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50 notification-toast",s.innerHTML=`
          <div class="flex items-center">
            <div class="py-1"><svg class="fill-current h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM6.7 9.29L9 11.6l4.3-4.3 1.4 1.42L9 14.4l-3.7-3.7 1.4-1.42z"/></svg></div>
            <div>
              <p class="text-sm">Product updated successfully!</p>
            </div>
          </div>
        `,document.body.appendChild(s),setTimeout(()=>{s.remove(),window.location.reload()},1500)}catch(e){console.error("Error updating product:",e),alert("Failed to update product: "+e.message)}})}catch(e){console.error("Error showing product edit form:",e)}}async function showInstructionDetail(t){console.log("Show instruction detail called with ID:",t);try{document.querySelectorAll(".instruction-detail-modal").forEach(e=>{e.remove()});const{data:i,error:s}=await supabase.from("instructions").select("*").eq("instruction_id",t).single();if(s)throw s;const{data:o,error:d}=await supabase.from("instructions").select("*").eq("recipe_id",i.recipe_id).order("step_number",{ascending:!0});if(d)throw d;var e=await foreignKeyResolver.resolveRecipe(i.recipe_id);const a=document.createElement("div");a.classList.add("fixed","inset-0","bg-black","bg-opacity-50","z-50","flex","items-center","justify-center","instruction-detail-modal");var r=`
      <div class="bg-white rounded-lg w-full max-w-3xl mx-4 overflow-hidden">
        <div class="p-4 bg-gray-50 flex justify-between items-center">
          <h3 class="text-lg font-medium">Recipe Instructions</h3>
          <button class="close-modal-btn text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6">
          <div class="mb-4">
            <h2 class="text-xl font-bold">${e}</h2>
          </div>
          
          <div class="mt-6">
            <h3 class="text-lg font-medium mb-3">Instructions</h3>
            <div class="space-y-4">
              ${o.map(e=>`
                <div class="flex items-start ${e.instruction_id===t?"bg-blue-50 p-3 rounded-md":""}">
                  <div class="flex-shrink-0 mr-4">
                    <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                      ${e.step_number}
                    </div>
                  </div>
                  <div class="flex-1">
                    <p class="text-gray-700">${e.description}</p>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
          
          <div class="flex justify-end gap-2 mt-6">
            <button type="button" class="edit-instructions-btn py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-700">
              Edit Instructions
            </button>
          </div>
        </div>
      </div>
    `;a.innerHTML=r,document.body.appendChild(a);const n=a.querySelector(".close-modal-btn"),l=(n.addEventListener("click",()=>{document.body.removeChild(a)}),a.addEventListener("click",e=>{e.target===a&&document.body.removeChild(a)}),a.querySelector(".edit-instructions-btn"));l.addEventListener("click",()=>{document.body.removeChild(a),editInstructionSet(i.recipe_id)})}catch(e){console.error("Error showing instruction details:",e),alert("Error showing instructions: "+e.message)}}async function editInstructionSet(e){console.log("Edit instruction set called for recipe ID:",e);try{document.querySelectorAll(".instruction-detail-modal").forEach(e=>{e.remove()});const{data:m,error:s}=await supabase.from("instructions").select("*").eq("recipe_id",e).order("step_number",{ascending:!0});if(s)throw s;var t=await foreignKeyResolver.resolveRecipe(e);const u=document.createElement("div");u.classList.add("fixed","inset-0","bg-black","bg-opacity-50","z-50","flex","items-center","justify-center","instruction-detail-modal");var r=`
      <div class="bg-white rounded-lg w-full max-w-3xl mx-4 flex flex-col h-[90vh]">
        <div class="p-4 bg-gray-50 flex justify-between items-center sticky top-0 z-10 border-b border-gray-200">
          <h3 class="text-lg font-medium">Edit Instructions for ${t}</h3>
          <button class="close-modal-btn text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="overflow-y-auto custom-scroll flex-1 min-h-0">
          <form id="edit-instructions-form" class="p-6">
            <input type="hidden" name="recipe_id" value="${e}">
            
            <div id="instructions-container" class="space-y-4 mb-4">
              ${m.map((e,t)=>`
                <div class="instruction-item border border-gray-200 p-4 rounded-md" data-id="${e.instruction_id}">
                  <div class="flex justify-between mb-2">
                    <div class="flex items-center">
                      <span class="mr-2 font-medium">Step</span>
                      <input type="number" name="step_number_${e.instruction_id}" class="w-16 rounded-md border border-gray-300 p-1" value="${e.step_number}" min="1">
                    </div>
                    <button type="button" class="delete-step-btn text-red-500 hover:text-red-700" data-id="${e.instruction_id}">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <textarea name="description_${e.instruction_id}" rows="3" class="w-full rounded-md border border-gray-300 p-2">${e.description||""}</textarea>
                </div>
              `).join("")}
            </div>
            
            <button type="button" id="add-step-btn" class="flex items-center text-primary hover:text-primary-700 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Step
            </button>
          </form>
        </div>
        
        <div class="p-4 bg-gray-50 flex justify-end gap-2 border-t border-gray-200 sticky bottom-0">
          <button type="button" class="cancel-btn py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" id="save-changes-btn" form="edit-instructions-form" class="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-700">
            Save Changes
          </button>
        </div>
      </div>
    `;u.innerHTML=r,document.body.appendChild(u);const o=u.querySelector(".close-modal-btn"),d=u.querySelector(".cancel-btn"),a=(o.addEventListener("click",()=>{document.body.removeChild(u)}),d.addEventListener("click",()=>{document.body.removeChild(u)}),u.addEventListener("click",e=>{e.target===u&&document.body.removeChild(u)}),u.querySelector("#add-step-btn")),n=u.querySelector("#instructions-container");let i=0;a.addEventListener("click",()=>{var e=0<m.length?Math.max(...m.map(e=>e.step_number))+1:1;const t="new-"+i++;e=`
        <div class="instruction-item border border-gray-200 p-4 rounded-md bg-green-50" data-id="${t}">
          <div class="flex justify-between mb-2">
            <div class="flex items-center">
              <span class="mr-2 font-medium">Step</span>
              <input type="number" name="step_number_${t}" class="w-16 rounded-md border border-gray-300 p-1" value="${e}" min="1">
            </div>
            <button type="button" class="delete-step-btn text-red-500 hover:text-red-700" data-id="${t}">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          <textarea name="description_${t}" rows="3" class="w-full rounded-md border border-gray-300 p-2" placeholder="Enter step description..."></textarea>
        </div>
      `;n.insertAdjacentHTML("beforeend",e);const r=n.querySelector(`[data-id="${t}"] .delete-step-btn`);r.addEventListener("click",function(){const e=n.querySelector(`[data-id="${t}"]`);e.remove()})});const l=u.querySelectorAll(".delete-step-btn"),p=(l.forEach(e=>{e.addEventListener("click",function(){var e=this.getAttribute("data-id");const t=n.querySelector(`[data-id="${e}"]`);t.remove()})}),u.querySelector("#edit-instructions-form"));p.addEventListener("submit",async e=>{e.preventDefault();try{const i=new FormData(p),s=i.get("recipe_id"),r=u.querySelectorAll(".instruction-item"),o=[],d=[],a=new Set;r.forEach(e=>{const t=e.getAttribute("data-id");var e=parseInt(i.get("step_number_"+t),10),r=i.get("description_"+t);t.startsWith("new-")?d.push({recipe_id:s,step_number:e,description:r}):(a.add(t),o.push({instruction_id:t,recipe_id:s,step_number:e,description:r}))});var t=m.filter(e=>!a.has(e.instruction_id)).map(e=>e.instruction_id);const n=[];0<o.length&&n.push(supabase.from("instructions").upsert(o)),0<d.length&&n.push(supabase.from("instructions").insert(d)),0<t.length&&n.push(supabase.from("instructions").delete().in("instruction_id",t));for(const c of await Promise.all(n))if(c.error)throw c.error;document.body.removeChild(u);const l=document.createElement("div");l.className="fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50 notification-toast",l.innerHTML=`
          <div class="flex items-center">
            <div class="py-1"><svg class="fill-current h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM6.7 9.29L9 11.6l4.3-4.3 1.4 1.42L9 14.4l-3.7-3.7 1.4-1.42z"/></svg></div>
            <div>
              <p class="text-sm">Recipe instructions updated successfully!</p>
            </div>
          </div>
        `,document.body.appendChild(l),setTimeout(()=>{l.remove(),window.location.reload()},1500)}catch(e){console.error("Error updating instructions:",e),alert("Failed to update instructions: "+e.message)}})}catch(e){console.error("Error showing instruction edit form:",e),alert("Error showing instruction editor: "+e.message)}}