class DynamicTableRenderer{constructor(){this.tableConfigs=tableConfigurations||{},this.initializeTables(),this.setupEventListeners()}initializeTables(){document.addEventListener("DOMContentLoaded",async()=>{for(const r of document.querySelectorAll("[data-table-type]")){var t=r.dataset.tableType;let e=this.tableConfigs[t];if(!e){if(!(e=await configGenerator.generateConfig(t))){console.error("Could not generate configuration for table type: "+t);continue}this.tableConfigs[t]=e}await this.renderTable(r,e)}})}setupEventListeners(){this.eventListenersAttached||(this.eventListenersAttached=!0,document.addEventListener("click",async a=>{if(!a.recipeActionHandled){var e=a.target.classList.contains("table-action-btn")||a.target.classList.contains("edit-recipe-btn")||a.target.classList.contains("delete-recipe-btn");if(a.target&&e){a.recipeActionHandled=!0,a.preventDefault();let e,t,r;a.target.classList.contains("edit-recipe-btn")?(e="edit",r=a.target.dataset.id,t="recipes"):a.target.classList.contains("delete-recipe-btn")?(e="delete",r=a.target.dataset.id,t="recipes"):(e=a.target.dataset.action,t=a.target.dataset.tableType,r=a.target.dataset.id);const n=this.tableConfigs[t];if(n)switch(e){case"delete":var o=n.actions.find(e=>"delete"===e.action);if(o&&confirm(o.confirmMessage||"Are you sure?"))try{const d=a.target.closest("tr");if(d&&(d.style.opacity="0.5",d.style.transition="opacity 0.2s"),await this.deleteItem(n.tableName,n.idField,r)){const l=document.createElement("div");l.className="fixed inset-x-0 top-4 flex justify-center z-50",l.innerHTML=`
                  <div class="bg-green-100 border border-green-500 text-green-700 px-4 py-3 rounded shadow-md">
                    <div class="flex items-center">
                      <div class="py-1"><svg class="fill-current h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM6.7 9.29L9 11.6l4.3-4.3 1.4 1.42L9 14.4l-3.7-3.7 1.4-1.42z"/></svg></div>
                      <div>
                        <p class="text-sm">Item deleted successfully. Refreshing page...</p>
                      </div>
                    </div>
                  </div>
                `,document.body.appendChild(l),setTimeout(()=>{window.location.reload()},800)}else d&&(d.style.opacity="1"),alert("Failed to delete the item. Please try again.")}catch(e){console.error("Error during deletion:",e),alert("An error occurred while deleting the item.")}break;case"edit":try{var s=`edit${t.charAt(0).toUpperCase()+t.slice(1).replace(/s$/,"")}Detail`;"function"==typeof window[s]?await window[s](r):await this.showGenericEditModal(n.tableName,n.idField,r,n.columns)}catch(e){console.error(`Error editing ${t}:`,e),alert(`Could not edit ${t}. Error: `+e.message)}}}}},!0),document.addEventListener("click",async t=>{if(t.target.closest(".add-item-btn")){t=t.target.closest(".add-item-btn").dataset.tableType;if(t)if("recipes"===t&&"function"==typeof window.addRecipe)window.addRecipe();else if("products"===t&&"function"==typeof window.addProduct)window.addProduct();else{var e=this.tableConfigs[t];if(e)try{await this.showGenericAddModal(e.tableName,e.idField,e.columns)}catch(e){console.error(`Error adding to ${t}:`,e),alert("Could not open add form: "+e.message)}}}}))}async fetchItems(t,r=null){try{let e=supabase.from(t).select("*");var{data:a,error:o}=await(e=r?e.order(r.column,{ascending:r.ascending}):e);if(o)throw o;return a}catch(e){return console.error(`Error fetching ${t}:`,e),[]}}async fetchItemById(t,e,r){try{var{data:a,error:o}=await supabase.from(t).select("*").eq(e,r).single();if(o)throw o;return a}catch(e){return console.error(`Error fetching item from ${t}:`,e),null}}async deleteItem(t, e, r) {
    try {
      // Special handling for recipes table
      if (t === "recipes") {
        // Use the enhanced deleteRecipe function for recipes
        if (typeof deleteRecipe === "function") {
          const success = await deleteRecipe(r);
          if (!success) {
            throw new Error("Failed to delete recipe and its related data");
          }
          return true;
        }
      }
      
      // For all other tables, use the standard delete approach
      var a = (await supabase.from(t).delete().eq(e, r))["error"];
      if (a) throw a;
      return true;
    } catch (e) {
      console.error(`Error deleting item from ${t}:`, e);
      return false;
    }
  }async insertItem(t,e){try{var r=(await supabase.from(t).insert(e))["error"];if(r)throw r;return!0}catch(e){return console.error(`Error inserting item into ${t}:`,e),!1}}async renderTable(e,t){e.classList.remove("overflow-auto"),e.classList.add("overflow-auto");const r=e.closest(".card")?.querySelector(".card-header");if(r&&!r.querySelector(".add-item-btn")){const l=document.createElement("button");l.className="add-item-btn py-1 px-3 inline-flex items-center gap-1 text-sm font-medium bg-primary text-white rounded-md ml-auto",l.innerHTML=`
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add New
        `,l.dataset.tableType=t.tableName,r.style.display="flex",r.style.justifyContent="space-between",r.style.alignItems="center",r.appendChild(l)}for(;e.firstChild;)e.removeChild(e.firstChild);e.innerHTML=`
      <div class="table-wrapper">
        <div class="table-responsive custom-scroll">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50 sticky top-0 z-10">
              <tr>
                ${t.columns.map(e=>`<th scope="col" class="px-6 py-3 text-start text-sm text-default-500 min-w-[120px]">${e.header}</th>`).join("")}
                ${t.actions&&t.actions.length?'<th scope="col" class="px-6 py-3 text-end text-sm text-default-500 min-w-[100px]">Actions</th>':""}
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200" ${e.dataset.rowClasses?`data-row-classes="${e.dataset.rowClasses}"`:""}>
              <tr>
                <td colspan="${t.columns.length+(t.actions&&t.actions.length?1:0)}" class="px-6 py-4 text-center text-sm text-gray-500">
                  Loading data...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;const a=e.querySelector("table");e.querySelector(".table-wrapper");const o=e.querySelector(".table-responsive"),s=a.querySelector("tbody"),n=s.dataset.rowClasses||"",d=await this.fetchItems(t.tableName,t.orderBy);if(s.innerHTML="",d&&0!==d.length){5<d.length?(o.style.maxHeight="400px",o.style.overflowY="auto"):(o.style.maxHeight="none",o.style.overflowY="visible"),o.style.overflowX="auto";const i=[];for(const c of d)for(const m of t.columns)m.render&&"AsyncFunction"===m.render.constructor.name&&i.push((async()=>{c["_rendered_"+m.key]=await m.render(c)})());0<i.length&&await Promise.all(i),d.forEach(a=>{const e=document.createElement("tr");n&&(e.className=n);let o="";t.columns.forEach(e=>{var t=a[e.key];let r;r=void 0!==a["_rendered_"+e.key]?a["_rendered_"+e.key]:e.render&&"AsyncFunction"!==e.render.constructor.name?e.render(a):null!=t?t:void 0!==e.fallback?e.fallback:"",o+=`
          <td class="px-6 py-4 whitespace-nowrap text-sm text-default-800">
            ${r}
          </td>
        `}),t.actions&&t.actions.length&&(o+=`
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            ${t.actions.map(e=>`
              <a href="#" class="table-action-btn ${e.class}" 
                data-action="${e.action}" 
                data-table-type="${t.tableName}" 
                data-id="${a[t.idField]}">${e.text}</a>
            `).join("")}
          </td>
        `),e.innerHTML=o,s.appendChild(e)})}else{const y=document.createElement("tr");y.innerHTML=`
        <td colspan="${t.columns.length+(t.actions&&t.actions.length?1:0)}" class="px-6 py-4 text-center text-sm text-gray-500">
          No data found
        </td>
      `,void s.appendChild(y)}}async showGenericEditModal(s,n,d,l){try{document.querySelectorAll(".generic-edit-modal").forEach(e=>{e.remove()});const i=await this.fetchItemById(s,n,d);if(!i)throw new Error(`Could not find ${s} with ${n}=`+d);const c=document.createElement("div");c.classList.add("fixed","inset-0","bg-black","bg-opacity-50","z-50","flex","items-center","justify-center","generic-edit-modal");let r="";l.forEach(e=>{if(e.key!==n){const t=void 0!==i[e.key]&&null!==i[e.key]?i[e.key]:"";"boolean"==typeof t?r+=`
            <div class="mb-4">
              <label class="inline-flex items-center">
                <input type="checkbox" name="${e.key}" class="rounded border-gray-300" ${t?"checked":""}>
                <span class="ml-2 text-sm font-medium text-gray-700">${e.header}</span>
              </label>
            </div>
          `:"number"==typeof t?r+=`
            <div class="mb-4">
              <label for="${e.key}" class="block text-sm font-medium text-gray-700 mb-1">${e.header}</label>
              <input type="number" id="${e.key}" name="${e.key}" class="w-full rounded-md border border-gray-300 p-2" value="${t}">
            </div>
          `:Array.isArray(t)?r+=`
            <div class="mb-4">
              <label for="${e.key}" class="block text-sm font-medium text-gray-700 mb-1">${e.header} (comma separated)</label>
              <input type="text" id="${e.key}" name="${e.key}" class="w-full rounded-md border border-gray-300 p-2" value="${t.join(", ")}">
            </div>
          `:"string"==typeof t&&100<t.length?r+=`
            <div class="mb-4">
              <label for="${e.key}" class="block text-sm font-medium text-gray-700 mb-1">${e.header}</label>
              <textarea id="${e.key}" name="${e.key}" rows="4" class="w-full rounded-md border border-gray-300 p-2">${t}</textarea>
            </div>
          `:r+=`
            <div class="mb-4">
              <label for="${e.key}" class="block text-sm font-medium text-gray-700 mb-1">${e.header}</label>
              <input type="text" id="${e.key}" name="${e.key}" class="w-full rounded-md border border-gray-300 p-2" value="${null!==t?t:""}">
            </div>
          `}});var e=`
        <div class="bg-white rounded-lg w-full max-w-3xl mx-4 flex flex-col h-[90vh]">
          <div class="p-4 bg-gray-50 flex justify-between items-center sticky top-0 z-10 border-b border-gray-200">
            <h3 class="text-lg font-medium">Edit ${s.charAt(0).toUpperCase()+s.slice(1).replace(/s$/,"")}</h3>
            <button class="close-modal-btn text-gray-400 hover:text-gray-600">
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="overflow-y-auto custom-scroll flex-1 min-h-0">
            <form id="edit-form" class="p-6">
              <input type="hidden" name="${n}" value="${i[n]}">
            
              ${r}
            </form>
          </div>
          <div class="p-4 bg-gray-50 flex justify-end gap-2 border-t border-gray-200 sticky bottom-0">
            <button type="button" class="cancel-btn py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" id="save-changes-btn" class="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-700">
              Save Changes
            </button>
          </div>
        </div>
      `;c.innerHTML=e,document.body.appendChild(c);const t=c.querySelector(".close-modal-btn"),a=c.querySelector(".cancel-btn"),m=c.querySelector("#edit-form"),o=c.querySelector("#save-changes-btn");t.addEventListener("click",()=>{document.body.removeChild(c)}),a.addEventListener("click",()=>{document.body.removeChild(c)}),c.addEventListener("click",e=>{e.target===c&&document.body.removeChild(c)}),o.addEventListener("click",()=>{m.dispatchEvent(new Event("submit"))}),m.addEventListener("submit",async e=>{e.preventDefault();try{const r=new FormData(m),a={};l.forEach(t=>{if(t.key!==n){let e=r.get(t.key);"boolean"==typeof i[t.key]?e=!!r.get(t.key):"number"==typeof i[t.key]?e=e?Number(e):0:Array.isArray(i[t.key])&&(e=e?e.split(",").map(e=>e.trim()).filter(e=>e):[]),a[t.key]=e}});var t=(await supabase.from(s).update(a).eq(n,d))["error"];if(t)throw t;document.body.removeChild(c);const o=document.createElement("div");o.className="fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50 notification-toast",o.innerHTML=`
            <div class="flex items-center">
              <div class="py-1"><svg class="fill-current h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM6.7 9.29L9 11.6l4.3-4.3 1.4 1.42L9 14.4l-3.7-3.7 1.4-1.42z"/></svg></div>
              <div>
                <p class="text-sm">Item updated successfully!</p>
              </div>
            </div>
          `,document.body.appendChild(o),setTimeout(()=>{o.remove(),window.location.reload()},1500)}catch(e){console.error("Error updating item:",e),alert("Failed to update item: "+e.message)}})}catch(e){console.error("Error showing edit modal:",e),alert("Could not display edit form: "+e.message)}}async showGenericAddModal(o,s,n){try{document.querySelectorAll(".generic-add-modal").forEach(e=>{e.remove()});const d=document.createElement("div");d.classList.add("fixed","inset-0","bg-black","bg-opacity-50","z-50","flex","items-center","justify-center","generic-add-modal");let t="";n.forEach(e=>{e.key!==s&&("boolean"===e.type?t+=`
            <div class="mb-4">
              <label class="inline-flex items-center">
                <input type="checkbox" name="${e.key}" class="rounded border-gray-300">
                <span class="ml-2 text-sm font-medium text-gray-700">${e.header}</span>
              </label>
            </div>
          `:"number"===e.type?t+=`
            <div class="mb-4">
              <label for="${e.key}" class="block text-sm font-medium text-gray-700 mb-1">${e.header}</label>
              <input type="number" id="${e.key}" name="${e.key}" class="w-full rounded-md border border-gray-300 p-2" value="0">
            </div>
          `:"array"===e.type?t+=`
            <div class="mb-4">
              <label for="${e.key}" class="block text-sm font-medium text-gray-700 mb-1">${e.header} (comma separated)</label>
              <input type="text" id="${e.key}" name="${e.key}" class="w-full rounded-md border border-gray-300 p-2">
            </div>
          `:"text"===e.type||e.key.includes("description")?t+=`
            <div class="mb-4">
              <label for="${e.key}" class="block text-sm font-medium text-gray-700 mb-1">${e.header}</label>
              <textarea id="${e.key}" name="${e.key}" rows="4" class="w-full rounded-md border border-gray-300 p-2"></textarea>
            </div>
          `:t+=`
            <div class="mb-4">
              <label for="${e.key}" class="block text-sm font-medium text-gray-700 mb-1">${e.header}</label>
              <input type="text" id="${e.key}" name="${e.key}" class="w-full rounded-md border border-gray-300 p-2">
            </div>
          `)});var e=`
        <div class="bg-white rounded-lg w-full max-w-3xl mx-4 flex flex-col h-[90vh]">
          <div class="p-4 bg-gray-50 flex justify-between items-center sticky top-0 z-10 border-b border-gray-200">
            <h3 class="text-lg font-medium">Add New ${o.charAt(0).toUpperCase()+o.slice(1).replace(/s$/,"")}</h3>
            <button class="close-modal-btn text-gray-400 hover:text-gray-600">
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="overflow-y-auto custom-scroll flex-1 min-h-0">
            <form id="add-form" class="p-6">
              ${t}
            </form>
          </div>
          <div class="p-4 bg-gray-50 flex justify-end gap-2 border-t border-gray-200 sticky bottom-0">
            <button type="button" class="cancel-btn py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" id="save-new-btn" class="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-700">
              Save
            </button>
          </div>
        </div>
      `;d.innerHTML=e,document.body.appendChild(d);const r=d.querySelector(".close-modal-btn"),a=d.querySelector(".cancel-btn"),l=d.querySelector("#add-form"),i=d.querySelector("#save-new-btn");r.addEventListener("click",()=>{document.body.removeChild(d)}),a.addEventListener("click",()=>{document.body.removeChild(d)}),d.addEventListener("click",e=>{e.target===d&&document.body.removeChild(d)}),i.addEventListener("click",()=>{l.dispatchEvent(new Event("submit"))}),l.addEventListener("submit",async e=>{e.preventDefault();try{const r=new FormData(l),a={};if(n.forEach(t=>{if(t.key!==s){let e=r.get(t.key);"boolean"===t.type?e=!!r.get(t.key):"number"===t.type||"number"==typeof t.fallback?e=e?Number(e):0:"array"===t.type?e=e?e.split(",").map(e=>e.trim()).filter(e=>e):[]:""===e&&(e=void 0!==t.fallback?t.fallback:null),a[t.key]=e}}),!await this.insertItem(o,a))throw new Error("Failed to insert item");document.body.removeChild(d);const t=document.createElement("div");t.className="fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50 notification-toast",t.innerHTML=`
            <div class="flex items-center">
              <div class="py-1"><svg class="fill-current h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM6.7 9.29L9 11.6l4.3-4.3 1.4 1.42L9 14.4l-3.7-3.7 1.4-1.42z"/></svg></div>
              <div>
                <p class="text-sm">Item added successfully!</p>
              </div>
            </div>
          `,document.body.appendChild(t),setTimeout(()=>{t.remove(),window.location.reload()},1500)}catch(e){console.error("Error adding item:",e),alert("Failed to add item: "+e.message)}})}catch(e){console.error("Error showing add modal:",e),alert("Could not display add form: "+e.message)}}}const tableRenderer=new DynamicTableRenderer;