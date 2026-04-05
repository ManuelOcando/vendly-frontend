import { notFound } from "next/navigation"
import StoreViewer from "@/components/store/StoreViewer"
import { getStoreData, getStoreItems, getStoreCategories } from "@/lib/store-service"
import { CartProvider } from "@/components/storefront/CartContext"

interface StorePageProps {
  params: {
    slug: string
  }
}

export default async function StorePage({ params }: StorePageProps) {
  // Next.js 15+ params is async
  const { slug } = await params
  
  if (!slug) {
    notFound()
  }
  
  try {
    // Obtener datos de la tienda en paralelo
    const [storeData, items, categories] = await Promise.all([
      getStoreData(slug),
      getStoreItems(slug),
      getStoreCategories(slug)
    ])

    if (!storeData) {
      notFound()
    }

    return (
      <CartProvider>
        <StoreViewer 
          store={storeData}
          initialItems={items}
          categories={categories}
          slug={slug}
        />
      </CartProvider>
    )
  } catch (error) {
    console.error("Error loading store:", error)
    notFound()
  }
}
