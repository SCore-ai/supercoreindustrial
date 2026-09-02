import { model } from "@medusajs/framework/utils"

const QuoteLineItem = model.define("quote_line_item", {
  id: model.id().primaryKey(),
  quote_id: model.text(),
  variant_id: model.text(),
  product_id: model.text().nullable(),
  quantity: model.number().default(1),
  sku: model.text().nullable(),
  mpn: model.text().nullable(),
  title: model.text().nullable(),
  unit_price: model.float().nullable(),
  discount_percent: model.number().default(0),
  metadata: model.json().nullable(),
})

export default QuoteLineItem
