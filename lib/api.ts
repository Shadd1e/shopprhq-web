function normaliseBase(url: string) {
  const u = url.replace(/\/$/, '')
  return u.startsWith('http://') || u.startsWith('https://') ? u : `https://${u}`
}

const BASE = normaliseBase(
  process.env.NEXT_PUBLIC_API_URL ?? 'https://api.shopprhq.com'
)

// ── Core fetch ─────────────────────────────────────────────────────────────

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const { headers: optHeaders, ...restOptions } = options ?? {}
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...optHeaders },
    ...restOptions,
  })
  const data = await res.json()
  if (!res.ok) throw { status: res.status, detail: data.detail ?? 'Something went wrong' }
  return data as T
}

function bearer(token: string) {
  return { Authorization: `Bearer ${token}` }
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface MerchantLoginResponse {
  access_token: string
  merchant_id: string
  name: string
  email: string
}

export interface RegisterResponse {
  id: string
  name: string
  email: string
}

export interface ClientLoginResponse {
  access_token: string
  client_id: string
  store_name: string
  merchant_id: string
}

export interface MerchantProfile {
  id: string
  name: string
  email: string
  email_verified: boolean
  whatsapp_number?: string
}

export interface Client {
  id: string
  name: string
  merchant_id: string
  whatsapp_number?: string
}

export interface InventoryInfo {
  quantity: number
  low_stock_threshold?: number
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  category?: string
  merchant_id?: string
  client_id?: string
  inventory?: InventoryInfo
  _client?: Client   // enriched client-side
}

export interface Order {
  id: string
  order_code: string
  merchant_id: string
  client_id: string
  user_id: string
  customer_name?: string
  payment_method: string
  total_amount: number
  status: string
  created_at?: string
  confirmed_at?: string
  fulfilled_at?: string
  cancelled_at?: string
}

export interface OrderDetail extends Order {
  store_name?: string
  store_address?: string
  delivery_type?: string
  delivery_address?: string
  delivery_contact_number?: string
  delivery_fee?: number
  effective_total?: number
  dispatched_at?: string
  items: {
    product_id: string
    product_name: string
    quantity: number
    price: number
    subtotal: number
  }[]
}

// ── Auth ───────────────────────────────────────────────────────────────────

export async function merchantLogin(merchant_id: string, password: string) {
  return req<MerchantLoginResponse>('/api/v1/merchants/login', {
    method: 'POST',
    body: JSON.stringify({ merchant_id, password }),
  })
}

export async function registerMerchant(payload: {
  name: string
  email: string
  password: string
  whatsapp_number: string | null
}) {
  return req<RegisterResponse>('/api/v1/merchants/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function storeLogin(client_id: string, password: string) {
  return req<ClientLoginResponse>('/api/v1/clients/login', {
    method: 'POST',
    body: JSON.stringify({ client_id, password }),
  })
}

// ── Merchant profile ───────────────────────────────────────────────────────

export async function getMerchantProfile(token: string) {
  return req<MerchantProfile>('/api/v1/merchants/me', {
    headers: bearer(token),
  })
}

export async function resendVerification(token: string) {
  return req<{ message: string }>('/api/v1/merchants/resend-verification', {
    method: 'POST',
    headers: bearer(token),
  })
}

// ── Clients (stores) ───────────────────────────────────────────────────────

export async function getClients(token: string) {
  return req<Client[]>('/api/v1/clients/', {
    headers: bearer(token),
  })
}

// ── Products (inventory endpoint — requires X-headers) ────────────────────

export async function getInventory(token: string, merchantId: string, clientId: string) {
  return req<Product[]>('/api/v1/inventory/', {
    headers: { ...bearer(token), 'X-Merchant-ID': merchantId, 'X-Client-ID': clientId },
  })
}

export async function createProduct(
  token: string,
  merchantId: string,
  clientId: string,
  data: { name: string; price: number; description?: string; category?: string; initial_stock?: number },
) {
  return req<Product>('/api/v1/products/admin/', {
    method: 'POST',
    headers: { ...bearer(token), 'X-Merchant-ID': merchantId, 'X-Client-ID': clientId },
    body: JSON.stringify({ ...data, merchant_id: merchantId, client_id: clientId }),
  })
}

export async function updateProduct(
  token: string,
  merchantId: string,
  clientId: string,
  productId: string,
  data: { name?: string; price?: number; description?: string; category?: string },
) {
  return req<Product>(`/api/v1/products/admin/${productId}`, {
    method: 'PATCH',
    headers: { ...bearer(token), 'X-Merchant-ID': merchantId, 'X-Client-ID': clientId },
    body: JSON.stringify(data),
  })
}

export async function updateStock(
  token: string,
  merchantId: string,
  clientId: string,
  productId: string,
  quantity: number,
) {
  return req(`/api/v1/inventory/${productId}/stock`, {
    method: 'PATCH',
    headers: { ...bearer(token), 'X-Merchant-ID': merchantId, 'X-Client-ID': clientId },
    body: JSON.stringify({ quantity }),
  })
}

// ── Orders ─────────────────────────────────────────────────────────────────

export async function getOrders(token: string, merchantId: string, status?: string) {
  const qs = new URLSearchParams({ merchant_id: merchantId, limit: '200' })
  if (status) qs.set('status', status)
  return req<Order[]>(`/api/v1/orders/?${qs}`, {
    headers: bearer(token),
  })
}

export async function getOrderDetail(token: string, orderId: string, merchantId: string) {
  return req<OrderDetail>(`/api/v1/orders/${orderId}/detail?merchant_id=${merchantId}`, {
    headers: bearer(token),
  })
}

export async function confirmCashOrder(token: string, orderId: string, merchantId: string) {
  return req(`/api/v1/orders/${orderId}/confirm-cash?merchant_id=${merchantId}`, {
    method: 'POST',
    headers: bearer(token),
  })
}

export async function dispatchOrder(token: string, orderId: string, merchantId: string) {
  return req(`/api/v1/orders/${orderId}/mark-out-for-delivery?merchant_id=${merchantId}`, {
    method: 'POST',
    headers: bearer(token),
  })
}
