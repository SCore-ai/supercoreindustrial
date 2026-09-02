"use client"

import { Badge, Button, Heading, Input, Label, Text } from "@medusajs/ui"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { b2bClient } from "../../lib/client"
import type {
  B2bEmailSettingsStatus,
  B2bEmailTestResult,
  B2bModuleSettings,
} from "../../lib/types"
import { SettingsToggleRow } from "./settings-toggle-row"

type EmailFormFields = Pick<
  B2bModuleSettings,
  | "email_enabled"
  | "email_from"
  | "email_admin"
  | "smtp_host"
  | "smtp_port"
  | "smtp_user"
  | "smtp_secure"
  | "notify_on_registration"
  | "notify_on_quote_submit"
  | "notify_on_offer_sent"
  | "notify_on_order_approval"
>

type EmailSettingsPanelProps = {
  email: B2bEmailSettingsStatus
  form: EmailFormFields
  smtpPass: string
  onFieldChange: <K extends keyof EmailFormFields>(
    key: K,
    value: EmailFormFields[K]
  ) => void
  onSmtpPassChange: (value: string) => void
  onToggle: (
    key:
      | "notify_on_registration"
      | "notify_on_quote_submit"
      | "notify_on_offer_sent"
      | "notify_on_order_approval",
    value: boolean
  ) => void
}

export const EmailSettingsPanel = ({
  email,
  form,
  smtpPass,
  onFieldChange,
  onSmtpPassChange,
  onToggle,
}: EmailSettingsPanelProps) => {
  const [testRecipient, setTestRecipient] = useState(form.email_admin ?? "")
  const [testResult, setTestResult] = useState<B2bEmailTestResult | null>(null)

  const verifyMutation = useMutation({
    mutationFn: () => b2bClient.testEmail({ verify_only: true }),
    onSuccess: (result) => setTestResult(result),
    onError: (error: Error) =>
      setTestResult({
        success: false,
        stage: "verify",
        message: "Request failed",
        error: error.message,
      }),
  })

  const sendTestMutation = useMutation({
    mutationFn: () =>
      b2bClient.testEmail({
        to: testRecipient.trim(),
        verify_only: false,
      }),
    onSuccess: (result) => setTestResult(result),
    onError: (error: Error) =>
      setTestResult({
        success: false,
        stage: "send",
        message: "Request failed",
        error: error.message,
      }),
  })

  const portUsesStartTls = form.smtp_port === 587 || form.smtp_port === 25

  const handlePortChange = (value: string) => {
    const port = Number(value) || 587
    onFieldChange("smtp_port", port)

    if (port === 587 || port === 25 || port === 2525) {
      onFieldChange("smtp_secure", false)
    }

    if (port === 465) {
      onFieldChange("smtp_secure", true)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-ui-border-base p-5">
        <Heading level="h2" className="mb-1">
          SMTP delivery
        </Heading>
        <Text size="small" className="mb-4 text-ui-fg-subtle">
          Configure outbound email for B2B notifications. Save changes before
          running a connection test.
        </Text>

        <div className="mb-4 flex flex-wrap gap-2">
          <Badge color={form.email_enabled ? "green" : "grey"} size="2xsmall">
            {form.email_enabled ? "Enabled" : "Disabled"}
          </Badge>
          <Badge color={email.configured ? "green" : "orange"} size="2xsmall">
            {email.configured ? "SMTP ready" : "Incomplete configuration"}
          </Badge>
        </div>

        <SettingsToggleRow
          label="Enable email notifications"
          description="Master switch for all B2B outbound email"
          checked={form.email_enabled}
          onChange={(value) => onFieldChange("email_enabled", value)}
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="email_from"
            label="From address"
            type="email"
            placeholder="service@supercoresystems.co.uk"
            value={form.email_from ?? ""}
            onChange={(value) => onFieldChange("email_from", value || null)}
          />
          <Field
            id="email_admin"
            label="Merchant inbox"
            type="email"
            placeholder="service@supercoresystems.co.uk"
            value={form.email_admin ?? ""}
            onChange={(value) => onFieldChange("email_admin", value || null)}
          />
          <Field
            id="smtp_host"
            label="SMTP host"
            placeholder="smtp.example.com"
            value={form.smtp_host ?? ""}
            onChange={(value) => onFieldChange("smtp_host", value || null)}
          />
          <Field
            id="smtp_port"
            label="SMTP port"
            type="number"
            placeholder="587"
            value={String(form.smtp_port ?? 587)}
            onChange={handlePortChange}
          />
          <Field
            id="smtp_user"
            label="SMTP username"
            placeholder="Usually your mailbox or API key user"
            value={form.smtp_user ?? ""}
            onChange={(value) => onFieldChange("smtp_user", value || null)}
          />
          <div className="space-y-2">
            <Label htmlFor="smtp_pass">SMTP password</Label>
            <Input
              id="smtp_pass"
              type="password"
              autoComplete="new-password"
              placeholder={
                email.smtp_pass_set ? "Saved — enter to replace" : "Required for most providers"
              }
              value={smtpPass}
              onChange={(event) => onSmtpPassChange(event.target.value)}
            />
            {email.smtp_pass_set && !smtpPass && (
              <Text size="xsmall" className="text-ui-fg-subtle">
                A password is already saved. Leave blank to keep it.
              </Text>
            )}
          </div>
        </div>

        <div className="mt-4">
          <SettingsToggleRow
            label="Implicit SSL (port 465)"
            description={
              portUsesStartTls
                ? "Port 587 uses STARTTLS automatically — keep this off"
                : "Enable only for SMTPS on port 465"
            }
            checked={form.smtp_secure}
            onChange={(value) => onFieldChange("smtp_secure", value)}
            disabled={portUsesStartTls}
          />
        </div>
      </section>

      <section className="rounded-xl border border-ui-border-base p-5">
        <Heading level="h2" className="mb-1">
          Connection test
        </Heading>
        <Text size="small" className="mb-4 text-ui-fg-subtle">
          Verify SMTP authentication and domain delivery before sending customer
          offer emails. Tests use the last saved settings.
        </Text>

        <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="test_recipient">Test recipient</Label>
            <Input
              id="test_recipient"
              type="email"
              placeholder="admin@yourdomain.com"
              value={testRecipient}
              onChange={(event) => setTestRecipient(event.target.value)}
            />
          </div>
          <Button
            size="small"
            variant="secondary"
            isLoading={verifyMutation.isPending}
            onClick={() => verifyMutation.mutate()}
          >
            Verify connection
          </Button>
          <Button
            size="small"
            isLoading={sendTestMutation.isPending}
            onClick={() => sendTestMutation.mutate()}
          >
            Send test email
          </Button>
        </div>

        {testResult && <EmailTestResultBox result={testResult} />}
      </section>

      <section className="rounded-xl border border-ui-border-base p-5">
        <Heading level="h2" className="mb-1">
          Notification events
        </Heading>
        <Text size="small" className="mb-4 text-ui-fg-subtle">
          Merchant notifications go to the merchant inbox above. Offer emails go
          to the customer quote contact.
        </Text>

        <SettingsToggleRow
          label="New trade registration"
          description="Notify merchant when /register-trade is submitted"
          checked={form.notify_on_registration}
          onChange={(value) => onToggle("notify_on_registration", value)}
        />
        <SettingsToggleRow
          label="Quote submitted"
          description="Notify merchant on storefront quote submit"
          checked={form.notify_on_quote_submit}
          onChange={(value) => onToggle("notify_on_quote_submit", value)}
        />
        <SettingsToggleRow
          label="Offer sent"
          description="Email customer when priced offer is sent"
          checked={form.notify_on_offer_sent}
          onChange={(value) => onToggle("notify_on_offer_sent", value)}
        />
        <SettingsToggleRow
          label="Order pending approval"
          description="Notify merchant when subaccount order needs approval"
          checked={form.notify_on_order_approval}
          onChange={(value) => onToggle("notify_on_order_approval", value)}
        />
      </section>
    </div>
  )
}

const EmailTestResultBox = ({ result }: { result: B2bEmailTestResult }) => (
  <div
    className={`mt-4 rounded-lg border p-4 ${
      result.success
        ? "border-ui-border-success bg-ui-bg-success-subtle"
        : "border-ui-border-error bg-ui-bg-error-subtle"
    }`}
  >
    <div className="flex flex-wrap items-center gap-2">
      <Badge color={result.success ? "green" : "red"} size="2xsmall">
        {result.success ? "Success" : "Failed"}
      </Badge>
      <Text size="small" weight="plus">
        {result.message}
      </Text>
    </div>

    {result.error && (
      <Text size="small" className="mt-2 text-ui-fg-error">
        {result.error}
      </Text>
    )}

    {result.hint && (
      <Text size="small" className="mt-2 text-ui-fg-subtle">
        {result.hint}
      </Text>
    )}

    {result.config && (
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <ConfigLine label="Host" value={`${result.config.host}:${result.config.port}`} />
        <ConfigLine
          label="Encryption"
          value={
            result.config.secure
              ? "SSL on connect"
              : result.config.require_tls
                ? "STARTTLS"
                : "None"
          }
        />
        <ConfigLine label="From" value={result.config.from} />
        <ConfigLine
          label="Auth"
          value={result.config.auth_configured ? "Configured" : "Missing credentials"}
        />
      </div>
    )}
  </div>
)

const ConfigLine = ({ label, value }: { label: string; value: string }) => (
  <div>
    <Text size="xsmall" className="text-ui-fg-subtle">
      {label}
    </Text>
    <Text size="small" className="font-mono">
      {value}
    </Text>
  </div>
)

const Field = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  </div>
)
