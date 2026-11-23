import "server-only";
import { unstable_cache } from "next/cache";
import { getGarmentStory } from "@/lib/garments";
import type { Locale } from "@/i18n/config";
import { translateTexts } from "./google";

export type StoryTranslation =
  | { status: "translated"; story: string; description: string | null }
  | { status: "same-language" };

const cachedTranslation = unstable_cache(
  async (texts: string[], target: Locale): Promise<StoryTranslation> => {
    const [story, description] = await translateTexts(texts, target);
    if (story.detectedLanguage === target) return { status: "same-language" };

    return {
      status: "translated",
      story: story.text,
      description: description?.text ?? null,
    };
  },
  ["garment-story-translation"],
  { revalidate: false },
);

export async function translateGarmentStory(id: string, target: Locale) {
  const garment = await getGarmentStory(id);
  if (!garment) return null;

  const texts = [garment.story];
  if (garment.description) texts.push(garment.description);

  return cachedTranslation(texts, target);
}
