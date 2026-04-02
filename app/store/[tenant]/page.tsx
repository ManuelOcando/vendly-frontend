"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Search, X } from "lucide-react"

interface Item {
  id: string
  name: string
  description: string
  price: number
  currency: string
  images: string[]
  stock_quantity: number
  track_stock: boolean
  type: string
  is_featured: boolean
  likes_count: number
}

interface CartItem {
  item: Item
  quantity: number
}

export default function StorePage() {
  const params = useParams()
  const slug = params.tenant as string

  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [phone, setPhone] = useState("")
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const API = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    loadItems()
  }, [search])

  async function loadItems() {
    try {
      const url = `${API}/api/v1/store/${slug}/items${search ? `?search=${search}` : ""}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function addToCart(item: Item) {
    setCart(prev => {
      const existing = prev.find(ci => ci.item.id === item.id)
      if (existing) {
        return prev.map(ci =>
          ci.item.id === item.id
            ? { ...ci, quantity: ci.quantity + 1 }
            : ci
        )
      }
      return [...prev, { item, quantity: 1 }]
    })
    setShowCart(true)
  }

  function removeFromCart(itemId: string) {
    setCart(prev => prev.filter(ci => ci.item.id !== itemId))
  }

  function getCartTotal() {
    return cart.reduce((total, ci) => total + ci.item.price * ci.quantity, 0)
  }

  function getCartCount() {
    return cart.reduce((total, ci) => total + ci.quantity, 0)
  }

  async function handleCheckout() {
    if (!phone) return
    setCheckoutLoading(true)

    try {
      // Crear carrito en backend
      const res = await fetch(`${API}/api/v1/store/${slug}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_phone: phone,
          items: cart.map(ci => ({
            item_id: ci.item.id,
            quantity: ci.quantity,
          })),
        }),
      })

      const data = await res.json()
      const cartId = data.cart_id

      // Generar mensaje para WhatsApp
      const itemsList = cart
        .map(ci => `• ${ci.item.name} x${ci.quantity} = $${(ci.item.price * ci.quantity).toFixed(2)}`)
        .join("\n")

      const message = encodeURIComponent(
        `Hola! Mi carrito ID: ${cartId}\n\n${itemsList}\n\nTotal: $${getCartTotal().toFixed(2)}`
      )

      // Obtener el número de WhatsApp de la tienda
      const tenantRes = await fetch(`${API}/api/v1/store/${slug}`)
      const tenant = await tenantRes.json()
      const waNumber = tenant.whatsapp_number?.replace(/\D/g, "") || ""

      if (!waNumber) {
        alert("Esta tienda no tiene WhatsApp configurado")
        return
      }

      // Abrir WhatsApp
      window.open(`https://wa.me/${waNumber}?text=${message}`, "_blank")
      setShowPhoneModal(false)
      setCart([])
      setShowCart(false)
    } catch (e) {
      console.error(e)
    } finally {
      setCheckoutLoading(false)
    }
  }

  const storeColor = "#6366f1"

  return (
    <div className="pb-24">
      {/* Search bar */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar productos..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-3 gap-1 p-1 mt-1">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">📦</p>
          <p className="font-medium">No hay productos disponibles</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-0.5 bg-gray-200 mt-0.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="aspect-square bg-white relative cursor-pointer overflow-hidden"
              onClick={() => setSelectedItem(item)}
            >
              {item.images && item.images.length > 0 ? (
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-2">
                  <span className="text-3xl">
                    {item.type === "service" ? "🔧" : "📦"}
                  </span>
                  <p className="text-xs text-center text-gray-600 mt-1 line-clamp-2">
                    {item.name}
                  </p>
                </div>
              )}

              {/* Price overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-white text-xs font-bold">${item.price}</p>
              </div>

              {/* Featured badge */}
              {item.is_featured && (
                <div className="absolute top-1 right-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-1 rounded">
                  ⭐
                </div>
              )}

              {/* Out of stock */}
              {item.track_stock && item.stock_quantity === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-xs font-bold bg-red-500 px-2 py-1 rounded">
                    Agotado
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Product detail modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{selectedItem.name}</h2>
                  <p className="text-2xl font-bold text-indigo-600 mt-1">
                    ${selectedItem.price.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedItem.images && selectedItem.images.length > 0 && (
                <img
                  src={selectedItem.images[0]}
                  alt={selectedItem.name}
                  className="w-full h-64 object-cover rounded-xl mb-4"
                />
              )}

              {selectedItem.description && (
                <p className="text-gray-600 mb-4">{selectedItem.description}</p>
              )}

              <div className="flex gap-2 mb-4">
                <Badge variant="outline">
                  {selectedItem.type === "service" ? "🔧 Servicio" : "📦 Producto"}
                </Badge>
                {selectedItem.track_stock && (
                  <Badge
                    variant={selectedItem.stock_quantity > 0 ? "default" : "destructive"}
                  >
                    {selectedItem.stock_quantity > 0
                      ? `${selectedItem.stock_quantity} disponibles`
                      : "Agotado"}
                  </Badge>
                )}
              </div>

              <Button
                className="w-full"
                disabled={selectedItem.track_stock && selectedItem.stock_quantity === 0}
                onClick={() => {
                  addToCart(selectedItem)
                  setSelectedItem(null)
                }}
                style={{ backgroundColor: storeColor }}
              >
                {selectedItem.track_stock && selectedItem.stock_quantity === 0
                  ? "Agotado"
                  : "Agregar al carrito 🛒"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cart drawer */}
      {showCart && cart.length > 0 && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">🛒 Tu carrito</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-4">
                {cart.map((ci) => (
                  <div key={ci.item.id} className="p-3 bg-gray-50 rounded-xl">
                    {/* Nombre y precio unitario */}
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium">{ci.item.name}</p>
                        <p className="text-sm text-gray-500">${ci.item.price.toFixed(2)} c/u</p>
                      </div>
                      {/* Botón eliminar item completo */}
                      <button
                        onClick={() => removeFromCart(ci.item.id)}
                        className="text-red-400 hover:text-red-600 ml-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Controles de cantidad */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Botón disminuir */}
                        <button
                          onClick={() => {
                            if (ci.quantity === 1) {
                              removeFromCart(ci.item.id)
                            } else {
                              setCart(prev =>
                                prev.map(c =>
                                  c.item.id === ci.item.id
                                    ? { ...c, quantity: c.quantity - 1 }
                                    : c
                                )
                              )
                            }
                          }}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100"
                        >
                          −
                        </button>

                        <span className="font-bold text-lg w-6 text-center">
                          {ci.quantity}
                        </span>

                        {/* Botón aumentar */}
                        <button
                          onClick={() => {
                            setCart(prev =>
                              prev.map(c =>
                                c.item.id === ci.item.id
                                  ? { ...c, quantity: c.quantity + 1 }
                                  : c
                              )
                            )
                          }}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal del item */}
                      <span className="font-bold text-indigo-600">
                        ${(ci.item.price * ci.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-indigo-600">${getCartTotal().toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="w-full"
                style={{ backgroundColor: "#25D366" }}
                onClick={() => {
                  setShowCart(false)
                  setShowPhoneModal(true)
                }}
              >
                📱 Pedir por WhatsApp
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Phone modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h2 className="text-xl font-bold mb-2">¿Cuál es tu número?</h2>
            <p className="text-sm text-gray-500 mb-4">
              Te redirigiremos a WhatsApp para completar tu pedido
            </p>
            <Input
              type="tel"
              placeholder="+58412XXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mb-4"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPhoneModal(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                style={{ backgroundColor: "#25D366" }}
                onClick={handleCheckout}
                disabled={!phone || checkoutLoading}
              >
                {checkoutLoading ? "..." : "Ir a WhatsApp"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating cart button */}
      {cart.length > 0 && !showCart && !showPhoneModal && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setShowCart(true)}
            className="relative w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center"
            style={{ backgroundColor: storeColor }}
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {getCartCount()}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}