import fs from "fs"
import path from "path"

type PackageJson = {
  name?: string
  version?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  packageManager?: string
}

function readPackageJson(filePath: string): PackageJson | null {
  if (!fs.existsSync(filePath)) {
    return null
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as PackageJson
  } catch {
    return null
  }
}

export function getMonorepoRoot() {
  const cwd = process.cwd()
  const candidates = [
    cwd,
    path.resolve(cwd, ".."),
    path.resolve(cwd, "../.."),
    path.resolve(cwd, "../../.."),
  ]

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "pnpm-workspace.yaml"))) {
      return candidate
    }
  }

  return path.resolve(cwd, "../..")
}

function packageJsonCandidates(root: string, packageName: string) {
  const segments = packageName.startsWith("@")
    ? packageName.split("/")
    : [packageName]

  return [
    path.join(process.cwd(), "node_modules", ...segments, "package.json"),
    path.join(root, "node_modules", ...segments, "package.json"),
    path.join(root, "apps/backend/node_modules", ...segments, "package.json"),
    path.join(root, "apps/storefront/node_modules", ...segments, "package.json"),
  ]
}

/** Prefer the resolved install in node_modules over the range in package.json. */
export function readInstalledPackageVersion(
  packageName: string,
  root = getMonorepoRoot()
): string | null {
  for (const candidate of packageJsonCandidates(root, packageName)) {
    const pkg = readPackageJson(candidate)
    if (pkg?.version) {
      return pkg.version
    }
  }

  return null
}

function declaredVersion(
  deps: Record<string, string | undefined>,
  packageName: string
) {
  return deps[packageName] ?? null
}

export function readWorkspacePackageVersions() {
  const root = getMonorepoRoot()
  const backendPkg = readPackageJson(path.join(root, "apps/backend/package.json"))
  const storefrontPkg = readPackageJson(
    path.join(root, "apps/storefront/package.json")
  )
  const rootPkg = readPackageJson(path.join(root, "package.json"))

  const backendDeps = {
    ...(backendPkg?.dependencies ?? {}),
    ...(backendPkg?.devDependencies ?? {}),
  }

  const storefrontDeps = {
    ...(storefrontPkg?.dependencies ?? {}),
    ...(storefrontPkg?.devDependencies ?? {}),
  }

  const rootDeps = {
    ...(rootPkg?.dependencies ?? {}),
    ...(rootPkg?.devDependencies ?? {}),
  }

  const resolve = (packageName: string, declared?: string | null) =>
    readInstalledPackageVersion(packageName, root) ??
    normalizeInstalledVersion(declared) ??
    null

  return {
    root,
    packages: {
      [backendPkg?.name ?? "@dtc/backend"]: backendPkg?.version ?? null,
      [storefrontPkg?.name ?? "@dtc/storefront"]:
        storefrontPkg?.version ?? null,
      "@medusajs/medusa": resolve(
        "@medusajs/medusa",
        declaredVersion(backendDeps, "@medusajs/medusa")
      ),
      "@medusajs/framework": resolve(
        "@medusajs/framework",
        declaredVersion(backendDeps, "@medusajs/framework")
      ),
      "@medusajs/admin-sdk": resolve(
        "@medusajs/admin-sdk",
        declaredVersion(backendDeps, "@medusajs/admin-sdk")
      ),
      "@medusajs/dashboard": resolve(
        "@medusajs/dashboard",
        declaredVersion(backendDeps, "@medusajs/dashboard")
      ),
      "@medusajs/loyalty-plugin": resolve(
        "@medusajs/loyalty-plugin",
        declaredVersion(backendDeps, "@medusajs/loyalty-plugin")
      ),
      "@medusajs/draft-order": resolve(
        "@medusajs/draft-order",
        declaredVersion(backendDeps, "@medusajs/draft-order")
      ),
      next: resolve("next", declaredVersion(storefrontDeps, "next")),
      react: resolve(
        "react",
        declaredVersion(storefrontDeps, "react") ??
          declaredVersion(rootDeps, "react")
      ),
      eslint: resolve("eslint", declaredVersion(rootDeps, "eslint")),
      typescript: resolve(
        "typescript",
        declaredVersion(backendDeps, "typescript") ??
          declaredVersion(rootDeps, "typescript")
      ),
      turbo: resolve("turbo", declaredVersion(rootDeps, "turbo")),
    },
    package_manager: rootPkg?.packageManager ?? null,
  }
}

export function normalizeInstalledVersion(version: string | null | undefined) {
  if (!version) {
    return null
  }

  return version.replace(/^[\^~>=<]+/, "").trim() || null
}

export function isUpdateAvailable(
  installed: string | null,
  latest: string | null
) {
  if (!installed || !latest) {
    return false
  }

  const cleanInstalled = normalizeInstalledVersion(installed)
  const cleanLatest = normalizeInstalledVersion(latest)

  if (!cleanInstalled || !cleanLatest) {
    return false
  }

  return cleanInstalled !== cleanLatest
}
