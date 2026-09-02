import { toast } from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { b2bClient } from "../lib/client"

type CompanyActionOptions = {
  companyId?: string
  onDeleted?: () => void
}

type OfferActionOptions = {
  offerId?: string
  onDeleted?: () => void
}

export function useCompanyRecordActions({
  companyId,
  onDeleted,
}: CompanyActionOptions = {}) {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-b2b-companies"] })
    queryClient.invalidateQueries({ queryKey: ["admin-b2b-dashboard"] })

    if (companyId) {
      queryClient.invalidateQueries({ queryKey: ["admin-b2b-company", companyId] })
    }
  }

  const archive = useMutation({
    mutationFn: (id: string) => b2bClient.archiveCompany(id),
    onSuccess: () => {
      invalidate()
      toast.success("Customer archived")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const restore = useMutation({
    mutationFn: (id: string) => b2bClient.restoreCompany(id),
    onSuccess: () => {
      invalidate()
      toast.success("Customer restored")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const remove = useMutation({
    mutationFn: (id: string) => b2bClient.deleteCompany(id),
    onSuccess: () => {
      invalidate()
      toast.success("Customer deleted")
      onDeleted?.()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return { archive, restore, remove }
}

export function useOfferRecordActions({
  offerId,
  onDeleted,
}: OfferActionOptions = {}) {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-b2b-quotes"] })
    queryClient.invalidateQueries({ queryKey: ["admin-b2b-dashboard"] })

    if (offerId) {
      queryClient.invalidateQueries({ queryKey: ["admin-b2b-quote", offerId] })
    }
  }

  const archive = useMutation({
    mutationFn: (id: string) => b2bClient.archiveQuote(id),
    onSuccess: () => {
      invalidate()
      toast.success("Offer archived")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const restore = useMutation({
    mutationFn: (id: string) => b2bClient.restoreQuote(id),
    onSuccess: () => {
      invalidate()
      toast.success("Offer restored")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const remove = useMutation({
    mutationFn: (id: string) => b2bClient.deleteQuote(id),
    onSuccess: () => {
      invalidate()
      toast.success("Offer deleted")
      onDeleted?.()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return { archive, restore, remove }
}

type ConversationActionOptions = {
  conversationId?: string
  onDeleted?: () => void
}

export function useConversationRecordActions({
  conversationId,
  onDeleted,
}: ConversationActionOptions = {}) {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-b2b-conversations"] })
    queryClient.invalidateQueries({ queryKey: ["admin-b2b-dashboard"] })

    if (conversationId) {
      queryClient.invalidateQueries({
        queryKey: ["admin-b2b-conversation", conversationId],
      })
    }
  }

  const archive = useMutation({
    mutationFn: (id: string) => b2bClient.archiveConversation(id),
    onSuccess: () => {
      invalidate()
      toast.success("Conversation archived")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const restore = useMutation({
    mutationFn: (id: string) => b2bClient.restoreConversation(id),
    onSuccess: () => {
      invalidate()
      toast.success("Conversation restored")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const remove = useMutation({
    mutationFn: (id: string) => b2bClient.deleteConversation(id),
    onSuccess: () => {
      invalidate()
      toast.success("Conversation deleted")
      onDeleted?.()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return { archive, restore, remove }
}
