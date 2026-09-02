"use client"

import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import HomepageEditor from "../../../components/online-store/homepage-editor"
import OnlineStoreShell from "../../../components/online-store/online-store-shell"
import ThemePreviewFrame from "../../../components/online-store/theme-preview-frame"
import { onlineStoreClient } from "../../../lib/online-store-client"

const OnlineStoreHomepagePage = () => {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-online-store-homepage"],
    queryFn: () => onlineStoreClient.getHomepage(),
  })

  const saveMutation = useMutation({
    mutationFn: onlineStoreClient.updateHomepage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-online-store-homepage"] })
      queryClient.invalidateQueries({ queryKey: ["admin-online-store-overview"] })
    },
  })

  return (
    <OnlineStoreShell
      title="Homepage"
      description="Edit hero carousel slides and featured category tiles. Changes save as draft until published."
    >
      {isLoading && <p className="text-ui-fg-subtle">Loading homepage…</p>}
      {error instanceof Error && (
        <p className="text-ui-fg-error">{error.message}</p>
      )}
      {data && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <HomepageEditor
            homepage={data.homepage}
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
  label: "Homepage",
  nested: "/online-store",
  rank: 2,
})

export default OnlineStoreHomepagePage
