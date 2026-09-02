import { MedusaError, MedusaService } from "@medusajs/framework/utils"
import B2bCompany from "./models/b2b-company"
import B2bCompanyMember from "./models/b2b-company-member"
import B2bConversation from "./models/b2b-conversation"
import B2bMessage from "./models/b2b-message"
import B2bOrderApproval from "./models/b2b-order-approval"
import B2bPricingTier from "./models/b2b-pricing-tier"
import B2bSettings from "./models/b2b-settings"
import {
  B2B_SETTINGS_ID,
  DEFAULT_B2B_SETTINGS,
  type B2bModuleSettings,
  type UpdateB2bSettingsInput,
  type UpdateB2bSettingsPayload,
} from "../../lib/b2b/settings-types"
import { DEFAULT_ADMIN_EMAIL } from "../../lib/b2b/admin-email"
import {
  buildArchivedCompanyMetadata,
  buildArchivedConversationMetadata,
  buildRestoredCompanyMetadata,
  buildRestoredConversationMetadata,
  isConversationArchived,
  resolveCompanyRestoreStatus,
  resolveConversationRestoreStatus,
} from "../../lib/b2b/record-lifecycle"

export type CreateB2bCompanyInput = {
  name: string
  email: string
  legal_name?: string | null
  phone?: string | null
  vat_number?: string | null
  registration_number?: string | null
  website?: string | null
  country_code?: string | null
  customer_group_id?: string | null
  primary_customer_id?: string | null
  admin_notes?: string | null
  require_order_approval?: boolean
  metadata?: Record<string, unknown> | null
}

export type UpdateB2bCompanyInput = {
  id: string
  name?: string
  legal_name?: string | null
  email?: string
  phone?: string | null
  vat_number?: string | null
  registration_number?: string | null
  website?: string | null
  country_code?: string | null
  customer_group_id?: string | null
  primary_customer_id?: string | null
  admin_notes?: string | null
  metadata?: Record<string, unknown> | null
}

export type AdminListCompaniesInput = {
  status?: "pending" | "approved" | "rejected" | "suspended" | "archived"
  include_archived?: boolean
  limit?: number
  offset?: number
}

export type AddCompanyMemberInput = {
  company_id: string
  customer_id?: string | null
  email?: string | null
  first_name?: string | null
  last_name?: string | null
  role?: "admin" | "buyer" | "approver"
  is_primary?: boolean
  status?: "active" | "invited" | "disabled"
}

class B2bModuleService extends MedusaService({
  B2bCompany,
  B2bCompanyMember,
  B2bOrderApproval,
  B2bConversation,
  B2bMessage,
  B2bPricingTier,
  B2bSettings,
}) {
  async ensureDefaultSettings(): Promise<B2bModuleSettings> {
    const [existing] = await this.listB2bSettings(
      { id: B2B_SETTINGS_ID },
      { take: 1 }
    )

    if (existing) {
      const metadata = (existing.metadata ?? {}) as Record<string, unknown>

      if (metadata.admin_email_v1 !== true) {
        await this.updateB2bSettings({
          id: B2B_SETTINGS_ID,
          email_from: DEFAULT_ADMIN_EMAIL,
          email_admin: DEFAULT_ADMIN_EMAIL,
          metadata: {
            ...metadata,
            admin_email_v1: true,
          },
        })

        return this.retrieveB2bSettings(B2B_SETTINGS_ID) as Promise<B2bModuleSettings>
      }

      return existing as B2bModuleSettings
    }

    const [created] = await this.createB2bSettings([
      {
        id: B2B_SETTINGS_ID,
        ...DEFAULT_B2B_SETTINGS,
      },
    ])

    return created as B2bModuleSettings
  }

  async getSettings(): Promise<B2bModuleSettings> {
    return this.ensureDefaultSettings()
  }

  async updateSettings(
    input: UpdateB2bSettingsPayload
  ): Promise<B2bModuleSettings> {
    await this.ensureDefaultSettings()

    const { smtp_pass, ...rest } = input
    const payload: UpdateB2bSettingsInput = { ...rest }

    const emptyToNull = (value?: string | null) => {
      if (typeof value !== "string") {
        return value
      }
      const trimmed = value.trim()
      return trimmed ? trimmed : null
    }

    payload.company_legal_name = emptyToNull(payload.company_legal_name)
    payload.company_address = emptyToNull(payload.company_address)
    payload.company_phone = emptyToNull(payload.company_phone)
    payload.company_email = emptyToNull(payload.company_email)
    payload.company_vat_number = emptyToNull(payload.company_vat_number)
    payload.company_registration_number = emptyToNull(
      payload.company_registration_number
    )
    payload.company_iban = emptyToNull(payload.company_iban)
    payload.company_bank = emptyToNull(payload.company_bank)
    payload.company_bic = emptyToNull(payload.company_bic)
    payload.company_payment_term = emptyToNull(payload.company_payment_term)

    if (smtp_pass?.trim()) {
      payload.smtp_pass = smtp_pass.trim()
    }

    await this.updateB2bSettings({
      id: B2B_SETTINGS_ID,
      ...payload,
    })

    return this.retrieveB2bSettings(B2B_SETTINGS_ID) as Promise<B2bModuleSettings>
  }

  async registerTradeAccount(input: CreateB2bCompanyInput) {
    const settings = await this.getSettings()
    return this.createCompany({
      ...input,
      require_order_approval: settings.default_require_order_approval,
    })
  }
  async retrieveCompanyWithMembers(companyId: string) {
    const company = await this.retrieveB2bCompany(companyId)
    const members = await this.listB2bCompanyMembers({
      company_id: companyId,
    })

    return { ...company, members }
  }

  async listCompaniesForAdmin(input: AdminListCompaniesInput = {}) {
    const filters: Record<string, unknown> = {}

    if (input.status) {
      filters.status = input.status
    } else if (!input.include_archived) {
      filters.status = {
        $in: ["pending", "approved", "rejected", "suspended"],
      }
    }

    const [companies, count] = await this.listAndCountB2bCompanies(filters, {
      take: input.limit ?? 20,
      skip: input.offset ?? 0,
      order: { created_at: "DESC" },
    })

    const companyIds = companies.map((company) => company.id)
    const members = companyIds.length
      ? await this.listB2bCompanyMembers({ company_id: companyIds })
      : []

    const memberCountByCompany = new Map<string, number>()

    for (const member of members) {
      memberCountByCompany.set(
        member.company_id,
        (memberCountByCompany.get(member.company_id) ?? 0) + 1
      )
    }

    return {
      companies: companies.map((company) => ({
        ...company,
        member_count: memberCountByCompany.get(company.id) ?? 0,
      })),
      count,
    }
  }

  async createCompany(input: CreateB2bCompanyInput) {
    const settings = await this.getSettings()
    const requireOrderApproval =
      input.require_order_approval ?? settings.default_require_order_approval

    const [company] = await this.createB2bCompanies([
      {
        ...input,
        status: "pending",
        require_order_approval: requireOrderApproval,
      },
    ])

    if (input.primary_customer_id || input.email) {
      await this.createB2bCompanyMembers([
        {
          company_id: company.id,
          customer_id: input.primary_customer_id ?? null,
          email: input.email,
          role: "admin",
          is_primary: true,
          status: "active",
        },
      ])
    }

    return this.retrieveCompanyWithMembers(company.id)
  }

  async updateCompany(input: UpdateB2bCompanyInput) {
    const { id, ...data } = input
    await this.updateB2bCompanies({ id, ...data })
    return this.retrieveCompanyWithMembers(id)
  }

  async approveCompany(companyId: string, customerGroupId?: string | null) {
    const company = await this.retrieveB2bCompany(companyId)

    await this.updateB2bCompanies({
      id: companyId,
      status: "approved",
      approved_at: new Date(),
      rejected_at: null,
      ...(customerGroupId !== undefined && {
        customer_group_id: customerGroupId,
      }),
    })

    return this.retrieveCompanyWithMembers(companyId)
  }

  async rejectCompany(companyId: string, adminNotes?: string | null) {
    await this.updateB2bCompanies({
      id: companyId,
      status: "rejected",
      rejected_at: new Date(),
      ...(adminNotes !== undefined && { admin_notes: adminNotes }),
    })

    return this.retrieveCompanyWithMembers(companyId)
  }

  async suspendCompany(companyId: string) {
    await this.updateB2bCompanies({
      id: companyId,
      status: "suspended",
    })

    return this.retrieveCompanyWithMembers(companyId)
  }

  async archiveCompany(companyId: string) {
    const company = await this.retrieveB2bCompany(companyId)

    if (company.status === "archived") {
      return this.retrieveCompanyWithMembers(companyId)
    }

    const metadata = buildArchivedCompanyMetadata(
      company.metadata as Record<string, unknown> | null,
      company.status
    )

    await this.updateB2bCompanies({
      id: companyId,
      status: "archived",
      metadata,
    })

    return this.retrieveCompanyWithMembers(companyId)
  }

  async restoreCompany(companyId: string) {
    const company = await this.retrieveB2bCompany(companyId)

    if (company.status !== "archived") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Customer is not archived"
      )
    }

    const conflict = await this.findCompanyByEmail(company.email)

    if (conflict && conflict.id !== companyId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Another active customer uses this email. Archive or delete that account first."
      )
    }

    const metadata = buildRestoredCompanyMetadata(
      company.metadata as Record<string, unknown> | null
    )
    const previousStatus = resolveCompanyRestoreStatus(company)

    await this.updateB2bCompanies({
      id: companyId,
      status: previousStatus,
      metadata,
    })

    return this.retrieveCompanyWithMembers(companyId)
  }

  async deleteCompany(companyId: string) {
    const members = await this.listB2bCompanyMembers({
      company_id: companyId,
    })

    if (members.length) {
      await this.deleteB2bCompanyMembers(members.map((member) => member.id))
    }

    await this.deleteB2bCompanies(companyId)
  }

  private isInactiveCompanyStatus(status: string) {
    return status === "archived" || status === "rejected"
  }

  async findCompanyByEmail(email: string) {
    const normalized = email.trim().toLowerCase()
    const [company] = await this.listB2bCompanies(
      { email: normalized },
      { take: 1 }
    )

    if (company && !this.isInactiveCompanyStatus(company.status)) {
      return company
    }

    const companies = await this.listB2bCompanies({}, { take: 200 })

    return (
      companies.find(
        (entry) =>
          entry.email?.trim().toLowerCase() === normalized &&
          !this.isInactiveCompanyStatus(entry.status)
      ) ?? null
    )
  }

  async findCompanyByCustomerId(customerId: string) {
    const [member] = await this.listB2bCompanyMembers(
      { customer_id: customerId, status: "active" },
      { take: 1 }
    )

    if (!member) {
      return null
    }

    return this.retrieveCompanyWithMembers(member.company_id)
  }

  async addMember(input: AddCompanyMemberInput) {
    const [member] = await this.createB2bCompanyMembers([
      {
        company_id: input.company_id,
        customer_id: input.customer_id ?? null,
        email: input.email ?? null,
        first_name: input.first_name ?? null,
        last_name: input.last_name ?? null,
        role: input.role ?? "buyer",
        is_primary: input.is_primary ?? false,
        status: input.status ?? "active",
      },
    ])

    return member
  }

  async removeMember(memberId: string) {
    const member = await this.retrieveB2bCompanyMember(memberId)

    if (member.is_primary) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Cannot remove the main contact. Change the main contact first."
      )
    }

    await this.deleteB2bCompanyMembers(memberId)

    return { id: memberId, deleted: true }
  }

  async updateMember(input: {
    id: string
    role?: "admin" | "buyer" | "approver"
    status?: "active" | "invited" | "disabled"
    first_name?: string | null
    last_name?: string | null
    customer_id?: string | null
  }) {
    const member = await this.retrieveB2bCompanyMember(input.id)

    if (member.is_primary && input.role && input.role !== "admin") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "The main contact must remain a company admin."
      )
    }

    if (member.is_primary && input.status && input.status !== "active") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "The main contact cannot be disabled."
      )
    }

    await this.updateB2bCompanyMembers({
      id: input.id,
      ...(input.role !== undefined && { role: input.role }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.first_name !== undefined && { first_name: input.first_name }),
      ...(input.last_name !== undefined && { last_name: input.last_name }),
      ...(input.customer_id !== undefined && { customer_id: input.customer_id }),
    })

    return this.retrieveB2bCompanyMember(input.id)
  }

  async setPrimaryContact(companyId: string, memberId: string) {
    const company = await this.retrieveCompanyWithMembers(companyId)
    const member = company.members?.find((entry) => entry.id === memberId)

    if (!member) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Company member not found"
      )
    }

    for (const entry of company.members ?? []) {
      if (entry.is_primary) {
        await this.updateB2bCompanyMembers({
          id: entry.id,
          is_primary: false,
        })
      }
    }

    await this.updateB2bCompanyMembers({
      id: memberId,
      is_primary: true,
      role: "admin",
    })

    await this.updateB2bCompanies({
      id: companyId,
      primary_customer_id: member.customer_id ?? company.primary_customer_id,
      ...(member.email ? { email: member.email } : {}),
    })

    return this.retrieveCompanyWithMembers(companyId)
  }

  async upsertCompanyFromQuote(input: {
    email: string
    company?: string | null
    customer_id?: string | null
  }) {
    const settings = await this.getSettings()
    const existing = await this.findCompanyByEmail(input.email)

    if (existing) {
      await this.linkCustomerToCompanyByEmail({
        companyId: existing.id,
        email: input.email,
        customerId: input.customer_id ?? null,
      })

      return this.retrieveB2bCompany(existing.id)
    }

    const [created] = await this.createB2bCompanies([
      {
        name: input.company?.trim() || input.email.split("@")[1] || "Unknown",
        email: input.email.trim().toLowerCase(),
        status: settings.auto_approve_registrations ? "approved" : "pending",
        primary_customer_id: input.customer_id ?? null,
        require_order_approval: settings.default_require_order_approval,
        ...(settings.auto_approve_registrations && { approved_at: new Date() }),
      },
    ])

    await this.createB2bCompanyMembers([
      {
        company_id: created.id,
        customer_id: input.customer_id ?? null,
        email: input.email.trim().toLowerCase(),
        role: "admin",
        is_primary: true,
        status: "active",
      },
    ])

    return created
  }

  async linkCustomerToCompanyByEmail(input: {
    companyId: string
    email: string
    customerId?: string | null
  }) {
    const normalizedEmail = input.email.trim().toLowerCase()
    const members = await this.listB2bCompanyMembers({
      company_id: input.companyId,
    })
    const usable = members.filter((entry) => entry.status !== "disabled")

    const member =
      usable.find(
        (entry) => entry.email?.trim().toLowerCase() === normalizedEmail
      ) ??
      usable.find((entry) => entry.is_primary) ??
      usable[0] ??
      null

    if (member && input.customerId) {
      await this.updateB2bCompanyMembers({
        id: member.id,
        customer_id: member.customer_id ?? input.customerId,
        email: member.email ?? normalizedEmail,
        ...(member.status === "invited" ? { status: "active" } : {}),
      })
    }

    if (!member && input.customerId) {
      await this.createB2bCompanyMembers([
        {
          company_id: input.companyId,
          customer_id: input.customerId,
          email: normalizedEmail,
          role: "admin",
          is_primary: members.length === 0,
          status: "active",
        },
      ])
    }

    const company = await this.retrieveB2bCompany(input.companyId)

    if (input.customerId && !company.primary_customer_id) {
      await this.updateB2bCompanies({
        id: input.companyId,
        primary_customer_id: input.customerId,
      })
    }

    return this.retrieveCompanyWithMembers(input.companyId)
  }

  async findCompanyByCustomerEmail(email: string) {
    return this.findCompanyByEmail(email)
  }

  async findMemberByCustomerId(customerId: string) {
    const [member] = await this.listB2bCompanyMembers(
      { customer_id: customerId },
      { take: 1 }
    )

    if (!member || member.status === "disabled") {
      return null
    }

    return member
  }

  async createOrderApproval(input: {
    order_id: string
    company_id: string
    requested_by_member_id?: string | null
  }) {
    const [existing] = await this.listB2bOrderApprovals(
      { order_id: input.order_id },
      { take: 1 }
    )

    if (existing) {
      return existing
    }

    const [approval] = await this.createB2bOrderApprovals([
      {
        order_id: input.order_id,
        company_id: input.company_id,
        requested_by_member_id: input.requested_by_member_id ?? null,
        status: "pending",
      },
    ])

    return approval
  }

  async listOrderApprovalsForAdmin(input: {
    status?: "pending" | "approved" | "rejected"
    limit?: number
    offset?: number
  } = {}) {
    const filters: Record<string, unknown> = {}
    if (input.status) {
      filters.status = input.status
    }

    const [approvals, count] = await this.listAndCountB2bOrderApprovals(
      filters,
      {
        take: input.limit ?? 20,
        skip: input.offset ?? 0,
        order: { created_at: "DESC" },
      }
    )

    return { approvals, count }
  }

  async approveOrderApproval(
    approvalId: string,
    approvedByMemberId?: string | null,
    notes?: string | null
  ) {
    const existing = await this.retrieveB2bOrderApproval(approvalId)

    if (existing.status !== "pending") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Order approval is already ${existing.status}`
      )
    }

    await this.updateB2bOrderApprovals({
      id: approvalId,
      status: "approved",
      approved_by_member_id: approvedByMemberId ?? null,
      ...(notes !== undefined && { notes }),
    })

    return this.retrieveB2bOrderApproval(approvalId)
  }

  async rejectOrderApproval(
    approvalId: string,
    approvedByMemberId?: string | null,
    notes?: string | null
  ) {
    const existing = await this.retrieveB2bOrderApproval(approvalId)

    if (existing.status !== "pending") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Order approval is already ${existing.status}`
      )
    }

    await this.updateB2bOrderApprovals({
      id: approvalId,
      status: "rejected",
      approved_by_member_id: approvedByMemberId ?? null,
      ...(notes !== undefined && { notes }),
    })

    return this.retrieveB2bOrderApproval(approvalId)
  }

  async findOrderApprovalByOrderId(orderId: string) {
    const [approval] = await this.listB2bOrderApprovals(
      { order_id: orderId },
      { take: 1 }
    )
    return approval ?? null
  }

  async shouldRequireOrderApproval(customerId: string) {
    const settings = await this.getSettings()

    if (!settings.order_approval_enabled) {
      return null
    }

    const member = await this.findMemberByCustomerId(customerId)
    if (!member) {
      return null
    }

    const company = await this.retrieveB2bCompany(member.company_id)

    if (company.status !== "approved" || !company.require_order_approval) {
      return null
    }

    if (member.role === "admin" || member.is_primary) {
      return null
    }

    return { company, member }
  }

  async createConversation(input: {
    subject: string
    company_id?: string | null
    quote_id?: string | null
    order_id?: string | null
    customer_id?: string | null
    created_by?: "admin" | "customer"
    initial_message?: string
    sender_type?: "admin" | "customer"
    sender_id?: string | null
    sender_name?: string | null
  }) {
    const [conversation] = await this.createB2bConversations([
      {
        subject: input.subject,
        company_id: input.company_id ?? null,
        quote_id: input.quote_id ?? null,
        order_id: input.order_id ?? null,
        customer_id: input.customer_id ?? null,
        created_by: input.created_by ?? "customer",
        status: "open",
      },
    ])

    if (input.initial_message) {
      await this.createB2bMessages([
        {
          conversation_id: conversation.id,
          body: input.initial_message,
          sender_type: input.sender_type ?? input.created_by ?? "customer",
          sender_id: input.sender_id ?? null,
          sender_name: input.sender_name ?? null,
        },
      ])
    }

    return this.retrieveConversationWithMessages(conversation.id)
  }

  async retrieveConversationWithMessages(conversationId: string) {
    const conversation = await this.retrieveB2bConversation(conversationId)
    const messages = await this.listB2bMessages(
      { conversation_id: conversationId },
      { order: { created_at: "ASC" } }
    )

    return { ...conversation, messages }
  }

  async detachQuoteFromConversations(quoteId: string) {
    const conversations = await this.listB2bConversations({ quote_id: quoteId })

    for (const conversation of conversations) {
      const metadata = {
        ...((conversation.metadata as Record<string, unknown> | null) ?? {}),
        detached_quote_id: quoteId,
        detached_quote_at: new Date().toISOString(),
      }

      await this.updateB2bConversations({
        id: conversation.id,
        quote_id: null,
        metadata,
      })
    }

    return conversations.length
  }

  async listConversationsForAdmin(input: {
    status?: "open" | "closed" | "archived" | "all"
    limit?: number
    offset?: number
  } = {}) {
    const filters: Record<string, unknown> = {}

    if (input.status === "archived") {
      filters.status = "archived"
    } else if (input.status === "open" || input.status === "closed") {
      filters.status = input.status
    } else if (input.status !== "all") {
      filters.status = { $in: ["open", "closed"] }
    }

    const limit = normalizeConversationLimit(input.limit)
    const offset = normalizeConversationOffset(input.offset)

    const [conversations, count] = await this.listAndCountB2bConversations(
      filters,
      {
        take: limit,
        skip: offset,
        order: { updated_at: "DESC" },
      }
    )

    return { conversations, count }
  }

  async archiveConversation(conversationId: string) {
    const conversation = await this.retrieveB2bConversation(conversationId)

    if (isConversationArchived(conversation.status)) {
      return this.retrieveConversationWithMessages(conversationId)
    }

    const metadata = buildArchivedConversationMetadata(
      conversation.metadata as Record<string, unknown> | null,
      conversation.status
    )

    await this.updateB2bConversations({
      id: conversationId,
      status: "archived",
      metadata,
    })

    return this.retrieveConversationWithMessages(conversationId)
  }

  async restoreConversation(conversationId: string) {
    const conversation = await this.retrieveB2bConversation(conversationId)

    if (!isConversationArchived(conversation.status)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Conversation is not archived"
      )
    }

    const metadata = buildRestoredConversationMetadata(
      conversation.metadata as Record<string, unknown> | null
    )
    const previousStatus = resolveConversationRestoreStatus(conversation)

    await this.updateB2bConversations({
      id: conversationId,
      status: previousStatus,
      metadata,
    })

    return this.retrieveConversationWithMessages(conversationId)
  }

  async deleteConversation(conversationId: string) {
    const messages = await this.listB2bMessages({
      conversation_id: conversationId,
    })

    if (messages.length) {
      await this.deleteB2bMessages(messages.map((message) => message.id))
    }

    await this.deleteB2bConversations(conversationId)

    return { id: conversationId, deleted: true }
  }

  async listConversationsForCustomer(input: {
    customer_id: string
    company_id?: string | null
    quote_ids?: string[]
    limit?: number
    offset?: number
  }) {
    const accessFilters: Array<Record<string, unknown>> = [
      { customer_id: input.customer_id },
    ]

    if (input.company_id) {
      accessFilters.push({ company_id: input.company_id })
    }

    if (input.quote_ids?.length) {
      accessFilters.push({ quote_id: { $in: input.quote_ids } })
    }

    const limit = normalizeConversationLimit(input.limit)
    const offset = normalizeConversationOffset(input.offset)
    const [conversations, count] = await this.listAndCountB2bConversations(
      {
        status: { $ne: "archived" },
        $or: accessFilters,
      },
      {
        take: limit,
        skip: offset,
        order: { updated_at: "DESC" },
      }
    )

    return {
      conversations,
      count,
      limit,
      offset,
    }
  }

  async listLatestMessagesForConversations(conversationIds: string[]) {
    if (!conversationIds.length) {
      return new Map<string, Awaited<ReturnType<typeof this.listB2bMessages>>[number]>()
    }

    const messages = await this.listB2bMessages(
      { conversation_id: { $in: conversationIds } },
      { order: { created_at: "DESC" } }
    )
    const latestByConversation = new Map<string, (typeof messages)[number]>()

    for (const message of messages) {
      if (!latestByConversation.has(message.conversation_id)) {
        latestByConversation.set(message.conversation_id, message)
      }
    }

    return latestByConversation
  }

  async customerCanAccessConversation(
    conversation: {
      customer_id?: string | null
      company_id?: string | null
      quote_id?: string | null
    },
    context: {
      customerId: string
      companyId?: string | null
      quoteIds?: string[]
    }
  ) {
    if (conversation.customer_id === context.customerId) {
      return true
    }

    if (
      context.companyId &&
      conversation.company_id &&
      conversation.company_id === context.companyId
    ) {
      return true
    }

    if (
      conversation.quote_id &&
      context.quoteIds?.includes(conversation.quote_id)
    ) {
      return true
    }

    return false
  }

  async listOrderApprovalsForCompany(input: {
    company_id: string
    status?: "pending" | "approved" | "rejected"
    limit?: number
    offset?: number
  }) {
    const filters: Record<string, unknown> = {
      company_id: input.company_id,
    }

    if (input.status) {
      filters.status = input.status
    }

    const [approvals, count] = await this.listAndCountB2bOrderApprovals(
      filters,
      {
        take: input.limit ?? 20,
        skip: input.offset ?? 0,
        order: { created_at: "DESC" },
      }
    )

    return {
      approvals,
      count,
      limit: input.limit ?? 20,
      offset: input.offset ?? 0,
    }
  }

  async addMessage(input: {
    conversation_id: string
    body: string
    sender_type: "admin" | "customer" | "system"
    sender_id?: string | null
    sender_name?: string | null
  }) {
    const conversation = await this.retrieveB2bConversation(input.conversation_id)

    if (isConversationArchived(conversation.status)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Cannot reply to an archived conversation. Restore it first."
      )
    }

    const [message] = await this.createB2bMessages([
      {
        conversation_id: input.conversation_id,
        body: input.body,
        sender_type: input.sender_type,
        sender_id: input.sender_id ?? null,
        sender_name: input.sender_name ?? null,
      },
    ])

    await this.updateB2bConversations({
      id: input.conversation_id,
      status: "open",
    })

    return message
  }

  async createPricingTier(input: {
    name: string
    customer_group_id?: string | null
    variant_id?: string | null
    product_id?: string | null
    min_quantity?: number
    max_quantity?: number | null
    unit_price?: number | null
    currency_code?: string
    discount_percent?: number
    priority?: number
    status?: "active" | "disabled"
  }) {
    const [tier] = await this.createB2bPricingTiers([input])
    return tier
  }

  async updatePricingTier(input: {
    id: string
    name?: string
    customer_group_id?: string | null
    variant_id?: string | null
    product_id?: string | null
    min_quantity?: number
    max_quantity?: number | null
    unit_price?: number | null
    currency_code?: string
    discount_percent?: number
    priority?: number
    status?: "active" | "disabled"
  }) {
    const { id, ...data } = input
    await this.updateB2bPricingTiers({ id, ...data })
    return this.retrieveB2bPricingTier(id)
  }

  async listPricingTiersForAdmin(input: {
    variant_id?: string
    customer_group_id?: string
    status?: "active" | "disabled"
    limit?: number
    offset?: number
  } = {}) {
    const filters: Record<string, unknown> = {}
    if (input.variant_id) filters.variant_id = input.variant_id
    if (input.customer_group_id) {
      filters.customer_group_id = input.customer_group_id
    }
    if (input.status) filters.status = input.status

    const [tiers, count] = await this.listAndCountB2bPricingTiers(filters, {
      take: input.limit ?? 50,
      skip: input.offset ?? 0,
      order: { priority: "DESC" },
    })

    return { tiers, count }
  }

  async resolveTierPrice(input: {
    variant_id: string
    quantity: number
    customer_group_id?: string | null
    currency_code?: string
  }) {
    const tiers = await this.listB2bPricingTiers(
      {
        variant_id: input.variant_id,
        status: "active",
      },
      { take: 100, order: { priority: "DESC" } }
    )

    const matching = tiers
      .filter((tier) => {
        if (
          input.customer_group_id &&
          tier.customer_group_id &&
          tier.customer_group_id !== input.customer_group_id
        ) {
          return false
        }

        if (input.quantity < tier.min_quantity) {
          return false
        }

        if (tier.max_quantity != null && input.quantity > tier.max_quantity) {
          return false
        }

        if (
          input.currency_code &&
          tier.currency_code &&
          tier.currency_code !== input.currency_code
        ) {
          return false
        }

        return true
      })
      .sort((a, b) => b.min_quantity - a.min_quantity)

    return matching[0] ?? null
  }
}

export default B2bModuleService

function normalizeConversationLimit(limit: number | undefined) {
  if (!Number.isFinite(limit)) {
    return 20
  }

  return Math.min(Math.max(Math.floor(limit ?? 20), 1), 100)
}

function normalizeConversationOffset(offset: number | undefined) {
  if (!Number.isFinite(offset)) {
    return 0
  }

  return Math.max(Math.floor(offset ?? 0), 0)
}
