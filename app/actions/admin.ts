"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type DeleteResponseResult =
  | { ok: true }
  | { ok: false; error: "forbidden" | "not_found" };

// Deletes a student's survey response (and, via cascade, all of their saved
// answers). Admin-only — re-checks the session server-side rather than
// trusting the caller, since this is a destructive, irreversible action.
export async function deleteSurveyResponse(userId: string): Promise<DeleteResponseResult> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user || session.user.role !== "admin") {
    return { ok: false, error: "forbidden" };
  }

  const deleted = await prisma.surveyResponse.deleteMany({ where: { userId } });
  if (deleted.count === 0) {
    return { ok: false, error: "not_found" };
  }

  revalidatePath("/");
  revalidatePath("/admin");

  return { ok: true };
}
