'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Recommendation = {
  id: string
  title: string
  score: number
}

export default function RecipeRecommendations({ recipeId }: { recipeId: string }) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipe_id: recipeId })
    })
      .then(r => r.json())
      .then(data => setRecommendations(data.recommendations || []))
      .catch(() => setRecommendations([]))
      .finally(() => setLoading(false))
  }, [recipeId])

  if (loading) return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-gray-800 mb-4">You might also like</h2>
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )

  if (recommendations.length === 0) return null

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-gray-800 mb-4">You might also like</h2>
      <div className="grid grid-cols-2 gap-4">
        {recommendations.map(rec => (
          <Link key={rec.id} href={`/recipe/${rec.id}`}
            className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100">
            <p className="font-medium text-gray-800">{rec.title}</p>
            <p className="text-xs text-orange-400 mt-1 font-medium">
              {Math.round(rec.score * 100)}% match
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}