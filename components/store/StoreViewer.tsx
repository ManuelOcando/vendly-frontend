"use client"

import { useState, useEffect } from "react"
import { Search, ShoppingCart, Phone, Star, Clock, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import { Store, StoreItem, Category, CartItem } from "@/lib/store-service"
import StoreItemCard from "./StoreItemCard"
import CartManager from "./CartManager"

interface StoreViewerProps {
  store: Store
  initialItems: StoreItem[]
  categories: Category[]
  slug: string
}

export default function StoreViewer({ store, initialItems, categories, slug }: StoreViewerProps) {
  const [items, setItems] = useState<StoreItem[]>(initialItems)
  const [filteredItems, setFilteredItems] = useState<StoreItem[]>(initialItems)
  const [cart, setCart] = useState<{ items: CartItem[], total: number }>({ items: [], total: 0 })
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("featured")
  const { toast } = useToast()

  // Filtrar y ordenar items
  useEffect(() => {
    let filtered = items

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por categoría
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category_id === selectedCategory)
    }

    // Ordenar
    switch (sortBy) {
      case "price-low":
        filtered = [...filtered].sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered = [...filtered].sort((a, b) => b.price - a.price)
        break
      case "name":
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name))
        break
      case "popular":
        filtered = [...filtered].sort((a, b) => b.total_sold - a.total_sold)
        break
      default: // featured
        filtered = [...filtered].sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1
          if (!a.is_featured && b.is_featured) return 1
          return 0
        })
    }

    setFilteredItems(filtered)
  }, [items, searchTerm, selectedCategory, sortBy])

  const addToCart = (item: StoreItem) => {
    const existingItem = cart.items.find(cartItem => cartItem.item_id === item.id)
    
    if (existingItem) {
      // Incrementar cantidad
      const updatedItems = cart.items.map(cartItem =>
        cartItem.item_id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      )
      updateCart(updatedItems)
    } else {
      // Agregar nuevo item
      const newItem: CartItem = {
        item_id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1
      }
      updateCart([...cart.items, newItem])
    }

    toast({
      title: "Producto agregado",
      description: `${item.name} se ha agregado al carrito`,
    })
  }

  const updateCart = (items: CartItem[]) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    setCart({ items, total })
  }

  const removeFromCart = (itemId: string) => {
    const updatedItems = cart.items.filter(item => item.item_id !== itemId)
    updateCart(updatedItems)
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }

    const updatedItems = cart.items.map(item =>
      item.item_id === itemId ? { ...item, quantity } : item
    )
    updateCart(updatedItems)
  }

  const getTotalItems = () => {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {store.logo_url && (
                <img
                  src={store.logo_url}
                  alt={store.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">{store.name}</h1>
                <p className="text-sm text-gray-500">
                  {store.description}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {store.whatsapp_number && (
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4 mr-2" />
                  {store.whatsapp_number}
                </Button>
              )}
              
              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="relative">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Carrito
                    {getTotalItems() > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                        {getTotalItems()}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Carrito de Compras</SheetTitle>
                    <SheetDescription>
                      Revisa tus productos antes de finalizar el pedido
                    </SheetDescription>
                  </SheetHeader>
                  <CartManager
                    cart={cart}
                    onUpdateCart={updateCart}
                    onRemoveItem={removeFromCart}
                    onUpdateQuantity={updateQuantity}
                    storeSlug={slug}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Destacados</SelectItem>
                <SelectItem value="popular">Más vendidos</SelectItem>
                <SelectItem value="price-low">Precio: Menor a mayor</SelectItem>
                <SelectItem value="price-high">Precio: Mayor a menor</SelectItem>
                <SelectItem value="name">Nombre: A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {filteredItems.length} producto{filteredItems.length !== 1 ? 's' : ''} encontrado{filteredItems.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Products Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <StoreItemCard
                key={item.id}
                item={item}
                onAddToCart={addToCart}
                isInCart={cart.items.some(cartItem => cartItem.item_id === item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-500">
              Intenta ajustar los filtros o términos de búsqueda
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
