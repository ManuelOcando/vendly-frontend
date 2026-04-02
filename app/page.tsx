import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-pink-50">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
          Vendly
        </h1>

        <p className="text-xl text-gray-600 max-w-md mx-auto">
          Tu asistente de ventas por WhatsApp.
          Automatiza tu negocio con inteligencia artificial.
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              Empezar Gratis
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Iniciar Sesión
            </Button>
          </Link>
        </div>

        <p className="text-sm text-gray-400">
          7 días de prueba gratis. Sin tarjeta de crédito.
        </p>
      </div>
    </div>
  )
}