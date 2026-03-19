'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import RecipeCard from './RecipeCard'
import Link from 'next/link'

type Profile = { id: string; username: string; avatar_url: string | null }
type Recipe = { id: string; title: string; description: string; image_url: string; cuisine: string; category: string; cooking_time: number; profiles: { username: string } }
type Collection = { id: string; name: string }
type Favourite = { id: string; collection_id: string | null; recipes: Recipe }

type Props = {
  profile: Profile
  recipes: Recipe[]
  favourites: Favourite[]
  collections: Collection[]
  userId: string
}

export default function ProfileClient({ profile, recipes, favourites, collections, userId }: Props) {
  const [activeTab, setActiveTab] = useState<'recipes' | 'favourites' | 'collections'>('recipes')
  const [newCollectionName, setNewCollectionName] = useState('')
  const [showNewCollection, setShowNewCollection] = useState(false)
  const [localCollections, setLocalCollections] = useState(collections)
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const supabase = createClient()

  async function createCollection() {
    if (!newCollectionName.trim()) return

    const { data } = await supabase
      .from('collections')
      .insert({ user_id: userId, name: newCollectionName.trim() })
      .select()
      .single()

    if (data) {
      setLocalCollections([...localCollections, data])
      setNewCollectionName('')
      setShowNewCollection(false)
    }
  }

  async function deleteCollection(id: string) {
    await supabase.from('collections').delete().eq('id', id)
    setLocalCollections(localCollections.filter(c => c.id !== id))
    if (selectedCollection === id) setSelectedCollection(null)
  }

  const favouritesInCollection = selectedCollection
    ? favourites.filter(f => f.collection_id === selectedCollection)
    : favourites

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Profile header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-2xl font-bold text-orange-500">
          {profile?.username?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">@{profile?.username}</h1>
          <p className="text-sm text-gray-400">
            {recipes.length} recipes · {favourites.length} favourites
          </p>
        </div>
        <Link href="/recipe/new"
          className="ml-auto bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          + Post Recipe
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        {(['recipes', 'favourites', 'collections'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium capitalize transition border-b-2 ${
              activeTab === tab
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* My Recipes tab */}
      {activeTab === 'recipes' && (
        <div>
          {recipes.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg mb-2">No recipes yet</p>
              <Link href="/recipe/new" className="text-orange-500 hover:underline text-sm">Post your first recipe</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={{ ...recipe, profiles: { username: profile.username } }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Favourites tab */}
      {activeTab === 'favourites' && (
        <div>
          {favourites.length === 0 ? (
            <p className="text-center py-12 text-gray-400">No favourites yet — save recipes by clicking the heart button!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favouritesInCollection.map(fav => (
                <RecipeCard key={fav.id} recipe={fav.recipes} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Collections tab */}
      {activeTab === 'collections' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">My Collections</h2>
            <button onClick={() => setShowNewCollection(true)}
              className="text-sm text-orange-500 hover:text-orange-600 font-medium">
              + New Collection
            </button>
          </div>

          {showNewCollection && (
            <div className="bg-white rounded-xl p-4 shadow-sm mb-4 flex gap-2">
              <input
                type="text"
                value={newCollectionName}
                onChange={e => setNewCollectionName(e.target.value)}
                placeholder="Collection name..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                onKeyDown={e => e.key === 'Enter' && createCollection()}
              />
              <button onClick={createCollection}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600">
                Create
              </button>
              <button onClick={() => setShowNewCollection(false)}
                className="text-gray-400 hover:text-gray-600 px-2">
                ✕
              </button>
            </div>
          )}

          {localCollections.length === 0 ? (
            <p className="text-center py-12 text-gray-400">No collections yet — create one to organise your favourites!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {localCollections.map(collection => {
                const count = favourites.filter(f => f.collection_id === collection.id).length
                return (
                  <div key={collection.id}
                    onClick={() => { setSelectedCollection(collection.id); setActiveTab('favourites') }}
                    className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800">{collection.name}</h3>
                        <p className="text-xs text-gray-400 mt-1">{count} recipe{count !== 1 ? 's' : ''}</p>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); deleteCollection(collection.id) }}
                        className="text-gray-300 hover:text-red-400 transition text-lg">
                        ✕
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}