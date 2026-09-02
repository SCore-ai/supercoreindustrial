import { Text } from "@medusajs/ui"

const KpiIcon = ({
  label,
  value,
  icon,
  tone = "default",
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  tone?: "default" | "orange" | "cyan" | "blue" | "green"
}) => {
  const toneClass =
    tone === "orange"
      ? "text-orange-500"
      : tone === "cyan"
        ? "text-cyan-500"
        : tone === "blue"
          ? "text-blue-500"
          : tone === "green"
            ? "text-green-500"
            : "text-ui-fg-subtle"

  return (
    <div className="flex items-center gap-3">
      <span className={`text-2xl ${toneClass}`}>{icon}</span>
      <div>
        <Text size="xsmall" className="text-ui-fg-subtle">
          {label}
        </Text>
        <Text weight="plus" className="text-lg">
          {value}
        </Text>
      </div>
    </div>
  )
}

export default KpiIcon
