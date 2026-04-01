'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { merchantLogin, getMerchantProfile, resendVerification, type MerchantProfile } from '@/lib/api'
import { cn } from '@/lib/utils'

// ── Shared input style ─────────────────────────────────────────────────────

const INPUT = cn(
  'w-full px-3.5 py-2.5 rounded-[13px]',
  'bg-bg border-[1.5px] border-border',
  'text-sm font-sans text-ink placeholder:text-ink-4/50',
  'outline-none transition-all',
  'focus:border-wa focus:bg-white focus:ring-2 focus:ring-wa/10',
)

// ══════════════════════════════════════════════════════════════════════════
// LOGIN VIEW
// ══════════════════════════════════════════════════════════════════════════

function LoginView({ onSuccess }: { onSuccess: (token: string) => void }) {
  const [mid,     setMid]     = useState('')
  const [pin,     setPin]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!mid.trim()) return setError('Enter your Merchant ID.')
    if (!pin)        return setError('Enter your PIN.')

    setLoading(true)
    try {
      const data = await merchantLogin(mid.trim().toUpperCase(), pin)
      localStorage.setItem('m_tok',  data.access_token)
      localStorage.setItem('m_id',   data.merchant_id)
      localStorage.setItem('m_name', data.name)
      onSuccess(data.access_token)
    } catch (err: any) {
      setError(err.detail ?? 'Invalid Merchant ID or PIN.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-5">
      <div className="w-full max-w-sm py-8">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <div className="bg-white rounded-3xl border border-border shadow-lg p-9">
          <h1 className="font-display font-extrabold text-[1.45rem] tracking-tight text-ink mb-1.5">
            Merchant sign in
          </h1>
          <p className="text-sm text-ink-4 mb-7 leading-relaxed">
            Sign in with your Merchant ID and 4-digit PIN.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider
                text-ink-3 mb-1.5">
                Merchant ID
              </label>
              <input
                type="text"
                placeholder="e.g. MR1001"
                value={mid}
                onChange={(e) => { setMid(e.target.value); setError('') }}
                autoComplete="username"
                autoCapitalize="characters"
                spellCheck={false}
                className={INPUT}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider
                text-ink-3 mb-1.5">
                PIN
              </label>
              <input
                type="password"
                placeholder="••••"
                maxLength={4}
                inputMode="numeric"
                value={pin}
                onChange={(e) => { setPin(e.target.value); setError('') }}
                autoComplete="current-password"
                className={INPUT}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3
                text-sm text-red-700 leading-snug">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink text-white font-semibold text-sm py-3.5 rounded-2xl
                hover:bg-ink-2 transition-all hover:-translate-y-0.5
                disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <div className="mt-5 space-y-3 text-center">
          <p className="text-sm text-ink-4">
            New here?{' '}
            <Link href="/register" className="text-wa-dark font-semibold hover:underline">
              Create a store →
            </Link>
          </p>
          <p className="text-sm text-ink-4">
            Store manager?{' '}
            <Link href="/store-login" className="text-wa-dark font-semibold hover:underline">
              Store sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// DASHBOARD — STAT CARD
// ══════════════════════════════════════════════════════════════════════════

function StatCard({
  label,
  value,
  sub,
  loading,
}: {
  label: string
  value?: string
  sub?: string
  loading?: boolean
}) {
  return (
    <div className="bg-white border border-border rounded-3xl p-6">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-4 mb-3">
        {label}
      </p>
      {loading ? (
        <>
          <div className="skeleton h-9 w-24 mb-2 rounded-lg" />
          <div className="skeleton h-3.5 w-16 rounded" />
        </>
      ) : (
        <>
          <p className="font-display font-extrabold text-3xl text-ink tracking-tight">
            {value ?? '—'}
          </p>
          {sub && <p className="text-xs text-ink-4 mt-1">{sub}</p>}
        </>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// DASHBOARD — INFO ROW
// ══════════════════════════════════════════════════════════════════════════

function InfoRow({
  label,
  value,
  mono,
  badge,
}: {
  label: string
  value: string
  mono?: boolean
  badge?: { text: string; color: 'green' | 'amber' | 'neutral' }
}) {
  const badgeColors = {
    green:   'bg-green-50 text-green-700 border-green-200',
    amber:   'bg-amber-50 text-amber-700 border-amber-200',
    neutral: 'bg-bg text-ink-3 border-border',
  }

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <span className="text-sm text-ink-3">{label}</span>
      <div className="flex items-center gap-2">
        {badge && (
          <span className={cn(
            'text-[11px] font-semibold border px-2.5 py-0.5 rounded-full',
            badgeColors[badge.color],
          )}>
            {badge.text}
          </span>
        )}
        <span className={cn(
          'text-sm font-semibold text-ink',
          mono && 'font-mono text-[13px]',
        )}>
          {value}
        </span>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// DASHBOARD — TAB SHELL (coming soon placeholder)
// ══════════════════════════════════════════════════════════════════════════

function TabShell({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-white border border-border rounded-3xl p-12 sm:p-16 text-center">
      <div className="w-14 h-14 bg-bg border border-border rounded-2xl
        flex items-center justify-center mx-auto mb-5 text-2xl">
        {icon}
      </div>
      <h3 className="font-display font-bold text-xl text-ink mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-ink-3 max-w-xs mx-auto leading-relaxed">{desc}</p>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// DASHBOARD VIEW
// ══════════════════════════════════════════════════════════════════════════

type Tab = 'overview' | 'products' | 'orders' | 'settings'

function DashboardView({
  token,
  onLogout,
}: {
  token: string
  onLogout: () => void
}) {
  const params         = useSearchParams()
  const [tab, setTab]  = useState<Tab>('overview')
  const [profile, setProfile]         = useState<MerchantProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [resendLoading, setResendLoading]   = useState(false)
  const [resendDone, setResendDone]         = useState(false)

  const isVerified = params?.get('verified') === '1'

  useEffect(() => {
    getMerchantProfile(token)
      .then(setProfile)
      .catch(onLogout)
      .finally(() => setProfileLoading(false))
  }, [token, onLogout])

  async function handleResend() {
    setResendLoading(true)
    try {
      await resendVerification(token)
      setResendDone(true)
    } catch {}
    finally { setResendLoading(false) }
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview',  label: 'Overview',  icon: '▦'  },
    { id: 'products',  label: 'Products',  icon: '📦' },
    { id: 'orders',    label: 'Orders',    icon: '🧾' },
    { id: 'settings',  label: 'Settings',  icon: '⚙️' },
  ]

  const storedName = typeof window !== 'undefined' ? localStorage.getItem('m_name') ?? '' : ''

  return (
    <div className="min-h-screen bg-bg">

      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <Logo size="sm" />

          <div className="flex items-center gap-3">
            {profile && (
              <span className="hidden sm:block text-sm font-medium text-ink-3 max-w-[200px] truncate">
                {profile.name}
              </span>
            )}
            <button
              onClick={onLogout}
              className="text-xs font-semibold text-ink-3 hover:text-ink px-3 py-2
                rounded-xl hover:bg-bg transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8">

        {/* ── Verification banner ────────────────────────────────────── */}
        {isVerified && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 mb-6
            flex items-center gap-3">
            <span className="text-xl">✅</span>
            <div>
              <p className="text-sm font-semibold text-green-800">Email verified</p>
              <p className="text-xs text-green-700 mt-0.5">
                Your account is fully active. Welcome to ShopprHQ!
              </p>
            </div>
          </div>
        )}

        {!profileLoading && profile && !profile.email_verified && !isVerified && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-6
            flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">Verify your email</p>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                We sent a 6-digit code to{' '}
                <strong>{profile.email}</strong>. Enter it in the dashboard
                to activate your account.
              </p>
            </div>
            {resendDone ? (
              <span className="text-xs text-green-700 font-semibold shrink-0">Sent ✓</span>
            ) : (
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="text-xs font-semibold text-amber-800 border border-amber-300
                  px-4 py-2 rounded-xl hover:bg-amber-100 transition-colors shrink-0
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? 'Sending…' : 'Resend code'}
              </button>
            )}
          </div>
        )}

        {/* ── Tab nav ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 bg-white border border-border rounded-2xl
          p-1 mb-8 w-fit overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold',
                'transition-all whitespace-nowrap',
                tab === t.id
                  ? 'bg-ink text-white shadow-sm'
                  : 'text-ink-3 hover:text-ink hover:bg-bg',
              )}
            >
              <span>{t.icon}</span>
              <span className="hidden sm:block">{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab content ───────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-5">
              <StatCard label="Total Orders" value="—" sub="All time" loading={profileLoading} />
              <StatCard label="Revenue"      value="—" sub="All time" loading={profileLoading} />
              <StatCard label="Products"     value="—" sub="In catalogue" loading={profileLoading} />
            </div>

            <div className="bg-white border border-border rounded-3xl p-7">
              <h3 className="font-display font-bold text-lg text-ink mb-5 tracking-tight">
                Your account
              </h3>
              {profileLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="skeleton h-5 rounded" />
                  ))}
                </div>
              ) : profile ? (
                <div>
                  <InfoRow label="Merchant ID"    value={profile.id}    mono />
                  <InfoRow label="Business name"  value={profile.name} />
                  <InfoRow label="Email"          value={profile.email} />
                  <InfoRow
                    label="Email status"
                    value={profile.email_verified ? 'Verified' : 'Not verified'}
                    badge={
                      profile.email_verified
                        ? { text: 'Verified ✓', color: 'green' }
                        : { text: 'Pending', color: 'amber' }
                    }
                  />
                </div>
              ) : null}
            </div>

            {/* Quick links */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="bg-white border border-border rounded-3xl p-6
                flex items-center justify-between group hover:shadow-md
                hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                onClick={() => setTab('products')}
              >
                <div>
                  <p className="font-semibold text-sm text-ink">Add your products</p>
                  <p className="text-xs text-ink-4 mt-0.5">Build your catalogue</p>
                </div>
                <span className="text-2xl group-hover:scale-110 transition-transform">📦</span>
              </div>
              <div className="bg-white border border-border rounded-3xl p-6
                flex items-center justify-between group hover:shadow-md
                hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                onClick={() => setTab('settings')}
              >
                <div>
                  <p className="font-semibold text-sm text-ink">Set operator number</p>
                  <p className="text-xs text-ink-4 mt-0.5">Start receiving order alerts</p>
                </div>
                <span className="text-2xl group-hover:scale-110 transition-transform">⚙️</span>
              </div>
            </div>
          </div>
        )}

        {tab === 'products' && (
          <TabShell
            icon="📦"
            title="Products"
            desc="Add, edit, and manage your product catalogue. Set prices, stock levels, and product images."
          />
        )}

        {tab === 'orders' && (
          <TabShell
            icon="🧾"
            title="Orders"
            desc="View and manage all incoming orders from your WhatsApp store. Track status, confirm, and dispatch."
          />
        )}

        {tab === 'settings' && (
          <TabShell
            icon="⚙️"
            title="Settings"
            desc="Configure your operator WhatsApp number, store details, and delivery settings."
          />
        )}
      </main>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// PAGE — auth gate
// ══════════════════════════════════════════════════════════════════════════

function DashboardPage() {
  const [token,   setToken]   = useState<string | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    setToken(localStorage.getItem('m_tok'))
    setChecked(true)
  }, [])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('m_tok')
    localStorage.removeItem('m_id')
    localStorage.removeItem('m_name')
    setToken(null)
  }, [])

  // Hydration guard — avoids flash
  if (!checked) return null

  if (!token) {
    return <LoginView onSuccess={(tok) => setToken(tok)} />
  }

  return <DashboardView token={token} onLogout={handleLogout} />
}

// Suspense boundary required because DashboardView uses useSearchParams
export default function Page() {
  return (
    <Suspense fallback={null}>
      <DashboardPage />
    </Suspense>
  )
}
