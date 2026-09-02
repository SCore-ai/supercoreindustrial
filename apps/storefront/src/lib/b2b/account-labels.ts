import type { QuoteAdminStatus, StoreB2bOrderApproval } from "@lib/data/b2b-account"

export function quoteStatusLabel(status: QuoteAdminStatus | null | undefined) {
  switch (status) {
    case "new":
      return "Submitted"
    case "in_review":
      return "In review"
    case "quoted":
      return "Offer ready"
    case "won":
      return "Accepted"
    case "lost":
      return "Declined"
    case "cancelled":
      return "Cancelled"
    default:
      return "Pending"
  }
}

export function approvalStatusLabel(
  status: StoreB2bOrderApproval["status"]
) {
  switch (status) {
    case "pending":
      return "Pending approval"
    case "approved":
      return "Approved"
    case "rejected":
      return "Rejected"
    default:
      return status
  }
}

export function conversationStatusLabel(
  status: "open" | "closed" | "archived" | string
) {
  switch (status) {
    case "open":
      return "Open"
    case "closed":
      return "Closed"
    case "archived":
      return "Archived"
    default:
      return status
  }
}

export function conversationStatusTone(
  status: "open" | "closed" | "archived" | string
) {
  switch (status) {
    case "open":
      return "bg-emerald-50 text-emerald-800 border-emerald-200"
    case "closed":
      return "bg-sc-paper text-sc-steel border-sc-line"
    default:
      return "bg-sc-paper text-sc-steel border-sc-line"
  }
}
