import { createServerSupabaseClient } from '@/lib/supabase-server'
import Navbar from '@/components/Navbar'
import { notFound } from 'next/navigation'
import FavouriteButton from '@/components/FavouriteButton'

type Props = {
  params: Promise<{ id: string }>
}

export default async function RecipePage({ params }: Props) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: recipe } = await supabase
    .from('recipes')
    .select(`*, profiles(username)`)
    .eq('id', id)
    .single()

  if (!recipe) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: favourite } = user ? await supabase
    .from('favourites')
    .select('id')
    .eq('user_id', user.id)
    .eq('recipe_id', id)
    .single() : { data: null }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Image */}
        {recipe.image_url ? (
          <img src={recipe.image_url} alt={recipe.title}
            className="w-full h-72 object-cover rounded-xl mb-6" />
        ) : (
          <div className="w-full h-72 bg-orange-50 rounded-xl mb-6 flex items-center justify-center text-6xl">🍽️</div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-orange-500 font-medium uppercase tracking-wide">
                {recipe.category}
              </span>
              {recipe.cuisine && (
                <span className="text-xs text-gray-400">· {recipe.cuisine}</span>
              )}
              {recipe.cooking_time && (
                <span className="text-xs text-gray-400">· ⏱ {recipe.cooking_time} min</span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-800">{recipe.title}</h1>
            <p className="text-sm text-gray-400 mt-1">by {recipe.profiles?.username}</p>
          </div>
          {user && (
            <FavouriteButton
              recipeId={id}
              userId={user.id}
              initialFavourited={!!favourite}
            />
          )}
        </div>

        {/* Description */}
        {recipe.description && (
          <p className="text-gray-600 mb-8">{recipe.description}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Ingredients */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Ingredients</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ing: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-orange-400 mt-0.5">•</span>
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Instructions</h2>
            <ol className="space-y-3">
              {recipe.instructions.map((step: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </main>
  )
}