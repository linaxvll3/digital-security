"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { surveyQuestions } from "@/lib/survey-data";

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}

export type SurveyProgress = {
  completed: boolean;
  answers: Record<number, string>;
};

export async function getSurveyProgress(userId: string): Promise<SurveyProgress> {
  const response = await prisma.surveyResponse.findUnique({
    where: { userId },
    include: { answers: { select: { questionIndex: true, optionText: true } } },
  });

  if (!response) {
    return { completed: false, answers: {} };
  }

  const answers: Record<number, string> = {};
  for (const answer of response.answers) {
    answers[answer.questionIndex] = answer.optionText;
  }

  return { completed: response.completedAt !== null, answers };
}

export type SaveAnswerResult =
  | { ok: true }
  | { ok: false; error: "unauthenticated" | "invalid" };

// Called every time the respondent confirms an answer (clicks "Next"), so
// progress survives a closed tab, sign-out, or lost connection.
export async function saveSurveyAnswer(
  questionIndex: number,
  optionText: string
): Promise<SaveAnswerResult> {
  const userId = await getUserId();
  if (!userId) {
    return { ok: false, error: "unauthenticated" };
  }

  const question = surveyQuestions[questionIndex];
  const optionIndex = question ? question.options.indexOf(optionText) : -1;
  if (!question || optionIndex === -1) {
    return { ok: false, error: "invalid" };
  }

  const response = await prisma.surveyResponse.upsert({
    where: { userId },
    create: { userId },
    update: {},
    select: { id: true },
  });

  await prisma.surveyAnswer.upsert({
    where: {
      responseId_questionIndex: { responseId: response.id, questionIndex },
    },
    create: {
      responseId: response.id,
      questionIndex,
      category: question.category,
      question: question.question,
      optionIndex,
      optionText,
    },
    update: {
      category: question.category,
      question: question.question,
      optionIndex,
      optionText,
    },
  });

  return { ok: true };
}

export type CompleteSurveyResult =
  | { ok: true }
  | { ok: false; error: "unauthenticated" | "incomplete" };

export async function completeSurveyResponse(): Promise<CompleteSurveyResult> {
  const userId = await getUserId();
  if (!userId) {
    return { ok: false, error: "unauthenticated" };
  }

  const response = await prisma.surveyResponse.findUnique({
    where: { userId },
    select: { _count: { select: { answers: true } } },
  });

  if (!response || response._count.answers < surveyQuestions.length) {
    return { ok: false, error: "incomplete" };
  }

  await prisma.surveyResponse.update({
    where: { userId },
    data: { completedAt: new Date() },
  });

  return { ok: true };
}
