import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Navigate } from "react-router-dom"

const B2bCompaniesRedirectPage = () => {
  return <Navigate to="/customers/companies" replace />
}

export const config = defineRouteConfig({
  label: "Customers",
  link: false,
})

export default B2bCompaniesRedirectPage
