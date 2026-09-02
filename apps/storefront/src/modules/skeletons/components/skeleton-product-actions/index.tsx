const SkeletonProductActions = () => {
  return (
    <div className="sc-product-buy-box" aria-hidden>
      <div className="h-3 w-24 animate-pulse rounded bg-sc-line" />
      <div className="mt-3 h-8 w-4/5 animate-pulse rounded bg-sc-line" />
      <div className="mt-4 flex gap-5">
        <div className="h-4 w-40 animate-pulse rounded bg-sc-line" />
        <div className="h-4 w-36 animate-pulse rounded bg-sc-line" />
      </div>
      <div className="mt-4 h-16 w-full animate-pulse rounded bg-sc-paper" />
      <div className="mt-6 space-y-4 border-t border-sc-line pt-5">
        <div className="h-3 w-20 animate-pulse rounded bg-sc-line" />
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="space-y-1.5">
            <div className="h-3 w-28 animate-pulse rounded bg-sc-line" />
            <div className="h-11 w-full animate-pulse rounded-md bg-sc-paper" />
          </div>
        ))}
      </div>
      <div className="mt-5 h-12 w-full animate-pulse rounded bg-sc-line" />
    </div>
  )
}

export default SkeletonProductActions
