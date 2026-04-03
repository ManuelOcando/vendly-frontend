"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const STATUS_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  pending_payment:    { label: "Esperando pago",     color: "bg-yellow-100 text-yellow-800", emoji: "⏳" },
  payment_submitted:  { label: "Comprobante enviado", color: "bg-blue-100 text-blue-800",    emoji: "📤" },
  payment_confirmed:  { label: "Pago confirmado",     color: "bg-green-100 text-green-800",  emoji: "✅" },
  processing:         { label: "En proceso",          color: "bg-purple-100 text-purple-800", emoji: "🔄" },
  ready:              { label: "Listo",               color: "bg-indigo-100 text-indigo-800", emoji: "📦" },
  delivered:          { label: "Entregado",           color: "bg-gray-100 text-gray-800",    emoji: "🎉" },
  cancelled:          { label: "Cancelado",           color: "bg-red-100 text-red-800",      emoji: "❌" },
}

const STATUS_FLOW: Record<string, string> = {
  pending_payment:   "payment_confirmed",
  payment_submitted: "payment_confirmed",
  payment_confirmed: "processing",
  processing:        "ready",
  ready:             "delivered",
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const [filter, setFilter] = useState("all")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      setToken(session.access_token)

      const data = await api("/api/v1/orders", {
        token: session.access_token,
      })
      setOrders(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(orderId: string, newStatus: string) {
    if (!token) return
    setUpdatingId(orderId)
    try {
      await api(`/api/v1/orders/${orderId}/status`, {
        method: "PUT",
        token,
        body: JSON.stringify({ status: newStatus }),
      })
      await loadOrders()
    } catch (e: any) {
      alert("Error: " + e.message)
    } finally {
      setUpdatingId(null)
    }
  }

  async function cancelOrder(orderId: string) {
    if (!confirm("¿Cancelar este pedido?")) return
    await updateStatus(orderId, "cancelled")
  }

  const filters = [
    { key: "all",              label: "Todos" },
    { key: "pending_payment",  label: "⏳ Pendientes" },
    { key: "payment_submitted",label: "📤 Por confirmar" },
    { key: "payment_confirmed",label: "✅ Confirmados" },
    { key: "processing",       label: "🔄 En proceso" },
    { key: "delivered",        label: "🎉 Entregados" },
  ]

  const filteredOrders = filter === "all"
    ? orders
    : orders.filter(o => o.status === filter)

  if (loading) return <p className="text-gray-500">Cargando pedidos...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <Button variant="outline" onClick={loadOrders} size="sm">
          🔄 Actualizar
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.key
                ? "bg-indigo-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-500 text-lg">No hay pedidos aquí</p>
            <p className="text-gray-400 text-sm mt-2">
              Los pedidos aparecerán cuando los clientes compren
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending_payment
            const nextStatus = STATUS_FLOW[order.status]
            const nextStatusInfo = nextStatus ? STATUS_CONFIG[nextStatus] : null
            const isUpdating = updatingId === order.id

            return (
              <Card key={order.id}>
                <CardContent className="p-4">
                  {/* Header del pedido */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">
                          #{order.order_number}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                          {statusInfo.emoji} {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {new Date(order.created_at).toLocaleString("es-VE", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span className="text-xl font-bold text-indigo-600">
                      ${parseFloat(order.total || 0).toFixed(2)}
                    </span>
                  </div>

                  {/* Info del cliente */}
                  {(order.customer_name || order.customer_phone) && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm font-medium text-gray-700">
                        👤 {order.customer_name || "Cliente"}
                      </p>
                      {order.customer_phone && (
                        <a
                          href={`https://wa.me/${order.customer_phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-green-600 hover:underline"
                        >
                          📱 {order.customer_phone}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Comprobante de pago */}
                  {order.payment_proof_url && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        📎 Comprobante de pago:
                      </p>
                      <a
                        href={order.payment_proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:underline"
                      >
                        Ver comprobante →
                      </a>
                    </div>
                  )}

                  {/* Acciones */}
                  {order.status !== "delivered" && order.status !== "cancelled" && (
                    <div className="flex gap-2 mt-3 pt-3 border-t">
                      {/* Botón acción principal */}
                      {nextStatusInfo && (
                        <Button
                          size="sm"
                          className="flex-1"
                          disabled={isUpdating}
                          onClick={() => updateStatus(order.id, nextStatus)}
                        >
                          {isUpdating ? "..." : `${nextStatusInfo.emoji} ${nextStatusInfo.label}`}
                        </Button>
                      )}

                      {/* WhatsApp al cliente */}
                      {order.customer_phone && (
                        <a
                          href={`https://wa.me/${order.customer_phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" variant="outline">
                            💬 Escribir
                          </Button>
                        </a>
                      )}

                      {/* Cancelar */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500 border-red-200 hover:bg-red-50"
                        disabled={isUpdating}
                        onClick={() => cancelOrder(order.id)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}