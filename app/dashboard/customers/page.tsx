"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface Customer {
  name: string
  phone: string
  email?: string
  total_orders: number
  total_spent: number
  first_order_date?: string
  last_order_date?: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filtered, setFiltered] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    loadCustomers()
  }, [])

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(customers)
      return
    }
    const term = search.toLowerCase()
    setFiltered(
      customers.filter(
        c =>
          (c.name || "").toLowerCase().includes(term) ||
          c.phone.toLowerCase().includes(term) ||
          (c.email || "").toLowerCase().includes(term)
      )
    )
  }, [search, customers])

  async function loadCustomers() {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const data = await api("/api/v1/customers", {
        token: session.access_token,
      })
      setCustomers(data)
      setFiltered(data)
    } catch (e) {
      console.error("Error cargando clientes:", e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando clientes...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Button variant="outline" onClick={loadCustomers} size="sm">
          🔄 Actualizar
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por nombre, teléfono o email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-gray-500 text-lg">No hay clientes</p>
            <p className="text-gray-400 text-sm mt-2">
              Los clientes aparecerán cuando realicen pedidos
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(customer => (
            <Card key={customer.phone}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {customer.name || "Cliente"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">📱 {customer.phone}</p>
                {customer.email && (
                  <p className="text-sm text-gray-600">✉️ {customer.email}</p>
                )}
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm text-gray-500">
                    🛒 {customer.total_orders} órdenes
                  </span>
                  <span className="text-sm font-medium">
                    ${customer.total_spent.toFixed(2)}
                  </span>
                </div>
                <a
                  href={`https://wa.me/${customer.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button size="sm" className="w-full">
                    💬 Escribir por WhatsApp
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
