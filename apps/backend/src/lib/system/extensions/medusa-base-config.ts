import { getStripePaymentModule } from "../../payments/stripe-env"

const stripePaymentModule = getStripePaymentModule()

export const baseModules = [
  {
    resolve: "./src/modules/quote",
  },
  {
    resolve: "./src/modules/b2b",
  },
  {
    resolve: "./src/modules/catalog",
  },
  {
    resolve: "./src/modules/security",
  },
  {
    resolve: "./src/modules/online-store",
  },
  {
    resolve: "./src/modules/search-analytics",
  },
  {
    resolve: "@medusajs/medusa/analytics",
    options: {
      providers: [
        {
          resolve: "@medusajs/analytics-local",
          id: "local",
        },
      ],
    },
  },
  {
    resolve: "@medusajs/medusa/fulfillment",
    options: {
      providers: [
        {
          resolve: "@medusajs/medusa/fulfillment-manual",
          id: "manual",
        },
      ],
    },
  },
  {
    resolve: "@medusajs/medusa/translation",
  },
  ...(stripePaymentModule ? [stripePaymentModule] : []),
  {
    resolve: "@medusajs/medusa/file",
    options: {
      providers: [
        {
          resolve: "@medusajs/medusa/file-local",
          id: "local",
          options: {
            upload_dir: "static",
            // Browser-facing URL (host machine). Override with MEDUSA_FILE_BACKEND_URL if needed.
            backend_url:
              process.env.MEDUSA_FILE_BACKEND_URL ||
              process.env.BACKEND_URL ||
              "http://localhost:9000/static",
          },
        },
      ],
    },
  },
]

export const basePlugins = [
  {
    resolve: "@medusajs/loyalty-plugin",
    options: {},
  },
  {
    resolve: "@medusajs/draft-order",
    options: {},
  },
]
