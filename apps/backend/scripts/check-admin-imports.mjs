import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const adminRoot = path.resolve(__dirname, "../src/admin")

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(full, out)
    } else if (/\.(tsx|ts)$/.test(entry.name)) {
      out.push(full)
    }
  }
  return out
}

const importRe = /from\s+["'](\.\.?\/[^"']+)["']/g
const files = walk(adminRoot)
const missing = []

for (const file of files) {
  const text = fs.readFileSync(file, "utf8")
  let match
  while ((match = importRe.exec(text))) {
    const spec = match[1]
    const base = path.resolve(path.dirname(file), spec)
    const candidates = [
      base,
      `${base}.ts`,
      `${base}.tsx`,
      `${base}.js`,
      `${base}.jsx`,
      path.join(base, "index.ts"),
      path.join(base, "index.tsx"),
    ]
    if (!candidates.some((candidate) => fs.existsSync(candidate))) {
      missing.push({
        file: path.relative(adminRoot, file).replaceAll("\\", "/"),
        spec,
      })
    }
  }
}

if (!missing.length) {
  console.log("ALL_RESOLVE_OK")
  process.exit(0)
}

console.log(JSON.stringify(missing, null, 2))
process.exit(1)
