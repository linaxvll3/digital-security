"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type SaveStudentNameResult =
  | { ok: true }
  | { ok: false; error: "unauthenticated" | "invalid" };

export async function saveStudentName(name: string): Promise<SaveStudentNameResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { ok: false, error: "unauthenticated" };
  }

  const trimmed = name.trim();
  if (!trimmed) {
    return { ok: false, error: "invalid" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { studentName: trimmed },
  });

  return { ok: true };
}

export async function getStudentName(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { studentName: true },
  });

  return user?.studentName ?? null;
}
