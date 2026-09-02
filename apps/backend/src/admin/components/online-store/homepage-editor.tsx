"use client"

import { Button, Input, Label, Text, Textarea, toast } from "@medusajs/ui"
import { useEffect, useState } from "react"
import type {
  HomepageFeaturedCategory,
  HomepageHeroSlide,
  OnlineStoreHomepage,
} from "../../lib/online-store-types"
import SortableList from "./sortable-list"

type HomepageEditorProps = {
  homepage: OnlineStoreHomepage
  onSave: (payload: { homepage: OnlineStoreHomepage }) => Promise<void>
  saving?: boolean
}

const emptySlide = (): HomepageHeroSlide => ({
  id: `slide-${Date.now()}`,
  tag: "New slide",
  title: "Slide title",
  description: "Slide description",
  ctaLabel: "Learn more",
  ctaHref: "/",
  image: "",
  imageAlt: "",
  tabLabel: "Slide tab",
})

const emptyCategory = (): HomepageFeaturedCategory => ({
  handle: `category-${Date.now()}`,
  title: "New category",
  href: "/all-products",
  image: "",
  imageAlt: "",
})

const HomepageEditor = ({ homepage, onSave, saving = false }: HomepageEditorProps) => {
  const [heroSlides, setHeroSlides] = useState(homepage.heroSlides)
  const [featuredCategories, setFeaturedCategories] = useState(
    homepage.featuredCategories
  )

  useEffect(() => {
    setHeroSlides(homepage.heroSlides)
    setFeaturedCategories(homepage.featuredCategories)
  }, [homepage])

  const updateSlide = (index: number, patch: Partial<HomepageHeroSlide>) => {
    setHeroSlides((prev) =>
      prev.map((slide, i) => (i === index ? { ...slide, ...patch } : slide))
    )
  }

  const updateCategory = (
    index: number,
    patch: Partial<HomepageFeaturedCategory>
  ) => {
    setFeaturedCategories((prev) =>
      prev.map((category, i) => (i === index ? { ...category, ...patch } : category))
    )
  }

  const handleSave = async () => {
    try {
      await onSave({ homepage: { heroSlides, featuredCategories } })
      toast.success("Homepage saved as draft")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed")
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-ui-border-base bg-ui-bg-base p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Text weight="plus" className="text-lg">
              Hero carousel
            </Text>
            <Text size="small" className="text-ui-fg-subtle">
              Drag slides to reorder. Changes publish after you click Publish.
            </Text>
          </div>
          <Button
            variant="secondary"
            size="small"
            onClick={() => setHeroSlides((prev) => [...prev, emptySlide()])}
          >
            Add slide
          </Button>
        </div>

        <SortableList
          className="mt-4 space-y-4"
          items={heroSlides}
          onReorder={setHeroSlides}
          keyExtractor={(slide) => slide.id}
          renderItem={(slide, index, dragHandle) => (
            <div className="rounded-md border border-ui-border-base p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {dragHandle}
                  <Text weight="plus">Slide {index + 1}</Text>
                </div>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() =>
                    setHeroSlides((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  Remove
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Tag</Label>
                  <Input
                    className="mt-1"
                    value={slide.tag}
                    onChange={(e) => updateSlide(index, { tag: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Tab label</Label>
                  <Input
                    className="mt-1"
                    value={slide.tabLabel}
                    onChange={(e) =>
                      updateSlide(index, { tabLabel: e.target.value })
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Title</Label>
                  <Input
                    className="mt-1"
                    value={slide.title}
                    onChange={(e) => updateSlide(index, { title: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    className="mt-1"
                    value={slide.description}
                    onChange={(e) =>
                      updateSlide(index, { description: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>CTA label</Label>
                  <Input
                    className="mt-1"
                    value={slide.ctaLabel}
                    onChange={(e) =>
                      updateSlide(index, { ctaLabel: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>CTA link</Label>
                  <Input
                    className="mt-1"
                    value={slide.ctaHref}
                    onChange={(e) =>
                      updateSlide(index, { ctaHref: e.target.value })
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Image URL</Label>
                  <Input
                    className="mt-1"
                    value={slide.image}
                    onChange={(e) => updateSlide(index, { image: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Image alt text</Label>
                  <Input
                    className="mt-1"
                    value={slide.imageAlt}
                    onChange={(e) =>
                      updateSlide(index, { imageAlt: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}
        />
      </section>

      <section className="rounded-lg border border-ui-border-base bg-ui-bg-base p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Text weight="plus" className="text-lg">
              Featured categories
            </Text>
            <Text size="small" className="text-ui-fg-subtle">
              Tiles shown below the hero on the homepage.
            </Text>
          </div>
          <Button
            variant="secondary"
            size="small"
            onClick={() =>
              setFeaturedCategories((prev) => [...prev, emptyCategory()])
            }
          >
            Add category
          </Button>
        </div>

        <SortableList
          className="mt-4 space-y-4"
          items={featuredCategories}
          onReorder={setFeaturedCategories}
          keyExtractor={(category) => category.handle}
          renderItem={(category, index, dragHandle) => (
            <div className="rounded-md border border-ui-border-base p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {dragHandle}
                  <Text weight="plus">{category.title || `Category ${index + 1}`}</Text>
                </div>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() =>
                    setFeaturedCategories((prev) =>
                      prev.filter((_, i) => i !== index)
                    )
                  }
                >
                  Remove
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Title</Label>
                  <Input
                    className="mt-1"
                    value={category.title}
                    onChange={(e) =>
                      updateCategory(index, { title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Handle</Label>
                  <Input
                    className="mt-1"
                    value={category.handle}
                    onChange={(e) =>
                      updateCategory(index, { handle: e.target.value })
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Link</Label>
                  <Input
                    className="mt-1"
                    value={category.href ?? ""}
                    onChange={(e) =>
                      updateCategory(index, { href: e.target.value })
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Image URL</Label>
                  <Input
                    className="mt-1"
                    value={category.image}
                    onChange={(e) =>
                      updateCategory(index, { image: e.target.value })
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Image alt text</Label>
                  <Input
                    className="mt-1"
                    value={category.imageAlt}
                    onChange={(e) =>
                      updateCategory(index, { imageAlt: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}
        />
      </section>

      <div className="flex justify-end">
        <Button onClick={handleSave} isLoading={saving}>
          Save homepage
        </Button>
      </div>
    </div>
  )
}

export default HomepageEditor
