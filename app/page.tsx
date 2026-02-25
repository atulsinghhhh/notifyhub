import Link from "next/link";

const FEATURES = [
  {
    title: "Multi-Channel",
    desc: "Email, SMS, and Push notifications through a single unified API endpoint.",
    icon: "M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z",
  },
  {
    title: "Smart Retry",
    desc: "Automatic exponential backoff with dead-letter queues for failed deliveries.",
    icon: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 14.652",
  },
  {
    title: "Templates",
    desc: "Create reusable message templates with dynamic variable interpolation.",
    icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
  },
  {
    title: "Analytics",
    desc: "Real-time delivery tracking, channel breakdowns, and timeline visualization.",
    icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
  },
  {
    title: "Multi-Tenant",
    desc: "Isolated tenants with their own API keys, rate limits, and webhook callbacks.",
    icon: "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z",
  },
  {
    title: "Circuit Breaker",
    desc: "Provider health monitoring with automatic failover to backup providers.",
    icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  },
];

const STATS = [
  { val: "99.9%", label: "Uptime SLA" },
  { val: "<50ms", label: "API Latency" },
  { val: "10M+", label: "Messages/day" },
  { val: "3", label: "Channels" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-root)] flex flex-col font-[family-name:var(--font-body)]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-[var(--border-default)] bg-[var(--bg-surface)] sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-500 rounded-[7px] flex items-center justify-center font-[family-name:var(--font-display)] font-bold text-sm text-white">
            N
          </div>
          <span className="font-[family-name:var(--font-display)] font-bold text-[1.05rem] text-[var(--text-primary)] tracking-tight">
            NotifyHub
          </span>
        </div>
        <div className="flex gap-2">
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] font-[family-name:var(--font-display)] font-medium text-sm no-underline hover:bg-[var(--bg-hover)] transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center px-5 py-2 rounded-lg bg-blue-500 text-white font-[family-name:var(--font-display)] font-semibold text-sm no-underline hover:bg-blue-600 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 relative overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        {/* Glow */}
        <div className="absolute w-[500px] h-[500px] rounded-full top-[20%] left-1/2 -translate-x-1/2 pointer-events-none bg-[radial-gradient(circle,rgba(59,130,246,0.12)_0%,transparent_70%)]" />

        <div className="relative z-[1] max-w-[720px]">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-mono text-[0.72rem] font-medium mb-6 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Multi-channel notification engine
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.5rem,5vw,3.75rem)] font-bold leading-[1.1] tracking-tighter mb-5 text-[var(--text-primary)]">
            Deliver notifications<br />
            at any scale
          </h1>

          <p className="text-lg leading-relaxed text-[var(--text-secondary)] max-w-[540px] mx-auto mb-10">
            Email, SMS, and Push &mdash; unified API, smart routing, retry logic, and
            real-time analytics. Built for reliability.
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-blue-500 text-white font-[family-name:var(--font-display)] font-semibold text-[0.9rem] no-underline hover:bg-blue-600 transition-colors"
            >
              Start for free
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638l-3.96-4.158a.75.75 0 111.085-1.034l5.25 5.5a.75.75 0 010 1.034l-5.25 5.5a.75.75 0 11-1.085-1.034l3.96-4.158H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center px-7 py-3 rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] font-[family-name:var(--font-display)] font-medium text-[0.9rem] no-underline hover:bg-[var(--bg-hover)] transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="flex justify-center gap-12 px-6 py-8 border-y border-[var(--border-default)] bg-[var(--bg-surface)] flex-wrap">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <div className="font-mono text-2xl font-medium text-blue-500 leading-none">
              {s.val}
            </div>
            <div className="text-[0.7rem] uppercase tracking-widest text-[var(--text-muted)] mt-1">
              {s.label}
            </div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-[960px] mx-auto">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-center mb-2">
          Everything you need
        </h2>
        <p className="text-center text-[var(--text-muted)] text-sm mb-12">
          A complete notification infrastructure, out of the box
        </p>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-6"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-500 mb-3 opacity-80"
              >
                <path d={f.icon} />
              </svg>
              <h3 className="font-[family-name:var(--font-display)] text-[0.95rem] font-semibold mb-1">
                {f.title}
              </h3>
              <p className="text-[0.82rem] text-[var(--text-muted)] leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 border-t border-[var(--border-default)] text-xs text-[var(--text-muted)]">
        NotifyHub &mdash; Multi-channel notification infrastructure
      </footer>
    </div>
  );
}
