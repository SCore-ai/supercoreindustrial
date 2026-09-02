"use client"

import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import NavigationEditor from "../../../components/online-store/navigation-editor"
import OnlineStoreShell from "../../../components/online-store/online-store-shell"
import ThemePreviewFrame from "../../../components/online-store/theme-preview-frame"
import { onlineStoreClient } from "../../../lib/online-store-client"

const OnlineStoreNavigationPage = () => {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-online-store-navigation"],
    queryFn: () => onlineStoreClient.getNavigation(),
  })

  const saveMutation = useMutation({
    mutationFn: onlineStoreClient.updateNavigation,
    onSuccess: (response) => {
      queryClient.setQueryData(["admin-online-store-navigation"], response)
      queryClient.invalidateQueries({ queryKey: ["admin-online-store-overview"] })
    },
  })

  const resetMutation = useMutation({
    mutationFn: () => onlineStoreClient.resetNavigation(),
    onSuccess: (response) => {
      queryClient.setQueryData(["admin-online-store-navigation"], response)
      queryClient.invalidateQueries({ queryKey: ["admin-online-store-overview"] })
    },
  })

  return (
    <OnlineStoreShell
      title="Navigation"
      description="Design mega menu columns for Services, Technologies, Company, and Support. Products menu uses Medusa categories."
    >
      {isLoading && <p className="text-ui-fg-subtle">Loading navigation…</p>}
      {error instanceof Error && (
        <p className="text-ui-fg-error">{error.message}</p>
      )}
      {data && (
        <div className="space-y-6">
          <NavigationEditor
            mainNavigation={data.main_navigation}
            contactMenu={data.contact_menu}
            partnerCatalog={data.partner_catalog}
            productsMenu={data.products_menu}
            saving={saveMutation.isPending || resetMutation.isPending}
            onSave={async (payload) => {
              await saveMutation.mutateAsync(payload)
            }}
            onReset={async () => {
              await resetMutation.mutateAsync()
            }}
          />
          <ThemePreviewFrame height={480} />
        </div>
      )}
    </OnlineStoreShell>
  )
}

export const config = defineRouteConfig({
  label: "Navigation",
  nested: "/online-store",
  rank: 3,
})

export default OnlineStoreNavigationPage
