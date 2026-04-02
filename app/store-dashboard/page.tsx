'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'
import { getOrders, type Order } from '@/lib/api'
import { cn } from '@/lib/utils'

function fmt(n: number) {
  return '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function timeAgo(iso?: string) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
}

const STATUS_STYLE: Record<string, string> = {
  AWAITING_PICKUP:  'bg-amber-50 text-amber-700 border-amber-200',
  PENDING_PAYMENT:  'bg-blue-50 text-blue-700 border-blue-200',
  PAID:             'bg-green-50 text-green-700 border-green-200',
  OUT_FOR_DELIVERY: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  FULFILLED:        'bg-emerald-50 text-emerald-800 border-emerald-200',
  CANCELLED:        'bg-red-50 text-red-700 border-red-200',
  CREATED:          'bg-bg text-ink-3 border-border',
}

const STATUS_LABEL: Record<string, string> = {
  AWAITING_PICKUP:  'Awaiting Pickup',
  PENDING_PAYMENT:  'Pending Payment',
  PAID:             'Paid',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  FULFILLED:        'Fulfilled',
  CANCELLED:        'Cancelled',
  CREATED:          'Created',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(
      'text-[11px] font-semibold border px-2.5 py-0.5 rounded-full whitespace-nowrap',
      STATUS_STYLE[status] ?? 'bg-bg text-ink-3 border-border',
    )}>
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}

type Tab = 'orders' | 'settings'

interface StoreInfo {
  tok:   string
  cid:   string
  cname: string
  mid:   string
}

// ── Skeleton row ─────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-border last:border-0">
      <div className="skeleton h-4 w-20 rounded" />
      <div className="skeleton h-4 w-32 rounded flex-1" />
      <div className="skeleton h-4 w-16 rounded" />
      <div className="skeleton h-6 w-20 rounded-full" />
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────

function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="w-14 h-14 bg-bg border border-border rounded-2xl
        flex items-center justify-center mx-auto mb-4 text-2xl">
        {icon}
      </div>
      <p className="font-semibold text-sm text-ink mb-1">{title}</p>
      <p className="text-xs text-ink-4 leading-relaxed">{desc}</p>
    </div>
  )
}

// ── Orders tab ────────────────────────────────────────────────────────────

function OrdersTab({ info }: { info: StoreInfo }) {
  const [orders,  setOrders]  = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    getOrders(info.tok, info.mid)
      .then((data) => {
        if (cancelled) return
        // Filter to this store's orders if the backend returns all stores
        const filtered = data.filter((o) => o.client_id === info.cid)
        setOrders(filtered.length > 0 ? filtered : data)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err?.detail ?? 'Could not load orders.')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [info.tok, info.mid, info.cid])

  const today    = new Date().toDateString()
  const todayCount  = orders.filter(o => o.created_at && new Date(o.created_at).toDateString() === today).length
  const pending     = orders.filter(o => o.status === 'AWAITING_PICKUP' || o.status === 'PENDING_PAYMENT').length
  const paid        = orders.filter(o => o.status === 'PAID' || o.status === 'FULFILLED').length
  const revenue     = orders.filter(o => ['PAID','FULFILLED'].includes(o.status)).reduce((s, o) => s + o.total_amount, 0)

  const sorted = [...orders].sort((a, b) =>
    new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
  )

  const stats = [
    { label: 'Today',   value: loading ? null : todayCount.toString() },
    { label: 'Pending', value: loading ? null : pending.toString() },
    { label: 'Paid',    value: loading ? null : paid.toString() },
    { label: 'Revenue', value: loading ? null : fmt(revenue) },
  ]

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-border rounded-2xl p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-4 mb-2">
              {s.label}
            </p>
            {s.value === null
              ? <div className="skeleton h-8 w-16 rounded-lg" />
              : <p className="font-display font-extrabold text-2xl text-ink">{s.value}</p>
            }
          </div>
        ))}
      </div>

      {/* Orders list */}
      <div className="bg-white border border-border rounded-3xl overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-sm text-ink">Recent orders</h3>
          <span className="text-xs text-ink-4">Live via WhatsApp</span>
        </div>
        {error ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : loading ? (
          <div className="divide-y divide-border px-6">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-4 py-4">
                <div className="skeleton h-4 w-20 rounded" />
                <div className="skeleton h-4 w-32 rounded flex-1" />
                <div className="skeleton h-4 w-16 rounded" />
                <div className="skeleton h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="px-6">
            <EmptyState
              icon="🧾"
              title="No orders yet"
              desc="Orders placed through your WhatsApp store will appear here in real time."
            />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sorted.map(o => (
              <div key={o.id} className="px-6 py-4 flex items-center gap-4">
                <span className="font-mono text-xs font-semibold text-ink bg-bg border border-border
                  px-2.5 py-1 rounded-lg shrink-0">
                  {o.order_code}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">
                    {o.customer_name || o.user_id}
                  </p>
                  <p className="text-xs text-ink-4 mt-0.5">{timeAgo(o.created_at)}</p>
                </div>
                <span className="text-sm font-semibold text-ink shrink-0">
                  {fmt(o.total_amount)}
                </span>
                <StatusBadge status={o.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Settings tab ──────────────────────────────────────────────────────────

function SettingsTab({ info }: { info: StoreInfo }) {
  return (
    <div className="bg-white border border-border rounded-3xl p-7 space-y-6">
      <div>
        <h3 className="font-display font-bold text-lg text-ink mb-5 tracking-tight">
          Store info
        </h3>
        <div className="space-y-0">
          {[
            { label: 'Store name',  value: info.cname || '—' },
            { label: 'Store ID',    value: info.cid,   mono: true },
            { label: 'Merchant ID', value: info.mid,   mono: true },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between py-3.5 border-b border-border last:border-0"
            >
              <span className="text-sm text-ink-3">{row.label}</span>
              <span className={cn(
                'text-sm font-semibold text-ink',
                row.mono && 'font-mono text-[13px]',
              )}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
        <p className="text-sm font-semibold text-amber-800 mb-1">
          Operator number &amp; store settings
        </p>
        <p className="text-xs text-amber-700 leading-relaxed">
          Full settings management — operator phone, delivery zones, store hours — is coming soon.
          Contact your merchant at{' '}
          <a href="mailto:hello@shopprhq.com" className="font-semibold underline">
            hello@shopprhq.com
          </a>{' '}
          for urgent changes.
        </p>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════════════════

export default function StoreDashboardPage() {
  const router              = useRouter()
  const [info, setInfo]     = useState<StoreInfo | null>(null)
  const [checked, setChecked] = useState(false)
  const [tab, setTab]       = useState<Tab>('orders')

  useEffect(() => {
    const tok   = localStorage.getItem('tok')
    const cid   = localStorage.getItem('cid')
    const cname = localStorage.getItem('cname') ?? ''
    const mid   = localStorage.getItem('mid')   ?? ''

    if (!tok || !cid) {
      router.replace('/store-login')
      return
    }
    setInfo({ tok, cid, cname, mid })
    setChecked(true)
  }, [router])

  function logout() {
    localStorage.removeItem('tok')
    localStorage.removeItem('cid')
    localStorage.removeItem('cname')
    localStorage.removeItem('mid')
    router.replace('/store-login')
  }

  if (!checked || !info) return null

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'orders',   label: 'Orders',   icon: '🧾' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen bg-bg">

      {/* Top bar */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            {info.cname && (
              <span className="hidden sm:block text-xs font-semibold text-ink-4
                bg-bg border border-border px-2.5 py-1 rounded-full">
                {info.cname}
              </span>
            )}
          </div>
          <button
            onClick={logout}
            className="text-xs font-semibold text-ink-3 hover:text-ink px-3 py-2
              rounded-xl hover:bg-bg transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-8">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-display font-extrabold text-2xl text-ink tracking-tight">
            {info.cname || 'Your Store'}
          </h1>
          <p className="text-sm text-ink-4 mt-1">
            Store ID:{' '}
            <span className="font-mono font-semibold text-ink-3">{info.cid}</span>
          </p>
        </div>

        {/* Tab nav */}
        <div className="flex items-center gap-1 bg-white border border-border rounded-2xl
          p-1 mb-8 w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold',
                'transition-all',
                tab === t.id
                  ? 'bg-ink text-white shadow-sm'
                  : 'text-ink-3 hover:text-ink hover:bg-bg',
              )}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {tab === 'orders'   && <OrdersTab   info={info} />}
        {tab === 'settings' && <SettingsTab info={info} />}
      </main>
    </div>
  )
}
