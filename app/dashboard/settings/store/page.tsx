"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Save, CheckCircle } from "lucide-react"

interface Tenant {
  id: string
  name: string
  slug: string
  description?: string
  logo_url?: string
  primary_color?: string
  secondary_color?: string
  whatsapp_number?: string
  currency: string
  address?: string
  social_links?: Record<string, string>
}

export default function StoreSettingsPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [token, setToken] = useState<string>("")

  // Form fields
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    logo_url: "",
    primary_color: "#4F46E5",
    secondary_color: "#10B981",
    whatsapp_number: "",
    currency: "USD",
    address: "",
  })

  useEffect(() => {
    loadTenant()
  }, [])

  async function loadTenant() {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      setToken(session.access_token)
      const data = await api("/api/v1/tenants/me", {
        token: session.access_token,
      })
      setTenant(data)
      setForm({
        name: data.name || "",
        slug: data.slug || "",
        description: data.description || "",
        logo_url: data.logo_url || "",
        primary_color: data.primary_color || "#4F46E5",
        secondary_color: data.secondary_color || "#10B981",
        whatsapp_number: data.whatsapp_number || "",
        currency: data.currency || "USD",
        address: data.address || "",
      })
    } catch (e) {
      console.error("Error cargando tenant:", e)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!token) return
    setSaving(true)
    setSaved(false)
    
    try {
      await api("/api/v1/tenants/me", {
        method: "PUT",
        token,
        body: JSON.stringify(form),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: any) {
      alert("Error al guardar: " + e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-gray-500">Cargando configuración...</p>
  }

  const storeUrl = tenant ? `https://vendly-frontend.vercel.app/store/${tenant.slug}` : ""

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Configuración de la Tienda</h1>
          <p className="text-gray-500">Personaliza la apariencia y datos de tu negocio</p>
        </div>
        <div className="flex gap-2">
          {saved && (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Guardado
            </Badge>
          )}
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>

      {tenant && (
        <Card className="bg-indigo-50 border-indigo-200">
          <CardContent className="py-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">URL pública de tu tienda:</p>
                <p className="font-medium text-indigo-700">{storeUrl}</p>
              </div>
              <a href={storeUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Tienda
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
          <TabsTrigger value="contact">Contacto</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Negocio *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Mi Tienda Online"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL) *</Label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">/store/</span>
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={e => setForm({ ...form, slug: e.target.value })}
                    placeholder="mi-tienda"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Este será el URL público de tu tienda. Solo letras, números y guiones.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Breve descripción de tu negocio"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Moneda</Label>
                <select
                  id="currency"
                  value={form.currency}
                  onChange={e => setForm({ ...form, currency: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="USD">USD - Dólar Americano</option>
                  <option value="VES">VES - Bolívar Venezolano</option>
                  <option value="COP">COP - Peso Colombiano</option>
                  <option value="ARS">ARS - Peso Argentino</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Apariencia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo_url">URL del Logo</Label>
                <Input
                  id="logo_url"
                  value={form.logo_url}
                  onChange={e => setForm({ ...form, logo_url: e.target.value })}
                  placeholder="https://ejemplo.com/logo.png"
                />
                <p className="text-xs text-gray-500">
                  Sube tu logo a un servicio como Imgur o Cloudinary y pega el URL aquí.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Color Primario</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="primary_color"
                      value={form.primary_color}
                      onChange={e => setForm({ ...form, primary_color: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={form.primary_color}
                      onChange={e => setForm({ ...form, primary_color: e.target.value })}
                      placeholder="#4F46E5"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Color Secundario</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="secondary_color"
                      value={form.secondary_color}
                      onChange={e => setForm({ ...form, secondary_color: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={form.secondary_color}
                      onChange={e => setForm({ ...form, secondary_color: e.target.value })}
                      placeholder="#10B981"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-4 p-4 border rounded-lg">
                <p className="text-sm font-medium mb-3">Vista Previa:</p>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 rounded text-white"
                    style={{ backgroundColor: form.primary_color }}
                  >
                    Botón Primario
                  </button>
                  <button
                    className="px-4 py-2 rounded text-white"
                    style={{ backgroundColor: form.secondary_color }}
                  >
                    Botón Secundario
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp_number">Número de WhatsApp *</Label>
                <Input
                  id="whatsapp_number"
                  value={form.whatsapp_number}
                  onChange={e => setForm({ ...form, whatsapp_number: e.target.value })}
                  placeholder="+584141234567"
                />
                <p className="text-xs text-gray-500">
                  Este número recibirá los pedidos de los clientes.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  placeholder="Dirección física de tu negocio"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
