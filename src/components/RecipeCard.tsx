import Link from 'next/link'

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

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link href={`/recipe/${recipe.id}`}>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer">
        {recipe.image_url ? (
          <img src={recipe.image_url} alt={recipe.title} className="w-full h-48 object-cover" />
        ) : (
          <div className="w-full h-48 bg-orange-50 flex items-center justify-center text-4xl">🍽️</div>
        )}
        <div className="p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-orange-500 font-medium uppercase tracking-wide">
              {recipe.category || recipe.cuisine}
            </span>
            {recipe.cooking_time && (
              <span className="text-xs text-gray-400">⏱ {recipe.cooking_time} min</span>
            )}
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">{recipe.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-2">{recipe.description}</p>
          <p className="text-xs text-gray-400 mt-2">by {recipe.profiles?.username}</p>
        </div>
      </div>
    </Link>
  )
}