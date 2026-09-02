"use client"

type ProductQuantityStepperProps = {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  id?: string
  label?: string
}

const ProductQuantityStepper = ({
  value,
  onChange,
  disabled,
  id = "product-qty",
  label = "Quantity",
}: ProductQuantityStepperProps) => (
  <div>
    <label
      htmlFor={id}
      className="sc-product-option-label mb-2 block"
    >
      {label}
    </label>
    <div className="inline-flex overflow-hidden rounded-md border border-sc-line bg-white">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
        className="flex h-11 w-11 items-center justify-center text-lg font-medium text-sc-body transition-colors hover:bg-sc-paper disabled:opacity-40"
      >
        −
      </button>
      <input
        id={id}
        type="number"
        min={1}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Math.max(1, Number(e.target.value) || 1))}
        className="h-11 w-16 border-x border-sc-line bg-white text-center text-sm font-semibold text-sc-body focus:outline-none"
      />
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled}
        onClick={() => onChange(value + 1)}
        className="flex h-11 w-11 items-center justify-center text-lg font-medium text-sc-body transition-colors hover:bg-sc-paper disabled:opacity-40"
      >
        +
      </button>
    </div>
  </div>
)

export default ProductQuantityStepper
