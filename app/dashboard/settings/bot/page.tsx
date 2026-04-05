"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Smartphone, CheckCircle, XCircle, AlertCircle, ExternalLink, Info } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface WhatsAppConfig {
  id: string
  evolution_api_url: string
  evolution_api_key: string
  instance_name: string
  phone_number: string | null
  is_connected: boolean
  created_at: string
}

interface HealthStatus {
  configured: boolean
  bot_status: string
  needs_qr: boolean
  evolution_api?: { status: string }
  whatsapp_connection?: { state: string }
}

export default function WhatsAppSettingsPage() {
  const [config, setConfig] = useState<WhatsAppConfig | null>(null)
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    evolution_api_url: "",
    evolution_api_key: "",
    instance_name: "vendly-bot",
    phone_number: ""
  })

  useEffect(() => {
    loadWhatsAppConfig()
  }, [])

  async function loadWhatsAppConfig() {
    try {
      setIsLoading(true)
      
      // Get current session
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setMessage({ type: "error", text: "No hay sesión activa" })
        return
      }

      // Load config from backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/whatsapp/config`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setConfig(data.config)
        setHealth(data.health)
        
        if (data.config) {
          setFormData({
            evolution_api_url: data.config.evolution_api_url,
            evolution_api_key: data.config.evolution_api_key,
            instance_name: data.config.instance_name,
            phone_number: data.config.phone_number || ""
          })
        }
      }
    } catch (error) {
      console.error("Error loading WhatsApp config:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function saveConfig() {
    try {
      setIsSaving(true)
      setMessage(null)

      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/whatsapp/config`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`
          },
          body: JSON.stringify(formData)
        }
      )

      if (response.ok) {
        setMessage({ type: "success", text: "Configuración guardada correctamente" })
        await loadWhatsAppConfig()
      } else {
        const error = await response.json()
        setMessage({ type: "error", text: error.detail || "Error al guardar" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error de conexión" })
    } finally {
      setIsSaving(false)
    }
  }

  async function getQRCode() {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/whatsapp/qr`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setQrCode(data.qr_base64)
      } else {
        setMessage({ type: "error", text: "No se pudo obtener el QR. Verifica que el bot esté configurado." })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error obteniendo QR" })
    }
  }

  if (isLoading) {
    return <div className="p-8">Cargando...</div>
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Smartphone className="h-8 w-8" />
          Configuración de WhatsApp Bot
        </h1>
        <p className="text-muted-foreground mt-2">
          Configura tu propio bot de WhatsApp para atender a tus clientes automáticamente
        </p>
      </div>

      {/* Railway Free Notice */}
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Plan Gratuito de Railway</AlertTitle>
        <AlertDescription className="text-blue-700">
          Cada cliente debe crear su propia cuenta en Railway Free (500 horas/mes ≈ 16 horas/día).
          Esto cubre horario comercial. Para 24/7, considera el plan Starter ($5/mes).
        </AlertDescription>
      </Alert>

      {message && (
        <Alert 
          className={`mb-6 ${message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={message.type === "success" ? "text-green-700" : "text-red-700"}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Status Card */}
      {health && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Estado del Bot
              {health.configured ? (
                health.bot_status === "connected" ? (
                  <Badge className="bg-green-100 text-green-800">Conectado</Badge>
                ) : (
                  <Badge variant="secondary">Desconectado</Badge>
                )
              ) : (
                <Badge variant="outline">No Configurado</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!health.configured ? (
              <p className="text-muted-foreground">
                WhatsApp no está configurado. Sigue la guía de abajo para configurar tu bot.
              </p>
            ) : health.needs_qr ? (
              <div className="space-y-4">
                <p className="text-amber-600">
                  El bot está online pero necesita autenticación. Escanea el QR con WhatsApp.
                </p>
                <Button onClick={getQRCode} variant="outline">
                  Obtener Código QR
                </Button>
                {qrCode && (
                  <div className="mt-4 p-4 bg-white rounded-lg inline-block">
                    <img 
                      src={`data:image/png;base64,${qrCode}`} 
                      alt="WhatsApp QR Code"
                      className="w-64 h-64"
                    />
                    <p className="text-sm text-center text-muted-foreground mt-2">
                      Escanea con WhatsApp → Ajustes → Dispositivos vinculados
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Evolution API: {health.evolution_api?.status || "unknown"}
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  WhatsApp: {health.whatsapp_connection?.state || "unknown"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Configuration Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configuración del Bot</CardTitle>
          <CardDescription>
            Introduce los datos de tu instancia de Evolution API en Railway
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL del Bot (Railway)</Label>
            <Input
              id="url"
              placeholder="https://tu-bot.up.railway.app"
              value={formData.evolution_api_url}
              onChange={(e) => setFormData({ ...formData, evolution_api_url: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              La URL que Railway te proporcionó al hacer deploy
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apikey">API Key</Label>
            <Input
              id="apikey"
              type="password"
              placeholder="tu-api-key-segura"
              value={formData.evolution_api_key}
              onChange={(e) => setFormData({ ...formData, evolution_api_key: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              La AUTHENTICATION_API_KEY que configuraste en Railway
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instance">Nombre de Instancia</Label>
            <Input
              id="instance"
              value={formData.instance_name}
              onChange={(e) => setFormData({ ...formData, instance_name: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Debe coincidir con el nombre en tu configuración de Railway
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Número de WhatsApp</Label>
            <Input
              id="phone"
              placeholder="584123456789"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Tu número de WhatsApp con código de país (58 para Venezuela)
            </p>
          </div>

          <Button 
            onClick={saveConfig} 
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? "Guardando..." : "Guardar Configuración"}
          </Button>
        </CardContent>
      </Card>

      {/* Setup Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Guía de Configuración
          </CardTitle>
          <CardDescription>
            Sigue estos pasos para configurar tu bot en Railway
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm list-decimal list-inside">
            <li>
              Crea una cuenta gratuita en{" "}
              <a 
                href="https://railway.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Railway
              </a>
            </li>
            <li>Haz fork del repositorio{" "}
              <a 
                href="https://github.com/EvolutionAPI/evolution-api" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Evolution API
              </a>
            </li>
            <li>En Railway: New Project → Deploy from GitHub → Selecciona tu fork</li>
            <li>Configura las variables de entorno (ver guía completa)</li>
            <li>Añade un volumen persistente en /data</li>
            <li>Copia la URL de Railway y pégala arriba en "URL del Bot"</li>
            <li>Genera una API key segura y guárdala en Railway y aquí</li>
            <li>Haz clic en "Obtener Código QR" y escanéalo con WhatsApp</li>
          </ol>
          
          <Separator className="my-4" />
          
          <p className="text-xs text-muted-foreground">
            Guía completa disponible en:{" "}
            <a 
              href="/docs/whatsapp-setup.md" 
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              whatsapp-setup.md
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
