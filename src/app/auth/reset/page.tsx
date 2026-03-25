'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPage() {
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [step, setStep] = useState<'email' | 'token'>('email')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSendEmail() {
    const supabase = createClient()
    setLoading(true)
    setError(null)

    if (!email) {
      setError('Please enter your email')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setStep('token')
    setLoading(false)
  }

  async function handleVerifyToken() {
    const supabase = createClient()
    setLoading(true)
    setError(null)

    if (!token || token.length < 8) {
      setError('Please enter the 8-digit code from your email')
      setLoading(false)
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError('Password must contain at least one uppercase letter')
      setLoading(false)
      return
    }

    if (!/[0-9]/.test(newPassword)) {
      setError('Password must contain at least one number')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'recovery'
    })

    if (error) {
      setError('Invalid or expired code. Please try again.')
      setLoading(false)
      return
    }

    // Now update the password
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">

        {step === 'email' && (
          <>
            <h1 className="text-2xl font-bold mb-2 text-gray-800">Reset password</h1>
            <p className="text-sm text-gray-500 mb-6">Enter your email and we'll send you a reset code</p>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="you@example.com" />
              </div>
              <button onClick={handleSendEmail} disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded-lg transition disabled:opacity-50">
                {loading ? 'Sending...' : 'Send reset code'}
              </button>
            </div>
          </>
        )}

        {step === 'token' && (
          <>
            <h1 className="text-2xl font-bold mb-2 text-gray-800">Check your email</h1>
            <p className="text-sm text-gray-500 mb-6">
              We sent a 8-digit code to <strong>{email}</strong>. Enter it below along with your new password.
            </p>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">6-digit code</label>
                <input type="text" value={token} onChange={e => setToken(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="12345678" maxLength={8} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="••••••••" />
                <p className="text-xs text-gray-400 mt-1">Min 8 characters, one uppercase, one number</p>
              </div>
              <button onClick={handleVerifyToken} disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded-lg transition disabled:opacity-50">
                {loading ? 'Updating...' : 'Reset password'}
              </button>
              <button onClick={() => setStep('email')} className="w-full text-sm text-gray-400 hover:text-gray-600">
                ← Use a different email
              </button>
            </div>
          </>
        )}

        <p className="text-sm text-gray-500 mt-4 text-center">
          <Link href="/auth/login" className="text-orange-500 hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  )
}