async function loadRecipeData(){const a=await fetchRecipes(),e=(console.log("Recipes loaded:",a),document.querySelectorAll(".recipe-table-container")),t=(e.forEach(e=>{renderTableContent(e,a)}),document.querySelectorAll('[data-table-type="recipes"]'));t.forEach(e=>{var t;window.tableRenderer?(t=window.tableRenderer.tableConfigs.recipes)&&window.tableRenderer.renderTable(e,t):renderTableContent(e,a)})}function renderTableContent(e,t){const n=e.querySelector("tbody");if(n){const r=n.dataset.rowClasses||"";if(n.innerHTML="",t&&0!==t.length)t.forEach(e=>{const t=document.createElement("tr");r&&(t.className=r);var a=e.created_at?new Date(e.created_at).toLocaleDateString():"",i=Array.isArray(e.tags)?e.tags.join(", "):"";t.innerHTML=`
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-default-800">
        <div class="flex items-center">
          ${e.image_url?`
            <div class="flex-shrink-0 h-10 w-10 mr-3">
              <img class="h-10 w-10 rounded-md object-cover" src="${e.image_url}" alt="">
            </div>
          `:""}
          <div>
            ${e.title||"Untitled Recipe"}
            ${i?`<p class="text-xs text-gray-500">${i}</p>`:""}
          </div>
        </div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-default-800">
        ${e.difficulty||"N/A"}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-default-800">
        ${e.cooking_time?e.cooking_time+" mins":"N/A"}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-default-800">
        ${e.likes_count||0}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-default-800">
        ${e.views_count||0}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-default-800">
        ${a}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <a href="#" class="text-primary hover:text-sky-700 mr-3 edit-recipe-btn" data-id="${e.recipe_id}">Edit</a>
        <a href="#" class="text-red-500 hover:text-red-700 delete-recipe-btn" data-id="${e.recipe_id}">Delete</a>
      </td>
    `,n.appendChild(t)});else{const a=document.createElement("tr");a.innerHTML=`
      <td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500">
        No recipes found
      </td>
    `,void n.appendChild(a)}}}document.addEventListener("DOMContentLoaded",async function(){console.log("Loading recipe data..."),await loadRecipeData(),document.addEventListener("click",async function(e){if(!e.recipeActionHandled){if(e.target&&e.target.classList.contains("delete-recipe-btn")){e.preventDefault(),e.recipeActionHandled=!0;var t=e.target.dataset.id;if(confirm("Are you sure you want to delete this recipe?"))if(await deleteRecipe(t)){const a=e.target.closest('[data-table-type="recipes"], .recipe-table-container');a&&"recipes"===a.getAttribute("data-table-type")&&window.tableRenderer?(t=window.tableRenderer.tableConfigs.recipes,await window.tableRenderer.renderTable(a,t)):await loadRecipeData()}}e.target&&e.target.classList.contains("edit-recipe-btn")&&(e.preventDefault(),e.recipeActionHandled=!0,t=e.target.dataset.id,await editRecipeDetail(t))}})});