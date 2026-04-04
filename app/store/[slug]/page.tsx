import { notFound } from "next/navigation"
import StoreViewer from "@/components/store/StoreViewer"
import { getStoreData, getStoreItems, getStoreCategories } from "@/lib/store-service"

interface StorePageProps {
  params: {
    slug: string
  }
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = params
  
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
      <StoreViewer 
        store={storeData}
        initialItems={items}
        categories={categories}
        slug={slug}
      />
    )
  } catch (error) {
    console.error("Error loading store:", error)
    notFound()
  }
}
