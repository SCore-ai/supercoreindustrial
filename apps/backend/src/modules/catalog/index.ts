import CatalogModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const CATALOG_MODULE = "catalog"

export default Module(CATALOG_MODULE, {
  service: CatalogModuleService,
})
