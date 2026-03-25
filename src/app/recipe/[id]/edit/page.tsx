import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import EditRecipeForm from '@/components/EditRecipeForm'
import Navbar from '@/components/Navbar'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditRecipePage({ params }: Props) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: recipe } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single()

  if (!recipe) notFound()

  // only the owner can edit
  if (recipe.user_id !== user.id) redirect('/')

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <EditRecipeForm recipe={recipe} />
    </main>
  )
}