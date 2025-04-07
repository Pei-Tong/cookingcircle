interface TableColumn {
  name: string;
  label?: string;
  type: string;
  required?: boolean;
  foreignKey?: {
    table: string;
    field: string;
    displayField: string;
  };
}

interface TableAction {
  action: string;
  label: string;
  confirmMessage?: string;
}

interface TableConfig {
  tableName: string;
  idField: string;
  columns: TableColumn[];
  actions: TableAction[];
}

const tableConfigurations: Record<string, TableConfig> = {
  recipes: {
    tableName: 'recipes',
    idField: 'id',
    columns: [
      { name: 'id', label: 'ID', type: 'text', required: true },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'text' },
      { name: 'cooking_time', label: 'Cooking Time', type: 'number' },
      { name: 'difficulty', label: 'Difficulty', type: 'text' },
      { name: 'servings', label: 'Servings', type: 'number' },
      { name: 'author_id', label: 'Author', type: 'text', foreignKey: {
        table: 'users',
        field: 'id',
        displayField: 'name'
      }},
      { name: 'created_at', label: 'Created At', type: 'datetime' },
      { name: 'updated_at', label: 'Updated At', type: 'datetime' }
    ],
    actions: [
      { action: 'edit', label: 'Edit' },
      { action: 'delete', label: 'Delete', confirmMessage: 'Are you sure you want to delete this recipe?' }
    ]
  },
  users: {
    tableName: 'users',
    idField: 'id',
    columns: [
      { name: 'id', label: 'ID', type: 'text', required: true },
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'role', label: 'Role', type: 'text' },
      { name: 'created_at', label: 'Created At', type: 'datetime' },
      { name: 'updated_at', label: 'Updated At', type: 'datetime' }
    ],
    actions: [
      { action: 'edit', label: 'Edit' },
      { action: 'delete', label: 'Delete', confirmMessage: 'Are you sure you want to delete this user?' }
    ]
  },
  products: {
    tableName: 'products',
    idField: 'id',
    columns: [
      { name: 'id', label: 'ID', type: 'text', required: true },
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'unit', label: 'Unit', type: 'text' },
      { name: 'created_at', label: 'Created At', type: 'datetime' },
      { name: 'updated_at', label: 'Updated At', type: 'datetime' }
    ],
    actions: [
      { action: 'edit', label: 'Edit' },
      { action: 'delete', label: 'Delete', confirmMessage: 'Are you sure you want to delete this product?' }
    ]
  },
  instructions: {
    tableName: 'instructions',
    idField: 'id',
    columns: [
      { name: 'id', label: 'ID', type: 'text', required: true },
      { name: 'recipe_id', label: 'Recipe', type: 'text', foreignKey: {
        table: 'recipes',
        field: 'id',
        displayField: 'title'
      }},
      { name: 'step_number', label: 'Step Number', type: 'number', required: true },
      { name: 'description', label: 'Description', type: 'text', required: true },
      { name: 'created_at', label: 'Created At', type: 'datetime' },
      { name: 'updated_at', label: 'Updated At', type: 'datetime' }
    ],
    actions: [
      { action: 'edit', label: 'Edit' },
      { action: 'delete', label: 'Delete', confirmMessage: 'Are you sure you want to delete this instruction?' }
    ]
  },
  recipe_nutrition: {
    tableName: 'recipe_nutrition',
    idField: 'id',
    columns: [
      { name: 'id', label: 'ID', type: 'text', required: true },
      { name: 'recipe_id', label: 'Recipe', type: 'text', foreignKey: {
        table: 'recipes',
        field: 'id',
        displayField: 'title'
      }},
      { name: 'calories', label: 'Calories', type: 'number' },
      { name: 'protein', label: 'Protein (g)', type: 'number' },
      { name: 'carbohydrates', label: 'Carbohydrates (g)', type: 'number' },
      { name: 'fat', label: 'Fat (g)', type: 'number' },
      { name: 'created_at', label: 'Created At', type: 'datetime' },
      { name: 'updated_at', label: 'Updated At', type: 'datetime' }
    ],
    actions: [
      { action: 'edit', label: 'Edit' },
      { action: 'delete', label: 'Delete', confirmMessage: 'Are you sure you want to delete this nutrition info?' }
    ]
  }
};

export default tableConfigurations; 