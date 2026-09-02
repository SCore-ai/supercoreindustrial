"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { approvalStatusLabel } from "@lib/b2b/account-labels"
import {
  approveB2bOrderApproval,
  rejectB2bOrderApproval,
  type StoreB2bOrderApproval,
} from "@lib/data/b2b-account"

type ApprovalListProps = {
  approvals: StoreB2bOrderApproval[]
  canApprove: boolean
}

const ApprovalList = ({ approvals, canApprove }: ApprovalListProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [notesById, setNotesById] = useState<Record<string, string>>({})
  const [activeId, setActiveId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!approvals.length) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--sc-line)] p-8 text-center text-ui-fg-subtle">
        <p className="text-base-regular">No order approvals to show.</p>
      </div>
    )
  }

  const runAction = (
    approvalId: string,
    action: "approve" | "reject"
  ) => {
    setError(null)
    setActiveId(approvalId)

    startTransition(async () => {
      try {
        const notes = notesById[approvalId]?.trim() || null
        if (action === "approve") {
          await approveB2bOrderApproval({ approvalId, notes })
        } else {
          await rejectB2bOrderApproval({ approvalId, notes })
        }
        setNotesById((prev) => {
          const next = { ...prev }
          delete next[approvalId]
          return next
        })
        router.refresh()
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Could not update order approval"
        )
      } finally {
        setActiveId(null)
      }
    })
  }

  return (
    <div className="space-y-4">
      {canApprove && (
        <p className="text-sm text-ui-fg-subtle">
          Pending orders below can be approved or rejected for your company.
        </p>
      )}
      {!canApprove && (
        <p className="text-sm text-ui-fg-subtle">
          You can track approval status here. Approvers and company admins can
          take action on pending orders.
        </p>
      )}
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="overflow-hidden rounded-xl border border-[var(--sc-line)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--sc-paper)] text-ui-fg-subtle">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Updated</th>
              <th className="px-4 py-3 font-medium">Notes</th>
              {canApprove && (
                <th className="px-4 py-3 font-medium">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {approvals.map((approval) => {
              const busy = isPending && activeId === approval.id
              const isPendingStatus = approval.status === "pending"

              return (
                <tr
                  key={approval.id}
                  className="border-t border-[var(--sc-line)] align-top"
                >
                  <td className="px-4 py-3">
                    <LocalizedClientLink
                      href={`/account/orders/details/${approval.order_id}`}
                      className="font-mono text-xs text-[var(--sc-body)] hover:text-[var(--sc-cta)] hover:underline"
                    >
                      {approval.order_id.slice(-8)}
                    </LocalizedClientLink>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        approval.status === "pending"
                          ? "bg-amber-50 text-amber-800"
                          : approval.status === "approved"
                            ? "bg-green-50 text-green-800"
                            : "bg-red-50 text-red-800"
                      }`}
                    >
                      {approvalStatusLabel(approval.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ui-fg-subtle">
                    {approval.updated_at
                      ? new Date(approval.updated_at).toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-ui-fg-subtle">
                    {canApprove && isPendingStatus ? (
                      <textarea
                        rows={2}
                        value={notesById[approval.id] ?? ""}
                        onChange={(event) =>
                          setNotesById((prev) => ({
                            ...prev,
                            [approval.id]: event.target.value,
                          }))
                        }
                        placeholder="Optional note"
                        className="w-full min-w-[12rem] rounded-lg border border-[var(--sc-line)] px-2 py-1.5 text-sm text-[var(--sc-body)] focus:border-[var(--sc-cta)] focus:outline-none focus:ring-2 focus:ring-[var(--sc-cta)]/20"
                        disabled={busy}
                      />
                    ) : (
                      approval.notes || "—"
                    )}
                  </td>
                  {canApprove && (
                    <td className="px-4 py-3">
                      {isPendingStatus ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => runAction(approval.id, "approve")}
                            className="rounded-lg bg-[var(--sc-cta)] px-3 py-1.5 text-xs font-semibold text-[var(--sc-ink)] transition-colors hover:opacity-90 disabled:opacity-50"
                          >
                            {busy ? "Working…" : "Approve"}
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => runAction(approval.id, "reject")}
                            className="rounded-lg border border-[var(--sc-line)] px-3 py-1.5 text-xs font-semibold text-[var(--sc-body)] transition-colors hover:border-red-300 hover:text-red-700 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-ui-fg-subtle">—</span>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ApprovalList
