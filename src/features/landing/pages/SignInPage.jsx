import { Link, useRouter } from '@/features/landing/lib/router'
import AuthShell from '../components/AuthShell'

export default function SignInPage() {
  const router = useRouter()

  return (
    <AuthShell>
      <div className="rounded-xl border border-white/10 bg-[#1e1e20] p-6 shadow-[0_8px_40px_rgba(0,0,0,0.45)] md:p-7">
        <h1 className="text-center text-2xl font-semibold text-white">
          Welcome back
        </h1>
        <p className="mt-2 text-center text-sm text-white/50">
          Sign in to continue.
        </p>

        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="mt-5 w-full rounded-md border border-white/15 bg-[#2a2a2e] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#333338]"
        >
          Continue with Google
        </button>

        <div className="my-4 flex items-center gap-3 text-xs text-white/35">
          <div className="h-px flex-1 bg-white/10" />
          <span>or</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-white/70">
              Email address
            </span>
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full rounded-md border border-white/15 bg-[#2a2a2e] px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan-400/40"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-white/70">
              Password
            </span>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full rounded-md border border-white/15 bg-[#2a2a2e] px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan-400/40"
            />
          </label>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="mt-1 w-full rounded-md bg-[#b0b3ff] px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-[#c4c6ff]"
          >
            Continue
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/45">
          New here?{' '}
          <Link to="/sign-up" className="font-medium text-cyan-300 hover:text-cyan-200">
            Create account
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
