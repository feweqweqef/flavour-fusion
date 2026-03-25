'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    // Get initial user
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    // Listen for auth changes (login, logout, Google redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold text-orange-500">
        Flavour Fusion
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link href="/recipe/new"
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
              + Post Recipe
            </Link>
            <Link href="/profile"
              className="text-sm text-gray-600 hover:text-orange-500 transition">
              My Profile
            </Link>
            <button onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-red-500 transition">
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/login"
              className="text-sm text-gray-600 hover:text-orange-500 transition">
              Log in
            </Link>
            <Link href="/auth/signup"
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}