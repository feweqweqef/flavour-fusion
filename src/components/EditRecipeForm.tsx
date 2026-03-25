'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Recipe = {
  id: string
  title: string
  description: string
  ingredients: string[]
  instructions: string[]
  cuisine: string
  category: string
  cooking_time: number
  image_url: string
}

export default function EditRecipeForm({ recipe }: { recipe: Recipe }) {
  const [title, setTitle] = useState(recipe.title || '')
  const [description, setDescription] = useState(recipe.description || '')
  const [ingredients, setIngredients] = useState<string[]>(recipe.ingredients || [''])
  const [instructions, setInstructions] = useState<string[]>(recipe.instructions || [''])
  const [cuisine, setCuisine] = useState(recipe.cuisine || '')
  const [category, setCategory] = useState(recipe.category || '')
  const [cookingTime, setCookingTime] = useState(recipe.cooking_time?.toString() || '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function addIngredient() { setIngredients([...ingredients, '']) }
  function updateIngredient(index: number, value: string) {
    const updated = [...ingredients]; updated[index] = value; setIngredients(updated)
  }
  function removeIngredient(index: number) {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }
  function addInstruction() { setInstructions([...instructions, '']) }
  function updateInstruction(index: number, value: string) {
    const updated = [...instructions]; updated[index] = value; setInstructions(updated)
  }
  function removeInstruction(index: number) {
    setInstructions(instructions.filter((_, i) => i !== index))
  }

  async function handleSave() {
    const supabase = createClient()
    setLoading(true)
    setError(null)

    if (!title || !category) {
      setError('Title and category are required')
      setLoading(false)
      return
    }

    const cleanIngredients = ingredients.filter(i => i.trim() !== '')
    const cleanInstructions = instructions.filter(i => i.trim() !== '')

    if (cleanIngredients.length === 0 || cleanInstructions.length === 0) {
      setError('Please add at least one ingredient and one instruction')
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase
      .from('recipes')
      .update({
        title,
        description,
        ingredients: cleanIngredients,
        instructions: cleanInstructions,
        cuisine,
        category,
        cooking_time: cookingTime ? parseInt(cookingTime) : null,
      })
      .eq('id', recipe.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    router.push(`/recipe/${recipe.id}`)
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Edit Recipe</h1>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Recipe Title *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="e.g. Spicy Thai Noodles" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="A short description..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400">
              <option value="">Select...</option>
              <option>Chicken</option>
              <option>Beef</option>
              <option>Seafood</option>
              <option>Vegetarian</option>
              <option>Pasta</option>
              <option>Salad</option>
              <option>Rice</option>
              <option>Dessert</option>
              <option>Soup</option>
              <option>Snack</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine</label>
            <input type="text" value={cuisine} onChange={e => setCuisine(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="e.g. Italian, Thai..." />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cooking Time (minutes)</label>
          <input type="number" value={cookingTime} onChange={e => setCookingTime(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="e.g. 30" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients *</label>
          <div className="space-y-2">
            {ingredients.map((ing, index) => (
              <div key={index} className="flex gap-2">
                <input type="text" value={ing} onChange={e => updateIngredient(index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder={`Ingredient ${index + 1}`} />
                {ingredients.length > 1 && (
                  <button onClick={() => removeIngredient(index)} className="text-red-400 hover:text-red-600 px-2">✕</button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addIngredient} className="mt-2 text-sm text-orange-500 hover:text-orange-600 font-medium">
            + Add ingredient
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Instructions *</label>
          <div className="space-y-2">
            {instructions.map((inst, index) => (
              <div key={index} className="flex gap-2">
                <span className="text-sm text-gray-400 mt-2 w-6 shrink-0">{index + 1}.</span>
                <textarea value={inst} onChange={e => updateInstruction(index, e.target.value)} rows={2}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder={`Step ${index + 1}`} />
                {instructions.length > 1 && (
                  <button onClick={() => removeInstruction(index)} className="text-red-400 hover:text-red-600 px-2">✕</button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addInstruction} className="mt-2 text-sm text-orange-500 hover:text-orange-600 font-medium">
            + Add step
          </button>
        </div>

        <div className="flex gap-3">
          <button onClick={handleSave} disabled={loading}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg transition disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}