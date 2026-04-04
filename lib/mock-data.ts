// Datos mock para desarrollo rápido
export const mockItems = [
  {
    id: "1",
    name: "Hamburguesa Clásica",
    description: "Hamburguesa con queso, lechuga y tomate",
    price: 8.50,
    currency: "USD",
    type: "product",
    stock_quantity: 50,
    low_stock_threshold: 5,
    track_stock: true,
    is_active: true,
    is_featured: false,
    images: [],
    total_sold: 25,
    likes_count: 12,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "2",
    name: "Pizza Margarita",
    description: "Pizza con salsa de tomate, mozzarella y albahaca",
    price: 12.00,
    currency: "USD",
    type: "product",
    stock_quantity: 30,
    low_stock_threshold: 5,
    track_stock: true,
    is_active: true,
    is_featured: true,
    images: [],
    total_sold: 40,
    likes_count: 20,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "3",
    name: "Corte de Cabello",
    description: "Corte de cabello profesional para hombres",
    price: 15.00,
    currency: "USD",
    type: "service",
    stock_quantity: 0,
    low_stock_threshold: 0,
    track_stock: false,
    service_duration_minutes: 30,
    is_active: true,
    is_featured: false,
    images: [],
    total_sold: 15,
    likes_count: 8,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  }
]

export const mockStats = {
  total_products: 3,
  total_orders: 80,
  pending_orders: 5,
  total_revenue: 1250.00,
  low_stock_items: []
}

export const mockWhatsAppStatus = {
  connected: false,
  active_connection: null
}
