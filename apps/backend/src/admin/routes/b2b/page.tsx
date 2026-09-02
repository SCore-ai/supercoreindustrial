import { defineRouteConfig } from "@medusajs/admin-sdk"
import { BuildingStorefront } from "@medusajs/icons"
import { Navigate } from "react-router-dom"

const B2bIndexPage = () => <Navigate to="/b2b/dashboard" replace />

export const config = defineRouteConfig({
  label: "B2B",
  icon: BuildingStorefront,
})

export default B2bIndexPage
