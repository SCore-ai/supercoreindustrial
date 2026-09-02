/**
 * Reindex all published products into Typesense.
 *
 * Usage:
 *   node scripts/reindex-typesense.mjs
 *
 * Run inside the backend container when using Docker.
 */

import { execSync } from "node:child_process"

const medusa = "./node_modules/.bin/medusa"

execSync(`${medusa} exec ./src/scripts/reindex-typesense.ts`, {
  stdio: "inherit",
})
