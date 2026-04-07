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
  phone_number_id: string
  access_token: string
  business_account_id: string | null
  phone_number: string | null
  is_connected: boolean
  created_at: string
}

interface HealthStatus {
  configured: boolean
  connected: boolean
  status?: string
  app_name?: string
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
    phone_number_id: "",
    access_token: "",
    business_account_id: "",
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
            phone_number_id: data.config.phone_number_id || "",
            access_token: "", // No devolver el token completo por seguridad
            business_account_id: data.config.business_account_id || "",
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
          body: JSON.stringify({
            phone_number_id: formData.phone_number_id,
            access_token: formData.access_token,
            business_account_id: formData.business_account_id,
            phone_number: formData.phone_number
          })
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

      {/* Meta API Notice */}
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Meta WhatsApp Business API</AlertTitle>
        <AlertDescription className="text-blue-700">
          Usa la API oficial de Meta para WhatsApp. Necesitas una cuenta de Meta Business verificada.
          Sin QR, sin hosting - solo credenciales de API.
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
                health.connected ? (
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
                WhatsApp no está configurado. Introduce tus credenciales de Meta API.
              </p>
            ) : (
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Meta API: {health.status || "online"}
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  App: {health.app_name || "Vendly"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Configuration Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Credenciales de Meta API</CardTitle>
          <CardDescription>
            Configura tu número de WhatsApp Business con Meta API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone_number_id">Phone Number ID</Label>
            <Input
              id="phone_number_id"
              placeholder="123456789012345"
              value={formData.phone_number_id}
              onChange={(e) => setFormData({ ...formData, phone_number_id: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Lo encuentras en Meta Business → WhatsApp → API Setup
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="access_token">Access Token (System User)</Label>
            <Input
              id="access_token"
              type="password"
              placeholder="EAAB..."
              value={formData.access_token}
              onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Crea un System User en Meta Business → Generar Token con permisos: whatsapp_business_messaging
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_account_id">Business Account ID (opcional)</Label>
            <Input
              id="business_account_id"
              placeholder="987654321098765"
              value={formData.business_account_id}
              onChange={(e) => setFormData({ ...formData, business_account_id: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Requerido solo para gestionar plantillas
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
              Tu número registrado en WhatsApp Business (con código de país)
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
            Guía de Configuración Meta
          </CardTitle>
          <CardDescription>
            Sigue estos pasos para configurar WhatsApp Business API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm list-decimal list-inside">
            <li>
              Crea una cuenta en{" "}
              <a 
                href="https://business.facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Meta Business
              </a>
            </li>
            <li>
              Registra tu app en{" "}
              <a 
                href="https://developers.facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Meta for Developers
              </a>
            </li>
            <li>Añade el producto "WhatsApp" a tu app</li>
            <li>Verifica tu número de teléfono de WhatsApp Business</li>
            <li>En Meta Business → WhatsApp → API Setup, copia el "Phone Number ID"</li>
            <li>Crea un System User con permiso "whatsapp_business_messaging"</li>
            <li>Genera un Access Token permanente para el System User</li>
            <li>Pega los datos arriba y guarda</li>
          </ol>
          
          <Separator className="my-4" />
          
          <p className="text-xs text-muted-foreground">
            <strong>Costos:</strong> 1000 conversaciones/mes gratis, luego ~$0.005-0.08 por mensaje según país.
            <br />
            <strong>Webhook:</strong> Configura en Meta: https://vendly-backend-uuos.onrender.com/webhook/whatsapp
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
