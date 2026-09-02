/**
 * Mega menu layout tokens — Supercore brand (supercoreai.co.uk).
 * Orange CTA, dark charcoal nav text. No cyan.
 */
export const MEGA_MENU_LAYOUT = {
  panelMinHeight: 440,
  panelMaxHeight: 520,
  openDelayMs: 80,
  closeDelayMs: 250,
  /** INS panel slide-down duration (navigation__menu transition) */
  panelTransitionMs: 300,
  contentTransitionMs: 250,
  /** Products: INS mode rail | flat category/brand columns */
  productsGrid: "240px minmax(0, 1fr)",
  flatColumns: 3,
  /** Marketing menus (Services, Technologies, …) */
  triple: "repeat(3, minmax(0, 1fr))",
  double: "repeat(2, minmax(0, 1fr))",
  single: "minmax(0, 1fr)",
} as const

export const MEGA_MENU_TYPOGRAPHY = {
  trigger: "sc-nav-link gap-1",
  panelTitle:
    "text-[28px] leading-[36px] font-normal text-sc-ink tracking-tight",
  columnTitle:
    "font-display text-xs font-semibold uppercase tracking-[0.125em] text-sc-steel transition-colors hover:text-sc-ink",
  sectionTitle:
    "font-display text-xs font-semibold uppercase tracking-[0.125em] text-sc-steel transition-colors hover:text-sc-ink",
  flatLink:
    "text-base leading-6 text-sc-body hover:text-sc-cta transition-colors",
  link: "text-base leading-6 text-sc-body hover:text-sc-cta transition-colors",
  linkActive:
    "text-base leading-6 font-medium text-sc-ink bg-sc-cta/10",
  modeRailLabel: "text-base font-normal",
  childHeading:
    "text-base font-normal text-sc-body hover:text-sc-cta transition-colors",
  subLink: "text-base leading-6 text-sc-body hover:text-sc-cta transition-colors",
  viewAll:
    "text-base font-semibold text-sc-body hover:text-sc-cta hover:underline inline-flex items-center gap-1",
} as const
