'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function ForgotPasswordForm() {
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="text-center space-y-3">
        <div className="text-4xl">📬</div>
        <p className="font-semibold text-gray-900">Check your inbox</p>
        <p className="text-sm text-gray-500">
          We sent a reset link to <strong>{email}</strong>. Click it to choose a new password.
        </p>
        <Link href="/login" className="text-sm text-green-600 hover:underline font-medium block mt-4">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-gray-500">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <Button type="submit" loading={loading} size="lg" className="w-full">
        Send reset link
      </Button>
      <p className="text-sm text-center text-gray-500">
        <Link href="/login" className="text-green-600 hover:underline font-medium">
          Back to sign in
        </Link>
      </p>
    </form>
  )
}
