"use client"

import { Badge, Button, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { onlineStoreClient } from "../../lib/online-store-client"

type PublishBarProps = {
  className?: string
}

export default function PublishBar({ className }: PublishBarProps) {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["admin-online-store-overview"],
    queryFn: () => onlineStoreClient.getOverview(),
  })

  const publishMutation = useMutation({
    mutationFn: () => onlineStoreClient.publish(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-online-store-overview"] })
      queryClient.invalidateQueries({ queryKey: ["admin-online-store-theme"] })
      queryClient.invalidateQueries({ queryKey: ["admin-online-store-navigation"] })
      queryClient.invalidateQueries({ queryKey: ["admin-online-store-homepage"] })
      toast.success("Changes published to live store")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const discardMutation = useMutation({
    mutationFn: () => onlineStoreClient.discardDraft(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-online-store-overview"] })
      queryClient.invalidateQueries({ queryKey: ["admin-online-store-theme"] })
      queryClient.invalidateQueries({ queryKey: ["admin-online-store-navigation"] })
      queryClient.invalidateQueries({ queryKey: ["admin-online-store-homepage"] })
      toast.success("Draft discarded")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const hasDraft = data?.has_unpublished_changes

  if (isLoading || !hasDraft) {
    return null
  }

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ui-border-base bg-ui-bg-subtle px-4 py-3 ${className ?? ""}`}
    >
      <div className="flex items-center gap-2">
        <Badge color="orange" size="2xsmall">
          Unpublished changes
        </Badge>
        <Text size="small" className="text-ui-fg-subtle">
          Save edits as draft, then publish when ready.
          {data.published_at
            ? ` Last published ${new Date(data.published_at).toLocaleString()}.`
            : ""}
        </Text>
      </div>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="small"
          isLoading={discardMutation.isPending}
          onClick={() => discardMutation.mutate()}
        >
          Discard draft
        </Button>
        <Button
          size="small"
          isLoading={publishMutation.isPending}
          onClick={() => publishMutation.mutate()}
        >
          Publish
        </Button>
      </div>
    </div>
  )
}
