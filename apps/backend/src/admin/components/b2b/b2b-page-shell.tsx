import { Text } from "@medusajs/ui"
import { Link } from "react-router-dom"

const B2bPageShell = ({
  title,
  subtitle,
  children,
  actions,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  actions?: React.ReactNode
}) => (
  <div className="flex flex-col gap-y-6 p-6">
    <div className="flex items-start justify-between gap-4 border-b border-ui-border-base pb-4">
      <div>
        <Text size="xsmall" className="text-ui-fg-subtle uppercase tracking-wide">
          B2B Module
        </Text>
        <h1 className="text-ui-fg-base txt-xlarge-plus mt-1">{title}</h1>
        {subtitle && (
          <Text size="small" className="mt-1 text-ui-fg-subtle">
            {subtitle}
          </Text>
        )}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <Link
          to="/b2b/settings"
          className="text-sm text-ui-fg-interactive hover:underline"
        >
          Settings
        </Link>
      </div>
    </div>
    {children}
  </div>
)

export default B2bPageShell
