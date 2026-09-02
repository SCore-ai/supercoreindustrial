import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import { CompanyDetailView } from "../../../../components/b2b/company-detail-view"
import { b2bClient } from "../../../../lib/client"

const CustomerCompanyDetailPage = () => {
  const { id } = useParams()

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-b2b-company", id],
    queryFn: () => b2bClient.getCompany(id!),
    enabled: Boolean(id),
  })

  if (isLoading) {
    return (
      <Container className="p-6">
        <Text>Loading company...</Text>
      </Container>
    )
  }

  if (error || !data?.company) {
    return (
      <Container className="p-6">
        <Text className="text-ui-fg-error">
          {(error as Error)?.message ?? "Company not found"}
        </Text>
      </Container>
    )
  }

  return (
    <Container className="p-6">
      <CompanyDetailView company={data.company} />
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Company detail",
})

export default CustomerCompanyDetailPage
