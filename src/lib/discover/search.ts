import "server-only";
import { getTranslations } from "next-intl/server";
import {
  categorySlugs,
  materialSlugs,
  subcategorySlugs,
} from "@/lib/catalogue";

export type SearchWord = {
  text: string;
  materials: string[];
  categories: string[];
  subcategories: string[];
};

const ignoredWords = new Set(["and", "the", "for", "with", "from"]);

export function searchText(query: string) {
  return query
    .toLowerCase()
    .split(/[^\p{L}\p{N}']+/u)
    .filter((word) => word.length >= 3 && !ignoredWords.has(word))
    .slice(0, 5);
}

export async function searchWords(query: string): Promise<SearchWord[]> {
  const t = await getTranslations("Catalogue");

  return searchText(query).map((text) => {
    const has = (name: string) => name.toLowerCase().includes(text);

    return {
      text,
      materials: materialSlugs.filter((slug) => has(t(`materials.${slug}`))),
      categories: categorySlugs.filter((slug) => has(t(`categories.${slug}`))),
      subcategories: subcategorySlugs.filter((slug) =>
        has(t(`subcategories.${slug}`)),
      ),
    };
  });
}
