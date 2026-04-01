const BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  'https://ordaa-phase-one-production-765c.up.railway.app'

// ── Core fetch wrapper ─────────────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) {
    throw { status: res.status, detail: data.detail ?? 'Something went wrong' }
  }
  return data as T
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

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  image_url?: string
}

export interface Order {
  id: string
  order_code: string
  status: string
  total_amount: number
  payment_method: string
  created_at: string
  customer_name?: string
}

// ── Auth ───────────────────────────────────────────────────────────────────

export async function merchantLogin(merchant_id: string, password: string) {
  return request<MerchantLoginResponse>('/api/v1/merchants/login', {
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
  return request<RegisterResponse>('/api/v1/merchants/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function storeLogin(client_id: string, password: string) {
  return request<ClientLoginResponse>('/api/v1/clients/login', {
    method: 'POST',
    body: JSON.stringify({ client_id, password }),
  })
}

// ── Merchant dashboard data ────────────────────────────────────────────────

export async function getMerchantProfile(token: string) {
  return request<MerchantProfile>('/api/v1/merchants/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function getProducts(token: string, merchantId: string) {
  return request<Product[]>(`/api/v1/merchants/${merchantId}/products`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function getOrders(token: string, merchantId: string) {
  return request<Order[]>(`/api/v1/merchants/${merchantId}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function resendVerification(token: string) {
  return request<{ message: string }>('/api/v1/merchants/resend-verification', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
}
