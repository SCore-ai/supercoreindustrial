"use client"

import { Dialog, Transition } from "@headlessui/react"
import { clx } from "@modules/common/components/ui"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  type WheelEvent,
} from "react"

type GalleryLightboxProps = {
  open: boolean
  onClose: () => void
  images: HttpTypes.StoreProductImage[]
  activeIndex: number
  onIndexChange: (index: number) => void
  productTitle: string
}

const MIN_ZOOM = 1
const MAX_ZOOM = 4
const ZOOM_STEP = 0.25

export default function GalleryLightbox({
  open,
  onClose,
  images,
  activeIndex,
  onIndexChange,
  productTitle,
}: GalleryLightboxProps) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragOrigin = useRef({ x: 0, y: 0, panX: 0, panY: 0 })

  const activeImage = images[activeIndex]
  const hasMultiple = images.length > 1

  const resetView = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  useEffect(() => {
    if (open) resetView()
  }, [activeIndex, open, resetView])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
      if (event.key === "ArrowLeft" && hasMultiple) {
        onIndexChange((activeIndex - 1 + images.length) % images.length)
      }
      if (event.key === "ArrowRight" && hasMultiple) {
        onIndexChange((activeIndex + 1) % images.length)
      }
      if (event.key === "+" || event.key === "=") {
        setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))
      }
      if (event.key === "-") {
        setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))
      }
      if (event.key === "0") resetView()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, activeIndex, hasMultiple, images.length, onClose, onIndexChange, resetView])

  const clampPan = (nextPan: { x: number; y: number }, nextZoom: number) => {
    const limit = 120 * nextZoom
    return {
      x: Math.min(Math.max(nextPan.x, -limit), limit),
      y: Math.min(Math.max(nextPan.y, -limit), limit),
    }
  }

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault()
    const delta = event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
    setZoom((current) => {
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current + delta))
      if (next <= 1) setPan({ x: 0, y: 0 })
      return next
    })
  }

  const handlePointerDown = (clientX: number, clientY: number) => {
    if (zoom <= 1) return
    setIsDragging(true)
    dragOrigin.current = {
      x: clientX,
      y: clientY,
      panX: pan.x,
      panY: pan.y,
    }
  }

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDragging) return
    const dx = clientX - dragOrigin.current.x
    const dy = clientY - dragOrigin.current.y
    setPan(
      clampPan(
        {
          x: dragOrigin.current.panX + dx,
          y: dragOrigin.current.panY + dy,
        },
        zoom
      )
    )
  }

  const handlePointerUp = () => setIsDragging(false)

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[80]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-sc-ink/92 backdrop-blur-md" />
        </Transition.Child>

        <div className="fixed inset-0 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{productTitle}</p>
              {hasMultiple && (
                <p className="text-xs text-white/70">
                  Image {activeIndex + 1} of {images.length}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ZoomControls
                zoom={zoom}
                onZoomIn={() =>
                  setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))
                }
                onZoomOut={() =>
                  setZoom((z) => {
                    const next = Math.max(MIN_ZOOM, z - ZOOM_STEP)
                    if (next <= 1) setPan({ x: 0, y: 0 })
                    return next
                  })
                }
                onReset={resetView}
              />
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-white/25 px-3 py-1.5 text-sm font-medium hover:border-sc-cta hover:text-sc-cta"
              >
                Close
              </button>
            </div>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-4">
            {hasMultiple && (
              <LightboxArrow
                direction="prev"
                onClick={() =>
                  onIndexChange((activeIndex - 1 + images.length) % images.length)
                }
              />
            )}

            <div
              className={clx(
                "relative flex h-full w-full max-w-6xl items-center justify-center",
                zoom > 1 ? "cursor-grab" : "cursor-zoom-in",
                isDragging && "cursor-grabbing"
              )}
              onWheel={handleWheel}
              onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
              onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={(e) => {
                const touch = e.touches[0]
                if (touch) handlePointerDown(touch.clientX, touch.clientY)
              }}
              onTouchMove={(e) => {
                const touch = e.touches[0]
                if (touch) handlePointerMove(touch.clientX, touch.clientY)
              }}
              onTouchEnd={handlePointerUp}
              onDoubleClick={() => {
                if (zoom > 1) resetView()
                else setZoom(2)
              }}
            >
              {activeImage?.url && (
                <div
                  className="relative h-full w-full transition-transform duration-150 ease-out"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  }}
                >
                  <Image
                    src={activeImage.url}
                    alt={`${productTitle} — zoomed`}
                    fill
                    sizes="100vw"
                    className="object-contain select-none"
                    draggable={false}
                    priority
                  />
                </div>
              )}
            </div>

            {hasMultiple && (
              <LightboxArrow
                direction="next"
                onClick={() =>
                  onIndexChange((activeIndex + 1) % images.length)
                }
              />
            )}
          </div>

          {hasMultiple && (
            <div className="flex justify-center gap-2 overflow-x-auto px-4 pb-5 no-scrollbar">
              {images.map((image, index) => (
                <button
                  key={image.id ?? index}
                  type="button"
                  onClick={() => onIndexChange(index)}
                  className={clx(
                    "relative h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-white/10",
                    index === activeIndex
                      ? "border-sc-cta ring-2 ring-sc-cta/40"
                      : "border-white/20 hover:border-white/50"
                  )}
                  aria-label={`View image ${index + 1}`}
                >
                  {image.url && (
                    <Image
                      src={image.url}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-contain p-1"
                    />
                  )}
                </button>
              ))}
            </div>
          )}

          <p className="pb-4 text-center text-xs text-white/50">
            Scroll or use +/- to zoom · Drag to pan · Double-click to toggle zoom
          </p>
        </div>
      </Dialog>
    </Transition>
  )
}

function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
}: {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}) {
  return (
    <div className="flex items-center gap-1 rounded-md border border-white/25 bg-white/5 p-1">
      <button
        type="button"
        onClick={onZoomOut}
        className="flex h-8 w-8 items-center justify-center rounded hover:bg-white/10"
        aria-label="Zoom out"
      >
        −
      </button>
      <span className="min-w-[3rem] text-center text-xs font-medium">
        {Math.round(zoom * 100)}%
      </span>
      <button
        type="button"
        onClick={onZoomIn}
        className="flex h-8 w-8 items-center justify-center rounded hover:bg-white/10"
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        type="button"
        onClick={onReset}
        className="ml-1 rounded px-2 py-1 text-xs hover:bg-white/10"
      >
        Reset
      </button>
    </div>
  )
}

function LightboxArrow({
  direction,
  onClick,
}: {
  direction: "prev" | "next"
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "prev" ? "Previous image" : "Next image"}
      className={clx(
        "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white hover:border-sc-cta hover:text-sc-cta",
        direction === "prev" ? "left-2 small:left-6" : "right-2 small:right-6"
      )}
    >
      {direction === "prev" ? "‹" : "›"}
    </button>
  )
}
