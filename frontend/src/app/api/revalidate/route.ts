import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { getEnv } from "@/lib/env";

const BodySchema = z.object({ tags: z.array(z.string()).min(1).max(20) });
const ALLOWED_TAG = /^(settings|page:[a-z0-9-]+)$/;

function hasValidSecret(provided: string | null, expected: string): boolean {
  if (!expected || !provided) {
    return false;
  }

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);

  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request): Promise<Response> {
  if (!hasValidSecret(request.headers.get("x-forecourt-secret"), getEnv().SHARED_SECRET)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = BodySchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return Response.json({ error: "Expected { tags: string[] }" }, { status: 400 });
  }

  const revalidated = [...new Set(parsed.data.tags.filter((tag) => ALLOWED_TAG.test(tag)))];

  for (const tag of revalidated) {
    revalidateTag(tag, { expire: 0 });
  }

  return Response.json({ revalidated });
}
