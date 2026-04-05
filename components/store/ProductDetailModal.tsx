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
      <DialogContent className="max-w-6xl w-[95vw] max-h-[85vh] overflow-hidden p-0">
        <DialogHeader className="px-8 py-5 border-b shrink-0">
          <DialogTitle className="text-2xl font-semibold">{item.name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row h-[calc(85vh-80px)]">
          {/* Image Section - 50% */}
          <div className="relative md:w-1/2 w-full bg-gray-50 flex items-center justify-center p-8">
            {images.length > 0 && !imageError ? (
              <>
                <img
                  src={images[currentImageIndex]}
                  alt={item.name}
                  className="max-w-full max-h-[50vh] md:max-h-[60vh] object-contain rounded-lg"
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

          {/* Product Info - 50% */}
          <div className="md:w-1/2 w-full p-8 flex flex-col justify-between bg-white">
            <div className="space-y-6">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {item.is_featured && (
                  <Badge variant="secondary" className="text-sm px-3 py-1">Destacado</Badge>
                )}
                {stockStatus && (
                  <Badge variant={stockStatus.color as any} className="text-sm px-3 py-1">{stockStatus.text}</Badge>
                )}
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {item.type === "product" ? "📦 Producto" : "🔧 Servicio"}
                </Badge>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">
                  {formatPrice(item.price)}
                </span>
                {item.currency !== 'VES' && (
                  <span className="text-lg text-gray-500">{item.currency}</span>
                )}
              </div>

              {/* Description */}
              {item.description && (
                <p className="text-gray-600 text-lg leading-relaxed">{item.description}</p>
              )}

              {/* Stock info */}
              <div className="space-y-2 text-base text-gray-500">
                {item.track_stock && (
                  <p className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Stock disponible:</span> 
                    <span>{item.stock_quantity} unidades</span>
                  </p>
                )}
                {item.total_sold > 0 && (
                  <p className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Vendidos:</span> 
                    <span>{item.total_sold}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Button */}
            <div className="pt-8">
              <Button
                onClick={() => onAddToCart(item)}
                disabled={stockStatus?.text === "Agotado" || isInCart}
                className="w-full h-14 text-lg font-semibold"
              >
              <ShoppingCart className="h-5 w-5 mr-2" />
                {isInCart 
                  ? "✓ En el carrito" 
                  : stockStatus?.text === "Agotado" 
                    ? "Agotado" 
                    : "Agregar al carrito"
                }
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
