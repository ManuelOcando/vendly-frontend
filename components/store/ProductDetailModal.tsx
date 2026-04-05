"use client"

import { useState, useEffect } from "react"
import { X, ChevronLeft, ChevronRight, ShoppingCart, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StoreItem } from "@/lib/store-service"

interface ProductDetailModalProps {
  item: StoreItem | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (item: StoreItem) => void
  isInCart: boolean
}

export default function ProductDetailModal({
  item,
  isOpen,
  onClose,
  onAddToCart,
  isInCart
}: ProductDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0)
      setImageError(false)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!item || !isOpen) return null

  const images = item.images && item.images.length > 0 ? item.images : []
  const hasMultipleImages = images.length > 1

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
    setImageError(false)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    setImageError(false)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 2
    }).format(price)
  }

  const getStockStatus = () => {
    if (!item.track_stock) return null
    
    if (item.stock_quantity === 0) {
      return { text: "Agotado", color: "destructive" }
    } else if (item.stock_quantity <= 3) {
      return { text: `¡Últimas ${item.stock_quantity} unidades!`, color: "secondary" }
    }
    return null
  }

  const stockStatus = getStockStatus()

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="relative bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
        style={{ 
          width: '100%',
          maxWidth: '1200px',
          height: 'auto',
          maxHeight: '90vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white shrink-0">
          <h2 className="text-xl font-semibold truncate pr-4">{item.name}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row overflow-hidden" style={{ minHeight: '500px' }}>
          {/* Image Section */}
          <div className="relative lg:w-[60%] w-full bg-gray-50 flex items-center justify-center p-6 min-h-[300px] lg:min-h-[500px]">
            {images.length > 0 && !imageError ? (
              <>
                <img
                  src={images[currentImageIndex]}
                  alt={item.name}
                  className="max-w-full max-h-[400px] lg:max-h-[600px] object-contain"
                  onError={() => setImageError(true)}
                />
                
                {/* Navigation Arrows */}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white shadow-lg rounded-full hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white shadow-lg rounded-full hover:bg-gray-50 transition-colors"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Image Indicators */}
                {hasMultipleImages && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentImageIndex ? "bg-gray-800" : "bg-gray-400"
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Image Counter */}
                {hasMultipleImages && (
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/70 text-white text-sm rounded-full">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <Package className="h-24 w-24 mb-4" />
                <p className="text-lg">Sin imagen</p>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:w-[40%] w-full p-6 lg:p-8 flex flex-col bg-white border-l overflow-y-auto">
            <div className="space-y-5">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {item.is_featured && (
                  <Badge variant="secondary">Destacado</Badge>
                )}
                {stockStatus && (
                  <Badge variant={stockStatus.color as any}>{stockStatus.text}</Badge>
                )}
                <Badge variant="outline">
                  {item.type === "product" ? "📦 Producto" : "🔧 Servicio"}
                </Badge>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">
                  {formatPrice(item.price)}
                </span>
                {item.currency !== 'VES' && (
                  <span className="text-gray-500">{item.currency}</span>
                )}
              </div>

              {/* Description */}
              {item.description && (
                <p className="text-gray-600 text-lg leading-relaxed">{item.description}</p>
              )}

              {/* Stock */}
              <div className="space-y-2 text-gray-500">
                {item.track_stock && (
                  <p className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Stock:</span> 
                    {item.stock_quantity} unidades
                  </p>
                )}
                {item.total_sold > 0 && (
                  <p className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Vendidos:</span> 
                    {item.total_sold}
                  </p>
                )}
              </div>
            </div>

            {/* Button - Always at bottom */}
            <div className="pt-8 mt-auto">
              <Button
                onClick={() => onAddToCart(item)}
                disabled={stockStatus?.text === "Agotado" || isInCart}
                className="w-full h-14 text-lg font-semibold"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {isInCart 
                  ? "✓ En carrito" 
                  : stockStatus?.text === "Agotado" 
                    ? "Agotado" 
                    : "Agregar al carrito"
                }
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
