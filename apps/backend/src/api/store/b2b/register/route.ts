import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { B2B_MODULE } from "../../../../modules/b2b"
import B2bModuleService from "../../../../modules/b2b/service"
import { allowsDedicatedRegistration } from "../../../../lib/b2b/settings-guard"
import { notifyRegistrationReceived } from "../../../../lib/b2b/email/notifications"
import { consumeVerificationToken } from "../../../../lib/b2b/trade-registration-verification"
import approveB2bCompanyWorkflow from "../../../../workflows/b2b/approve-b2b-company"
import { auditFromRequest } from "../../../../lib/security/audit"
import { Modules } from "@medusajs/framework/utils"
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const settings = await b2bService.getSettings()

  if (!allowsDedicatedRegistration(settings)) {
    res.status(403).json({
      message:
        "Trade account registration via form is disabled. Submit a quote request instead.",
    })
    return
  }

  const body = (req.body || {}) as {
    name: string
    email: string
    verification_token?: string | null
    legal_name?: string | null
    contact_name?: string | null
    phone?: string | null
    vat_number?: string | null
    registration_number?: string | null
    website?: string | null
    country_code?: string | null
    customer_id?: string | null
    admin_notes?: string | null
  }

  if (!body.name?.trim() || !body.email?.trim()) {
    res.status(400).json({ message: "Company name and email are required" })
    return
  }

  const normalizedEmail = body.email.trim().toLowerCase()

  if (!body.verification_token?.trim()) {
    res.status(400).json({
      message: "Email verification is required before submitting a trade account.",
    })
    return
  }

  if (!consumeVerificationToken(body.verification_token.trim(), normalizedEmail)) {
    res.status(400).json({
      message:
        "Email verification expired or invalid. Verify your email and try again.",
    })
    return
  }

  const existing = await b2bService.findCompanyByEmail(normalizedEmail)

  if (existing) {
    res.status(409).json({
      message:
        "A trade account with this email already exists. Archive or delete the existing customer in B2B → Customers, then try again.",
      company_id: existing.id,
      status: existing.status,
    })
    return
  }

  const contactNote = body.contact_name?.trim()
    ? `Primary contact: ${body.contact_name.trim()}`
    : null
  const adminNotes = [contactNote, body.admin_notes?.trim()]
    .filter(Boolean)
    .join("\n\n")

  const company = await b2bService.registerTradeAccount({
    name: body.name.trim(),
    email: normalizedEmail,
    legal_name: body.legal_name ?? null,
    phone: body.phone ?? null,
    vat_number: body.vat_number ?? null,
    registration_number: body.registration_number ?? null,
    website: body.website ?? null,
    country_code: body.country_code ?? null,
    primary_customer_id: body.customer_id ?? null,
    admin_notes: adminNotes || null,
    metadata: contactNote
      ? { contact_name: body.contact_name?.trim() ?? null }
      : null,
  })

  let responseCompany = company

  if (settings.auto_approve_registrations) {
    const { result } = await approveB2bCompanyWorkflow(req.scope).run({
      input: { company_id: company.id },
    })
    responseCompany = result

    await auditFromRequest(req, {
      actor_type: "customer",
      actor_email: normalizedEmail,
      action: "b2b.company.approved",
      resource_type: "b2b_company",
      resource_id: result.id,
      company_id: result.id,
      summary: `Auto-approved registration ${result.name}`,
    })
  } else {
    const eventBus = req.scope.resolve(Modules.EVENT_BUS)
    await eventBus.emit({
      name: "b2b.registration.created",
      data: {
        id: company.id,
        name: company.name,
        email: company.email,
      },
    })

    await notifyRegistrationReceived(req.scope, {
      companyName: company.name,
      email: company.email,
    })
  }

  res.status(201).json({ company: responseCompany })
}