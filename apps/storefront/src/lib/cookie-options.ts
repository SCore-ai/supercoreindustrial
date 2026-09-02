export const medusaCookieOptions = {
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
}

export const medusaHttpOnlyCookieOptions = {
  ...medusaCookieOptions,
  httpOnly: true,
}
