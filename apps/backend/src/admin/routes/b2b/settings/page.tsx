"use client"

import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Button,
  Container,
  Heading,
  Label,
  Select,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import B2bPageShell from "../../../components/b2b/b2b-page-shell"
import { CompanyBankingPanel } from "../../../components/b2b/company-banking-panel"
import { EmailSettingsPanel } from "../../../components/b2b/email-settings-panel"
import { SettingsToggleRow } from "../../../components/b2b/settings-toggle-row"
import { ZohoSettingsPanel } from "../../../components/b2b/zoho-settings-panel"
import { b2bClient } from "../../../lib/client"
import type {
  B2bModuleSettings,
  B2bRegistrationMode,
  B2bEmailSettingsStatus,
  B2bZohoSettingsStatus,
} from "../../../lib/types"

type SettingsForm = Omit<B2bModuleSettings, "id" | "metadata" | "updated_at">

type SettingsTab = "general" | "company" | "email" | "integrations"

const SETTINGS_TABS: { id: SettingsTab; label: string }[] = [
  { id: "general", label: "General" },
  { id: "company", label: "Company & bank" },
  { id: "email", label: "Email" },
  { id: "integrations", label: "Integrations" },
]

const REGISTRATION_OPTIONS: { value: B2bRegistrationMode; label: string }[] = [
  { value: "both", label: "Quote submit + dedicated form" },
  { value: "quote_submit", label: "Quote submit only" },
  { value: "dedicated_form", label: "Dedicated registration form only" },
]

const B2bSettingsPage = () => {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<SettingsTab>("general")

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-b2b-settings"],
    queryFn: () => b2bClient.getSettings(),
  })

  const [form, setForm] = useState<SettingsForm | null>(null)
  const [smtpPass, setSmtpPass] = useState("")
  const [zoho, setZoho] = useState<B2bZohoSettingsStatus | null>(null)
  const [email, setEmail] = useState<B2bEmailSettingsStatus | null>(null)

  useEffect(() => {
    if (data?.settings) {
      const { id: _id, metadata: _meta, updated_at: _ua, ...rest } = data.settings
      setForm(rest)
      setSmtpPass("")
      setZoho(data.zoho)
      setEmail(data.email)
    }
  }, [data])

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!form) {
        throw new Error("Settings not loaded")
      }
      return b2bClient.updateSettings({
        ...form,
        ...(smtpPass.trim() ? { smtp_pass: smtpPass.trim() } : {}),
      })
    },
    onSuccess: (response) => {
      queryClient.setQueryData(["admin-b2b-settings"], response)
      const { id: _id, metadata: _meta, updated_at: _ua, ...rest } =
        response.settings
      setForm(rest)
      setSmtpPass("")
      setZoho(response.zoho)
      setEmail(response.email)
      toast.success("B2B settings saved")
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  if (isLoading || !form) {
    return (
      <Container className="p-6">
        <Text>{isLoading ? "Loading settings..." : "Preparing form..."}</Text>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="p-6">
        <Text className="text-ui-fg-error">{(error as Error).message}</Text>
      </Container>
    )
  }

  const setField = <K extends keyof SettingsForm>(
    key: K,
    value: SettingsForm[K]
  ) => {
    setForm((current) => (current ? { ...current, [key]: value } : current))
  }

  const setFlag = (key: keyof SettingsForm, value: boolean) => {
    setField(key, value)
  }

  return (
    <Container className="p-0">
      <B2bPageShell
        title="Settings"
        subtitle="Configure B2B Module features, company details, email, and integrations"
        actions={
          <Button
            size="small"
            isLoading={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            Save changes
          </Button>
        }
      >
        <nav className="flex flex-wrap gap-2 border-b border-ui-border-base pb-4">
          {SETTINGS_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                activeTab === tab.id
                  ? "bg-ui-bg-subtle text-ui-fg-base font-medium"
                  : "text-ui-fg-subtle hover:bg-ui-bg-subtle-hover hover:text-ui-fg-base"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === "general" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SettingsCard title="Store features">
              <SettingsToggleRow
                label="Conversations & messaging"
                description="Store and admin messaging APIs"
                checked={form.conversations_enabled}
                onChange={(value) => setFlag("conversations_enabled", value)}
              />
              <SettingsToggleRow
                label="Quotes & offers"
                description="Quote cart, submit, and priced offers"
                checked={form.quotes_enabled}
                onChange={(value) => setFlag("quotes_enabled", value)}
              />
              <SettingsToggleRow
                label="Subaccount order approval"
                description="Parent approves buyer subaccount orders"
                checked={form.order_approval_enabled}
                onChange={(value) => setFlag("order_approval_enabled", value)}
              />
              <SettingsToggleRow
                label="Tiered / group pricing"
                description="Quantity breaks by customer group"
                checked={form.tiered_pricing_enabled}
                onChange={(value) => setFlag("tiered_pricing_enabled", value)}
              />
              <SettingsToggleRow
                label="Purchase lists"
                description="Saved reorder lists (storefront UI planned)"
                checked={form.purchase_lists_enabled}
                onChange={(value) => setFlag("purchase_lists_enabled", value)}
                planned
              />
              <SettingsToggleRow
                label="Quick order form"
                description="Storefront Quick Order Terminal (SKU grid / CSV to basket)"
                checked={form.bulk_order_form_enabled}
                onChange={(value) => setFlag("bulk_order_form_enabled", value)}
              />
            </SettingsCard>

            <SettingsCard title="Registration & approval">
              <div className="mb-4 space-y-2">
                <Label htmlFor="registration_mode">Registration channel</Label>
                <Select
                  value={form.registration_mode}
                  onValueChange={(value) =>
                    setForm((current) =>
                      current
                        ? {
                            ...current,
                            registration_mode: value as B2bRegistrationMode,
                          }
                        : current
                    )
                  }
                >
                  <Select.Trigger id="registration_mode">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {REGISTRATION_OPTIONS.map((option) => (
                      <Select.Item key={option.value} value={option.value}>
                        {option.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>

              <div className="mb-4 space-y-2">
                <Label htmlFor="trade_registration_path">
                  Trade registration path
                </Label>
                <input
                  id="trade_registration_path"
                  className="w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-2 text-sm"
                  value={form.trade_registration_path}
                  onChange={(event) =>
                    setForm((current) =>
                      current
                        ? {
                            ...current,
                            trade_registration_path: event.target.value,
                          }
                        : current
                    )
                  }
                />
              </div>

              <SettingsToggleRow
                label="Auto-approve new registrations"
                description="Skip manual review in Customers"
                checked={form.auto_approve_registrations}
                onChange={(value) => setFlag("auto_approve_registrations", value)}
              />
              <SettingsToggleRow
                label="Require order approval (default)"
                description="Applied to new companies unless overridden"
                checked={form.default_require_order_approval}
                onChange={(value) =>
                  setFlag("default_require_order_approval", value)
                }
              />
              <SettingsToggleRow
                label="Hide prices for guests"
                description="Storefront shows contact-for-pricing when logged out"
                checked={form.hide_prices_for_guests}
                onChange={(value) => setFlag("hide_prices_for_guests", value)}
              />
            </SettingsCard>
          </div>
        )}

        {activeTab === "company" && (
          <CompanyBankingPanel form={form} onFieldChange={setField} />
        )}

        {activeTab === "email" && email && (
          <EmailSettingsPanel
            email={email}
            form={form}
            smtpPass={smtpPass}
            onFieldChange={setField}
            onSmtpPassChange={setSmtpPass}
            onToggle={setFlag}
          />
        )}

        {activeTab === "integrations" && zoho && (
          <ZohoSettingsPanel
            zoho={zoho}
            syncOnOffer={form.zoho_sync_on_offer}
            onSyncOnOfferChange={(value) => setFlag("zoho_sync_on_offer", value)}
          />
        )}

        {data?.settings.updated_at && (
          <Text size="xsmall" className="mt-6 text-ui-fg-subtle">
            Last saved: {new Date(data.settings.updated_at).toLocaleString()}
          </Text>
        )}
      </B2bPageShell>
    </Container>
  )
}

const SettingsCard = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <div className="rounded-xl border border-ui-border-base p-5">
    <Heading level="h2" className="mb-4">
      {title}
    </Heading>
    <div className="space-y-1">{children}</div>
  </div>
)

export const config = defineRouteConfig({
  label: "Settings",
  rank: 2,
})

export default B2bSettingsPage
