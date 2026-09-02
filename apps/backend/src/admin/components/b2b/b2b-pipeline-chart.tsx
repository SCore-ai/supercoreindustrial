import { Text } from "@medusajs/ui"
import type { B2bDashboardStats } from "../../lib/types"

const STAGE_COLORS = [
  "bg-blue-500",
  "bg-cyan-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-rose-500",
]

const B2bPipelineChart = ({
  stages,
  height = 180,
}: {
  stages: Array<{ label: string; value: number }>
  height?: number
}) => {
  const max = Math.max(...stages.map((stage) => stage.value), 1)

  return (
    <div className="flex items-end gap-3 px-1" style={{ height }}>
      {stages.map((stage, index) => (
        <div
          key={stage.label}
          className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
        >
          <Text size="small" weight="plus">
            {stage.value}
          </Text>
          <div
            className={`w-full rounded-t-lg transition-all ${STAGE_COLORS[index % STAGE_COLORS.length]}`}
            style={{
              height: `${Math.max(16, (stage.value / max) * (height - 48))}px`,
            }}
          />
          <Text
            size="xsmall"
            className="text-center text-ui-fg-subtle leading-tight"
          >
            {stage.label}
          </Text>
        </div>
      ))}
    </div>
  )
}

export default B2bPipelineChart

export function buildQuotePipelineStages(stats: B2bDashboardStats) {
  return [
    { label: "New", value: stats.new_quotes },
    { label: "In review", value: stats.in_review_quotes },
    { label: "Quoted", value: stats.quoted_offers },
    { label: "Won", value: stats.won_quotes },
    { label: "Lost", value: stats.lost_quotes },
  ]
}
