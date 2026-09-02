import SecurityModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const SECURITY_MODULE = "security"

export default Module(SECURITY_MODULE, {
  service: SecurityModuleService,
})
