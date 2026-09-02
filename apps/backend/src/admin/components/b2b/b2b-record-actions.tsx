import { Button } from "@medusajs/ui"
import type { UseMutationResult } from "@tanstack/react-query"

type Mutation = Pick<
  UseMutationResult<unknown, Error, string, unknown>,
  "mutate" | "isPending"
>

type B2bRecordActionsProps = {
  recordId: string
  recordLabel: string
  isArchived: boolean
  archive: Mutation
  restore: Mutation
  remove: Mutation
  size?: "small" | "base"
  showApprove?: boolean
  onApprove?: () => void
  approvePending?: boolean
}

export const B2bRecordActions = ({
  recordId,
  recordLabel,
  isArchived,
  archive,
  restore,
  remove,
  size = "small",
  showApprove = false,
  onApprove,
  approvePending = false,
}: B2bRecordActionsProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {showApprove && onApprove && (
        <Button
          size={size}
          variant="secondary"
          isLoading={approvePending}
          onClick={onApprove}
        >
          Approve
        </Button>
      )}

      {isArchived ? (
        <Button
          size={size}
          variant="secondary"
          isLoading={restore.isPending}
          onClick={() => {
            if (
              window.confirm(
                `Restore ${recordLabel}? It will become active in the list again.`
              )
            ) {
              restore.mutate(recordId)
            }
          }}
        >
          Restore
        </Button>
      ) : (
        <Button
          size={size}
          variant="secondary"
          isLoading={archive.isPending}
          onClick={() => {
            if (
              window.confirm(
                `Archive ${recordLabel}? You can restore it later from the Archived filter.`
              )
            ) {
              archive.mutate(recordId)
            }
          }}
        >
          Archive
        </Button>
      )}

      <Button
        size={size}
        variant="danger"
        isLoading={remove.isPending}
        onClick={() => {
          if (
            window.confirm(
              `Permanently delete ${recordLabel}? This cannot be undone.`
            )
          ) {
            remove.mutate(recordId)
          }
        }}
      >
        Delete
      </Button>
    </div>
  )
}

export default B2bRecordActions
