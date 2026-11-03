import { z } from "zod";
import {
  participantCodeSchema,
  rememberParticipant,
} from "@/lib/discover/visitor";

const bodySchema = z.object({ code: participantCodeSchema });

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new Response(null, { status: 400 });

  await rememberParticipant(parsed.data.code);
  return new Response(null, { status: 204 });
}
