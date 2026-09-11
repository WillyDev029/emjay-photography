import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { isSupabaseConfigured, DEMO_ADMIN_EMAIL } from '@/config/env'
import { Field, Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Seo } from '@/components/ui/Seo'

export function AdminLoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/admin'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setError(null)
    setSubmitting(true)
    try {
      await signIn(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-950 px-4">
      <Seo title="Admin Login" path="/admin/login" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(192,160,95,0.12),transparent_55%)]" />

      <Link
        to="/"
        className="mb-8 flex items-center gap-2 text-sm text-ink-400 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to website
      </Link>

      <div className="relative w-full max-w-md rounded-2xl border border-ink-800 bg-ink-900 p-8 shadow-pop">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold-600/15 text-gold-400">
            <Lock className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-display text-2xl text-white">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-ink-400">Sign in to manage your website</p>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
          <Field label="Email" required>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="username"
              className="bg-ink-950 border-ink-700 text-white placeholder:text-ink-500"
            />
          </Field>
          <Field label="Password" required>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="bg-ink-950 border-ink-700 text-white placeholder:text-ink-500"
            />
          </Field>

          {error && (
            <div
              className="rounded-lg border border-red-700 bg-red-950/60 px-4 py-3 text-sm text-red-400"
              role="alert"
            >
              {error}
            </div>
          )}

          <Button type="submit" loading={submitting} fullWidth size="lg">
            Sign In
          </Button>
        </form>

        {!isSupabaseConfigured && (
          <div className="mt-6 rounded-lg border border-gold-700/40 bg-gold-600/10 px-4 py-3 text-xs leading-relaxed text-gold-200">
            <p className="font-medium uppercase tracking-wider text-gold-300">
              Demo mode
            </p>
            <p className="mt-1">
              Connect Supabase in <code className="text-gold-200">.env</code> to enable real
              admin accounts. Until then, use the demo credentials below.
            </p>
            <p className="mt-2 font-mono">
              {DEMO_ADMIN_EMAIL} · demo1234
            </p>
          </div>
        )}
      </div>
    </div>
  )
}