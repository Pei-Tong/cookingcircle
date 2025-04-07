"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/db/client'

export default function DebugPage() {
  const [schema, setSchema] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSchema() {
      try {
        // Fetch users table info
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .limit(1)

        // Fetch recipes table info
        const { data: recipesData, error: recipesError } = await supabase
          .from('recipes')
          .select('*')
          .limit(1)

        // Fetch user_follows table info with structure check
        const { data: followsData, error: followsError } = await supabase
          .from('user_follows')
          .select('*')
          .limit(1)

        // Check if tables exist
        const { data: tablesData, error: tablesError } = await supabase
          .rpc('get_tables')
          .select('*')

        setSchema({
          users: {
            exists: !usersError,
            error: usersError?.message,
            columns: usersData ? Object.keys(usersData[0] || {}) : [],
            sample: usersData?.[0]
          },
          recipes: {
            exists: !recipesError,
            error: recipesError?.message,
            columns: recipesData ? Object.keys(recipesData[0] || {}) : [],
            sample: recipesData?.[0]
          },
          user_follows: {
            exists: !followsError,
            error: followsError?.message,
            columns: followsData ? Object.keys(followsData[0] || {}) : [],
            sample: followsData?.[0]
          },
          tables: tablesData || tablesError?.message
        })
      } catch (err: any) {
        setError(err.message)
      }
    }

    fetchSchema()
  }, [])

  if (error) return <div>Error: {error}</div>
  if (!schema) return <div>Loading...</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Database Schema</h1>
      {Object.entries(schema).map(([table, info]: [string, any]) => (
        <div key={table} className="mb-8">
          <h2 className="text-xl font-semibold mb-2">{table}</h2>
          <div className="space-y-2">
            <div>
              <strong>Status: </strong>
              <span className={info.exists ? "text-green-600" : "text-red-600"}>
                {info.exists ? "Exists" : "Error"}
              </span>
            </div>
            {info.error && (
              <div className="text-red-600">
                <strong>Error: </strong>
                {info.error}
              </div>
            )}
            {info.columns && (
              <div>
                <strong>Columns: </strong>
                <pre className="bg-gray-100 p-2 rounded mt-1">
                  {JSON.stringify(info.columns, null, 2)}
                </pre>
              </div>
            )}
            {info.sample && (
              <div>
                <strong>Sample Data: </strong>
                <pre className="bg-gray-100 p-2 rounded mt-1">
                  {JSON.stringify(info.sample, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
} 