"use client"

import { useState } from "react"
import { ShoppingCart, Star, Heart, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StoreItem } from "@/lib/store-service"

interface StoreItemCardProps {
  item: StoreItem
  onAddToCart: (item: StoreItem) => void
  isInCart: boolean
}

export default function StoreItemCard({ item, onAddToCart, isInCart }: StoreItemCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleAddToCart = () => {
    onAddToCart(item)
  }

  const toggleLike = () => {
    setIsLiked(!isLiked)
    // TODO: Implementar like en backend
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
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-0">
        <div className="relative">
          {/* Imagen del producto */}
          <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
            {item.images && item.images.length > 0 && !imageError ? (
              <img
                src={item.images[0]}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {item.is_featured && (
              <Badge variant="secondary" className="text-xs">
                Destacado
              </Badge>
            )}
            {stockStatus && (
              <Badge variant={stockStatus.color as any} className="text-xs">
                {stockStatus.text}
              </Badge>
            )}
          </div>

          {/* Botón de like */}
          <button
            onClick={toggleLike}
            className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            <Heart
              className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
            />
          </button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4">
        <div className="space-y-2">
          {/* Nombre del producto */}
          <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight">
            {item.name}
          </h3>

          {/* Descripción */}
          {item.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {item.description}
            </p>
          )}

          {/* Rating y ventas */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-gray-700">4.5</span>
              <span className="text-gray-500">({item.likes_count})</span>
            </div>
            {item.total_sold > 0 && (
              <span className="text-gray-500">
                {item.total_sold} vendido{item.total_sold !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Precio */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(item.price)}
            </span>
            {item.currency !== 'VES' && (
              <span className="text-sm text-gray-500">
                {item.currency}
              </span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={stockStatus?.text === "Agotado" || isInCart}
          className="w-full"
          variant={isInCart ? "secondary" : "default"}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isInCart ? "En el carrito" : stockStatus?.text === "Agotado" ? "Agotado" : "Agregar"}
        </Button>
      </CardFooter>
    </Card>
  )
}
