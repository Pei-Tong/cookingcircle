'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import EditModal from './EditModal';
import AddModal from './AddModal';

interface Column {
  name: string;
  label: string;
  type: string;
  options?: string[];
  required?: boolean;
}

interface DynamicTableProps {
  tableName: string;
  columns: Column[];
  items: any[];
  onRefresh: () => void;
  actions?: {
    edit?: boolean;
    delete?: boolean;
    confirmDelete?: boolean;
  };
}

export default function DynamicTable({ tableName, columns, items, onRefresh, actions = { edit: true, delete: true, confirmDelete: true } }: DynamicTableProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const handleDelete = async (id: string) => {
    if (actions.confirmDelete && !confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      onRefresh();
    } catch (error) {
      console.error(`Error deleting ${tableName}:`, error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      alert(`Failed to delete ${tableName}: ${message}`);
    }
  };

  const handleEdit = (id: string) => {
    setSelectedItemId(id);
    setEditModalOpen(true);
  };

  const handleAdd = () => {
    setAddModalOpen(true);
  };

  const handleSave = async () => {
    onRefresh();
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{tableName}</h2>
        <button
          onClick={handleAdd}
          className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Add New
        </button>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(column => (
              <th
                key={column.name}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
            {(actions.edit || actions.delete) && (
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item, index) => (
            <tr key={item.id || index}>
              {columns.map(column => (
                <td key={column.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {Array.isArray(item[column.name])
                    ? item[column.name].join(', ')
                    : item[column.name]?.toString() || ''}
                </td>
              ))}
              {(actions.edit || actions.delete) && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {actions.edit && (
                    <button
                      onClick={() => handleEdit(item.id)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                  )}
                  {actions.delete && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {selectedItemId && (
        <EditModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSave={handleSave}
          tableName={tableName}
          itemId={selectedItemId}
          columns={columns}
        />
      )}

      <AddModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={onRefresh}
        tableName={tableName}
        columns={columns}
      />
    </div>
  );
} 