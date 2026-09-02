"use client"

import { Button, Input, Label, Text, Textarea, toast } from "@medusajs/ui"
import { useState } from "react"
import type {
  OnlineStoreAnnouncement,
  OnlineStoreMegaMenuLayout,
  OnlineStoreThemeColors,
  OnlineStoreThemeLayout,
  OnlineStoreThemeTypography,
  ResolvedOnlineStoreSettings,
} from "../../lib/online-store-types"

type ThemeSettingsPanelProps = {
  settings: ResolvedOnlineStoreSettings
  onSave: (payload: Record<string, unknown>) => Promise<void>
  saving?: boolean
}

type AccordionSection = {
  id: string
  title: string
  content: React.ReactNode
}

const ThemeSettingsPanel = ({
  settings,
  onSave,
  saving = false,
}: ThemeSettingsPanelProps) => {
  const [colors, setColors] = useState<OnlineStoreThemeColors>(settings.colors)
  const [typography, setTypography] = useState<OnlineStoreThemeTypography>(
    settings.typography
  )
  const [layout, setLayout] = useState<OnlineStoreThemeLayout>(settings.layout)
  const [megaMenu, setMegaMenu] = useState<OnlineStoreMegaMenuLayout>(
    settings.mega_menu_layout
  )
  const [announcement, setAnnouncement] = useState<OnlineStoreAnnouncement>(
    settings.announcement
  )
  const [customCss, setCustomCss] = useState(settings.custom_css ?? "")
  const [storefrontUrl, setStorefrontUrl] = useState(settings.storefront_url ?? "")
  const [openSection, setOpenSection] = useState<string>("colors")

  const handleSave = async () => {
    try {
      await onSave({
        storefront_url: storefrontUrl || null,
        colors,
        typography,
        layout,
        mega_menu_layout: megaMenu,
        announcement,
        custom_css: customCss || null,
      })
      toast.success("Theme settings saved as draft")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed")
    }
  }

  const sections: AccordionSection[] = [
    {
      id: "colors",
      title: "Colors",
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["cta", "CTA / Accent"],
              ["ctaHover", "CTA hover"],
              ["ink", "Headings (ink)"],
              ["body", "Body text"],
              ["steel", "Steel / labels"],
              ["line", "Borders"],
              ["paper", "Paper background"],
              ["footer", "Footer"],
              ["search", "Search field"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <Label htmlFor={`color-${key}`}>{label}</Label>
              <div className="mt-1 flex gap-2">
                <input
                  id={`color-${key}`}
                  type="color"
                  value={colors[key]}
                  onChange={(e) =>
                    setColors((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  className="h-10 w-12 cursor-pointer rounded border border-ui-border-base"
                />
                <Input
                  value={colors[key]}
                  onChange={(e) =>
                    setColors((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                />
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "typography",
      title: "Typography",
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Base font size</Label>
            <Input
              className="mt-1"
              value={typography.baseFontSize}
              onChange={(e) =>
                setTypography((prev) => ({ ...prev, baseFontSize: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>Page heading size</Label>
            <Input
              className="mt-1"
              value={typography.headingSize}
              onChange={(e) =>
                setTypography((prev) => ({ ...prev, headingSize: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>Mega menu title size</Label>
            <Input
              className="mt-1"
              value={typography.megaMenuTitleSize}
              onChange={(e) =>
                setTypography((prev) => ({
                  ...prev,
                  megaMenuTitleSize: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <Label>Nav link height</Label>
            <Input
              className="mt-1"
              value={typography.navLinkHeight}
              onChange={(e) =>
                setTypography((prev) => ({ ...prev, navLinkHeight: e.target.value }))
              }
            />
          </div>
        </div>
      ),
    },
    {
      id: "layout",
      title: "Layout",
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Header height</Label>
            <Input
              className="mt-1"
              value={layout.headerHeight}
              onChange={(e) =>
                setLayout((prev) => ({ ...prev, headerHeight: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>Content max width</Label>
            <Input
              className="mt-1"
              value={layout.contentMaxWidth}
              onChange={(e) =>
                setLayout((prev) => ({ ...prev, contentMaxWidth: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>Mega menu min height (px)</Label>
            <Input
              type="number"
              className="mt-1"
              value={layout.megaMenuPanelMinHeight}
              onChange={(e) =>
                setLayout((prev) => ({
                  ...prev,
                  megaMenuPanelMinHeight: Number(e.target.value) || 440,
                }))
              }
            />
          </div>
          <div>
            <Label>Mega menu max height (px)</Label>
            <Input
              type="number"
              className="mt-1"
              value={layout.megaMenuPanelMaxHeight}
              onChange={(e) =>
                setLayout((prev) => ({
                  ...prev,
                  megaMenuPanelMaxHeight: Number(e.target.value) || 520,
                }))
              }
            />
          </div>
        </div>
      ),
    },
    {
      id: "mega-menu",
      title: "Mega menu behaviour",
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Open delay (ms)</Label>
            <Input
              type="number"
              className="mt-1"
              value={megaMenu.openDelayMs}
              onChange={(e) =>
                setMegaMenu((prev) => ({
                  ...prev,
                  openDelayMs: Number(e.target.value) || 0,
                }))
              }
            />
          </div>
          <div>
            <Label>Close delay (ms)</Label>
            <Input
              type="number"
              className="mt-1"
              value={megaMenu.closeDelayMs}
              onChange={(e) =>
                setMegaMenu((prev) => ({
                  ...prev,
                  closeDelayMs: Number(e.target.value) || 0,
                }))
              }
            />
          </div>
          <div>
            <Label>Product grid columns</Label>
            <Input
              type="number"
              className="mt-1"
              value={megaMenu.flatColumns}
              onChange={(e) =>
                setMegaMenu((prev) => ({
                  ...prev,
                  flatColumns: Number(e.target.value) || 3,
                }))
              }
            />
          </div>
        </div>
      ),
    },
    {
      id: "announcement",
      title: "Announcement bar",
      content: (
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={announcement.enabled}
              onChange={(e) =>
                setAnnouncement((prev) => ({ ...prev, enabled: e.target.checked }))
              }
            />
            Show announcement bar
          </label>
          <div>
            <Label>Message</Label>
            <Textarea
              className="mt-1"
              rows={3}
              value={announcement.message}
              onChange={(e) =>
                setAnnouncement((prev) => ({ ...prev, message: e.target.value }))
              }
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Link label (optional)</Label>
              <Input
                className="mt-1"
                value={announcement.linkLabel ?? ""}
                onChange={(e) =>
                  setAnnouncement((prev) => ({ ...prev, linkLabel: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Link URL</Label>
              <Input
                className="mt-1"
                value={announcement.linkHref ?? ""}
                onChange={(e) =>
                  setAnnouncement((prev) => ({ ...prev, linkHref: e.target.value }))
                }
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "custom-css",
      title: "Custom CSS",
      content: (
        <div>
          <Label>Additional storefront CSS</Label>
          <Textarea
            className="mt-1 font-mono text-xs"
            rows={8}
            value={customCss}
            onChange={(e) => setCustomCss(e.target.value)}
            placeholder=":root { --sc-cta: #FFB700; }"
          />
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="w-full shrink-0 lg:w-72">
        <div className="overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-base">
          <div className="border-b border-ui-border-base px-4 py-3">
            <Text weight="plus">Theme settings</Text>
          </div>
          <ul>
            {sections.map((section) => (
              <li key={section.id} className="border-b border-ui-border-base last:border-0">
                <button
                  type="button"
                  onClick={() => setOpenSection(section.id)}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors ${
                    openSection === section.id
                      ? "bg-ui-bg-subtle font-medium"
                      : "hover:bg-ui-bg-subtle"
                  }`}
                >
                  {section.title}
                  <span aria-hidden>{openSection === section.id ? "▾" : "▸"}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4">
          <Label>Storefront URL</Label>
          <Input
            className="mt-1"
            value={storefrontUrl}
            onChange={(e) => setStorefrontUrl(e.target.value)}
            placeholder="https://supercoreai.co.uk"
          />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="rounded-lg border border-ui-border-base bg-ui-bg-base p-5">
          {sections.find((section) => section.id === openSection)?.content}
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSave} isLoading={saving}>
            Save theme settings
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ThemeSettingsPanel
