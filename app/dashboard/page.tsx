"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
          const data = await api("/api/v1/dashboard/stats", {
            token: session.access_token,
          })
          setStats(data)
        }
      } catch (e) {
        console.error("Error cargando stats:", e)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return <p className="text-gray-500">Cargando estadísticas...</p>
  }

  const cards = [
    { title: "Productos Activos", value: stats?.total_products || 0, icon: "📦" },
    { title: "Pedidos Totales", value: stats?.total_orders || 0, icon: "📋" },
    { title: "Pedidos Pendientes", value: stats?.pending_orders || 0, icon: "⏳" },
    { title: "Ingresos Totales", value: `$${(stats?.total_revenue || 0).toFixed(2)}`, icon: "💰" },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {card.title}
              </CardTitle>
              <span className="text-2xl">{card.icon}</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats?.low_stock_items && stats.low_stock_items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">⚠️ Stock Bajo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.low_stock_items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                  <span>{item.name}</span>
                  <span className="text-sm font-medium text-yellow-700">
                    {item.stock_quantity} unidades
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}