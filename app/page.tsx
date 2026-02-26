import Link from "next/link";
import AnimatedCounter from "./components/AnimatedCounter";
import InteractiveFeatureCard from "./components/InteractiveFeatureCard";
import FloatingParticles from "./components/FloatingParticles";
import CodePreview from "./components/CodePreview";
import ScrollReveal from "./components/ScrollReveal";

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

const TESTIMONIALS = [
  {
    quote: "NotifyHub reduced our notification infrastructure complexity by 90%. It just works.",
    author: "Sarah Chen",
    role: "CTO at TechFlow",
    avatar: "SC"
  },
  {
    quote: "The retry logic and analytics have been game-changing for our user engagement metrics.",
    author: "Marcus Johnson",
    role: "Engineering Lead at DataSync",
    avatar: "MJ"
  },
  {
    quote: "Migrated from our homegrown solution in a weekend. Best decision we made this year.",
    author: "Priya Patel",
    role: "VP Engineering at CloudBase",
    avatar: "PP"
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-root)] flex flex-col font-[family-name:var(--font-body)]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-[var(--border-default)] bg-[var(--bg-surface)]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-[7px] flex items-center justify-center font-[family-name:var(--font-display)] font-bold text-sm text-white shadow-lg shadow-blue-500/30">
            N
          </div>
          <span className="font-[family-name:var(--font-display)] font-bold text-[1.05rem] text-[var(--text-primary)] tracking-tight">
            NotifyHub
          </span>
        </div>
        <div className="flex gap-2">
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] font-[family-name:var(--font-display)] font-medium text-sm no-underline hover:bg-[var(--bg-hover)] transition-all hover:border-blue-500/30"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center px-5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-[family-name:var(--font-display)] font-semibold text-sm no-underline hover:shadow-lg hover:shadow-blue-500/40 transition-all hover:scale-105"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 md:py-32 relative overflow-hidden">
        {/* Floating Particles */}
        <FloatingParticles />
        
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
        <div className="absolute w-[600px] h-[600px] rounded-full top-[20%] left-1/2 -translate-x-1/2 pointer-events-none bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,transparent_70%)] animate-pulse-slow" />

        <div className="relative z-[1] max-w-[760px]">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-400 font-mono text-[0.72rem] font-medium mb-6 tracking-wide border border-blue-500/20 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping-slow" />
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 absolute" />
            Multi-channel notification engine
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.5rem,5vw,4rem)] font-bold leading-[1.05] tracking-tighter mb-6 text-[var(--text-primary)] animate-fade-in-up">
            Deliver notifications<br />
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500 text-transparent bg-clip-text">
              at any scale
            </span>
          </h1>

          <p className="text-lg leading-relaxed text-[var(--text-secondary)] max-w-[580px] mx-auto mb-10 animate-fade-in-up animation-delay-200">
            Email, SMS, and Push &mdash; unified API, smart routing, retry logic, and
            real-time analytics. Built for reliability.
          </p>

          <div className="flex gap-3 justify-center flex-wrap mb-8 animate-fade-in-up animation-delay-400">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-[family-name:var(--font-display)] font-semibold text-[0.9rem] no-underline hover:shadow-xl hover:shadow-blue-500/50 transition-all hover:scale-105"
            >
              Start for free
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="transition-transform group-hover:translate-x-1">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638l-3.96-4.158a.75.75 0 111.085-1.034l5.25 5.5a.75.75 0 010 1.034l-5.25 5.5a.75.75 0 11-1.085-1.034l3.96-4.158H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center px-7 py-3 rounded-lg border-2 border-[var(--border-default)] text-[var(--text-primary)] font-[family-name:var(--font-display)] font-medium text-[0.9rem] no-underline hover:bg-[var(--bg-hover)] hover:border-blue-500/30 transition-all"
            >
              View Demo
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 text-xs text-[var(--text-muted)] animate-fade-in animation-delay-600">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              No credit card required
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Free forever plan
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="flex justify-center gap-12 px-6 py-10 border-y border-[var(--border-default)] bg-[var(--bg-surface)] flex-wrap">
        {STATS.map((s) => (
          <AnimatedCounter key={s.label} value={s.val} label={s.label} />
        ))}
      </section>

      {/* Code Preview */}
      <ScrollReveal>
        <section className="px-6 py-20 bg-gradient-to-b from-[var(--bg-root)] to-[var(--bg-surface)]">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Simple, Powerful API
            </h2>
            <p className="text-[var(--text-muted)] text-base max-w-2xl mx-auto">
              Send notifications in minutes. One unified API for all channels.
            </p>
          </div>
          <CodePreview />
        </section>
      </ScrollReveal>

      {/* Features */}
      <ScrollReveal>
        <section className="px-6 py-20 max-w-[1100px] mx-auto">
          <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold tracking-tight text-center mb-3">
            Everything you need
          </h2>
          <p className="text-center text-[var(--text-muted)] text-base mb-14">
            A complete notification infrastructure, out of the box
          </p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
            {FEATURES.map((f, i) => (
              <InteractiveFeatureCard
                key={f.title}
                title={f.title}
                desc={f.desc}
                icon={f.icon}
                index={i}
              />
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Testimonials */}
      <ScrollReveal>
        <section className="px-6 py-20 bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg-root)]">
          <div className="max-w-[1100px] mx-auto">
            <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold tracking-tight text-center mb-3">
              Loved by developers
            </h2>
            <p className="text-center text-[var(--text-muted)] text-base mb-14">
              Join thousands of teams using NotifyHub in production
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={i}
                  className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-6 hover:border-blue-500/30 transition-all hover:-translate-y-1 animate-fade-in-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-[var(--text-primary)]">{t.author}</div>
                      <div className="text-xs text-[var(--text-muted)]">{t.role}</div>
                    </div>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* CTA Section */}
      <ScrollReveal>
        <section className="px-6 py-24 max-w-[900px] mx-auto text-center">
          <div className="relative bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-blue-500/10 border border-blue-500/20 rounded-2xl p-12 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
            <div className="relative z-10">
              <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Ready to get started?
              </h2>
              <p className="text-[var(--text-secondary)] text-lg mb-8 max-w-[600px] mx-auto">
                Join thousands of developers shipping notifications at scale. Start free, no credit card required.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-[family-name:var(--font-display)] font-semibold text-base no-underline hover:shadow-xl hover:shadow-blue-500/50 transition-all hover:scale-105"
                >
                  Start Building Free
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638l-3.96-4.158a.75.75 0 111.085-1.034l5.25 5.5a.75.75 0 010 1.034l-5.25 5.5a.75.75 0 11-1.085-1.034l3.96-4.158H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center px-8 py-4 rounded-lg border-2 border-[var(--border-default)] text-[var(--text-primary)] font-[family-name:var(--font-display)] font-medium text-base no-underline hover:bg-[var(--bg-hover)] hover:border-blue-500/30 transition-all"
                >
                  View Documentation
                </Link>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Footer */}
      <footer className="text-center py-10 border-t border-[var(--border-default)] text-sm text-[var(--text-muted)]">
        <div className="mb-4">
          <div className="inline-flex items-center gap-2.5 mb-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center font-[family-name:var(--font-display)] font-bold text-xs text-white">
              N
            </div>
            <span className="font-[family-name:var(--font-display)] font-bold text-base text-[var(--text-primary)]">
              NotifyHub
            </span>
          </div>
        </div>
        <p>Multi-channel notification infrastructure for modern teams</p>
        <p className="mt-2 text-xs">© 2026 NotifyHub. All rights reserved.</p>
      </footer>
    </div>
  );
}
