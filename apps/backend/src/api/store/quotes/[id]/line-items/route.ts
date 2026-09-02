import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { addQuoteLineItemWorkflow } from "../../../../../workflows/quote/add-quote-line-item"

type AddLineItemBody = {
  variant_id: string
  quantity?: number
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id: quoteId } = req.params
  const body = req.body as AddLineItemBody

  if (!body?.variant_id) {
    res.status(400).json({ message: "variant_id is required" })
    return
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const productModule = req.scope.resolve(Modules.PRODUCT)

  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: [
      "id",
      "sku",
      "title",
      "metadata",
      "product.id",
      "product.title",
    ],
    filters: { id: body.variant_id },
  })

  const variant = variants[0]

  if (!variant) {
    res.status(404).json({ message: "Variant not found" })
    return
  }

  const quantity = Math.max(1, Number(body.quantity || 1))
  const product = variant.product as {
    id?: string
    title?: string
  } | undefined
  const metadata = (variant.metadata || {}) as Record<string, unknown>

  const { result: lineItem } = await addQuoteLineItemWorkflow(req.scope).run({
    input: {
      quote_id: quoteId,
      variant_id: variant.id,
      product_id: product?.id ?? null,
      quantity,
      sku: (variant.sku as string) ?? null,
      mpn: (metadata.mpn as string) ?? null,
      title: product?.title
        ? `${product.title} — ${variant.title || variant.sku}`
        : ((variant.title as string) ?? null),
      metadata: {
        variant_title: variant.title,
      },
    },
  })

  // Touch variant so Typesense/index subscribers stay warm; no-op if missing
  await productModule.retrieveProductVariant(variant.id).catch(() => null)

  res.status(201).json({ line_item: lineItem })
}
