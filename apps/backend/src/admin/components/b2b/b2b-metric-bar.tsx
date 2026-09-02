import { Text } from "@medusajs/ui"

const B2bMetricBar = ({
  label,
  value,
  total,
  tone = "blue",
}: {
  label: string
  value: number
  total: number
  tone?: "blue" | "cyan" | "green" | "orange" | "violet"
}) => {
  const safeTotal = Math.max(total, 1)
  const percent = Math.round((value / safeTotal) * 100)
  const toneClass =
    tone === "cyan"
      ? "bg-cyan-500"
      : tone === "green"
        ? "bg-emerald-500"
        : tone === "orange"
          ? "bg-orange-500"
          : tone === "violet"
            ? "bg-violet-500"
            : "bg-blue-500"

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <Text size="small" className="text-ui-fg-subtle">
          {label}
        </Text>
        <Text size="small" weight="plus">
          {value}
          <span className="ml-1 text-ui-fg-muted">({percent}%)</span>
        </Text>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-ui-bg-subtle">
        <div
          className={`h-full rounded-full ${toneClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

export default B2bMetricBar
