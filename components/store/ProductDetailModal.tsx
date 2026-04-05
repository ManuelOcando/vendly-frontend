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
      <DialogContent className="max-w-7xl w-[98vw] max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="text-xl font-semibold truncate">{item.name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row h-[calc(90vh-70px)]">
          {/* Image Section - Takes more space */}
          <div className="relative lg:w-[65%] w-full bg-gray-50 flex items-center justify-center p-4 lg:p-8 min-h-[300px] lg:min-h-0">
            {images.length > 0 && !imageError ? (
              <>
                <img
                  src={images[currentImageIndex]}
                  alt={item.name}
                  className="w-full h-full lg:max-h-[70vh] max-h-[250px] object-contain rounded-lg"
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

          {/* Product Info - Takes less space */}
          <div className="lg:w-[35%] w-full p-6 flex flex-col bg-white border-l overflow-y-auto">
            <div className="space-y-4">
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
              <div>
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(item.price)}
                </span>
                {item.currency !== 'VES' && (
                  <span className="text-sm text-gray-500 ml-2">{item.currency}</span>
                )}
              </div>

              {/* Description */}
              {item.description && (
                <p className="text-gray-600">{item.description}</p>
              )}

              {/* Stock */}
              <div className="text-sm text-gray-500 space-y-1">
                {item.track_stock && (
                  <p>Stock: {item.stock_quantity} unidades</p>
                )}
                {item.total_sold > 0 && (
                  <p>{item.total_sold} vendidos</p>
                )}
              </div>
            </div>

            {/* Button */}
            <div className="pt-6 mt-auto">
              <Button
                onClick={() => onAddToCart(item)}
                disabled={stockStatus?.text === "Agotado" || isInCart}
                className="w-full h-12"
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
      </DialogContent>
    </Dialog>
  )
}
