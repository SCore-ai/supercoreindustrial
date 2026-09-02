import React, { Suspense } from "react"

import ProductBreadcrumbs from "@modules/products/components/product-breadcrumbs"
import ProductContent from "@modules/products/components/product-content"
import ProductGalleryEnhanced from "@modules/products/components/product-gallery-enhanced"
import ProductJumpNav from "@modules/products/components/product-jump-nav"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductQuoteBanner from "@modules/products/components/product-quote-banner"
import RelatedProducts from "@modules/products/components/related-products"
import SuccessorProduct from "@modules/products/components/successor-product"
import VariantMatrix from "@modules/products/components/variant-matrix"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import {
  getProductJumpSections,
  getProductPageContent,
} from "@lib/util/product-page-content"
import { shouldShowVariantMatrix } from "@lib/util/variant-matrix"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import SkeletonProductActions from "@modules/skeletons/components/skeleton-product-actions"
import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  const matrixMode = shouldShowVariantMatrix(product)
  const pageContent = getProductPageContent(product)
  const jumpSections = getProductJumpSections(pageContent, {
    matrixMode,
    hasRelated: true,
  })

  return (
    <div className="sc-product-page bg-white" data-testid="product-container">
      <ProductBreadcrumbs
        product={product}
        categoryLabel={pageContent.categoryLabel}
      />

      <ProductJumpNav sections={jumpSections} />

      <div className="content-container py-8 small:py-10">
        <div className="sc-product-hero">
          <div className="mx-auto w-full max-w-[560px] justify-self-center lg:mx-0 lg:max-w-none lg:justify-self-auto">
            <ProductGalleryEnhanced
              images={images}
              productTitle={product.title ?? "Product"}
            />
          </div>

          <aside className="min-w-0 lg:sticky lg:top-[calc(var(--sc-header-height)+3.5rem)] lg:self-start">
            <div className="sc-product-buy-panel">
              <ProductOnboardingCta />
              <Suspense fallback={<SkeletonProductActions />}>
                <ProductActionsWrapper id={product.id} region={region} />
              </Suspense>

              <Suspense fallback={<SkeletonRelatedProducts />}>
                <SuccessorProduct
                  product={product}
                  countryCode={countryCode}
                />
                <RelatedProducts product={product} countryCode={countryCode} />
              </Suspense>
            </div>
          </aside>
        </div>
      </div>

      {matrixMode && <VariantMatrix product={product} />}

      <ProductContent
        product={product}
        content={pageContent}
        matrixMode={matrixMode}
      />

      <ProductQuoteBanner productTitle={product.title ?? "this product"} />
    </div>
  )
}

export default ProductTemplate
