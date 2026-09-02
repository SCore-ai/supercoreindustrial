"use client"

import { useState } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

type AnnouncementBarProps = {
  enabled?: boolean
  message?: string
  linkLabel?: string
  linkHref?: string
  dismissible?: boolean
}

const AnnouncementBar = ({
  enabled = true,
  message =
    "We launched the new Supercore Industrial Systems Ltd storefront. Returning customers can set a new password.",
  linkLabel = "set a new password",
  linkHref = "/account",
  dismissible = true,
}: AnnouncementBarProps) => {
  const [visible, setVisible] = useState(true)

  if (!enabled || !visible || !message) {
    return null
  }

  return (
    <div className="bg-sc-ink text-white">
      <div className="content-container flex items-center justify-between gap-4 py-2.5 text-base">
        <p className="text-white/90">
          {message}{" "}
          {linkHref && linkLabel && (
            <LocalizedClientLink href={linkHref} className="underline hover:text-white">
              {linkLabel}
            </LocalizedClientLink>
          )}
          {!linkHref && linkLabel ? linkLabel : null}
        </p>
        {dismissible && (
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="shrink-0 text-white/70 hover:text-white"
            aria-label="Close announcement"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

export default AnnouncementBar
