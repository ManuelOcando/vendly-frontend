"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Phone, QrCode, TrendingUp, Package, ShoppingCart, DollarSign, AlertTriangle } from "lucide-react"
import Link from "next/link"
import QRGenerator from "@/components/dashboard/QRGenerator"

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [whatsappStatus, setWhatsappStatus] = useState<any>(null)
  const [tenantSlug, setTenantSlug] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [hasTenant, setHasTenant] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
          // Cargar stats, WhatsApp status y tenant info en paralelo
          const [statsData, whatsappData, tenantData] = await Promise.all([
            api("/api/v1/dashboard/stats", {
              token: session.access_token,
            }),
            api("/api/v1/dashboard/whatsapp/status", {
              token: session.access_token,
            }),
            api("/api/v1/tenants/me", {
              token: session.access_token,
            }).catch(() => null)
          ])
          
          console.log("Tenant data received:", tenantData)
          setStats(statsData)
          setWhatsappStatus(whatsappData)
          if (tenantData?.slug) {
            console.log("Setting tenant slug:", tenantData.slug)
            setTenantSlug(tenantData.slug)
          } else {
            console.warn("No slug found in tenant data:", tenantData)
          }
        }
      } catch (e: any) {
        console.error("Error cargando dashboard:", e)
        if (e.message && e.message.includes("No tienes un negocio configurado")) {
          setHasTenant(false)
        }
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return <p className="text-gray-500">Cargando dashboard...</p>
  }

  // Mostrar mensaje si no tiene tenant configurado
  if (!hasTenant) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Configuración Incompleta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-700">
              No tienes un negocio configurado. Para poder agregar productos y recibir pedidos, 
              necesitas completar el registro de tu negocio.
            </p>
            <div className="flex gap-2">
              <Link href="/register">
                <Button>
                  Completar Registro del Negocio
                </Button>
              </Link>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const cards = [
    { 
      title: "Productos Activos", 
      value: stats?.total_products || 0, 
      icon: Package,
      color: "text-blue-600"
    },
    { 
      title: "Pedidos Totales", 
      value: stats?.total_orders || 0, 
      icon: ShoppingCart,
      color: "text-green-600"
    },
    { 
      title: "Pedidos Pendientes", 
      value: stats?.pending_orders || 0, 
      icon: AlertTriangle,
      color: "text-yellow-600"
    },
    { 
      title: "Ingresos Totales", 
      value: `$${(stats?.total_revenue || 0).toFixed(2)}`, 
      icon: DollarSign,
      color: "text-purple-600"
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/dashboard/orders">
            <Button variant="outline">Ver Pedidos</Button>
          </Link>
          <Link href="/dashboard/products">
            <Button variant="outline">Gestionar Productos</Button>
          </Link>
        </div>
      </div>

      {/* Estado de WhatsApp */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Estado de WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          {whatsappStatus?.connected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Conectado
                </Badge>
                <span className="text-sm text-gray-600">
                  Número: {whatsappStatus.active_connection?.phone_number}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Tu bot está activo y recibiendo mensajes.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">
                  Desconectado
                </Badge>
                <span className="text-sm text-gray-600">
                  No hay conexión activa
                </span>
              </div>
              <div className="flex gap-2">
                <Button size="sm">
                  <QrCode className="h-4 w-4 mr-2" />
                  Conectar WhatsApp
                </Button>
                <Button variant="outline" size="sm">
                  Ver Instrucciones
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Conecta tu número de WhatsApp para empezar a recibir pedidos automáticos.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alertas de stock bajo */}
      {stats?.low_stock_items && stats.low_stock_items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Stock Bajo - Acción Requerida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.low_stock_items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <p className="text-sm text-gray-600">
                      Quedan {item.stock_quantity} unidades
                    </p>
                  </div>
                  <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                    Bajo
                  </Badge>
                </div>
              ))}
              <div className="pt-2">
                <Link href="/dashboard/products">
                  <Button variant="outline" size="sm">
                    Actualizar Stock
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Acciones rápidas y QR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link 
                  href={`/store/${tenantSlug || 'demo'}`} 
                  target="_blank"
                  className={!tenantSlug ? 'pointer-events-none' : ''}
                >
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    disabled={!tenantSlug}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    {tenantSlug ? 'Ver mi Tienda' : 'Cargando tienda...'}
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Ver Reportes
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  Configurar Bot
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          {tenantSlug && (
            <QRGenerator 
              storeUrl={`https://vendly-frontend.vercel.app/store/${tenantSlug}`}
              storeName={stats?.store_name || "Mi Tienda"}
            />
          )}
        </div>
      </div>
    </div>
  )
}