"use server";

import { z } from "zod";
import { getGarmentsById } from "@/lib/garments";
import { getTailorsById } from "@/lib/tailors";

const maxSaved = 100;

function savedIds(ids: unknown) {
  if (!Array.isArray(ids)) return [];

  return ids
    .filter((id): id is string => z.uuid().safeParse(id).success)
    .slice(0, maxSaved);
}

export async function loadSavedGarments(ids: unknown) {
  return getGarmentsById(savedIds(ids));
}

export async function loadSavedTailors(ids: unknown) {
  return getTailorsById(savedIds(ids));
}
