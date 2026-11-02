export const collectionSlugs = ["trending", "men", "women"] as const;

export const categorySlugs = [
  "tops",
  "bottoms",
  "dresses",
  "suits",
  "traditional-wear",
  "bridal-occasion",
] as const;

export const subcategorySlugs = [
  "shirts",
  "blouses",
  "kaftans-tunics",
  "crop-tops",
  "trousers",
  "skirts",
  "shorts",
] as const;

export const audienceSlugs = ["women", "men", "unisex", "kids"] as const;

export const materialSlugs = [
  "kitenge-cotton",
  "cotton",
  "linen",
  "wool",
  "lace",
  "silk-blend",
  "denim",
] as const;

export const tailoringTypeSlugs = [
  "dressmaking",
  "suit-tailoring",
  "traditional",
  "kitenge-ankara",
  "bridal-occasion",
  "shirts",
  "kids",
] as const;

export type CollectionSlug = (typeof collectionSlugs)[number];
export type CategorySlug = (typeof categorySlugs)[number];
export type SubcategorySlug = (typeof subcategorySlugs)[number];
export type AudienceSlug = (typeof audienceSlugs)[number];
export type MaterialSlug = (typeof materialSlugs)[number];
export type TailoringTypeSlug = (typeof tailoringTypeSlugs)[number];

export type Category = {
  slug: CategorySlug;
  subcategories: readonly SubcategorySlug[];
};

export const categories: readonly Category[] = [
  {
    slug: "tops",
    subcategories: ["shirts", "blouses", "kaftans-tunics", "crop-tops"],
  },
  { slug: "bottoms", subcategories: ["trousers", "skirts", "shorts"] },
  { slug: "dresses", subcategories: [] },
  { slug: "suits", subcategories: [] },
  { slug: "traditional-wear", subcategories: [] },
  { slug: "bridal-occasion", subcategories: [] },
];

export function findCollection(slug: string | undefined) {
  return collectionSlugs.find((collection) => collection === slug);
}

export function findCategory(slug: string | undefined) {
  return categories.find((category) => category.slug === slug);
}

export function findSubcategory(
  category: Category | undefined,
  slug: string | undefined,
) {
  return category?.subcategories.find((subcategory) => subcategory === slug);
}
