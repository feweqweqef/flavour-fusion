'use client'

import { useState, useMemo } from 'react'
import RecipeCard from './RecipeCard'

const CATEGORIES = ['All', 'Chicken', 'Beef', 'Seafood', 'Vegetarian', 'Pasta', 'Salad', 'Rice', 'Dessert', 'Soup', 'Snack']

type Recipe = {
  id: string
  title: string
  description: string
  image_url: string
  cuisine: string
  category: string
  cooking_time: number
  profiles: { username: string }
}

export default function RecipeGrid({ recipes }: { recipes: Recipe[] }) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = useMemo(() => {
    return recipes.filter(r => {
      const matchesSearch = !search ||
        r.title?.toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase()) ||
        r.category?.toLowerCase().includes(search.toLowerCase()) ||
        r.cuisine?.toLowerCase().includes(search.toLowerCase())
      const matchesCategory =
        activeCategory === 'All' || r.category === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [recipes, search, activeCategory])

  return (
    <div>
      <input
        type="text"
        placeholder="Search recipes..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
      />

      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              activeCategory === cat
                ? 'bg-orange-500 text-white'
                : 'bg-white border border-gray-300 text-gray-600 hover:border-orange-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-400 text-center py-12">No recipes found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  )
}