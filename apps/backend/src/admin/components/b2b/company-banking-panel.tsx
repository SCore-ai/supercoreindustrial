"use client"

import { Heading, Input, Label, Text } from "@medusajs/ui"
import type { B2bModuleSettings } from "../../lib/types"

type CompanyBankingFields = Pick<
  B2bModuleSettings,
  | "company_legal_name"
  | "company_address"
  | "company_phone"
  | "company_email"
  | "company_vat_number"
  | "company_registration_number"
  | "company_iban"
  | "company_bank"
  | "company_bic"
  | "company_payment_term"
>

type CompanyBankingPanelProps = {
  form: CompanyBankingFields
  onFieldChange: <K extends keyof CompanyBankingFields>(
    key: K,
    value: CompanyBankingFields[K]
  ) => void
}

const Field = ({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  </div>
)

export const CompanyBankingPanel = ({
  form,
  onFieldChange,
}: CompanyBankingPanelProps) => {
  const text = (value: string | null | undefined) => value ?? ""

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-ui-border-base p-5">
        <Heading level="h2" className="mb-1">
          Company details
        </Heading>
        <Text size="small" className="mb-4 text-ui-fg-subtle">
          Shown on the commercial offer PDF CONTACT block.
        </Text>
        <div className="space-y-4">
          <Field
            id="company_legal_name"
            label="Legal name"
            value={text(form.company_legal_name)}
            onChange={(value) => onFieldChange("company_legal_name", value)}
            placeholder="SUPERCORE AI SYSTEMS LTD."
          />
          <div className="space-y-2">
            <Label htmlFor="company_address">Address</Label>
            <textarea
              id="company_address"
              rows={4}
              className="w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-2 text-sm"
              value={text(form.company_address)}
              placeholder={"140 Goswell Road, Technique Building, Unit 3\nLondon\nEC1V 7DY\nUnited Kingdom"}
              onChange={(event) =>
                onFieldChange("company_address", event.target.value)
              }
            />
          </div>
          <Field
            id="company_phone"
            label="Phone"
            value={text(form.company_phone)}
            onChange={(value) => onFieldChange("company_phone", value)}
          />
          <Field
            id="company_email"
            label="Email"
            value={text(form.company_email)}
            onChange={(value) => onFieldChange("company_email", value)}
          />
          <Field
            id="company_vat_number"
            label="VAT number"
            value={text(form.company_vat_number)}
            onChange={(value) => onFieldChange("company_vat_number", value)}
            placeholder="GB454 3803 92"
          />
          <Field
            id="company_registration_number"
            label="Companies House / Chamber of Commerce no."
            value={text(form.company_registration_number)}
            onChange={(value) =>
              onFieldChange("company_registration_number", value)
            }
            placeholder="14447351"
          />
        </div>
      </section>

      <section className="rounded-xl border border-ui-border-base p-5">
        <Heading level="h2" className="mb-1">
          Bank details
        </Heading>
        <Text size="small" className="mb-4 text-ui-fg-subtle">
          Printed on every priced offer. Leave blank to hide as a dash.
        </Text>
        <div className="space-y-4">
          <Field
            id="company_iban"
            label="IBAN"
            value={text(form.company_iban)}
            onChange={(value) => onFieldChange("company_iban", value)}
            placeholder="GB00 BANK 0000 0000 00"
          />
          <Field
            id="company_bank"
            label="Bank"
            value={text(form.company_bank)}
            onChange={(value) => onFieldChange("company_bank", value)}
            placeholder="Bank name and sort code"
          />
          <Field
            id="company_bic"
            label="BIC / SWIFT"
            value={text(form.company_bic)}
            onChange={(value) => onFieldChange("company_bic", value)}
            placeholder="BANKGB2L"
          />
          <Field
            id="company_payment_term"
            label="Payment term"
            value={text(form.company_payment_term)}
            onChange={(value) => onFieldChange("company_payment_term", value)}
            placeholder="Prepayment"
          />
        </div>
      </section>
    </div>
  )
}
