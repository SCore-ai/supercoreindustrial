"use client"

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react"
import { Fragment, useEffect, useMemo, useState } from "react"
import ReactCountryFlag from "react-country-flag"

import { StateType } from "@lib/hooks/use-toggle-state"
import { formatCountryOptionLabel, formatRegionCurrency } from "@lib/regions/format"
import { useParams, usePathname } from "next/navigation"
import { updateRegion } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"

type CountryOption = {
  country: string
  region: string
  label: string
  currencyCode: string
}

type CountrySelectProps = {
  toggleState?: StateType
  regions: HttpTypes.StoreRegion[]
  variant?: "footer" | "header"
}

const CountrySelect = ({
  toggleState,
  regions,
  variant = "footer",
}: CountrySelectProps) => {
  const [current, setCurrent] = useState<CountryOption | undefined>(undefined)

  const { countryCode } = useParams()
  const currentPath = usePathname().split(`/${countryCode}`)[1]

  const close = toggleState?.close
  const state = toggleState?.state ?? false

  const regionCurrencyById = useMemo(() => {
    return new Map(
      regions.map((region) => [region.id, region.currency_code ?? ""])
    )
  }, [regions])

  const options = useMemo(() => {
    return regions
      ?.map((region) => {
        return region.countries?.map((country) => ({
          country: country.iso_2 ?? "",
          region: region.id,
          label: country.display_name ?? "",
          currencyCode: region.currency_code ?? "",
        }))
      })
      .flat()
      .filter((option): option is CountryOption => !!option)
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [regions])

  useEffect(() => {
    if (countryCode) {
      const option = options?.find((entry) => entry?.country === countryCode)
      setCurrent(option)
    }
  }, [options, countryCode])

  const handleChange = (option: CountryOption) => {
    updateRegion(option.country, currentPath)
    close?.()
  }

  const isHeader = variant === "header"

  return (
    <div>
      <Listbox
        as="span"
        onChange={handleChange}
        defaultValue={
          countryCode
            ? options?.find((entry) => entry?.country === countryCode)
            : undefined
        }
      >
        <ListboxButton
          className={
            isHeader
              ? "flex items-center gap-x-1.5 rounded-md px-2 py-2 text-sm text-sc-body hover:text-sc-ink"
              : "py-1 w-full"
          }
          aria-label="Select shipping region"
        >
          <div
            className={
              isHeader
                ? "flex items-center gap-x-1.5"
                : "txt-compact-small flex items-start gap-x-2"
            }
          >
            {!isHeader && <span>Shipping to:</span>}
            {current && (
              <span
                className={
                  isHeader
                    ? "flex items-center gap-x-1.5 font-medium"
                    : "txt-compact-small flex items-center gap-x-2"
                }
              >
                <ReactCountryFlag
                  svg
                  style={{
                    width: "16px",
                    height: "16px",
                  }}
                  countryCode={current.country ?? ""}
                />
                {isHeader
                  ? formatRegionCurrency(current.currencyCode)
                  : formatCountryOptionLabel(
                      current.label,
                      current.currencyCode
                    )}
              </span>
            )}
          </div>
        </ListboxButton>
        <div
          className={
            isHeader
              ? "relative"
              : "flex relative w-full min-w-[320px]"
          }
        >
          {isHeader ? (
            <ListboxOptions className="absolute right-0 top-full z-[900] mt-1 max-h-[320px] w-72 overflow-y-auto rounded-md border border-sc-line bg-white py-1 text-sm shadow-lg">
              {options?.map((option, index) => (
                <ListboxOption
                  key={index}
                  value={option}
                  className="flex cursor-pointer items-center gap-x-2 px-3 py-2 text-sc-body hover:bg-sc-surface"
                >
                  <ReactCountryFlag
                    svg
                    style={{
                      width: "16px",
                      height: "16px",
                    }}
                    countryCode={option?.country ?? ""}
                  />
                  {formatCountryOptionLabel(
                    option.label,
                    regionCurrencyById.get(option.region)
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          ) : (
            <Transition
              show={state}
              as={Fragment}
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <ListboxOptions
                className="absolute -bottom-[calc(100%-36px)] left-0 xsmall:left-auto xsmall:right-0 max-h-[442px] overflow-y-scroll z-[900] bg-white drop-shadow-md text-small-regular uppercase text-black no-scrollbar rounded-rounded w-full"
                static
              >
                {options?.map((option, index) => (
                  <ListboxOption
                    key={index}
                    value={option}
                    className="py-2 hover:bg-gray-200 px-3 cursor-pointer flex items-center gap-x-2"
                  >
                    <ReactCountryFlag
                      svg
                      style={{
                        width: "16px",
                        height: "16px",
                      }}
                      countryCode={option?.country ?? ""}
                    />
                    {formatCountryOptionLabel(
                      option.label,
                      regionCurrencyById.get(option.region)
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Transition>
          )}
        </div>
      </Listbox>
    </div>
  )
}

export default CountrySelect
