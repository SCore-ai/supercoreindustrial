import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Navigate, useParams } from "react-router-dom"

const B2bCompanyDetailRedirectPage = () => {
  const { id } = useParams()
  return <Navigate to={`/customers/companies/${id}`} replace />
}

export const config = defineRouteConfig({
  label: "Company detail",
  link: false,
})

export default B2bCompanyDetailRedirectPage
