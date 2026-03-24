import { createServerSupabaseClient } from '@/lib/supabase-server'
import Navbar from '@/components/Navbar'
import RecipeGrid from '@/components/RecipeGrid'
import Chatbot from '@/components/Chatbot'

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()

  const { data: recipes, error } = await supabase
    .from('recipes')
    .select(`*, profiles(username)`)
    .order('created_at', { ascending: false })

  console.log('Recipes fetched:', recipes?.length, 'Error:', error)

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Discover Recipes</h1>
          <p className="text-gray-500 mt-1">Find your next favourite meal</p>
        </div>
        <RecipeGrid recipes={recipes || []} />
      </div>
      <Chatbot />
    </main>
  )
}