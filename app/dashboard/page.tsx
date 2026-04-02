'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'
import {
  merchantLogin, getMerchantProfile, resendVerification,
  getClients, getInventory, createProduct, updateProduct,
  getOrders, getOrderDetail, confirmCashOrder, dispatchOrder,
  type MerchantProfile, type Client, type Product, type Order, type OrderDetail,
} from '@/lib/api'
import { cn } from '@/lib/utils'

// ══════════════════════════════════════════════════════════════════════════
// LINE ICONS
// ══════════════════════════════════════════════════════════════════════════

const S = 'w-[18px] h-[18px]'
const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

function IconGrid()     { return <svg className={S} viewBox="0 0 24 24" {...P}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> }
function IconBox()      { return <svg className={S} viewBox="0 0 24 24" {...P}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> }
function IconReceipt()  { return <svg className={S} viewBox="0 0 24 24" {...P}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><line x1="8" y1="9" x2="10" y2="9"/></svg> }
function IconSettings() { return <svg className={S} viewBox="0 0 24 24" {...P}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> }
function IconPlus()     { return <svg className={S} viewBox="0 0 24 24" {...P}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> }
function IconX()        { return <svg className="w-5 h-5" viewBox="0 0 24 24" {...P}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> }
function IconEdit()     { return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" {...P}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> }
function IconEye()      { return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" {...P}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> }
function IconTruck()    { return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" {...P}><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> }
function IconCheck()    { return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" {...P}><polyline points="20 6 9 17 4 12"/></svg> }

// ══════════════════════════════════════════════════════════════════════════
// SHARED STYLES + UTILS
// ══════════════════════════════════════════════════════════════════════════

const INPUT = cn(
  'w-full px-3.5 py-2.5 rounded-[13px]',
  'bg-bg border-[1.5px] border-border',
  'text-sm text-ink placeholder:text-ink-4/50',
  'outline-none transition-all',
  'focus:border-wa focus:bg-white focus:ring-2 focus:ring-wa/10',
)

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

// ══════════════════════════════════════════════════════════════════════════
// MODAL WRAPPER
// ══════════════════════════════════════════════════════════════════════════

function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4
        bg-ink/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl border border-border shadow-xl w-full max-w-lg
        max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h3 className="font-display font-bold text-lg text-ink tracking-tight">{title}</h3>
          <button onClick={onClose} className="text-ink-4 hover:text-ink transition-colors">
            <IconX />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ══════════════════════════════════════════════════════════════════════════

function OverviewTab({ orders, products, profile, loading }: {
  orders: Order[]; products: Product[]; profile: MerchantProfile | null; loading: boolean
}) {
  const revenue      = orders.filter(o => ['PAID','FULFILLED'].includes(o.status)).reduce((s, o) => s + o.total_amount, 0)
  const pending      = orders.filter(o => o.status === 'AWAITING_PICKUP').length
  const recentOrders = [...orders].sort((a, b) =>
    new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
  ).slice(0, 5)

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders',  value: loading ? null : orders.length.toString() },
          { label: 'Revenue',       value: loading ? null : fmt(revenue) },
          { label: 'Pending',       value: loading ? null : pending.toString() },
          { label: 'Products',      value: loading ? null : products.length.toString() },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-border rounded-2xl p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-4 mb-2">
              {s.label}
            </p>
            {s.value === null
              ? <div className="skeleton h-8 w-16 rounded-lg" />
              : <p className="font-display font-extrabold text-2xl text-ink tracking-tight">{s.value}</p>
            }
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white border border-border rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <p className="font-semibold text-sm text-ink">Recent orders</p>
        </div>
        {loading ? (
          <div className="divide-y divide-border">
            {[1,2,3].map(i => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="skeleton h-4 w-20 rounded" />
                <div className="skeleton h-4 w-32 rounded flex-1" />
                <div className="skeleton h-4 w-16 rounded" />
                <div className="skeleton h-6 w-24 rounded-full" />
              </div>
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-ink-4">No orders yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentOrders.map(o => (
              <div key={o.id} className="px-6 py-4 flex items-center gap-4">
                <span className="font-mono text-xs font-semibold text-ink bg-bg border border-border
                  px-2.5 py-1 rounded-lg shrink-0">
                  {o.order_code}
                </span>
                <span className="text-sm text-ink-3 truncate flex-1">
                  {o.customer_name || o.user_id}
                </span>
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

// ══════════════════════════════════════════════════════════════════════════
// ORDERS TAB
// ══════════════════════════════════════════════════════════════════════════

function OrdersTab({ orders, loading, token, merchantId, onRefresh }: {
  orders: Order[]; loading: boolean; token: string; merchantId: string; onRefresh: () => void
}) {
  const [filter,      setFilter]      = useState<string>('ALL')
  const [detail,      setDetail]      = useState<OrderDetail | null>(null)
  const [detailOpen,  setDetailOpen]  = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const FILTERS = ['ALL','AWAITING_PICKUP','OUT_FOR_DELIVERY','PAID','FULFILLED','CANCELLED']

  const visible = filter === 'ALL' ? orders : orders.filter(o => o.status === filter)
  const sorted  = [...visible].sort((a, b) =>
    new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
  )

  async function openDetail(orderId: string) {
    setDetailLoading(true)
    setDetailOpen(true)
    try {
      const d = await getOrderDetail(token, orderId, merchantId)
      setDetail(d)
    } catch { setDetailOpen(false) }
    finally { setDetailLoading(false) }
  }

  async function handleConfirm(orderId: string) {
    setActionLoading(orderId + 'confirm')
    try {
      await confirmCashOrder(token, orderId, merchantId)
      onRefresh()
      setDetailOpen(false)
    } catch {}
    finally { setActionLoading(null) }
  }

  async function handleDispatch(orderId: string) {
    setActionLoading(orderId + 'dispatch')
    try {
      await dispatchOrder(token, orderId, merchantId)
      onRefresh()
      setDetailOpen(false)
    } catch {}
    finally { setActionLoading(null) }
  }

  return (
    <>
      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap mb-5">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all',
              filter === f
                ? 'bg-ink text-white border-ink'
                : 'bg-white text-ink-3 border-border hover:border-ink-4 hover:text-ink',
            )}
          >
            {f === 'ALL' ? 'All orders' : (STATUS_LABEL[f] ?? f)}
          </button>
        ))}
      </div>

      <div className="bg-white border border-border rounded-3xl overflow-hidden">
        {loading ? (
          <div className="divide-y divide-border">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="skeleton h-4 w-16 rounded" />
                <div className="skeleton h-4 flex-1 rounded" />
                <div className="skeleton h-4 w-20 rounded" />
                <div className="skeleton h-6 w-24 rounded-full" />
                <div className="skeleton h-8 w-8 rounded-xl" />
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-ink mb-1">No orders</p>
            <p className="text-xs text-ink-4">Orders from your WhatsApp store appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sorted.map(o => (
              <div key={o.id} className="px-6 py-4 flex items-center gap-4 hover:bg-bg/50
                transition-colors group">
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
                <span className="text-xs text-ink-4 shrink-0 hidden sm:block capitalize">
                  {o.payment_method}
                </span>
                <StatusBadge status={o.status} />
                <button
                  onClick={() => openDetail(o.id)}
                  className="shrink-0 p-2 rounded-xl text-ink-4 hover:text-ink hover:bg-border/60
                    transition-all opacity-0 group-hover:opacity-100"
                >
                  <IconEye />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order detail modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Order detail">
        {detailLoading || !detail ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="skeleton h-5 rounded" />)}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xl text-ink tracking-wider">
                #{detail.order_code}
              </span>
              <StatusBadge status={detail.status} />
            </div>

            {/* Customer */}
            <div className="bg-bg rounded-2xl p-4 space-y-2">
              <Row label="Customer"   value={detail.customer_name || '—'} />
              <Row label="Phone"      value={detail.user_id} />
              <Row label="Payment"    value={detail.payment_method} capitalize />
              <Row label="Store"      value={detail.store_name || detail.client_id} />
              {detail.delivery_address && <Row label="Delivery address" value={detail.delivery_address} />}
              {detail.delivery_contact_number && <Row label="Delivery contact" value={detail.delivery_contact_number} />}
              <Row label="Placed"     value={detail.created_at ? new Date(detail.created_at).toLocaleString('en-NG') : '—'} />
            </div>

            {/* Items */}
            {detail.items.length > 0 && (
              <div className="border border-border rounded-2xl overflow-hidden">
                <div className="bg-bg px-4 py-2.5 border-b border-border">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-4">Items</p>
                </div>
                <div className="divide-y divide-border">
                  {detail.items.map(item => (
                    <div key={item.product_id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-ink">{item.product_name}</p>
                        <p className="text-xs text-ink-4">× {item.quantity} @ {fmt(item.price)}</p>
                      </div>
                      <span className="text-sm font-semibold text-ink">{fmt(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between px-4 py-3 bg-bg border-t border-border">
                  <span className="text-sm font-bold text-ink">Total</span>
                  <span className="text-sm font-bold text-ink">{fmt(detail.total_amount)}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              {detail.payment_method === 'cash' &&
                (detail.status === 'AWAITING_PICKUP' || detail.status === 'OUT_FOR_DELIVERY') && (
                <button
                  onClick={() => handleConfirm(detail.id)}
                  disabled={!!actionLoading}
                  className="flex items-center gap-2 bg-wa text-white text-sm font-semibold
                    px-4 py-2.5 rounded-xl shadow-wa hover:bg-wa-dark transition-all
                    disabled:opacity-50"
                >
                  <IconCheck />
                  {actionLoading === detail.id + 'confirm' ? 'Confirming…' : 'Confirm & send receipt'}
                </button>
              )}
              {detail.status === 'AWAITING_PICKUP' && detail.delivery_type === 'delivery' && (
                <button
                  onClick={() => handleDispatch(detail.id)}
                  disabled={!!actionLoading}
                  className="flex items-center gap-2 bg-ink text-white text-sm font-semibold
                    px-4 py-2.5 rounded-xl hover:bg-ink-2 transition-all disabled:opacity-50"
                >
                  <IconTruck />
                  {actionLoading === detail.id + 'dispatch' ? 'Dispatching…' : 'Mark out for delivery'}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

function Row({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-ink-4 shrink-0">{label}</span>
      <span className={cn('text-xs font-semibold text-ink text-right', capitalize && 'capitalize')}>
        {value}
      </span>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// PRODUCTS TAB
// ══════════════════════════════════════════════════════════════════════════

function ProductsTab({ products, clients, loading, token, merchantId, onRefresh }: {
  products: Product[]; clients: Client[]; loading: boolean
  token: string; merchantId: string; onRefresh: () => void
}) {
  const [addOpen,   setAddOpen]   = useState(false)
  const [editProd,  setEditProd]  = useState<Product | null>(null)
  const [saving,    setSaving]    = useState(false)
  const [addErr,    setAddErr]    = useState('')

  const [addForm, setAddForm] = useState({
    name: '', price: '', description: '', category: '', initial_stock: '0', client_id: '',
  })
  const [editForm, setEditForm] = useState({ name: '', price: '', description: '', category: '' })

  function setA(k: string) { return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { setAddForm(p => ({ ...p, [k]: e.target.value })); setAddErr('') } }
  function setE(k: string) { return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setEditForm(p => ({ ...p, [k]: e.target.value })) }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!addForm.name.trim()) return setAddErr('Product name is required.')
    if (!addForm.price || isNaN(+addForm.price) || +addForm.price <= 0) return setAddErr('Enter a valid price.')
    const clientId = addForm.client_id || clients[0]?.id
    if (!clientId) return setAddErr('No store found. Create a store first.')
    setSaving(true)
    try {
      await createProduct(token, merchantId, clientId, {
        name: addForm.name.trim(),
        price: +addForm.price,
        description: addForm.description || undefined,
        category: addForm.category || undefined,
        initial_stock: +addForm.initial_stock || 0,
      })
      setAddOpen(false)
      setAddForm({ name: '', price: '', description: '', category: '', initial_stock: '0', client_id: '' })
      onRefresh()
    } catch (err: any) {
      setAddErr(err.detail ?? 'Could not create product.')
    } finally { setSaving(false) }
  }

  function openEdit(p: Product) {
    setEditProd(p)
    setEditForm({ name: p.name, price: String(p.price), description: p.description ?? '', category: p.category ?? '' })
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editProd) return
    setSaving(true)
    try {
      await updateProduct(token, merchantId, editProd.client_id ?? editProd._client?.id ?? '', editProd.id, {
        name: editForm.name || undefined,
        price: editForm.price ? +editForm.price : undefined,
        description: editForm.description || undefined,
        category: editForm.category || undefined,
      })
      setEditProd(null)
      onRefresh()
    } catch {}
    finally { setSaving(false) }
  }

  return (
    <>
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-ink-4">
          {loading ? '—' : `${products.length} product${products.length !== 1 ? 's' : ''}`}
        </p>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 bg-ink text-white text-sm font-semibold
            px-4 py-2.5 rounded-xl hover:bg-ink-2 transition-all hover:-translate-y-px"
        >
          <IconPlus />
          Add product
        </button>
      </div>

      <div className="bg-white border border-border rounded-3xl overflow-hidden">
        {loading ? (
          <div className="divide-y divide-border">
            {[1,2,3,4].map(i => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="skeleton h-4 flex-1 rounded" />
                <div className="skeleton h-4 w-20 rounded" />
                <div className="skeleton h-5 w-16 rounded-full" />
                <div className="skeleton h-4 w-20 rounded" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-ink mb-1">No products yet</p>
            <p className="text-xs text-ink-4 mb-4">Add your first product to start taking orders.</p>
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-2 bg-wa text-white text-sm font-semibold
                px-5 py-2.5 rounded-xl shadow-wa hover:bg-wa-dark transition-all"
            >
              <IconPlus /> Add product
            </button>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-6 py-3
              border-b border-border text-[11px] font-semibold uppercase tracking-wider text-ink-4">
              <span>Name</span>
              <span className="text-right">Price</span>
              <span className="text-right">Stock</span>
              <span className="hidden sm:block">Store</span>
              <span />
            </div>
            <div className="divide-y divide-border">
              {products.map(p => {
                const qty    = p.inventory?.quantity ?? 0
                const thresh = p.inventory?.low_stock_threshold
                const isLow  = thresh != null && qty > 0 && qty <= thresh
                const isOut  = qty === 0
                return (
                  <div key={p.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4
                    items-center px-6 py-4 hover:bg-bg/50 transition-colors group">
                    <div>
                      <p className="text-sm font-medium text-ink truncate">{p.name}</p>
                      {p.description && (
                        <p className="text-xs text-ink-4 truncate mt-0.5">{p.description}</p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-ink text-right">
                      {fmt(p.price)}
                    </span>
                    <span className={cn(
                      'text-xs font-semibold border px-2.5 py-0.5 rounded-full text-right whitespace-nowrap',
                      isOut  ? 'bg-red-50 text-red-600 border-red-200' :
                      isLow  ? 'bg-amber-50 text-amber-700 border-amber-200' :
                               'bg-green-50 text-green-700 border-green-200',
                    )}>
                      {isOut ? 'Out of stock' : `${qty} in stock`}
                    </span>
                    <span className="text-xs text-ink-4 hidden sm:block">
                      {p._client?.name || p.client_id}
                    </span>
                    <button
                      onClick={() => openEdit(p)}
                      className="p-2 rounded-xl text-ink-4 hover:text-ink hover:bg-border/60
                        transition-all opacity-0 group-hover:opacity-100"
                    >
                      <IconEdit />
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Add product modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add product">
        <form onSubmit={handleAdd} className="space-y-4">
          <FormField label="Product name">
            <input type="text" placeholder="e.g. Jollof Rice (large)" value={addForm.name} onChange={setA('name')} className={INPUT} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Price (₦)">
              <input type="number" placeholder="1500" min="1" step="any" value={addForm.price} onChange={setA('price')} className={INPUT} />
            </FormField>
            <FormField label="Initial stock">
              <input type="number" placeholder="0" min="0" value={addForm.initial_stock} onChange={setA('initial_stock')} className={INPUT} />
            </FormField>
          </div>
          <FormField label="Category (optional)">
            <input type="text" placeholder="e.g. Food, Electronics" value={addForm.category} onChange={setA('category')} className={INPUT} />
          </FormField>
          <FormField label="Description (optional)">
            <textarea placeholder="Short product description" value={addForm.description}
              onChange={setA('description') as any}
              rows={2} className={cn(INPUT, 'resize-none')} />
          </FormField>
          {clients.length > 1 && (
            <FormField label="Store">
              <select value={addForm.client_id} onChange={setA('client_id')} className={INPUT}>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name || c.id}</option>)}
              </select>
            </FormField>
          )}
          {addErr && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{addErr}</p>}
          <button type="submit" disabled={saving}
            className="w-full bg-wa text-white font-semibold text-sm py-3 rounded-xl shadow-wa
              hover:bg-wa-dark transition-all disabled:opacity-50">
            {saving ? 'Saving…' : 'Add product'}
          </button>
        </form>
      </Modal>

      {/* Edit product modal */}
      <Modal open={!!editProd} onClose={() => setEditProd(null)} title="Edit product">
        <form onSubmit={handleEdit} className="space-y-4">
          <FormField label="Product name">
            <input type="text" value={editForm.name} onChange={setE('name')} className={INPUT} />
          </FormField>
          <FormField label="Price (₦)">
            <input type="number" min="1" step="any" value={editForm.price} onChange={setE('price')} className={INPUT} />
          </FormField>
          <FormField label="Category (optional)">
            <input type="text" value={editForm.category} onChange={setE('category')} className={INPUT} />
          </FormField>
          <FormField label="Description (optional)">
            <textarea value={editForm.description} onChange={setE('description') as any}
              rows={2} className={cn(INPUT, 'resize-none')} />
          </FormField>
          <button type="submit" disabled={saving}
            className="w-full bg-ink text-white font-semibold text-sm py-3 rounded-xl
              hover:bg-ink-2 transition-all disabled:opacity-50">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </Modal>
    </>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

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
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-5">
      <div className="w-full max-w-sm py-8">
        <div className="flex justify-center mb-8"><Logo /></div>
        <div className="bg-white rounded-3xl border border-border shadow-lg p-9">
          <h1 className="font-display font-extrabold text-[1.45rem] tracking-tight text-ink mb-1.5">
            Merchant sign in
          </h1>
          <p className="text-sm text-ink-4 mb-7 leading-relaxed">
            Sign in with your Merchant ID and 4-digit PIN.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Merchant ID">
              <input type="text" placeholder="e.g. MR1001" value={mid}
                onChange={e => { setMid(e.target.value); setError('') }}
                autoComplete="username" autoCapitalize="characters" spellCheck={false}
                className={INPUT} />
            </FormField>
            <FormField label="PIN">
              <input type="password" placeholder="••••" maxLength={4} inputMode="numeric"
                value={pin} onChange={e => { setPin(e.target.value); setError('') }}
                autoComplete="current-password" className={INPUT} />
            </FormField>
            {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-ink text-white font-semibold text-sm py-3.5 rounded-2xl
                hover:bg-ink-2 transition-all hover:-translate-y-0.5
                disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
        <div className="mt-5 space-y-3 text-center">
          <p className="text-sm text-ink-4">
            New here?{' '}
            <Link href="/register" className="text-wa-dark font-semibold hover:underline">Create a store →</Link>
          </p>
          <p className="text-sm text-ink-4">
            Store manager?{' '}
            <Link href="/store-login" className="text-wa-dark font-semibold hover:underline">Store sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// DASHBOARD VIEW
// ══════════════════════════════════════════════════════════════════════════

type Tab = 'overview' | 'products' | 'orders' | 'settings'

const TABS: { id: Tab; label: string; Icon: () => JSX.Element }[] = [
  { id: 'overview',  label: 'Overview',  Icon: IconGrid     },
  { id: 'products',  label: 'Products',  Icon: IconBox      },
  { id: 'orders',    label: 'Orders',    Icon: IconReceipt  },
  { id: 'settings',  label: 'Settings',  Icon: IconSettings },
]

function DashboardView({ token, onLogout }: { token: string; onLogout: () => void }) {
  const params     = useSearchParams()
  const isVerified = params?.get('verified') === '1'

  const [tab,     setTab]     = useState<Tab>('overview')
  const [profile, setProfile] = useState<MerchantProfile | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [orders,  setOrders]  = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]  = useState(true)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendDone,    setResendDone]    = useState(false)

  const merchantId = typeof window !== 'undefined' ? localStorage.getItem('m_id') ?? '' : ''

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [prof, clientList, orderList] = await Promise.all([
        getMerchantProfile(token),
        getClients(token),
        getOrders(token, merchantId),
      ])
      setProfile(prof)
      setClients(clientList)
      setOrders(orderList)

      // Load products across all stores
      const allProds: Product[] = []
      for (const c of clientList) {
        try {
          const prods = await getInventory(token, merchantId, c.id)
          allProds.push(...prods.map(p => ({ ...p, _client: c })))
        } catch {}
      }
      setProducts(allProds)
    } catch (err: any) {
      if (err?.status === 401) onLogout()
      // other errors (network, 5xx) — keep the user logged in, data just won't load
    } finally {
      setLoading(false)
    }
  }, [token, merchantId, onLogout])

  useEffect(() => { loadData() }, [loadData])

  async function handleResend() {
    setResendLoading(true)
    try { await resendVerification(token); setResendDone(true) } catch {}
    finally { setResendLoading(false) }
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Top bar */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            {profile && (
              <span className="hidden sm:block text-sm font-medium text-ink-3 max-w-[200px] truncate">
                {profile.name}
              </span>
            )}
            <button onClick={onLogout}
              className="text-xs font-semibold text-ink-3 hover:text-ink px-3 py-2
                rounded-xl hover:bg-bg transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8">
        {/* Banners */}
        {isVerified && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 mb-6 flex items-center gap-3">
            <span className="text-lg">✓</span>
            <div>
              <p className="text-sm font-semibold text-green-800">Email verified</p>
              <p className="text-xs text-green-700 mt-0.5">Your account is fully active. Welcome to ShopprHQ!</p>
            </div>
          </div>
        )}
        {!loading && profile && !profile.email_verified && !isVerified && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-6
            flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">Verify your email</p>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                We sent a 6-digit code to <strong>{profile.email}</strong>.
              </p>
            </div>
            {resendDone
              ? <span className="text-xs text-green-700 font-semibold shrink-0">Sent ✓</span>
              : <button onClick={handleResend} disabled={resendLoading}
                  className="text-xs font-semibold text-amber-800 border border-amber-300 px-4 py-2
                    rounded-xl hover:bg-amber-100 transition-colors shrink-0 disabled:opacity-50">
                  {resendLoading ? 'Sending…' : 'Resend code'}
                </button>
            }
          </div>
        )}

        {/* Tab nav — icon + label only when active */}
        <div className="flex items-center gap-1 bg-white border border-border rounded-2xl p-1 mb-8 w-fit">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all',
                tab === t.id
                  ? 'bg-ink text-white shadow-sm pr-4'
                  : 'text-ink-3 hover:text-ink hover:bg-bg',
              )}
            >
              <t.Icon />
              {tab === t.id && <span>{t.label}</span>}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'overview' && (
          <OverviewTab orders={orders} products={products} profile={profile} loading={loading} />
        )}
        {tab === 'products' && (
          <ProductsTab
            products={products} clients={clients} loading={loading}
            token={token} merchantId={merchantId} onRefresh={loadData}
          />
        )}
        {tab === 'orders' && (
          <OrdersTab
            orders={orders} loading={loading}
            token={token} merchantId={merchantId} onRefresh={loadData}
          />
        )}
        {tab === 'settings' && (
          <div className="bg-white border border-border rounded-3xl p-7 space-y-0">
            <h3 className="font-display font-bold text-lg text-ink mb-5 tracking-tight">Account</h3>
            {profile ? (
              <>
                <Row label="Merchant ID"   value={profile.id} />
                <Row label="Business name" value={profile.name} />
                <Row label="Email"         value={profile.email} />
                <Row label="Email status"  value={profile.email_verified ? 'Verified' : 'Not verified'} />
              </>
            ) : (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-5 rounded" />)}</div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// PAGE — auth gate + Suspense for useSearchParams
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

  if (!checked) return null

  if (!token) return <LoginView onSuccess={setToken} />

  return <DashboardView token={token} onLogout={handleLogout} />
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <DashboardPage />
    </Suspense>
  )
}
