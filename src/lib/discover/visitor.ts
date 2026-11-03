import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";

const visitorCookie = "akiba_visitor";
const oneYear = 60 * 60 * 24 * 365;

export async function visitorId() {
  const jar = await cookies();
  const current = jar.get(visitorCookie)?.value ?? "";

  if (z.uuid().safeParse(current).success) return current;

  const id = crypto.randomUUID();
  jar.set(visitorCookie, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: oneYear,
    path: "/",
  });
  return id;
}
