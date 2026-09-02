/**
 * Default Admin Products list columns (view_configurations).
 * Labels match the requested catalog ops layout.
 */
export const productEntityOverrides = {
  Product: {
    defaultVisibleFields: [
      "product_display",
      "status",
      "inventory_display",
      "categories_display",
      "sales_channels_display",
      "catalogs_display",
      "product_type_display",
      "vendor_display",
    ],
    defaultFieldOrdering: {
      product_display: 100,
      status: 200,
      inventory_display: 300,
      categories_display: 400,
      sales_channels_display: 500,
      catalogs_display: 600,
      product_type_display: 700,
      vendor_display: 800,
    },
    fieldMetadata: {
      status: { resolver: "product_status" },
    },
    computedColumns: [
      {
        id: "categories_display",
        name: "Category",
        renderMode: "badges",
        requiredFields: ["categories.name"],
        defaultVisible: true,
        description: "Product category",
        category: "relationship",
        metadata: {
          display_field: "name",
          list_field: "categories",
        },
      },
      {
        id: "sales_channels_display",
        name: "Channels",
        renderMode: "badges",
        requiredFields: ["sales_channels.name"],
        defaultVisible: true,
        description: "Sales channels the product is available in",
        category: "relationship",
        metadata: {
          list_field: "sales_channels",
          display_field: "name",
        },
      },
      {
        id: "catalogs_display",
        name: "Catalogs",
        renderMode: "collection",
        requiredFields: ["collection.title"],
        defaultVisible: true,
        description: "Product collection / catalog",
        category: "relationship",
      },
      {
        id: "inventory_display",
        name: "Inventory",
        renderMode: "product_inventory",
        requiredFields: [
          "variants.manage_inventory",
          "variants.inventory_items.id",
          "variants.inventory_items.location_levels.stocked_quantity",
          "variants.inventory_items.location_levels.reserved_quantity",
        ],
        defaultVisible: true,
        description: "Available inventory across variants",
        category: "metric",
      },
      {
        id: "product_type_display",
        name: "Product type",
        renderMode: "product_type_label",
        requiredFields: ["type.value"],
        defaultVisible: true,
        description: "Product type",
        category: "relationship",
      },
      {
        id: "vendor_display",
        name: "Vendor",
        renderMode: "product_vendor",
        requiredFields: ["metadata"],
        defaultVisible: true,
        description: "Vendor / manufacturer brand",
        category: "metadata",
      },
    ],
  },
}
