import OnlineStoreModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const ONLINE_STORE_MODULE = "onlineStore"

export default Module(ONLINE_STORE_MODULE, {
  service: OnlineStoreModuleService,
})
