"use server";

import { getLocale } from "next-intl/server";
import { z } from "zod";
import { isLocale } from "@/i18n/config";
import { translationEnabled } from "./google";
import { translateGarmentStory, type StoryTranslation } from "./story";

export type StoryTranslationResult = StoryTranslation | { status: "error" };

export async function translateStory(
  garmentId: string,
): Promise<StoryTranslationResult> {
  if (!z.uuid().safeParse(garmentId).success || !translationEnabled()) {
    return { status: "error" };
  }

  const locale = await getLocale();
  if (!isLocale(locale)) return { status: "error" };

  try {
    return (
      (await translateGarmentStory(garmentId, locale)) ?? { status: "error" }
    );
  } catch (error) {
    console.error(error);
    return { status: "error" };
  }
}
