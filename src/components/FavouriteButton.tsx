'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

type Collection = { id: string; name: string }

type Props = {
  recipeId: string
  userId: string
  initialFavourited: boolean
  collections: Collection[]
  initialCollectionId: string | null
}

export default function FavouriteButton({ recipeId, userId, initialFavourited, collections, initialCollectionId }: Props) {
  const [favourited, setFavourited] = useState(initialFavourited)
  const [loading, setLoading] = useState(false)
  const [showCollections, setShowCollections] = useState(false)
  const [collectionId, setCollectionId] = useState<string | null>(initialCollectionId)
  const supabase = createClient()

  async function saveToCollection(selectedCollectionId: string | null) {
    setLoading(true)

    if (favourited) {
      // Update existing favourite with new collection
      await supabase
        .from('favourites')
        .update({ collection_id: selectedCollectionId })
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)
    } else {
      // Insert new favourite
      await supabase
        .from('favourites')
        .insert({ user_id: userId, recipe_id: recipeId, collection_id: selectedCollectionId })
    }

    setCollectionId(selectedCollectionId)
    setFavourited(true)
    setShowCollections(false)
    setLoading(false)
  }

  async function removeFavourite() {
    setLoading(true)
    await supabase
      .from('favourites')
      .delete()
      .eq('user_id', userId)
      .eq('recipe_id', recipeId)
    setFavourited(false)
    setCollectionId(null)
    setShowCollections(false)
    setLoading(false)
  }

  const savedCollection = collections.find(c => c.id === collectionId)

  return (
    <div className="relative">
      <div className="flex gap-2">
        <button
          onClick={() => setShowCollections(!showCollections)}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            favourited
              ? 'bg-red-50 text-red-500 hover:bg-red-100'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {favourited ? '❤️' : '🤍'}
          {favourited ? (savedCollection ? `Saved to ${savedCollection.name}` : 'Saved') : 'Save'}
        </button>

        {favourited && (
          <button
            onClick={removeFavourite}
            disabled={loading}
            className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
          >
            ✕
          </button>
        )}
      </div>

      {/* Collection picker dropdown */}
      {showCollections && (
        <div className="absolute right-0 top-12 bg-white rounded-xl shadow-lg border border-gray-100 p-2 z-10 min-w-48">
          <p className="text-xs text-gray-400 px-2 py-1 font-medium">Save to...</p>

          <button
            onClick={() => saveToCollection(null)}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            ❤️ Save to favourites
          </button>

          {collections.length > 0 && (
            <>
              <div className="border-t border-gray-100 my-1" />
              {collections.map(col => (
                <button
                  key={col.id}
                  onClick={() => saveToCollection(col.id)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  📁 {col.name}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}