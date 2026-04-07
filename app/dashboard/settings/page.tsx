"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function SettingsPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/dashboard/settings/bot")
  }, [router])
  
  return (
    <div className="p-8">
      <p>Redirigiendo a configuración de bot...</p>
    </div>
  )
}
