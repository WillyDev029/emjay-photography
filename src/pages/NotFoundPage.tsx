import { Link } from 'react-router-dom'
import { Seo } from '@/components/ui/Seo'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-950 px-6 text-center">
      <Seo title="Page Not Found" path="/404" />
      <p className="font-display text-8xl text-gold-500">404</p>
      <h1 className="mt-4 font-display text-3xl text-white">
        This moment wasn’t captured
      </h1>
      <p className="mt-3 max-w-md text-ink-400">
        The page you’re looking for doesn’t exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-8 rounded-full bg-white px-8 py-3.5 text-sm font-medium uppercase tracking-wide text-ink-900 transition hover:bg-ivory-100"
      >
        Back to homepage
      </Link>
    </div>
  )
}