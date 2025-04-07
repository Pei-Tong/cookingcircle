'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  tableName: string;
  itemId: string | null;
  columns: {
    name: string;
    label: string;
    type: string;
    options?: string[];
    required?: boolean;
  }[];
}

export default function EditModal({ isOpen, onClose, onSave, tableName, itemId, columns }: EditModalProps) {
  const [formData, setFormData] = useState<Record<string, string | number | string[]>>({});
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (isOpen && itemId) {
      fetchItem();
    }
  }, [isOpen, itemId]);

  const fetchItem = async () => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', itemId)
        .single();

      if (error) throw error;
      if (data) {
        setFormData(data);
      }
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      alert(`Failed to fetch ${tableName}: ${message}`);
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number | string[];

    if (type === 'number') {
      processedValue = value ? parseInt(value) : 0;
    } else if (name === 'tags') {
      processedValue = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    } else {
      processedValue = value;
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from(tableName)
        .update(formData)
        .eq('id', itemId);

      if (error) throw error;

      onSave();
      onClose();
    } catch (error) {
      console.error(`Error updating ${tableName}:`, error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      alert(`Failed to update ${tableName}: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-3xl mx-4 overflow-hidden">
        <div className="p-4 bg-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-medium">Edit {tableName.slice(0, -1)}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          {columns.map(column => (
            <div key={column.name} className="mb-4">
              <label htmlFor={column.name} className="block text-sm font-medium text-gray-700 mb-1">
                {column.label}
              </label>
              {column.type === 'select' ? (
                <select
                  id={column.name}
                  name={column.name}
                  value={formData[column.name]?.toString() || ''}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 p-2"
                  required={column.required}
                >
                  <option value="">Select {column.label}</option>
                  {column.options?.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : column.type === 'textarea' ? (
                <textarea
                  id={column.name}
                  name={column.name}
                  value={formData[column.name]?.toString() || ''}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 p-2"
                  required={column.required}
                />
              ) : (
                <input
                  type={column.type}
                  id={column.name}
                  name={column.name}
                  value={formData[column.name]?.toString() || ''}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 p-2"
                  required={column.required}
                />
              )}
            </div>
          ))}
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 