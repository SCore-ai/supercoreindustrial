import { HttpTypes } from "@medusajs/types"
import { clx } from "@modules/common/components/ui"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (optionId: string, value: string) => void
  title: string
  disabled: boolean
  required?: boolean
  values?: string[]
  locked?: boolean
  pending?: boolean
  previousTitle?: string
  hint?: string
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
  required = true,
  values,
  locked = false,
  pending = false,
  previousTitle,
  hint,
}) => {
  const filteredOptions =
    values ?? (option.values ?? []).map((entry) => entry.value)
  const selectId = `option-${option.id}`
  const isInactive = disabled || locked || pending
  const placeholder = pending
    ? previousTitle
      ? `Select ${previousTitle} first`
      : `Select previous option first`
    : `Select ${title}`

  return (
    <div
      className={clx("sc-product-option", {
        "is-locked": locked,
        "is-pending": pending,
      })}
    >
      <label htmlFor={selectId} className="sc-product-option-label">
        {title}
        {required && !locked && !pending && (
          <span className="sc-product-option-required"> (Required)</span>
        )}
        {locked && <span className="sc-product-option-auto"> Automatic</span>}
      </label>
      <select
        id={selectId}
        value={current ?? ""}
        disabled={isInactive}
        data-testid={dataTestId}
        aria-required={required && !locked && !pending}
        aria-disabled={isInactive}
        onChange={(event) => {
          if (event.target.value) {
            updateOption(option.id, event.target.value)
          }
        }}
        className={clx(!current && "is-placeholder")}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {filteredOptions.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      {hint && <p className="sc-product-option-hint">{hint}</p>}
    </div>
  )
}

export default OptionSelect
