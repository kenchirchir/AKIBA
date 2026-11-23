"use server";

import { cookies } from "next/headers";
import { isLocale, localeCookie } from "./config";

const oneYear = 60 * 60 * 24 * 365;

export async function setLocale(formData: FormData) {
  const locale = formData.get("locale");
  if (!isLocale(locale)) return;

  (await cookies()).set(localeCookie, locale, {
    path: "/",
    maxAge: oneYear,
    sameSite: "lax",
  });
}
