"use client"

import type { StoreOnlineStoreSettings } from "@lib/data/online-store"

type ThemeStyleInjectorProps = {
  settings: StoreOnlineStoreSettings["theme"] | null
}

export default function ThemeStyleInjector({ settings }: ThemeStyleInjectorProps) {
  if (!settings) return null

  const { colors, typography, layout, custom_css } = settings

  const css = `
:root {
  --sc-cta: ${colors.cta};
  --sc-cta-hover: ${colors.ctaHover};
  --sc-accent: ${colors.accent ?? colors.cta};
  --sc-accent-dark: ${colors.ctaHover};
  --sc-ink: ${colors.ink};
  --sc-body: ${colors.body};
  --sc-steel: ${colors.steel};
  --sc-line: ${colors.line};
  --sc-paper: ${colors.paper};
  --sc-footer: ${colors.footer};
  --sc-search: ${colors.search};
  --sc-header-height: ${layout.headerHeight};
}
${custom_css ?? ""}
`.trim()

  return (
    <style
      data-online-store-theme={settings.version}
      dangerouslySetInnerHTML={{ __html: css }}
    />
  )
}
