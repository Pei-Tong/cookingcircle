async function addRecipe(){try{document.querySelectorAll(".recipe-add-modal").forEach(e=>{e.remove()});const a=document.createElement("div");a.classList.add("fixed","inset-0","bg-black","bg-opacity-50","z-50","flex","items-center","justify-center","recipe-add-modal");a.innerHTML=`
      <div class="bg-white rounded-lg w-full max-w-3xl mx-4 overflow-hidden">
        <div class="p-4 bg-gray-50 flex justify-between items-center">
          <h3 class="text-lg font-medium">Add New Recipe</h3>
          <button class="close-modal-btn text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form id="add-recipe-form" class="p-6">
          <div class="mb-4">
            <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" id="title" name="title" class="w-full rounded-md border border-gray-300 p-2" required>
          </div>
          
          <div class="mb-4">
            <label for="image_url" class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input type="text" id="image_url" name="image_url" class="w-full rounded-md border border-gray-300 p-2">
          </div>
          
          <div class="mb-4">
            <label for="tags" class="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
            <input type="text" id="tags" name="tags" class="w-full rounded-md border border-gray-300 p-2">
          </div>
          
          <div class="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label for="difficulty" class="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select id="difficulty" name="difficulty" class="w-full rounded-md border border-gray-300 p-2">
                <option value="">Select Difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            
            <div>
              <label for="cooking_time" class="block text-sm font-medium text-gray-700 mb-1">Cooking Time (mins)</label>
              <input type="number" id="cooking_time" name="cooking_time" class="w-full rounded-md border border-gray-300 p-2" value="0">
            </div>
            
            <div>
              <label for="servings" class="block text-sm font-medium text-gray-700 mb-1">Servings</label>
              <input type="number" id="servings" name="servings" class="w-full rounded-md border border-gray-300 p-2" value="0">
            </div>
          </div>
          
          <div class="mb-4">
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea id="description" name="description" rows="4" class="w-full rounded-md border border-gray-300 p-2"></textarea>
          </div>
          
          <div class="flex justify-end gap-2 mt-6">
            <button type="button" class="cancel-btn py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" class="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-700">
              Add Recipe
            </button>
          </div>
        </form>
      </div>
    `,document.body.appendChild(a);const e=a.querySelector("#image_url"),t=(e.addEventListener("input",function(){const e=this.parentElement,t=e.querySelector("img");var r=this.value.trim();if(r)if(t)t.src=r;else{const d=document.createElement("img");d.src=r,d.alt="Recipe Image Preview",d.className="mt-2 w-full h-32 object-cover rounded-md",e.appendChild(d)}else t&&t.remove()}),a.querySelector(".close-modal-btn")),r=a.querySelector(".cancel-btn"),i=(t.addEventListener("click",()=>{document.body.removeChild(a)}),r.addEventListener("click",()=>{document.body.removeChild(a)}),a.addEventListener("click",e=>{e.target===a&&document.body.removeChild(a)}),a.querySelector("#add-recipe-form"));i.addEventListener("submit",async e=>{e.preventDefault();try{const d=new FormData(i);var t={title:d.get("title"),image_url:d.get("image_url"),tags:d.get("tags")?d.get("tags").split(",").map(e=>e.trim()).filter(e=>e):[],difficulty:d.get("difficulty"),cooking_time:d.get("cooking_time")?parseInt(d.get("cooking_time")):0,servings:d.get("servings")?parseInt(d.get("servings")):0,description:d.get("description"),created_at:(new Date).toISOString(),likes_count:0,views_count:0},r=(await supabase.from("recipes").insert(t))["error"];if(r)throw r;document.body.removeChild(a);const o=document.createElement("div");o.className="fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50 notification-toast",o.innerHTML=`
          <div class="flex items-center">
            <div class="py-1"><svg class="fill-current h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM6.7 9.29L9 11.6l4.3-4.3 1.4 1.42L9 14.4l-3.7-3.7 1.4-1.42z"/></svg></div>
            <div>
              <p class="text-sm">Recipe added successfully!</p>
            </div>
          </div>
        `,document.body.appendChild(o),setTimeout(()=>{o.remove(),window.location.reload()},1500)}catch(e){console.error("Error adding recipe:",e),alert("Failed to add recipe: "+e.message)}})}catch(e){console.error("Error showing recipe add form:",e)}}async function addProduct(){try{document.querySelectorAll(".product-add-modal").forEach(e=>{e.remove()});const a=document.createElement("div");a.classList.add("fixed","inset-0","bg-black","bg-opacity-50","z-50","flex","items-center","justify-center","product-add-modal");a.innerHTML=`
      <div class="bg-white rounded-lg w-full max-w-3xl mx-4 overflow-hidden">
        <div class="p-4 bg-gray-50 flex justify-between items-center">
          <h3 class="text-lg font-medium">Add New Product</h3>
          <button class="close-modal-btn text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form id="add-product-form" class="p-6">
          <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input type="text" id="name" name="name" class="w-full rounded-md border border-gray-300 p-2" required>
          </div>
          
          <div class="mb-4">
            <label for="image_url" class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input type="text" id="image_url" name="image_url" class="w-full rounded-md border border-gray-300 p-2">
          </div>
          
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input type="text" id="category" name="category" class="w-full rounded-md border border-gray-300 p-2">
            </div>
            
            <div>
              <label for="price" class="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input type="number" id="price" name="price" step="0.01" class="w-full rounded-md border border-gray-300 p-2" value="0.00">
            </div>
          </div>
          
          <div class="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label for="rating" class="block text-sm font-medium text-gray-700 mb-1">Rating (0-5)</label>
              <input type="number" id="rating" name="rating" min="0" max="5" step="0.1" class="w-full rounded-md border border-gray-300 p-2" value="0">
            </div>
            
            <div>
              <label for="purchases" class="block text-sm font-medium text-gray-700 mb-1">Purchases</label>
              <input type="number" id="purchases" name="purchases" class="w-full rounded-md border border-gray-300 p-2" value="0">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">Stock Status</label>
              <label class="inline-flex items-center">
                <input type="checkbox" name="in_stock" class="rounded border-gray-300" checked>
                <span class="ml-2 text-sm text-gray-700">In Stock</span>
              </label>
            </div>
          </div>
          
          <div class="mb-4">
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea id="description" name="description" rows="4" class="w-full rounded-md border border-gray-300 p-2"></textarea>
          </div>
          
          <div class="flex justify-end gap-2 mt-6">
            <button type="button" class="cancel-btn py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" class="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-700">
              Add Product
            </button>
          </div>
        </form>
      </div>
    `,document.body.appendChild(a);const e=a.querySelector("#image_url"),t=(e.addEventListener("input",function(){const e=this.parentElement,t=e.querySelector("img");var r=this.value.trim();if(r)if(t)t.src=r;else{const d=document.createElement("img");d.src=r,d.alt="Product Image Preview",d.className="mt-2 w-full h-32 object-cover rounded-md",e.appendChild(d)}else t&&t.remove()}),a.querySelector(".close-modal-btn")),r=a.querySelector(".cancel-btn"),i=(t.addEventListener("click",()=>{document.body.removeChild(a)}),r.addEventListener("click",()=>{document.body.removeChild(a)}),a.addEventListener("click",e=>{e.target===a&&document.body.removeChild(a)}),a.querySelector("#add-product-form"));i.addEventListener("submit",async e=>{e.preventDefault();try{const d=new FormData(i);var t={name:d.get("name"),image_url:d.get("image_url"),category:d.get("category"),price:d.get("price")?parseFloat(d.get("price")):0,rating:d.get("rating")?parseFloat(d.get("rating")):0,purchases:d.get("purchases")?parseInt(d.get("purchases")):0,in_stock:!!d.get("in_stock"),description:d.get("description"),created_at:(new Date).toISOString()},r=(await supabase.from("products").insert(t))["error"];if(r)throw r;document.body.removeChild(a);const o=document.createElement("div");o.className="fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50 notification-toast",o.innerHTML=`
          <div class="flex items-center">
            <div class="py-1"><svg class="fill-current h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM6.7 9.29L9 11.6l4.3-4.3 1.4 1.42L9 14.4l-3.7-3.7 1.4-1.42z"/></svg></div>
            <div>
              <p class="text-sm">Product added successfully!</p>
            </div>
          </div>
        `,document.body.appendChild(o),setTimeout(()=>{o.remove(),window.location.reload()},1500)}catch(e){console.error("Error adding product:",e),alert("Failed to add product: "+e.message)}})}catch(e){console.error("Error showing product add form:",e)}}window.addRecipe=addRecipe,window.addProduct=addProduct;