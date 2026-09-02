import SearchAnalyticsModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const SEARCH_ANALYTICS_MODULE = "searchAnalytics"

export default Module(SEARCH_ANALYTICS_MODULE, {
  service: SearchAnalyticsModuleService,
})
