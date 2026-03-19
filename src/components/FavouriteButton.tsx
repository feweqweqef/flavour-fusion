'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

type Props = {
  recipeId: string
  userId: string
  initialFavourited: boolean
}

export default function FavouriteButton({ recipeId, userId, initialFavourited }: Props) {
  const [favourited, setFavourited] = useState(initialFavourited)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

async function toggleFavourite() {
  setLoading(true)

  if (favourited) {
    const { error } = await supabase
      .from('favourites')
      .delete()
      .eq('user_id', userId)
      .eq('recipe_id', recipeId)
    setFavourited(false)
  } else {
    const { data, error } = await supabase
      .from('favourites')
      .insert({ user_id: userId, recipe_id: recipeId })
      .select()
    setFavourited(true)
  }

  setLoading(false)
}

  return (
    <button
      onClick={toggleFavourite}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
        favourited
          ? 'bg-red-50 text-red-500 hover:bg-red-100'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {favourited ? '❤️ Saved' : '🤍 Save'}
    </button>
  )
}