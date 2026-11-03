import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";

const visitorCookie = "akiba_visitor";
const participantCookie = "akiba_participant";
const oneYear = 60 * 60 * 24 * 365;
const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: oneYear,
  path: "/",
};

export const participantCodeSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9-]{2,20}$/)
  .transform((value) => value.toUpperCase());

export async function visitorId() {
  const jar = await cookies();
  const current = jar.get(visitorCookie)?.value ?? "";

  if (z.uuid().safeParse(current).success) return current;

  const id = crypto.randomUUID();
  jar.set(visitorCookie, id, cookieOptions);
  return id;
}

export async function participantCode() {
  const value = (await cookies()).get(participantCookie)?.value;
  const parsed = participantCodeSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export async function rememberParticipant(code: string) {
  (await cookies()).set(participantCookie, code, cookieOptions);
}
