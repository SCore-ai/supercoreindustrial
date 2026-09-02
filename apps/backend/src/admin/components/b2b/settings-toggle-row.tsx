import { Badge, Text } from "@medusajs/ui"

export const SettingsToggleRow = ({
  label,
  description,
  checked,
  onChange,
  planned = false,
  disabled = false,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (value: boolean) => void
  planned?: boolean
  disabled?: boolean
}) => (
  <div className="flex items-start justify-between gap-4 border-b border-ui-border-base py-3 last:border-0">
    <div>
      <Text size="small" weight="plus">
        {label}
      </Text>
      {description && (
        <Text size="xsmall" className="text-ui-fg-subtle">
          {description}
        </Text>
      )}
    </div>
    <div className="flex shrink-0 items-center gap-2">
      {planned && (
        <Badge color="grey" size="2xsmall">
          Beta
        </Badge>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? "bg-ui-fg-interactive" : "bg-ui-bg-switch-off"
        }`}
      >
        <span
          className={`absolute top-0.5 block h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  </div>
)
