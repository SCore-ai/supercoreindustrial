import { Badge, Text } from "@medusajs/ui"

type EnvKeyEntry = {
  key: string
  optional?: boolean
  set: boolean
}

export const SettingsEnvKeys = ({
  envFile,
  keys,
}: {
  envFile: string
  keys: EnvKeyEntry[]
}) => (
  <div>
    <Text size="small" className="text-ui-fg-subtle">
      Configure in <code className="text-xs">{envFile}</code>:
    </Text>
    <div className="mt-2 space-y-1 font-mono text-xs">
      {keys.map((entry) => (
        <div
          key={entry.key}
          className="flex items-center justify-between gap-2 rounded-md px-1 py-0.5"
        >
          <Text>{entry.key}</Text>
          <EnvKeyBadge optional={entry.optional} set={entry.set} />
        </div>
      ))}
    </div>
  </div>
)

const EnvKeyBadge = ({
  optional,
  set,
}: {
  optional?: boolean
  set: boolean
}) => {
  if (set) {
    return (
      <Badge size="2xsmall" color="green">
        Set
      </Badge>
    )
  }

  if (optional) {
    return (
      <Badge size="2xsmall" color="grey">
        Optional
      </Badge>
    )
  }

  return (
    <Badge size="2xsmall" color="orange">
      Missing
    </Badge>
  )
}
