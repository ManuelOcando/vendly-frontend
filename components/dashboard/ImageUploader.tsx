"use client"

import { useState, useCallback } from "react"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface ImageUploaderProps {
  productId: string
  existingImages?: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
}

export default function ImageUploader({
  productId,
  existingImages = [],
  onImagesChange,
  maxImages = 5
}: ImageUploaderProps) {
  const [images, setImages] = useState<string[]>(existingImages)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    await uploadFiles(files)
  }, [images])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    const files = Array.from(e.target.files)
    await uploadFiles(files)
    e.target.value = "" // Reset input
  }

  const uploadFiles = async (files: File[]) => {
    const remainingSlots = maxImages - images.length
    if (remainingSlots <= 0) {
      alert(`Máximo ${maxImages} imágenes permitidas`)
      return
    }

    const filesToUpload = files.slice(0, remainingSlots)
    const validFiles = filesToUpload.filter(file => {
      const isValid = file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024
      if (!isValid) {
        console.warn(`Archivo ignorado: ${file.name} (debe ser imagen < 5MB)`)
      }
      return isValid
    })

    if (validFiles.length === 0) return

    setUploading(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        throw new Error("No hay sesión activa. Inicia sesión nuevamente.")
      }

      const formData = new FormData()
      validFiles.forEach(file => formData.append("files", file))
      formData.append("product_id", productId)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/upload/images`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Error desconocido" }))
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const newImages = [...images, ...data.urls]
      setImages(newImages)
      onImagesChange(newImages)

      if (data.errors?.length > 0) {
        console.warn("Errores de upload:", data.errors)
      }
    } catch (error: any) {
      console.error("Error uploading images:", error)
      alert(`Error subiendo imágenes: ${error.message || "Intenta de nuevo"}`)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = async (index: number) => {
    const imageToRemove = images[index]
    
    // TODO: Call delete endpoint to remove from storage
    // For now, just remove from state
    
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    onImagesChange(newImages)
  }

  return (
    <div className="space-y-4">
      {/* Existing Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((url, index) => (
            <div key={index} className="relative aspect-square group">
              <img
                src={url}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/70 text-white text-xs rounded">
                  Principal
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload"
            disabled={uploading}
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                <p className="text-sm text-gray-600">Subiendo...</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Arrastra imágenes o haz clic para seleccionar
                </p>
                <p className="text-xs text-gray-400">
                  JPG, PNG, WebP. Máx 5MB cada una
                </p>
                <p className="text-xs text-gray-400">
                  {images.length} / {maxImages} imágenes
                </p>
              </>
            )}
          </label>
        </div>
      )}
    </div>
  )
}
