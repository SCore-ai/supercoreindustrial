import { Button, Input, Text } from "@medusajs/ui"
import { useMemo, useState } from "react"

export type MoreActionItem = {
  id: string
  label: string
  section?: string
  tone?: "default" | "danger"
  onSelect: () => void | Promise<void>
}

const MoreActionsMenu = ({
  actions,
  label = "More actions",
  isLoading,
  align = "right",
}: {
  actions: MoreActionItem[]
  label?: string
  isLoading?: boolean
  align?: "left" | "right"
}) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()

    if (!needle) {
      return actions
    }

    return actions.filter((action) =>
      action.label.toLowerCase().includes(needle)
    )
  }, [actions, query])

  const grouped = filtered.reduce<Record<string, MoreActionItem[]>>(
    (acc, action) => {
      const key = action.section ?? "Actions"
      acc[key] = acc[key] ?? []
      acc[key].push(action)
      return acc
    },
    {}
  )

  return (
    <div className="relative">
      <Button
        size="small"
        variant="secondary"
        isLoading={isLoading}
        onClick={() => setOpen((current) => !current)}
      >
        {label}
      </Button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div
            className={`absolute z-50 mt-2 w-72 rounded-xl border border-ui-border-base bg-ui-bg-base p-2 shadow-lg ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            <Input
              placeholder="Search actions"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="mt-2 max-h-80 overflow-y-auto">
              {Object.entries(grouped).map(([section, items]) => (
                <div key={section} className="py-1">
                  <Text
                    size="xsmall"
                    className="px-2 py-1 uppercase text-ui-fg-subtle"
                  >
                    {section}
                  </Text>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`block w-full rounded-md px-2 py-2 text-left text-sm hover:bg-ui-bg-subtle ${
                        item.tone === "danger"
                          ? "text-ui-fg-error"
                          : "text-ui-fg-base"
                      }`}
                      onClick={async () => {
                        setOpen(false)
                        await item.onSelect()
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ))}
              {!filtered.length && (
                <Text size="small" className="px-2 py-3 text-ui-fg-subtle">
                  No actions match your search.
                </Text>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default MoreActionsMenu
