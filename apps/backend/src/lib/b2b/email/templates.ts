import type { B2bModuleSettings } from "../settings-types"
import {
  getEmailRuntimeConfig,
  type B2bEmailRuntimeConfig,
} from "../settings-email"
import type { QuoteEmailPayload } from "./quote-email-data"

const BRAND = {
  navy: "#0A1628",
  accent: "#008060",
  text: "#202223",
  muted: "#6d7175",
  border: "#e1e3e5",
  bg: "#f6f6f7",
  white: "#ffffff",
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

const formatMoney = (amount: number, currencyCode: string) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
  }).format(amount)

const formatDateTime = (iso: string | null) => {
  if (!iso) {
    return "just now"
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso))
}

const shortId = (id: string) => id.slice(-8).toUpperCase()

const layout = (body: string) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0;padding:24px;background:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BRAND.text};">
    <div style="max-width:560px;margin:0 auto;background:${BRAND.white};border:1px solid ${BRAND.border};border-radius:8px;overflow:hidden;">
      ${body}
      <div style="padding:20px 24px;border-top:1px solid ${BRAND.border};text-align:center;">
        <div style="font-size:14px;font-weight:700;color:${BRAND.navy};letter-spacing:0.02em;">Supercore Industrial</div>
        <div style="margin-top:6px;font-size:11px;color:${BRAND.muted};line-height:1.4;">
          Industrial networking, CCTV, PAGA &amp; hazardous area solutions
        </div>
      </div>
    </div>
  </body>
</html>`

const button = (href: string, label: string) =>
  `<p style="margin:20px 0 0;"><a href="${href}" style="display:inline-block;background:${BRAND.accent};color:${BRAND.white};text-decoration:none;padding:12px 18px;border-radius:8px;font-size:14px;font-weight:600;">${escapeHtml(label)}</a></p>`

const divider = () =>
  `<div style="height:1px;background:${BRAND.border};margin:24px 0;"></div>`

const summaryRow = (label: string, value: string, strong = false) => `
  <tr>
    <td style="padding:6px 0;color:${BRAND.muted};font-size:14px;${strong ? `font-weight:700;color:${BRAND.text};` : ""}">${label}</td>
    <td style="padding:6px 0;text-align:right;font-size:14px;${strong ? "font-weight:700;" : ""}">${value}</td>
  </tr>`

const quoteSummaryBlock = (quote: QuoteEmailPayload) => {
  const itemRows = quote.items
    .map((item) => {
      const title = escapeHtml(item.title)
      const sku = item.sku ? escapeHtml(item.sku) : null
      const qtyPrice =
        item.unit_price != null
          ? `${escapeHtml(formatMoney(item.unit_price, quote.currency_code))} × ${item.quantity}`
          : `Qty ${item.quantity}`
      const lineTotal =
        item.line_total != null
          ? escapeHtml(formatMoney(item.line_total, quote.currency_code))
          : "Quote pending"

      return `
        <tr>
          <td style="padding:14px 0;border-top:1px solid ${BRAND.border};vertical-align:top;">
            <div style="font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.02em;">${title}</div>
            <div style="margin-top:4px;font-size:13px;color:${BRAND.muted};">${qtyPrice}</div>
            ${sku ? `<div style="margin-top:2px;font-size:12px;color:${BRAND.muted};">SKU: ${sku}</div>` : ""}
          </td>
          <td style="padding:14px 0;border-top:1px solid ${BRAND.border};vertical-align:top;text-align:right;font-size:14px;white-space:nowrap;">
            ${lineTotal}
          </td>
        </tr>`
    })
    .join("")

  const totals =
    quote.subtotal != null
      ? `
        <table style="width:100%;border-collapse:collapse;margin-top:8px;">
          ${summaryRow("Subtotal", escapeHtml(formatMoney(quote.subtotal, quote.currency_code)))}
          ${summaryRow(
            "Total",
            escapeHtml(
              `${formatMoney(quote.subtotal, quote.currency_code)} ${quote.currency_code.toUpperCase()}`
            ),
            true
          )}
        </table>`
      : `
        <p style="margin:12px 0 0;font-size:13px;color:${BRAND.muted};">
          Pricing will be confirmed by our sales team.
        </p>`

  return `
    <h2 style="margin:0 0 8px;font-size:16px;font-weight:700;">Quote summary</h2>
    <table style="width:100%;border-collapse:collapse;">
      ${itemRows || `<tr><td style="padding:12px 0;color:${BRAND.muted};">No line items</td></tr>`}
    </table>
    ${totals}`
}

const customerDetailsBlock = (quote: QuoteEmailPayload) => `
  <h2 style="margin:0 0 12px;font-size:16px;font-weight:700;">Customer details</h2>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <tr>
      <td style="padding:4px 0;width:120px;color:${BRAND.muted};vertical-align:top;">Email</td>
      <td style="padding:4px 0;">${escapeHtml(quote.email ?? "—")}</td>
    </tr>
    <tr>
      <td style="padding:4px 0;color:${BRAND.muted};vertical-align:top;">Company</td>
      <td style="padding:4px 0;">${escapeHtml(quote.company ?? "—")}</td>
    </tr>
    <tr>
      <td style="padding:4px 0;color:${BRAND.muted};vertical-align:top;">Project</td>
      <td style="padding:4px 0;">${escapeHtml(quote.project ?? "—")}</td>
    </tr>
    ${
      quote.notes
        ? `<tr>
      <td style="padding:4px 0;color:${BRAND.muted};vertical-align:top;">Notes</td>
      <td style="padding:4px 0;white-space:pre-wrap;">${escapeHtml(quote.notes)}</td>
    </tr>`
        : ""
    }
  </table>`

const resolveConfig = (settings?: B2bModuleSettings) =>
  getEmailRuntimeConfig(settings)

export const emailTemplates = {
  registrationAdmin(
    input: {
      companyName: string
      email: string
      companyId: string
    },
    settings?: B2bModuleSettings
  ) {
    const config = resolveConfig(settings)
    const href = `${config.adminUrl}/customers/companies/${input.companyId}`

    return {
      subject: `New trade registration: ${input.companyName}`,
      html: layout(`
        <div style="padding:24px;">
          <p style="margin:0;font-size:14px;line-height:1.5;">
            <strong>${escapeHtml(input.companyName)}</strong> submitted a trade account registration.
          </p>
          ${button(href, "Review registration")}
          ${divider()}
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:6px 0;color:${BRAND.muted};">Company</td><td style="padding:6px 0;text-align:right;font-weight:600;">${escapeHtml(input.companyName)}</td></tr>
            <tr><td style="padding:6px 0;color:${BRAND.muted};">Email</td><td style="padding:6px 0;text-align:right;">${escapeHtml(input.email)}</td></tr>
          </table>
        </div>
      `),
    }
  },

  quoteSubmitAdmin(quote: QuoteEmailPayload, settings?: B2bModuleSettings) {
    const config = resolveConfig(settings)
    const href = `${config.adminUrl}/b2b/offers/${quote.quote_id}`
    const who = quote.company?.trim() || quote.email || "A customer"
    const intro = `${escapeHtml(who)} submitted quote request #${shortId(quote.quote_id)} on ${escapeHtml(formatDateTime(quote.created_at))}.`

    return {
      subject: `New quote request${quote.company ? `: ${quote.company}` : ""} (#${shortId(quote.quote_id)})`,
      html: layout(`
        <div style="padding:24px;">
          <p style="margin:0;font-size:14px;line-height:1.5;">${intro}</p>
          ${button(href, "View quote request")}
          ${divider()}
          ${quoteSummaryBlock(quote)}
          ${divider()}
          ${customerDetailsBlock(quote)}
        </div>
      `),
    }
  },

  quoteSubmitCustomer(quote: QuoteEmailPayload, settings?: B2bModuleSettings) {
    const config = resolveConfig(settings)
    const href = `${config.storefrontUrl}/account`

    return {
      subject: `We received your quote request (#${shortId(quote.quote_id)})`,
      html: layout(`
        <div style="padding:24px;">
          <p style="margin:0;font-size:14px;line-height:1.5;">
            Thanks${quote.company ? ` ${escapeHtml(quote.company)}` : ""} — we received your quote request on ${escapeHtml(formatDateTime(quote.created_at))}.
          </p>
          <p style="margin:12px 0 0;font-size:14px;line-height:1.5;color:${BRAND.muted};">
            Our team will review the items below and reply with pricing.
          </p>
          ${button(href, "View trade account")}
          ${divider()}
          ${quoteSummaryBlock(quote)}
          ${divider()}
          ${customerDetailsBlock(quote)}
        </div>
      `),
    }
  },

  offerSentCustomer(
    input: {
      quoteId: string
      email: string
      company?: string | null
      offerTotal?: number | null
      currencyCode?: string | null
      quote?: QuoteEmailPayload | null
    },
    settings?: B2bModuleSettings
  ) {
    const config = resolveConfig(settings)
    const currency = (input.currencyCode ?? input.quote?.currency_code ?? "gbp").toLowerCase()
    const total =
      input.offerTotal != null
        ? formatMoney(input.offerTotal, currency)
        : input.quote?.subtotal != null
          ? formatMoney(input.quote.subtotal, currency)
          : null

    return {
      subject: `Your quote offer is ready (#${shortId(input.quoteId)})`,
      html: layout(`
        <div style="padding:24px;">
          <p style="margin:0;font-size:14px;line-height:1.5;">
            Hello${input.company ? ` from ${escapeHtml(input.company)}` : ""}, our sales team has sent you a priced quote offer. A branded PDF is attached for internal approval.
          </p>
          ${
            total
              ? `<p style="margin:16px 0 0;font-size:22px;font-weight:700;">${escapeHtml(total)} <span style="font-size:13px;font-weight:500;color:${BRAND.muted};">${currency.toUpperCase()}</span></p>`
              : ""
          }
          ${button(`${config.storefrontUrl}/account/trade/quotes/${input.quoteId}`, "Review offer")}
          ${input.quote ? `${divider()}${quoteSummaryBlock(input.quote)}` : ""}
        </div>
      `),
    }
  },

  conversationReplyCustomer(
    input: {
      subject: string
      body: string
      senderName?: string | null
      conversationId: string
      quoteId?: string | null
    },
    settings?: B2bModuleSettings
  ) {
    const config = resolveConfig(settings)
    const href = `${config.storefrontUrl}/account`

    return {
      subject: `New reply: ${input.subject}`,
      html: layout(`
        <div style="padding:24px;">
          <p style="margin:0;font-size:14px;line-height:1.5;">
            ${escapeHtml(input.senderName?.trim() || "Supercore sales")} replied to your conversation.
          </p>
          ${button(href, "Open conversation")}
          ${divider()}
          <h2 style="margin:0 0 8px;font-size:16px;font-weight:700;">${escapeHtml(input.subject)}</h2>
          <div style="padding:14px 16px;background:${BRAND.bg};border:1px solid ${BRAND.border};border-radius:8px;font-size:14px;line-height:1.55;white-space:pre-wrap;">${escapeHtml(input.body)}</div>
          ${
            input.quoteId
              ? `<p style="margin:16px 0 0;font-size:12px;color:${BRAND.muted};">Related quote #${shortId(input.quoteId)}</p>`
              : ""
          }
        </div>
      `),
    }
  },

  passwordReset(
    input: {
      email: string
      resetUrl: string
      actorType: string
    },
    settings?: B2bModuleSettings
  ) {
    resolveConfig(settings)
    const isAdmin = input.actorType === "user"

    return {
      subject: isAdmin
        ? "Reset your Supercore admin password"
        : "Reset your password",
      html: layout(`
        <div style="padding:24px;">
          <p style="margin:0;font-size:14px;line-height:1.5;">
            We received a request to reset the password for <strong>${escapeHtml(input.email)}</strong>.
          </p>
          <p style="margin:12px 0 0;font-size:14px;color:${BRAND.muted};line-height:1.5;">
            ${
              isAdmin
                ? "Use the button below to set a new admin password. The link expires shortly."
                : "Use the button below to set a new password for your store account. The link expires shortly."
            }
          </p>
          ${button(input.resetUrl, "Reset password")}
          <p style="margin:20px 0 0;font-size:12px;color:${BRAND.muted};line-height:1.5;">
            If you did not request this, you can ignore this email. Your password will stay the same.
          </p>
        </div>
      `),
    }
  },

  registrationApprovedCustomer(
    input: {
      companyName: string
      email: string
      passwordSetupUrl?: string | null
    },
    settings?: B2bModuleSettings
  ) {
    const config = resolveConfig(settings)
    const href = input.passwordSetupUrl ?? `${config.storefrontUrl}/account`

    return {
      subject: "Your trade account has been approved",
      html: layout(`
        <div style="padding:24px;">
          <p style="margin:0;font-size:14px;line-height:1.5;">
            Your trade account request for <strong>${escapeHtml(input.companyName)}</strong> has been approved.
          </p>
          <p style="margin:12px 0 0;font-size:14px;color:${BRAND.muted};line-height:1.5;">
            Set your password to sign in, view tier pricing, submit orders, and manage quote requests.
          </p>
          ${button(href, input.passwordSetupUrl ? "Set your password" : "Sign in to trade account")}
        </div>
      `),
    }
  },

  orderApprovalCustomer(
    input: {
      orderId: string
      companyName: string
    },
    settings?: B2bModuleSettings
  ) {
    const config = resolveConfig(settings)
    const href = `${config.storefrontUrl}/account/trade/approvals`

    return {
      subject: `Order ${shortId(input.orderId)} needs approval`,
      html: layout(`
        <div style="padding:24px;">
          <p style="margin:0;font-size:14px;line-height:1.5;">
            A subaccount order for <strong>${escapeHtml(input.companyName)}</strong> is waiting for company approval.
          </p>
          ${button(href, "Review order approvals")}
        </div>
      `),
    }
  },

  orderApprovalAdmin(
    input: {
      orderId: string
      companyName: string
      approvalId: string
    },
    settings?: B2bModuleSettings
  ) {
    const config = resolveConfig(settings)
    const href = `${config.adminUrl}/b2b/order-approvals`

    return {
      subject: `Order pending approval: ${input.companyName}`,
      html: layout(`
        <div style="padding:24px;">
          <p style="margin:0;font-size:14px;line-height:1.5;">
            A subaccount order from <strong>${escapeHtml(input.companyName)}</strong> is waiting for approval.
          </p>
          ${button(href, "Review approvals")}
          ${divider()}
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:6px 0;color:${BRAND.muted};">Company</td><td style="padding:6px 0;text-align:right;font-weight:600;">${escapeHtml(input.companyName)}</td></tr>
            <tr><td style="padding:6px 0;color:${BRAND.muted};">Order ID</td><td style="padding:6px 0;text-align:right;font-family:ui-monospace,monospace;">${escapeHtml(input.orderId)}</td></tr>
          </table>
        </div>
      `),
    }
  },

  adminMfaChallenge(
    input: { email: string; code: string },
    settings?: B2bModuleSettings
  ) {
    resolveConfig(settings)

    return {
      subject: "Your Medusa admin sign-in code",
      html: layout(`
        <div style="padding:24px;">
          <p style="margin:0;font-size:14px;line-height:1.5;">
            Use this code to finish signing in to the Supercore admin dashboard:
          </p>
          <p style="font-size:32px;font-weight:700;letter-spacing:6px;margin:24px 0;text-align:center;">${escapeHtml(input.code)}</p>
          <p style="margin:0;color:${BRAND.muted};font-size:13px;">This code expires in 15 minutes. If you did not try to sign in, you can ignore this email.</p>
        </div>
      `),
    }
  },

  mfaChallenge(
    input: { email: string; code: string },
    settings?: B2bModuleSettings
  ) {
    resolveConfig(settings)

    return {
      subject: "Your trade account sign-in code",
      html: layout(`
        <div style="padding:24px;">
          <p style="margin:0;font-size:14px;line-height:1.5;">
            Use this code to finish signing in to your trade account:
          </p>
          <p style="font-size:32px;font-weight:700;letter-spacing:6px;margin:24px 0;text-align:center;">${escapeHtml(input.code)}</p>
          <p style="margin:0;color:${BRAND.muted};font-size:13px;">This code expires in 15 minutes. If you did not try to sign in, you can ignore this email.</p>
        </div>
      `),
    }
  },

  tradeRegistrationVerification(
    input: { email: string; code: string },
    settings?: B2bModuleSettings
  ) {
    resolveConfig(settings)

    return {
      subject: "Verify your email for trade account registration",
      html: layout(`
        <div style="padding:24px;">
          <p style="margin:0;font-size:14px;line-height:1.5;">
            Enter this verification code to continue your trade account registration:
          </p>
          <p style="font-size:32px;font-weight:700;letter-spacing:6px;margin:24px 0;text-align:center;">${escapeHtml(input.code)}</p>
          <p style="margin:0;color:${BRAND.muted};font-size:13px;">This code expires in 15 minutes.</p>
        </div>
      `),
    }
  },

  registrationReceivedCustomer(
    input: { companyName: string },
    settings?: B2bModuleSettings
  ) {
    const config = resolveConfig(settings)

    return {
      subject: "Trade account application received",
      html: layout(`
        <div style="padding:24px;">
          <p style="margin:0;font-size:14px;line-height:1.5;">
            Thank you for registering <strong>${escapeHtml(input.companyName)}</strong> for a trade account.
          </p>
          <p style="margin:12px 0 0;font-size:14px;color:${BRAND.muted};line-height:1.5;">
            Our team will review your application and email you when your account is approved.
          </p>
          ${button(config.storefrontUrl, "Visit storefront")}
        </div>
      `),
    }
  },

  b2bAccessInvite(
    input: {
      companyName: string
      email: string
      role?: string | null
      passwordSetupUrl?: string | null
      storefrontUrl?: string
    },
    settings?: B2bModuleSettings
  ) {
    const config = resolveConfig(settings)
    const href =
      input.passwordSetupUrl ??
      input.storefrontUrl ??
      `${config.storefrontUrl}/account`
    const roleLabel = input.role
      ? ` as a company ${escapeHtml(input.role)}`
      : ""

    return {
      subject: `B2B access for ${input.companyName}`,
      html: layout(`
        <div style="padding:24px;">
          <p style="margin:0;font-size:14px;line-height:1.5;">
            You have been invited${roleLabel} to the B2B account for <strong>${escapeHtml(input.companyName)}</strong>.
          </p>
          <p style="margin:12px 0 0;font-size:14px;color:${BRAND.muted};">
            Use <strong>${escapeHtml(input.email)}</strong> to view tier pricing, submit orders, and manage quotes.
          </p>
          ${button(
            href,
            input.passwordSetupUrl
              ? "Set your password"
              : "Sign in to trade account"
          )}
        </div>
      `),
    }
  },

  abandonedCheckoutRecovery(
    input: {
      customerName: string
      checkoutUrl: string
      displayId: string
      items: Array<{ title: string; quantity: number }>
      total: number
      currencyCode: string
    },
    settings?: B2bModuleSettings
  ) {
    resolveConfig(settings)
    const totalFormatted = formatMoney(input.total, input.currencyCode)
    const visibleItems = input.items.slice(0, 5)
    const remaining = input.items.length - visibleItems.length
    const itemRows = visibleItems
      .map(
        (item) => `
        <tr>
          <td style="padding:10px 0;border-top:1px solid ${BRAND.border};">${escapeHtml(item.title)}</td>
          <td style="padding:10px 0;border-top:1px solid ${BRAND.border};text-align:right;">× ${item.quantity}</td>
        </tr>`
      )
      .join("")

    return {
      subject: "You left items in your checkout",
      html: layout(`
        <div style="padding:24px;">
          <p style="margin:0;font-size:14px;line-height:1.5;">
            Hello ${escapeHtml(input.customerName)}, it looks like you did not finish checking out.
          </p>
          ${button(input.checkoutUrl, "Return to checkout")}
          ${divider()}
          <h2 style="margin:0 0 8px;font-size:16px;font-weight:700;">Order summary</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            ${itemRows}
            ${
              remaining > 0
                ? `<tr><td colspan="2" style="padding:8px 0;color:${BRAND.muted};">and ${remaining} more item${remaining === 1 ? "" : "s"}</td></tr>`
                : ""
            }
            <tr>
              <td style="padding:12px 0;font-weight:700;border-top:1px solid ${BRAND.border};">Total</td>
              <td style="padding:12px 0;font-weight:700;text-align:right;border-top:1px solid ${BRAND.border};">${escapeHtml(totalFormatted)}</td>
            </tr>
          </table>
          <p style="margin:16px 0 0;color:${BRAND.muted};font-size:12px;">Checkout reference #${escapeHtml(input.displayId)}</p>
        </div>
      `),
    }
  },
}

export type { B2bEmailRuntimeConfig }
