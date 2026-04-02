"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [tenant, setTenant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { signOut } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
        return
      }

      setUser(session.user)

      // Buscar tenant
      const { data: tenants } = await supabase
        .from("tenants")
        .select("*")
        .eq("owner_id", session.user.id)

      if (tenants && tenants.length > 0) {
        setTenant(tenants[0])
      } else {
        router.push("/register")
        return
      }

      setLoading(false)
    }

    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  const menuItems = [
    { href: "/dashboard", label: "📊 Resumen", active: true },
    { href: "/dashboard/products", label: "📦 Productos" },
    { href: "/dashboard/orders", label: "📋 Pedidos" },
    { href: "/dashboard/customers", label: "👥 Clientes" },
    { href: "/dashboard/settings", label: "⚙️ Configuración" },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
            Vendly
          </h1>
          <p className="text-sm text-gray-500 mt-1">{tenant?.name}</p>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t pt-4 mt-4">
          <p className="text-xs text-gray-400 mb-2">{user?.email}</p>
          <Button variant="outline" size="sm" onClick={signOut} className="w-full">
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 p-8">
        {children}
      </main>
    </div>
  )
}