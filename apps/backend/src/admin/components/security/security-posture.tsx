import { Badge, Text } from "@medusajs/ui"
import type { SecurityPostureCheck } from "../../lib/security-types"

const STATUS_META = {
  pass: { label: "Pass", color: "green" as const },
  warn: { label: "Review", color: "orange" as const },
  fail: { label: "Action required", color: "red" as const },
  manual: { label: "External setup", color: "grey" as const },
}

export const SecurityStatusBadge = ({
  status,
}: {
  status: SecurityPostureCheck["status"]
}) => {
  const meta = STATUS_META[status]
  return (
    <Badge color={meta.color} size="2xsmall">
      {meta.label}
    </Badge>
  )
}

export const SecurityCheckRow = ({ check }: { check: SecurityPostureCheck }) => (
  <div className="flex items-start justify-between gap-4 border-b border-ui-border-base py-3 last:border-0">
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <Text size="small" weight="plus">
          {check.label}
        </Text>
        <SecurityStatusBadge status={check.status} />
      </div>
      <Text size="xsmall" className="mt-1 text-ui-fg-subtle">
        {check.description}
      </Text>
      {check.recommendation && check.status !== "pass" && (
        <Text size="xsmall" className="mt-1 text-ui-fg-subtle">
          {check.recommendation}
        </Text>
      )}
    </div>
  </div>
)

export const SecurityPostureHero = ({
  score,
  grade,
  summary,
}: {
  score: number
  grade: string
  summary: { pass: number; warn: number; fail: number; manual: number }
}) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-[160px_1fr]">
    <div className="flex flex-col items-center justify-center rounded-xl border border-ui-border-base bg-ui-bg-subtle p-6">
      <Text className="text-4xl font-semibold">{grade}</Text>
      <Text size="small" className="text-ui-fg-subtle">
        Security grade
      </Text>
      <Text size="xsmall" className="mt-1 text-ui-fg-subtle">
        {score}% posture score
      </Text>
    </div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {[
        { label: "Passing", value: summary.pass, color: "text-ui-fg-interactive" },
        { label: "Review", value: summary.warn, color: "text-ui-tag-orange-text" },
        { label: "Critical", value: summary.fail, color: "text-ui-fg-error" },
        { label: "External", value: summary.manual, color: "text-ui-fg-subtle" },
      ].map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-ui-border-base p-4"
        >
          <Text size="xsmall" className="text-ui-fg-subtle">
            {item.label}
          </Text>
          <Text className={`text-2xl font-semibold ${item.color}`}>
            {item.value}
          </Text>
        </div>
      ))}
    </div>
  </div>
)
