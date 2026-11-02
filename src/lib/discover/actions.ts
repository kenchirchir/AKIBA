"use server";

import { z } from "zod";
import { getGarmentsById } from "@/lib/garments";

const maxSaved = 100;

export async function loadSavedGarments(ids: unknown) {
  if (!Array.isArray(ids)) return [];

  const valid = ids
    .filter((id): id is string => z.uuid().safeParse(id).success)
    .slice(0, maxSaved);

  return getGarmentsById(valid);
}
