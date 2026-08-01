export const BUSINESSES: Record<string, { id: string; name: string; slug: string; hasCatering: boolean; hasRawMaterials: boolean }> = {
  cafe: {
    id: import.meta.env.VITE_CAFE_BUSINESS_ID ?? "02a8572f-9352-409e-b8b8-bed453205c69",
    name: "Lorencia Cafe",
    slug: "cafe",
    hasCatering: true,
    hasRawMaterials: true,
  },
  "gift-shop": {
    id: import.meta.env.VITE_GIFT_SHOP_BUSINESS_ID ?? "1b8a5f49-fcb4-422c-ac96-51ee3f3a95c4",
    name: "Lorencia Gift Shop",
    slug: "gift-shop",
    hasCatering: false,
    hasRawMaterials: false,
  },
};

export type BusinessSlug = keyof typeof BUSINESSES;
