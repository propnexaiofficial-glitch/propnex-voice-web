import Logo from './Logo'

export default function AuthShell({ children }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="px-5 py-5 md:px-8">
        <Logo />
      </header>
      <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-5 pb-12">
        <div className="w-full max-w-[420px]">{children}</div>
      </main>
    </div>
  )
}
