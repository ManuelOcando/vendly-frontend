"use client"

import { useState } from "react"
import { Minus, Plus, Trash2, ShoppingBag, Phone, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { CartItem } from "@/lib/store-service"
import { createCart } from "@/lib/store-service"

interface CartManagerProps {
  cart: {
    items: CartItem[]
    total: number
  }
  onUpdateCart: (items: CartItem[]) => void
  onRemoveItem: (itemId: string) => void
  onUpdateQuantity: (itemId: string, quantity: number) => void
  storeSlug: string
}

export default function CartManager({
  cart,
  onUpdateCart,
  onRemoveItem,
  onUpdateQuantity,
  storeSlug
}: CartManagerProps) {
  const [customerPhone, setCustomerPhone] = useState("")
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const { toast } = useToast()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 2
    }).format(price)
  }

  const handleCheckout = async () => {
    if (!customerPhone.trim()) {
      toast({
        title: "Teléfono requerido",
        description: "Por favor ingresa tu número de teléfono para continuar",
        variant: "destructive"
      })
      return
    }

    if (!/^\+?\d{10,15}$/.test(customerPhone.replace(/\s/g, ''))) {
      toast({
        title: "Teléfono inválido",
        description: "Por favor ingresa un número de teléfono válido",
        variant: "destructive"
      })
      return
    }

    setIsCheckingOut(true)

    try {
      // Crear carrito en backend
      const createdCart = await createCart(storeSlug, cart.items)
      
      // Establecer teléfono del cliente
      // await setCustomerPhone(createdCart.id, customerPhone)

      // Generar deep link de WhatsApp
      const message = `Pedido:${createdCart.id}`
      const whatsappUrl = `https://wa.me/584140000000?text=${encodeURIComponent(message)}` // TODO: Obtener número real de la tienda

      // Redirigir a WhatsApp
      window.open(whatsappUrl, '_blank')

      toast({
        title: "¡Pedido creado!",
        description: "Serás redirigido a WhatsApp para confirmar tu pedido",
      })

      // Limpiar carrito local
      onUpdateCart([])

    } catch (error) {
      console.error('Error during checkout:', error)
      toast({
        title: "Error al procesar el pedido",
        description: "Por favor intenta nuevamente",
        variant: "destructive"
      })
    } finally {
      setIsCheckingOut(false)
    }
  }

  const getTotalItems = () => {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0)
  }

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ShoppingBag className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Tu carrito está vacío
        </h3>
        <p className="text-gray-500 mb-4">
          Agrega algunos productos para empezar
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Items del carrito */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          {cart.items.map((item) => (
            <div key={item.item_id} className="flex items-center space-x-4">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {item.name}
                </h4>
                <p className="text-sm text-gray-500">
                  {formatPrice(item.price)}
                </p>
              </div>

              {/* Controles de cantidad */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateQuantity(item.item_id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-3 w-3" />
                </Button>

                <span className="w-8 text-center text-sm font-medium">
                  {item.quantity}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateQuantity(item.item_id, item.quantity + 1)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              {/* Subtotal */}
              <div className="text-right min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>

              {/* Botón eliminar */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveItem(item.item_id)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen y checkout */}
      <div className="border-t pt-4 mt-4">
        <div className="space-y-4">
          {/* Teléfono del cliente */}
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono para contacto *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+58 414 123 4567"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Usaremos este número para contactarte sobre tu pedido
            </p>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(cart.total)}
            </span>
          </div>

          {/* Botón de checkout */}
          <Button
            onClick={handleCheckout}
            disabled={isCheckingOut || !customerPhone.trim()}
            className="w-full"
            size="lg"
          >
            {isCheckingOut ? (
              "Procesando..."
            ) : (
              <>
                <MessageCircle className="h-4 w-4 mr-2" />
                Pedir por WhatsApp
              </>
            )}
          </Button>

          {/* Información adicional */}
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>
              Serás redirigido a WhatsApp para confirmar tu pedido
            </p>
            <p>
              {getTotalItems()} producto{getTotalItems() !== 1 ? 's' : ''} en el carrito
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
