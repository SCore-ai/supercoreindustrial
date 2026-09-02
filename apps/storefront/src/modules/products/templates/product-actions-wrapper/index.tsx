import { listProducts } from "@lib/data/products"
import { fetchStoreB2bSettings } from "@lib/data/b2b"
import { retrieveCustomer } from "@lib/data/customer"
import { getProductPageContent } from "@lib/util/product-page-content"
import { shouldShowVariantMatrix } from "@lib/util/variant-matrix"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"

export default async function ProductActionsWrapper({
  id,
  region,
}: {
  id: string
  region: HttpTypes.StoreRegion
}) {
  const [productResult, settings, customer] = await Promise.all([
    listProducts({
      queryParams: { id: [id] },
      regionId: region.id,
    }).then(({ response }) => response.products[0]),
    fetchStoreB2bSettings(),
    retrieveCustomer(),
  ])

  const product = productResult

  if (!product) {
    return null
  }

  const hidePricesForGuests =
    settings?.storefront.hide_prices_for_guests === true && !customer
  const quotesEnabled = settings?.features.quotes !== false
  const tieredPricingEnabled = settings?.features.tiered_pricing === true
  const purchaseInfo = getProductPageContent(product)

  return (
    <ProductActions
      product={product}
      region={region}
      purchaseInfo={purchaseInfo}
      matrixMode={shouldShowVariantMatrix(product)}
      hidePricesForGuests={hidePricesForGuests}
      quotesEnabled={quotesEnabled}
      tieredPricingEnabled={tieredPricingEnabled}
      isLoggedIn={!!customer}
    />
  )
}
