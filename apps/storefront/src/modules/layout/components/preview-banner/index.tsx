"use client"

type PreviewBannerProps = {
  active: boolean
}

export default function PreviewBanner({ active }: PreviewBannerProps) {
  if (!active) return null

  return (
    <div className="sticky top-0 z-[60] border-b border-amber-300 bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-950">
      Preview mode — draft online store settings are visible. Live customers see the published version.
    </div>
  )
}
