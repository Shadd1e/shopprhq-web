'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Logo from '@/components/Logo'

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal')
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.12 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

// ── Static data ────────────────────────────────────────────────────────────

const stats = [
  { value: '60s',  label: 'to set up'  },
  { value: '<24h', label: 'to go live' },
  { value: '₦0',   label: 'upfront'    },
  { value: '1%',   label: 'per order'  },
]

const steps = [
  {
    n: '01',
    title: 'Create your store',
    body:  'Add your products, set prices, and write descriptions. Your full catalogue is ready in minutes — no dev needed.',
  },
  {
    n: '02',
    title: 'Share your number',
    body:  'Hand out your WhatsApp number. Customers message to browse, add to cart, and check out — all in the chat.',
  },
  {
    n: '03',
    title: 'Manage & get paid',
    body:  'Orders land in your dashboard the moment they\'re placed. Get live alerts on your phone. Confirm, dispatch, done.',
  },
]

const features = [
  {
    title: 'AI-powered ordering',
    body:  'Natural language understanding turns casual messages into structured orders — no confusing menus or commands.',
  },
  {
    title: 'Card & cash payments',
    body:  'Customers pay by card or cash on delivery. Payouts hit your bank account directly.',
  },
  {
    title: 'Real-time order alerts',
    body:  'Every order, confirmation, and low-stock warning goes straight to your operator number on WhatsApp.',
  },
  {
    title: 'Inventory management',
    body:  'Track stock levels in real time. Get automated low-stock warnings before you sell out.',
  },
  {
    title: 'Multi-store support',
    body:  'One merchant account, multiple WhatsApp storefronts. Manage everything from a single dashboard.',
  },
  {
    title: 'Orders dashboard',
    body:  'See every order, its status, and total revenue at a glance. Know what\'s moving and what\'s sitting.',
  },
]

// ── Arrow icon ─────────────────────────────────────────────────────────────

function ArrowRight({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 16 16">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function LandingPage() {
  useReveal()

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ════════════════════════════════════════════
          NAV
      ════════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 bg-bg/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <Logo />

          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <a
              href="#how-it-works"
              className="text-sm font-medium text-ink-3 hover:text-ink transition-colors"
            >
              How it works
            </a>
            <a
              href="#features"
              className="text-sm font-medium text-ink-3 hover:text-ink transition-colors"
            >
              Features
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-ink-2 px-4 py-2 rounded-xl
                hover:bg-border/70 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-ink text-white px-4 py-2.5 rounded-xl
                hover:bg-ink-2 transition-all duration-150 hover:-translate-y-px shadow-sm"
            >
              Create store
            </Link>
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════ */}
      <section className="pt-20 pb-28 px-5 text-center">
        <div className="max-w-3xl mx-auto">

          {/* Headline */}
          <h1 className="font-display font-extrabold text-[clamp(2.6rem,7vw,4.5rem)]
            tracking-tight leading-[1.04] text-ink mb-7">
            Stop losing orders<br />
            <span className="text-wa-dark">to DMs.</span>
          </h1>

          {/* Sub */}
          <p className="text-[1.1rem] sm:text-xl text-ink-3 leading-relaxed
            max-w-[30rem] mx-auto mb-11 font-normal">
            ShopprHQ turns your WhatsApp number into a real storefront.
            Customers browse, cart, and pay — without leaving the chat.
          </p>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2
                bg-wa text-white font-semibold text-base px-7 py-3.5 rounded-2xl
                shadow-wa hover:bg-wa-dark hover:shadow-wa-lg
                transition-all duration-200 hover:-translate-y-0.5"
            >
              Create your free store
              <ArrowRight />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2
                bg-white text-ink-2 font-semibold text-base px-7 py-3.5 rounded-2xl
                border border-border shadow-sm
                hover:border-ink-4 hover:shadow-md
                transition-all duration-200 hover:-translate-y-0.5"
            >
              See how it works
            </a>
          </div>

          {/* Stats strip */}
          <div className="max-w-xl mx-auto mt-16 grid grid-cols-2 sm:grid-cols-4
            bg-border gap-px rounded-2xl overflow-hidden border border-border shadow-md">
            {stats.map((s) => (
              <div key={s.value} className="bg-white px-4 py-5 text-center">
                <p className="font-display font-extrabold text-[1.65rem] tracking-tight text-ink">
                  {s.value}
                </p>
                <p className="text-[11px] text-ink-4 mt-0.5 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-28 px-5 bg-ink">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-16 reveal">
            <p className="text-[11px] font-bold uppercase tracking-[.14em] text-wa mb-4">
              How it works
            </p>
            <h2 className="font-display font-extrabold text-[clamp(2rem,5vw,3.2rem)]
              tracking-tight text-white leading-tight">
              Live in three steps.
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {steps.map((step, i) => (
              <div
                key={step.n}
                className="reveal bg-white/[.05] border border-white/[.09] rounded-3xl p-8
                  hover:bg-white/[.08] transition-colors duration-300"
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <p className="font-display font-extrabold text-[3.5rem] leading-none
                  text-white/[.08] mb-5 tracking-tight select-none">
                  {step.n}
                </p>
                <h3 className="font-display font-bold text-[1.15rem] text-white mb-3 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-sm text-white/50 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FEATURES
      ════════════════════════════════════════════ */}
      <section id="features" className="py-28 px-5 bg-bg">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-16 reveal">
            <p className="text-[11px] font-bold uppercase tracking-[.14em] text-wa mb-4">
              Features
            </p>
            <h2 className="font-display font-extrabold text-[clamp(2rem,5vw,3.2rem)]
              tracking-tight text-ink leading-tight">
              Everything you need.<br className="hidden sm:block" />
              <span className="text-ink-3 font-bold"> Nothing you don't.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="reveal bg-white border border-border rounded-3xl p-7
                  hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300"
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <h3 className="font-display font-bold text-[1.05rem] text-ink mb-2.5 tracking-tight">
                  {f.title}
                </h3>
                <p className="text-sm text-ink-3 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          CTA BAND
      ════════════════════════════════════════════ */}
      <section className="py-28 px-5 bg-wa-dark relative overflow-hidden">
        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none
          bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(37,211,102,.2)_0%,transparent_70%)]" />

        <div className="relative max-w-2xl mx-auto text-center reveal">
          <p className="text-[11px] font-bold uppercase tracking-[.14em] text-wa/70 mb-5">
            Get started
          </p>
          <h2 className="font-display font-extrabold text-[clamp(2rem,5vw,3.2rem)]
            tracking-tight text-white leading-tight mb-5">
            Ready to start<br />taking orders?
          </h2>
          <p className="text-white/60 text-lg mb-10 leading-relaxed">
            Your store is 60 seconds away.
          </p>

          <Link
            href="/register"
            className="inline-flex items-center gap-2.5 bg-white text-wa-dark font-bold
              text-base px-8 py-4 rounded-2xl shadow-xl
              hover:-translate-y-1 hover:shadow-2xl transition-all duration-200"
          >
            Create your free store
            <ArrowRight />
          </Link>
          <p className="mt-5 text-white/35 text-sm">No credit card. No setup fee.</p>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════ */}
      <footer className="bg-ink py-14 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center
            justify-between gap-8 mb-10 pb-10 border-b border-white/10">
            <div>
              <Logo dark />
              <p className="text-sm text-white/35 mt-3 max-w-xs leading-relaxed">
                Turn your WhatsApp number into a real storefront.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm text-white/40">
              <a href="#how-it-works" className="hover:text-white/70 transition-colors">How it works</a>
              <a href="#features"     className="hover:text-white/70 transition-colors">Features</a>
              <Link href="/register"  className="hover:text-white/70 transition-colors">Create store</Link>
              <Link href="/dashboard" className="hover:text-white/70 transition-colors">Sign in</Link>
              <a
                href="mailto:hello@shopprhq.com"
                className="hover:text-white/70 transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/25">© 2025 ShopprHQ</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
