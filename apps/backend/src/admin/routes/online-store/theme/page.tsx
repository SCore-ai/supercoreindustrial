"use client"

import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import OnlineStoreShell from "../../../components/online-store/online-store-shell"
import ThemePreviewFrame from "../../../components/online-store/theme-preview-frame"
import ThemeSettingsPanel from "../../../components/online-store/theme-settings-panel"
import { onlineStoreClient } from "../../../lib/online-store-client"

const OnlineStoreThemePage = () => {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-online-store-theme"],
    queryFn: () => onlineStoreClient.getTheme(),
  })

  const saveMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      onlineStoreClient.updateTheme(payload),
    onSuccess: (response) => {
      queryClient.setQueryData(["admin-online-store-theme"], response)
      queryClient.invalidateQueries({ queryKey: ["admin-online-store-overview"] })
    },
  })

  return (
    <OnlineStoreShell
      title="Theme settings"
      description="Shopify-style theme editor for colors, typography, layout, mega menu behaviour, and announcement bar."
    >
      {isLoading && <p className="text-ui-fg-subtle">Loading theme settings…</p>}
      {error instanceof Error && (
        <p className="text-ui-fg-error">{error.message}</p>
      )}
      {data?.settings && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <ThemeSettingsPanel
            settings={data.settings}
            saving={saveMutation.isPending}
            onSave={async (payload) => {
              await saveMutation.mutateAsync(payload)
            }}
          />
          <ThemePreviewFrame height={640} />
        </div>
      )}
    </OnlineStoreShell>
  )
}

export const config = defineRouteConfig({
  label: "Theme",
  nested: "/online-store",
  rank: 1,
})

export default OnlineStoreThemePage
