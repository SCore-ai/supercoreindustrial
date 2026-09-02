import { model } from "@medusajs/framework/utils"

const B2bPricingTier = model.define("b2b_pricing_tier", {
  id: model.id().primaryKey(),
  name: model.text(),
  customer_group_id: model.text().nullable(),
  variant_id: model.text().nullable(),
  product_id: model.text().nullable(),
  min_quantity: model.number().default(1),
  max_quantity: model.number().nullable(),
  unit_price: model.float().nullable(),
  currency_code: model.text().default("gbp"),
  discount_percent: model.number().default(0),
  priority: model.number().default(0),
  status: model.enum(["active", "disabled"]).default("active"),
  metadata: model.json().nullable(),
})

export default B2bPricingTier
