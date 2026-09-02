"use client"

import { Button, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { onlineStoreClient } from "../../lib/online-store-client"

type ThemePreviewFrameProps = {
  className?: string
  height?: number
}

export default function ThemePreviewFrame({
  className,
  height = 520,
}: ThemePreviewFrameProps) {
  const [reloadKey, setReloadKey] = useState(0)

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-online-store-preview"],
    queryFn: () => onlineStoreClient.getPreviewToken(),
  })

  const previewUrl = data?.preview_url

  return (
    <div className={`rounded-lg border border-ui-border-base bg-ui-bg-base ${className ?? ""}`}>
      <div className="flex items-center justify-between border-b border-ui-border-base px-4 py-3">
        <div>
          <Text weight="plus">Live preview</Text>
          <Text size="xsmall" className="text-ui-fg-muted">
            Draft theme and navigation render in the storefront iframe.
          </Text>
        </div>
        <Button
          variant="secondary"
          size="small"
          disabled={!previewUrl}
          onClick={() => setReloadKey((key) => key + 1)}
        >
          Refresh
        </Button>
      </div>

      <div className="p-4">
        {isLoading && (
          <div
            className="flex items-center justify-center rounded-md bg-ui-bg-subtle text-ui-fg-subtle"
            style={{ height }}
          >
            Loading preview…
          </div>
        )}
        {error instanceof Error && (
          <Text className="text-ui-fg-error">{error.message}</Text>
        )}
        {previewUrl && !isLoading && (
          <iframe
            key={reloadKey}
            title="Storefront preview"
            src={previewUrl}
            className="w-full rounded-md border border-ui-border-base bg-white"
            style={{ height }}
          />
        )}
      </div>
    </div>
  )
}
