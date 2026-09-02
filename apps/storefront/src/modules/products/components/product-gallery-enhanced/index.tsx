"use client"

import { clx } from "@modules/common/components/ui"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type TouchEvent,
} from "react"

import GalleryLightbox from "./gallery-lightbox"

type ProductGalleryEnhancedProps = {
  images: HttpTypes.StoreProductImage[]
  productTitle: string
}

const ZOOM_FACTOR = 2.5
const LENS_SIZE = 120
/** INS stencil: 500×659 main stage, ~50px vertical thumbnails left */
const STAGE_W = 500
const STAGE_H = 659
const THUMB_SIZE = 50

export default function ProductGalleryEnhanced({
  images,
  productTitle,
}: ProductGalleryEnhancedProps) {
  const galleryImages = images.filter((img) => img.url)
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lensActive, setLensActive] = useState(false)
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 })
  const [canHoverZoom, setCanHoverZoom] = useState(false)

  const stageRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)

  const activeImage = galleryImages[activeIndex]
  const hasMultiple = galleryImages.length > 1
  const hasImages = galleryImages.length > 0

  useEffect(() => {
    setCanHoverZoom(window.matchMedia("(hover: hover) and (pointer: fine)").matches)
  }, [])

  useEffect(() => {
    if (activeIndex >= galleryImages.length) {
      setActiveIndex(0)
    }
  }, [activeIndex, galleryImages.length])

  const goTo = useCallback(
    (index: number) => {
      if (!galleryImages.length) return
      const next = (index + galleryImages.length) % galleryImages.length
      setActiveIndex(next)
    },
    [galleryImages.length]
  )

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo])
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo])

  const updateLens = (clientX: number, clientY: number) => {
    const stage = stageRef.current
    if (!stage) return

    const rect = stage.getBoundingClientRect()
    const half = LENS_SIZE / 2
    const x = Math.min(Math.max(clientX - rect.left, half), rect.width - half)
    const y = Math.min(Math.max(clientY - rect.top, half), rect.height - half)

    setLensPos({ x, y })
  }

  const handleStageMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!canHoverZoom || !activeImage?.url) return
    updateLens(event.clientX, event.clientY)
  }

  const handleStageKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") goPrev()
    if (event.key === "ArrowRight") goNext()
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      setLightboxOpen(true)
    }
  }

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null
  }

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current == null || !hasMultiple) return

    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current
    const delta = endX - touchStartX.current

    if (Math.abs(delta) > 48) {
      if (delta < 0) goNext()
      else goPrev()
    }

    touchStartX.current = null
  }

  const lensBackgroundPos = () => {
    const stage = stageRef.current
    if (!stage) return "50% 50%"

    const rect = stage.getBoundingClientRect()
    const px = ((lensPos.x / rect.width) * 100).toFixed(2)
    const py = ((lensPos.y / rect.height) * 100).toFixed(2)

    return `${px}% ${py}%`
  }

  if (!hasImages) {
    return (
      <div
        className="flex items-center justify-center border border-sc-line bg-white text-sc-steel"
        style={{ width: STAGE_W, maxWidth: "100%", aspectRatio: "500 / 659" }}
        data-testid="product-gallery"
      >
        No image available
      </div>
    )
  }

  return (
    <>
      {/* Desktop/tablet: thumbnails LEFT + main stage RIGHT (INS layout) */}
      <div
        className="mx-auto hidden min-[768px]:flex min-[768px]:items-start min-[768px]:gap-3"
        data-testid="product-gallery"
      >
        {hasMultiple && (
          <div
            className="flex shrink-0 flex-col gap-2 overflow-y-auto no-scrollbar"
            style={{ width: THUMB_SIZE, maxHeight: STAGE_H }}
            role="tablist"
            aria-label="Product images"
          >
            {galleryImages.map((image, index) => (
              <ThumbnailButton
                key={image.id ?? index}
                image={image}
                index={index}
                total={galleryImages.length}
                active={index === activeIndex}
                onSelect={() => setActiveIndex(index)}
              />
            ))}
          </div>
        )}

        <MainStage
          stageRef={stageRef}
          activeImage={activeImage}
          activeIndex={activeIndex}
          totalImages={galleryImages.length}
          productTitle={productTitle}
          hasMultiple={hasMultiple}
          canHoverZoom={canHoverZoom}
          lensActive={lensActive}
          lensPos={lensPos}
          lensBackgroundPos={lensBackgroundPos}
          onKeyDown={handleStageKeyDown}
          onMouseEnter={() => canHoverZoom && setLensActive(true)}
          onMouseLeave={() => setLensActive(false)}
          onMouseMove={handleStageMouseMove}
          onOpenLightbox={() => setLightboxOpen(true)}
          onPrev={goPrev}
          onNext={goNext}
        />
      </div>

      {/* Mobile: main image + horizontal thumbnail strip below */}
      <div className="min-[768px]:hidden" data-testid="product-gallery-mobile">
        <MainStage
          stageRef={stageRef}
          activeImage={activeImage}
          activeIndex={activeIndex}
          totalImages={galleryImages.length}
          productTitle={productTitle}
          hasMultiple={hasMultiple}
          canHoverZoom={canHoverZoom}
          lensActive={lensActive}
          lensPos={lensPos}
          lensBackgroundPos={lensBackgroundPos}
          onKeyDown={handleStageKeyDown}
          onMouseEnter={() => canHoverZoom && setLensActive(true)}
          onMouseLeave={() => setLensActive(false)}
          onMouseMove={handleStageMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onOpenLightbox={() => setLightboxOpen(true)}
          onPrev={goPrev}
          onNext={goNext}
          fullWidth
        />

        {hasMultiple && (
          <div
            className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar"
            role="tablist"
            aria-label="Product images"
          >
            {galleryImages.map((image, index) => (
              <ThumbnailButton
                key={image.id ?? index}
                image={image}
                index={index}
                total={galleryImages.length}
                active={index === activeIndex}
                onSelect={() => setActiveIndex(index)}
              />
            ))}
          </div>
        )}
      </div>

      <GalleryLightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={galleryImages}
        activeIndex={activeIndex}
        onIndexChange={setActiveIndex}
        productTitle={productTitle}
      />
    </>
  )
}

function ThumbnailButton({
  image,
  index,
  total,
  active,
  onSelect,
}: {
  image: HttpTypes.StoreProductImage
  index: number
  total: number
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-label={`Image ${index + 1} of ${total}`}
      onClick={onSelect}
      className={clx(
        "relative shrink-0 overflow-hidden border bg-white transition-all",
        active
          ? "border-sc-cta ring-1 ring-sc-cta/35"
          : "border-sc-line hover:border-sc-steel"
      )}
      style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
    >
      {image.url && (
        <Image
          src={image.url}
          alt=""
          fill
          sizes="50px"
          className="object-contain p-0.5"
        />
      )}
    </button>
  )
}

type MainStageProps = {
  stageRef: React.RefObject<HTMLDivElement | null>
  activeImage?: HttpTypes.StoreProductImage
  activeIndex: number
  totalImages: number
  productTitle: string
  hasMultiple: boolean
  canHoverZoom: boolean
  lensActive: boolean
  lensPos: { x: number; y: number }
  lensBackgroundPos: () => string
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  onMouseMove: (event: MouseEvent<HTMLDivElement>) => void
  onTouchStart?: (event: TouchEvent<HTMLDivElement>) => void
  onTouchEnd?: (event: TouchEvent<HTMLDivElement>) => void
  onOpenLightbox: () => void
  onPrev: () => void
  onNext: () => void
  fullWidth?: boolean
}

function MainStage({
  stageRef,
  activeImage,
  activeIndex,
  totalImages,
  productTitle,
  hasMultiple,
  canHoverZoom,
  lensActive,
  lensPos,
  lensBackgroundPos,
  onKeyDown,
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
  onTouchStart,
  onTouchEnd,
  onOpenLightbox,
  onPrev,
  onNext,
  fullWidth = false,
}: MainStageProps) {
  return (
    <div
      ref={stageRef}
      tabIndex={0}
      role="button"
      aria-label={`${productTitle} image ${activeIndex + 1}. Click to zoom.`}
      onKeyDown={onKeyDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onClick={onOpenLightbox}
      className="group relative cursor-zoom-in overflow-hidden border border-sc-line bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sc-cta/40"
      style={{
        width: fullWidth ? "100%" : STAGE_W,
        maxWidth: "100%",
        aspectRatio: "500 / 659",
        maxHeight: STAGE_H,
      }}
    >
      {activeImage?.url && (
        <Image
          key={activeImage.id ?? activeIndex}
          src={activeImage.url}
          alt={`${productTitle} — image ${activeIndex + 1}`}
          fill
          priority={activeIndex === 0}
          sizes="(max-width: 768px) 100vw, 500px"
          className="object-contain p-3 transition-opacity duration-300"
          draggable={false}
        />
      )}

      {canHoverZoom && lensActive && activeImage?.url && (
        <>
          <div
            className="pointer-events-none absolute rounded-full border-2 border-sc-cta/50 bg-sc-cta/5"
            style={{
              width: LENS_SIZE,
              height: LENS_SIZE,
              left: lensPos.x - LENS_SIZE / 2,
              top: lensPos.y - LENS_SIZE / 2,
            }}
          />
          <div
            className="pointer-events-none absolute right-2 top-2 hidden h-32 w-32 overflow-hidden border border-sc-line bg-white shadow-md lg:block"
            style={{
              backgroundImage: `url(${activeImage.url})`,
              backgroundSize: `${ZOOM_FACTOR * 100}%`,
              backgroundPosition: lensBackgroundPos(),
              backgroundRepeat: "no-repeat",
            }}
            aria-hidden
          />
        </>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-sc-ink/45 to-transparent p-2.5 pt-8 opacity-0 transition-opacity group-hover:opacity-100">
        <span className="bg-white/95 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-sc-ink">
          {canHoverZoom ? "Hover · Click zoom" : "Tap to zoom"}
        </span>
        {hasMultiple && (
          <span className="bg-sc-ink/80 px-1.5 py-0.5 text-[11px] font-medium text-white">
            {activeIndex + 1} / {totalImages}
          </span>
        )}
      </div>

      {hasMultiple && (
        <>
          <NavArrow direction="prev" onClick={onPrev} label="Previous image" />
          <NavArrow direction="next" onClick={onNext} label="Next image" />
        </>
      )}
    </div>
  )
}

function NavArrow({
  direction,
  onClick,
  label,
}: {
  direction: "prev" | "next"
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      className={clx(
        "absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-sc-line bg-white/95 text-sc-ink shadow-sm opacity-0 transition-all hover:border-sc-cta hover:text-sc-cta group-hover:opacity-100 focus:opacity-100",
        direction === "prev" ? "left-2" : "right-2"
      )}
    >
      {direction === "prev" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
    </button>
  )
}
