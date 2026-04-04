import { createClient } from '@/lib/supabase/client'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface Store {
  id: string
  name: string
  slug: string
  description?: string
  logo_url?: string
  whatsapp_number?: string
  type: string
  subscription_plan?: string
  subscription_expires_at?: string
}

export interface StoreItem {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  images?: string[]
  stock_quantity: number
  track_stock: boolean
  type: string
  is_featured: boolean
  category_id?: string
  likes_count: number
  total_sold: number
  created_at: string
}

export interface Category {
  id: string
  name: string
  description?: string
  sort_order: number
  is_active: boolean
}

export interface CartItem {
  item_id: string
  quantity: number
  price: number
  name: string
}

export interface Cart {
  id: string
  store_id: string
  items: CartItem[]
  total: number
  customer_phone?: string
  status: string
  expires_at: string
}

export async function getStoreData(slug: string): Promise<Store | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/store/${slug}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`Failed to fetch store: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching store data:', error)
    return null
  }
}

export async function getStoreItems(
  slug: string, 
  options: {
    categoryId?: string
    search?: string
    limit?: number
    offset?: number
  } = {}
): Promise<StoreItem[]> {
  try {
    const params = new URLSearchParams()
    
    if (options.categoryId) params.append('category_id', options.categoryId)
    if (options.search) params.append('search', options.search)
    if (options.limit) params.append('limit', options.limit.toString())
    if (options.offset) params.append('offset', options.offset.toString())

    const response = await fetch(
      `${API_BASE_URL}/api/v1/store/${slug}/items?${params}`,
      {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch items: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching store items:', error)
    return []
  }
}

export async function getStoreCategories(slug: string): Promise<Category[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/store/${slug}/categories`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching store categories:', error)
    return []
  }
}

export async function createCart(slug: string, items: CartItem[]): Promise<Cart> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/store/${slug}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create cart: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating cart:', error)
    throw error
  }
}

export async function getCart(cartId: string): Promise<Cart | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/cart/${cartId}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`Failed to fetch cart: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching cart:', error)
    return null
  }
}

export async function addToCart(cartId: string, item: CartItem): Promise<Cart> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/cart/${cartId}/items`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    })

    if (!response.ok) {
      throw new Error(`Failed to add to cart: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error adding to cart:', error)
    throw error
  }
}

export async function setCustomerPhone(cartId: string, phone: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/cart/${cartId}/customer`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone }),
    })

    if (!response.ok) {
      throw new Error(`Failed to set customer phone: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Error setting customer phone:', error)
    throw error
  }
}
