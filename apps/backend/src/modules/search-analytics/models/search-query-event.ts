import { model } from "@medusajs/framework/utils"

const SearchQueryEvent = model.define("search_query_event", {
  id: model.id().primaryKey(),
  query: model.text(),
  normalized_query: model.text(),
  result_count: model.number().default(0),
  mpn_only: model.boolean().default(false),
})

export default SearchQueryEvent
