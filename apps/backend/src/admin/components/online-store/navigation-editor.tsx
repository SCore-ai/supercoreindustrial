"use client"

import { Badge, Button, Input, Label, Text, toast } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import type {
  OnlineStoreNavColumn,
  OnlineStoreNavLink,
  OnlineStoreNavMenu,
} from "../../lib/online-store-types"
import type { ProductsMenuPreview } from "../../../lib/online-store/catalog-navigation"
import SortableList from "./sortable-list"

type SelectedMenu = "products" | number

type NavigationEditorProps = {
  mainNavigation: OnlineStoreNavMenu[]
  contactMenu: OnlineStoreNavLink[]
  partnerCatalog: OnlineStoreNavLink[]
  productsMenu: ProductsMenuPreview
  onSave: (payload: {
    main_navigation: OnlineStoreNavMenu[]
    contact_menu: OnlineStoreNavLink[]
    partner_catalog: OnlineStoreNavLink[]
  }) => Promise<void>
  onReset: () => Promise<void>
  saving?: boolean
}

const NavigationEditor = ({
  mainNavigation,
  contactMenu,
  partnerCatalog,
  productsMenu,
  onSave,
  onReset,
  saving = false,
}: NavigationEditorProps) => {
  const [menus, setMenus] = useState<OnlineStoreNavMenu[]>(mainNavigation)
  const [contact, setContact] = useState<OnlineStoreNavLink[]>(contactMenu)
  const [partner, setPartner] = useState<OnlineStoreNavLink[]>(partnerCatalog)
  const [selectedMenu, setSelectedMenu] = useState<SelectedMenu>("products")

  useEffect(() => {
    setMenus(mainNavigation)
    setContact(contactMenu)
    setPartner(partnerCatalog)
  }, [mainNavigation, contactMenu, partnerCatalog])

  useEffect(() => {
    if (typeof selectedMenu === "number" && selectedMenu >= menus.length) {
      setSelectedMenu(Math.max(0, menus.length - 1))
    }
  }, [menus.length, selectedMenu])

  const updateMenu = (index: number, patch: Partial<OnlineStoreNavMenu>) => {
    setMenus((prev) =>
      prev.map((menu, i) => (i === index ? { ...menu, ...patch } : menu))
    )
  }

  const updateColumn = (
    menuIndex: number,
    columnIndex: number,
    patch: Partial<OnlineStoreNavColumn>
  ) => {
    setMenus((prev) =>
      prev.map((menu, mi) => {
        if (mi !== menuIndex) return menu
        const columns = [...(menu.columns ?? [])]
        columns[columnIndex] = { ...columns[columnIndex], ...patch }
        return { ...menu, columns }
      })
    )
  }

  const updateLink = (
    menuIndex: number,
    columnIndex: number,
    linkIndex: number,
    patch: Partial<OnlineStoreNavLink>
  ) => {
    setMenus((prev) =>
      prev.map((menu, mi) => {
        if (mi !== menuIndex) return menu
        const columns = (menu.columns ?? []).map((column, ci) => {
          if (ci !== columnIndex) return column
          const items = column.items.map((item, li) =>
            li === linkIndex ? { ...item, ...patch } : item
          )
          return { ...column, items }
        })
        return { ...menu, columns }
      })
    )
  }

  const reorderColumns = (menuIndex: number, columns: OnlineStoreNavColumn[]) => {
    setMenus((prev) =>
      prev.map((menu, mi) => (mi === menuIndex ? { ...menu, columns } : menu))
    )
  }

  const reorderLinks = (
    menuIndex: number,
    columnIndex: number,
    items: OnlineStoreNavLink[]
  ) => {
    setMenus((prev) =>
      prev.map((menu, mi) => {
        if (mi !== menuIndex) return menu
        const columns = (menu.columns ?? []).map((column, ci) =>
          ci === columnIndex ? { ...column, items } : column
        )
        return { ...menu, columns }
      })
    )
  }

  const addLink = (menuIndex: number, columnIndex: number) => {
    setMenus((prev) =>
      prev.map((menu, mi) => {
        if (mi !== menuIndex) return menu
        const columns = (menu.columns ?? []).map((column, ci) => {
          if (ci !== columnIndex) return column
          return {
            ...column,
            items: [...column.items, { label: "New link", href: "/" }],
          }
        })
        return { ...menu, columns }
      })
    )
  }

  const removeLink = (
    menuIndex: number,
    columnIndex: number,
    linkIndex: number
  ) => {
    setMenus((prev) =>
      prev.map((menu, mi) => {
        if (mi !== menuIndex) return menu
        const columns = (menu.columns ?? []).map((column, ci) => {
          if (ci !== columnIndex) return column
          return {
            ...column,
            items: column.items.filter((_, li) => li !== linkIndex),
          }
        })
        return { ...menu, columns }
      })
    )
  }

  const addColumn = (menuIndex: number) => {
    setMenus((prev) =>
      prev.map((menu, mi) => {
        if (mi !== menuIndex) return menu
        return {
          ...menu,
          columns: [
            ...(menu.columns ?? []),
            { title: "New column", items: [{ label: "New link", href: "/" }] },
          ],
        }
      })
    )
  }

  const handleSave = async () => {
    try {
      await onSave({
        main_navigation: menus,
        contact_menu: contact,
        partner_catalog: partner,
      })
      toast.success("Navigation saved as draft")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed")
    }
  }

  const handleReset = async () => {
    try {
      await onReset()
      toast.success("Navigation reset to defaults")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Reset failed")
    }
  }

  const activeMenu = typeof selectedMenu === "number" ? menus[selectedMenu] : null

  return (
    <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
      <div className="rounded-lg border border-ui-border-base bg-ui-bg-base">
        <div className="border-b border-ui-border-base px-4 py-3">
          <Text weight="plus">Menus</Text>
          <Text size="small" className="mt-1 text-ui-fg-subtle">
            Products uses your Medusa catalog. Drag to reorder other menus.
          </Text>
        </div>

        <div className="border-b border-ui-border-base">
          <button
            type="button"
            onClick={() => setSelectedMenu("products")}
            className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm ${
              selectedMenu === "products"
                ? "bg-ui-bg-subtle font-medium"
                : "hover:bg-ui-bg-subtle"
            }`}
          >
            <span className="flex items-center gap-2">
              {productsMenu.label}
              <Badge color="blue" size="2xsmall">
                Catalog
              </Badge>
            </span>
            <span className="text-ui-fg-muted">
              {productsMenu.category_count} cats
            </span>
          </button>
        </div>

        <SortableList
          items={menus}
          onReorder={(next) => {
            setMenus(next)
            if (typeof selectedMenu === "number") {
              const activeLabel = menus[selectedMenu]?.label
              const nextIndex = activeLabel
                ? next.findIndex((menu) => menu.label === activeLabel)
                : 0
              setSelectedMenu(nextIndex >= 0 ? nextIndex : 0)
            }
          }}
          keyExtractor={(menu, index) => `${menu.label}-${index}`}
          renderItem={(menu, index, dragHandle) => (
            <div className="border-b border-ui-border-base last:border-0">
              <div className="flex items-center gap-2 px-2 py-2">
                {dragHandle}
                <button
                  type="button"
                  onClick={() => setSelectedMenu(index)}
                  className={`flex flex-1 items-center justify-between rounded px-2 py-1.5 text-left text-sm ${
                    selectedMenu === index
                      ? "bg-ui-bg-subtle font-medium"
                      : "hover:bg-ui-bg-subtle"
                  }`}
                >
                  {menu.label}
                  <span className="text-ui-fg-muted">{menu.columns?.length ?? 0} cols</span>
                </button>
              </div>
            </div>
          )}
        />
      </div>

      <div className="space-y-6">
        {selectedMenu === "products" && (
          <div className="rounded-lg border border-ui-border-base bg-ui-bg-base p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Text weight="plus" className="text-lg">
                  {productsMenu.label} mega menu
                </Text>
                <Text size="small" className="mt-1 text-ui-fg-subtle">
                  Supercore categories and brands come from Medusa. Partner Catalogue
                  links are editable here and save as draft until published.
                </Text>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="small" asChild>
                  <Link to="/categories">Edit categories</Link>
                </Button>
                <Button variant="secondary" size="small" asChild>
                  <Link to="/collections">Edit collections</Link>
                </Button>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {productsMenu.sections
                .filter((section) => section.id !== "partner")
                .map((section) => (
                  <div
                    key={section.id}
                    className="rounded-md border border-ui-border-base p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Text weight="plus">{section.title}</Text>
                      <Badge color="grey" size="2xsmall">
                        Auto from Medusa
                      </Badge>
                    </div>
                    <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto">
                      {section.items.length === 0 ? (
                        <li className="text-sm text-ui-fg-subtle">
                          No items yet — add them in Medusa admin.
                        </li>
                      ) : (
                        section.items.map((item) => (
                          <li
                            key={`${section.id}-${item.label}-${item.href}`}
                            className="flex items-center justify-between gap-3 rounded px-2 py-1.5 text-sm hover:bg-ui-bg-subtle"
                          >
                            <span>{item.label}</span>
                            <span className="truncate text-ui-fg-muted">{item.href}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                ))}

              <div className="rounded-md border border-ui-border-base p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Text weight="plus">Partner Catalogue</Text>
                    <Text size="xsmall" className="text-ui-fg-muted">
                      Drag to reorder partner product category links.
                    </Text>
                  </div>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() =>
                      setPartner((prev) => [
                        ...prev,
                        { label: "New link", href: "/all-products" },
                      ])
                    }
                  >
                    Add link
                  </Button>
                </div>
                <div className="mt-4 space-y-2">
                  <SortableList
                    items={partner}
                    onReorder={setPartner}
                    keyExtractor={(item, index) => `${item.label}-${index}`}
                    renderItem={(item, index, dragHandle) => (
                      <div className="grid gap-2 sm:grid-cols-[auto_1fr_1fr_auto]">
                        {dragHandle}
                        <Input
                          value={item.label}
                          placeholder="Label"
                          onChange={(e) =>
                            setPartner((prev) =>
                              prev.map((link, i) =>
                                i === index ? { ...link, label: e.target.value } : link
                              )
                            )
                          }
                        />
                        <Input
                          value={item.href}
                          placeholder="/all-products/example"
                          onChange={(e) =>
                            setPartner((prev) =>
                              prev.map((link, i) =>
                                i === index ? { ...link, href: e.target.value } : link
                              )
                            )
                          }
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() =>
                            setPartner((prev) => prev.filter((_, i) => i !== index))
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMenu && typeof selectedMenu === "number" && (
          <div className="rounded-lg border border-ui-border-base bg-ui-bg-base p-5">
            <Text weight="plus" className="text-lg">
              {activeMenu.label} mega menu
            </Text>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Menu label</Label>
                <Input
                  className="mt-1"
                  value={activeMenu.label}
                  onChange={(e) => updateMenu(selectedMenu, { label: e.target.value })}
                />
              </div>
              <div>
                <Label>Overview link</Label>
                <Input
                  className="mt-1"
                  value={activeMenu.href ?? ""}
                  onChange={(e) => updateMenu(selectedMenu, { href: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <SortableList
                items={activeMenu.columns ?? []}
                onReorder={(columns) => reorderColumns(selectedMenu, columns)}
                keyExtractor={(column, index) => `${column.title}-${index}`}
                renderItem={(column, columnIndex, dragHandle) => (
                  <div className="rounded-md border border-ui-border-base p-4">
                    <div className="mb-3 flex items-center gap-2">
                      {dragHandle}
                      <Text weight="plus">Column {columnIndex + 1}</Text>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label>Column title</Label>
                        <Input
                          className="mt-1"
                          value={column.title}
                          onChange={(e) =>
                            updateColumn(selectedMenu, columnIndex, {
                              title: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Column link</Label>
                        <Input
                          className="mt-1"
                          value={column.href ?? ""}
                          onChange={(e) =>
                            updateColumn(selectedMenu, columnIndex, {
                              href: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <SortableList
                        items={column.items}
                        onReorder={(items) =>
                          reorderLinks(selectedMenu, columnIndex, items)
                        }
                        keyExtractor={(item, linkIndex) =>
                          `${item.label}-${linkIndex}`
                        }
                        renderItem={(item, linkIndex, linkDragHandle) => (
                          <div className="grid gap-2 sm:grid-cols-[auto_1fr_1fr_auto]">
                            {linkDragHandle}
                            <Input
                              value={item.label}
                              placeholder="Label"
                              onChange={(e) =>
                                updateLink(selectedMenu, columnIndex, linkIndex, {
                                  label: e.target.value,
                                })
                              }
                            />
                            <Input
                              value={item.href}
                              placeholder="/path"
                              onChange={(e) =>
                                updateLink(selectedMenu, columnIndex, linkIndex, {
                                  href: e.target.value,
                                })
                              }
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() =>
                                removeLink(selectedMenu, columnIndex, linkIndex)
                              }
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="small"
                        onClick={() => addLink(selectedMenu, columnIndex)}
                      >
                        Add link
                      </Button>
                    </div>
                  </div>
                )}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => addColumn(selectedMenu)}
              >
                Add column
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-ui-border-base bg-ui-bg-base p-5">
          <Text weight="plus">Contact dropdown links</Text>
          <Text size="small" className="mt-1 text-ui-fg-subtle">
            Drag to reorder contact menu links.
          </Text>
          <div className="mt-4 space-y-2">
            <SortableList
              items={contact}
              onReorder={setContact}
              keyExtractor={(item, index) => `${item.label}-${index}`}
              renderItem={(item, index, dragHandle) => (
                <div className="grid gap-2 sm:grid-cols-[auto_1fr_1fr]">
                  {dragHandle}
                  <Input
                    value={item.label}
                    onChange={(e) =>
                      setContact((prev) =>
                        prev.map((link, i) =>
                          i === index ? { ...link, label: e.target.value } : link
                        )
                      )
                    }
                  />
                  <Input
                    value={item.href}
                    onChange={(e) =>
                      setContact((prev) =>
                        prev.map((link, i) =>
                          i === index ? { ...link, href: e.target.value } : link
                        )
                      )
                    }
                  />
                </div>
              )}
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={handleReset} disabled={saving}>
            Reset to defaults
          </Button>
          <Button onClick={handleSave} isLoading={saving}>
            Save navigation
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NavigationEditor
