"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { api } from "@/lib/api"
import { mockItems } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

export default function ProductsPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [token, setToken] = useState<string | null>(null)
  const [hasTenant, setHasTenant] = useState(true)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("")
  const [type, setType] = useState("product")

  useEffect(() => {
    loadItems()
  }, [])

  async function loadItems() {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setToken(session.access_token)
        const data = await api("/api/v1/items", { token: session.access_token })
        setItems(data)
      }
    } catch (e: any) {
      console.error("Error:", e)
      if (e.message && e.message.includes("No tienes un negocio configurado")) {
        setHasTenant(false)
      }
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setName("")
    setDescription("")
    setPrice("")
    setStock("")
    setType("product")
    setEditingItem(null)
    setShowForm(false)
  }

  function startEdit(item: any) {
    setName(item.name)
    setDescription(item.description || "")
    setPrice(item.price.toString())
    setStock((item.stock_quantity || 0).toString())
    setType(item.type)
    setEditingItem(item)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Operación real en producción
    if (!token) return

    const body = {
      name,
      description,
      price: parseFloat(price),
      stock_quantity: parseInt(stock) || 0,
      type,
      currency: "USD",
    }

    try {
      if (editingItem) {
        const updatedItem = await api(`/api/v1/items/${editingItem.id}`, {
          method: "PUT",
          token,
          body: JSON.stringify(body),
        })
        setItems(items.map(item => item.id === editingItem.id ? updatedItem : item))
      } else {
        const createdItem = await api("/api/v1/items", {
          method: "POST",
          token,
          body: JSON.stringify(body),
        })
        setItems([...items, createdItem])
      }
      resetForm()
    } catch (e: any) {
      alert("Error: " + e.message)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este producto?")) return
    
    // Operación real en producción
    if (!token) return

    try {
      await api(`/api/v1/items/${id}`, { method: "DELETE", token })
      setItems(items.filter(item => item.id !== id))
    } catch (e: any) {
      alert("Error: " + e.message)
    }
  }

  if (loading) return <p className="text-gray-500">Cargando productos...</p>

  // Mostrar mensaje si no tiene tenant configurado
  if (!hasTenant) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              ⚠️ Configuración Incompleta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-700">
              No tienes un negocio configurado. Para poder agregar productos, 
              necesitas completar el registro de tu negocio primero.
            </p>
            <div className="flex gap-2">
              <a href="/register">
                <Button>
                  Completar Registro del Negocio
                </Button>
              </a>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button onClick={() => { resetForm(); setShowForm(!showForm) }}>
          {showForm ? "Cancelar" : "+ Nuevo Producto"}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingItem ? "Editar Producto" : "Nuevo Producto"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Hamburguesa Clásica" required />
                </div>
                <div className="space-y-2">
                  <Label>Precio (USD)</Label>
                  <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="8.50" required />
                </div>
                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="100" />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border rounded-md p-2">
                    <option value="product">Producto</option>
                    <option value="service">Servicio</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe tu producto..." />
              </div>
              <Button type="submit">
                {editingItem ? "Guardar Cambios" : "Crear Producto"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {items.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 text-lg">No tienes productos aún</p>
            <p className="text-gray-400 text-sm mt-2">Crea tu primer producto para empezar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{item.name}</h3>
                    <Badge variant={item.is_active ? "default" : "secondary"}>
                      {item.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                    <Badge variant="outline">{item.type === "product" ? "📦 Producto" : "🔧 Servicio"}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="font-medium text-green-600">${item.price}</span>
                    {item.track_stock && (
                      <span className={item.stock_quantity <= item.low_stock_threshold ? "text-yellow-600" : "text-gray-500"}>
                        Stock: {item.stock_quantity}
                      </span>
                    )}
                    <span className="text-gray-400">Vendidos: {item.total_sold}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => startEdit(item)}>
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleDelete(item.id)}>
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
