import { syncAxisZenitelFolders } from "../lib/catalog/website-product-sync"

const result = syncAxisZenitelFolders(process.cwd())
console.log(
  `[folder-sync] created=${result.created} updated=${result.updated} moved=${result.moved} skipped=${result.skipped} rows=${result.total_rows}`
)
console.log(`[folder-sync] root=${result.products_root}`)
