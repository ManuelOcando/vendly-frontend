"use client"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Copy, ExternalLink } from "lucide-react"

interface QRGeneratorProps {
  storeUrl: string
  storeName: string
}

export default function QRGenerator({ storeUrl, storeName }: QRGeneratorProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleDownloadQR = () => {
    const svg = document.getElementById("store-qr-code")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      
      const pngFile = canvas.toDataURL("image/png")
      const downloadLink = document.createElement("a")
      downloadLink.download = `${storeName.replace(/\s+/g, "_")}_qr.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Compartir Tienda
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code */}
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-white rounded-lg border">
            <QRCodeSVG
              id="store-qr-code"
              value={storeUrl}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
          
          <p className="text-sm text-gray-600 text-center">
            Escanea este código para visitar tu tienda
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDownloadQR}
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar QR
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCopyLink}
            >
              <Copy className="h-4 w-4 mr-2" />
              {copied ? "¡Copiado!" : "Copiar Link"}
            </Button>
          </div>
          
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button variant="secondary" className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Tienda en Vivo
            </Button>
          </a>
        </div>

        {/* Store URL */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">URL de tu tienda:</p>
          <p className="text-sm font-medium text-gray-700 break-all">
            {storeUrl}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
