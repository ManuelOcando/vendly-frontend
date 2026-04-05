"use client"

import { useState } from "react"
import { X, ChevronLeft, ChevronRight, ShoppingCart, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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

  if (!item) return null

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center justify-between text-xl">
            <span>{item.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-[1.2fr_1fr] gap-0 overflow-hidden">
          {/* Image Carousel */}
          <div className="relative bg-gray-100 md:h-[70vh] h-[50vh]">
            {images.length > 0 && !imageError ? (
              <>
                <img
                  src={images[currentImageIndex]}
                  alt={`${item.name} - Imagen ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
                
                {/* Navigation Arrows */}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Image Indicators */}
                {hasMultipleImages && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Image Counter */}
                {hasMultipleImages && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6 p-6 overflow-y-auto max-h-[70vh]">
            <div className="flex items-center gap-2">
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

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(item.price)}
              </span>
              {item.currency !== 'VES' && (
                <span className="text-sm text-gray-500">{item.currency}</span>
              )}
            </div>

            {item.description && (
              <p className="text-gray-600">{item.description}</p>
            )}

            <div className="space-y-2 text-sm text-gray-500">
              {item.track_stock && (
                <p>Stock disponible: {item.stock_quantity} unidades</p>
              )}
              {item.total_sold > 0 && (
                <p>{item.total_sold} vendido{item.total_sold !== 1 ? 's' : ''}</p>
              )}
            </div>

            <Button
              onClick={() => onAddToCart(item)}
              disabled={stockStatus?.text === "Agotado" || isInCart}
              className="w-full py-6 text-lg"
              size="lg"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {isInCart 
                ? "En el carrito" 
                : stockStatus?.text === "Agotado" 
                  ? "Agotado" 
                  : "Agregar al carrito"
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
