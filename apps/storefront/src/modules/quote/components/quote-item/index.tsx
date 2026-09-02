"use client"

import { deleteQuoteLineItem, updateQuoteLineItem } from "@lib/data/quotes"
import { StoreQuoteLineItem } from "@lib/data/quotes"
import { Trash } from "@medusajs/icons"
import { Table, Text } from "@modules/common/components/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import Spinner from "@modules/common/icons/spinner"
import { useState } from "react"

type QuoteItemProps = {
  item: StoreQuoteLineItem
}

const QuoteItem = ({ item }: QuoteItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    await updateQuoteLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err: Error) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  const handleDelete = async () => {
    setDeleting(true)
    await deleteQuoteLineItem(item.id).catch((err: Error) => {
      setError(err.message)
      setDeleting(false)
    })
  }

  return (
    <Table.Row className="w-full" data-testid="quote-item-row">
      <Table.Cell className="text-left">
        <Text className="txt-medium-plus text-ui-fg-base">{item.title}</Text>
        <div className="text-ui-fg-subtle text-small-regular mt-1">
          {item.sku && <span>Part #: {item.sku}</span>}
          {item.sku && item.mpn && <span> · </span>}
          {item.mpn && <span>MPN: {item.mpn}</span>}
        </div>
      </Table.Cell>

      <Table.Cell>
        <div className="flex gap-2 items-center w-28">
          <button
            type="button"
            className="flex gap-x-1 text-ui-fg-subtle hover:text-ui-fg-base cursor-pointer"
            onClick={handleDelete}
            disabled={deleting}
            data-testid="quote-item-delete"
          >
            {deleting ? <Spinner className="animate-spin" /> : <Trash />}
          </button>
          <select
            value={item.quantity}
            onChange={(e) => changeQuantity(Number(e.target.value))}
            disabled={updating}
            className="h-10 px-4 border border-ui-border-base rounded-md text-sm"
            data-testid="quote-item-quantity"
          >
            {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          {updating && <Spinner />}
        </div>
        <ErrorMessage error={error} />
      </Table.Cell>
    </Table.Row>
  )
}

export default QuoteItem
