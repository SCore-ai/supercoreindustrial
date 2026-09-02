import repeat from "@lib/util/repeat"

const SkeletonRelatedProducts = () => {
  return (
    <div className="mt-6 rounded-md border border-sc-line bg-sc-search/50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="h-4 w-40 animate-pulse rounded bg-sc-line" />
        <div className="h-3 w-24 animate-pulse rounded bg-sc-line" />
      </div>
      <ul className="mt-3 space-y-2.5">
        {repeat(2).map((index) => (
          <li
            key={index}
            className="flex gap-3 border border-sc-line bg-white p-2.5"
          >
            <div className="h-14 w-14 shrink-0 animate-pulse bg-sc-paper" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-3 w-16 animate-pulse rounded bg-sc-line" />
              <div className="h-4 w-full animate-pulse rounded bg-sc-line" />
              <div className="h-4 w-20 animate-pulse rounded bg-sc-line" />
              <div className="h-8 w-full animate-pulse rounded bg-sc-line" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SkeletonRelatedProducts
