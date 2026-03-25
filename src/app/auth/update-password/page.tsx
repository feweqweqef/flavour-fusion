'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    // Exchange the code in the URL for a session
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true)
      } else {
        // Try exchanging code from URL
        const code = new URLSearchParams(window.location.search).get('code')
        if (code) {
          supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
            if (error) {
              setError('Invalid or expired reset link. Please request a new one.')
            } else {
              setReady(true)
            }
          })
        } else {
          setError('Invalid reset link. Please request a new one.')
        }
      }
    })
  }, [])

  async function handleUpdate() {
    const supabase = createClient()
    setLoading(true)
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter')
      setLoading(false)
      return
    }

    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">Set new password</h1>
        <p className="text-sm text-gray-500 mb-6">Choose a strong new password</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {!ready && !error && (
          <p className="text-sm text-gray-400 text-center py-4">Verifying reset link...</p>
        )}

        {ready && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-400 mt-1">Min 8 characters, one uppercase, one number</p>
            </div>
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update password'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}