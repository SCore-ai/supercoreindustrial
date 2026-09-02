"use client"

import { ReactNode, useState } from "react"

type SortableListProps<T> = {
  items: T[]
  onReorder: (items: T[]) => void
  keyExtractor: (item: T, index: number) => string
  renderItem: (
    item: T,
    index: number,
    dragHandle: ReactNode
  ) => ReactNode
  className?: string
}

function reorderItems<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items
  }

  const next = [...items]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

export default function SortableList<T>({
  items,
  onReorder,
  keyExtractor,
  renderItem,
  className,
}: SortableListProps<T>) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null) return
    onReorder(reorderItems(items, dragIndex, targetIndex))
    setDragIndex(null)
    setOverIndex(null)
  }

  return (
    <ul className={className}>
      {items.map((item, index) => {
        const dragHandle = (
          <button
            type="button"
            draggable
            aria-label="Drag to reorder"
            className="cursor-grab rounded border border-ui-border-base bg-ui-bg-subtle px-2 py-1 text-xs text-ui-fg-muted active:cursor-grabbing"
            onDragStart={() => setDragIndex(index)}
            onDragEnd={() => {
              setDragIndex(null)
              setOverIndex(null)
            }}
          >
            ⋮⋮
          </button>
        )

        return (
          <li
            key={keyExtractor(item, index)}
            className={`transition-colors ${
              overIndex === index ? "ring-2 ring-ui-fg-interactive rounded-md" : ""
            } ${dragIndex === index ? "opacity-60" : ""}`}
            onDragOver={(event) => {
              event.preventDefault()
              setOverIndex(index)
            }}
            onDrop={(event) => {
              event.preventDefault()
              handleDrop(index)
            }}
          >
            {renderItem(item, index, dragHandle)}
          </li>
        )
      })}
    </ul>
  )
}

export { reorderItems }
