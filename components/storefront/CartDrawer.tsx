"use client"

import { useState } from "react"
import { useCart } from "./CartContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Minus, Plus, Trash2, ShoppingCart, User, Phone, MapPin } from "lucide-react"

interface CartDrawerProps {
  storeWhatsApp?: string
  storeName?: string
}

export default function CartDrawer({ storeWhatsApp, storeName }: CartDrawerProps) {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, total, itemCount, clearCart } = useCart()
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [showCheckout, setShowCheckout] = useState(false)

  const generateWhatsAppMessage = () => {
    const itemsList = items.map(item => 
      `• ${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}`
    ).join("\n")
    
    return `¡Hola! Quiero hacer un pedido de ${storeName || "su tienda"}:

${itemsList}

*Total: $${total.toFixed(2)}*

Mis datos:
👤 ${customerName}
📱 ${customerPhone}
📍 ${customerAddress}`
  }

  const handleCheckout = () => {
    if (!storeWhatsApp) {
      alert("Esta tienda no tiene WhatsApp configurado")
      return
    }
    
    const message = encodeURIComponent(generateWhatsAppMessage())
    const phone = storeWhatsApp.replace(/\D/g, "")
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank")
    
    // Clear cart after checkout
    clearCart()
    setIsOpen(false)
    setShowCheckout(false)
    setCustomerName("")
    setCustomerPhone("")
    setCustomerAddress("")
  }

  const canCheckout = customerName.trim() && customerPhone.trim()

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {showCheckout ? "Finalizar Pedido" : `Tu Carrito (${itemCount})`}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 && !showCheckout ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Tu carrito está vacío</p>
            </div>
          ) : showCheckout ? (
            <div className="space-y-4">
              {/* Resumen del pedido */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium mb-2">Resumen del pedido:</p>
                <div className="space-y-1 text-sm">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.quantity}x {item.name}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-2 pt-2 font-bold flex justify-between">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Datos del cliente */}
              <div className="space-y-3">
                <p className="font-medium">Tus datos:</p>
                
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tu nombre completo *"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tu número de teléfono *"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tu dirección de entrega"
                    value={customerAddress}
                    onChange={e => setCustomerAddress(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-indigo-600 font-bold">
                      ${item.price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <SheetFooter className="border-t pt-4">
          <div className="w-full space-y-3">
            {showCheckout ? (
              <>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  size="lg"
                  disabled={!canCheckout || items.length === 0}
                  onClick={handleCheckout}
                >
                  💬 Enviar pedido por WhatsApp
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowCheckout(false)}
                >
                  ← Volver al carrito
                </Button>
              </>
            ) : (
              <>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <Button 
                  className="w-full" 
                  size="lg"
                  disabled={items.length === 0}
                  onClick={() => setShowCheckout(true)}
                >
                  Finalizar Pedido
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsOpen(false)}
                >
                  Seguir Comprando
                </Button>
              </>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
