"use client"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { useState } from "react"

export const ShoppingList = ({ id }: { id: string }) => {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    const supabase = createServerComponentClient({ cookies })
    await supabase.from("shopping_list").delete().eq("id", id)
    setLoading(false)
    window.location.reload()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  )
}

