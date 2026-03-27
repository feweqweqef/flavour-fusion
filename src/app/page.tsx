import { createServerSupabaseClient } from '@/lib/supabase-server'
import Navbar from '@/components/Navbar'
import RecipeGrid from '@/components/RecipeGrid'
import Chatbot from '@/components/Chatbot'

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()

  const { data: recipes } = await supabase
    .from('recipes')
    .select(`*, profiles(username)`)
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-800">Discover Recipes</h1>
          <p className="text-gray-500 mt-1">Find your next favourite meal</p>
        </div>
        <RecipeGrid recipes={recipes || []} />
      </div>
      <Chatbot />
    </main>
  )
}