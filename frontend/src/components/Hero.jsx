export default function Hero({ onStartChat }) {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950/40 via-transparent to-transparent" />

      <div className="relative max-w-4xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/50 px-4 py-1.5 text-xs text-zinc-400">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          AI-powered consulting, now in preview
        </div>

        <h1 className="bg-gradient-to-b from-zinc-100 to-zinc-400 bg-clip-text text-5xl font-bold leading-tight tracking-tight text-transparent sm:text-6xl md:text-7xl">
          Your AI Consulting
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Copilot
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
          Empower your consulting practice with an intelligent copilot that
          helps you research, analyze, and deliver insights faster than ever.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={onStartChat}
            className="w-full rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-medium transition-all hover:bg-indigo-500 sm:w-auto"
          >
            Start Free Trial
          </button>
          <button className="w-full rounded-xl border border-zinc-700 px-8 py-3.5 text-sm font-medium transition-all hover:bg-zinc-800 sm:w-auto">
            Watch Demo
          </button>
        </div>
      </div>

      <div className="absolute bottom-10 flex animate-bounce flex-col items-center gap-1 text-zinc-600">
        <span className="text-xs">Scroll</span>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
