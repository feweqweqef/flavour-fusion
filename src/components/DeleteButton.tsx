'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function DeleteButton({ recipeId }: { recipeId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    const supabase = createClient()
    setLoading(true)

    await supabase
      .from('recipes')
      .delete()
      .eq('id', recipeId)

    router.push('/')
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Are you sure?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-2 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Deleting...' : 'Yes, delete'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-sm text-gray-400 hover:text-gray-600 px-3 py-2"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-sm text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition"
    >
      🗑️ Delete
    </button>
  )
}