import { prisma } from "@/lib/prisma";
import { surveyQuestions } from "@/lib/survey-data";

export type OptionStat = {
  optionIndex: number;
  optionText: string;
  count: number;
  percentage: number;
};

export type QuestionStat = {
  questionIndex: number;
  category: string;
  question: string;
  options: OptionStat[];
};

export type SurveyAnalytics = {
  totalCompleted: number;
  questions: QuestionStat[];
};

// Every completed response has exactly one answer per question (completion
// requires all 20 answered), so `totalCompleted` is the correct, constant
// denominator for every question's percentages.
export async function getSurveyAnalytics(): Promise<SurveyAnalytics> {
  const totalCompleted = await prisma.surveyResponse.count({
    where: { completedAt: { not: null } },
  });

  const answers = await prisma.surveyAnswer.findMany({
    where: { response: { completedAt: { not: null } } },
    select: { questionIndex: true, optionIndex: true },
  });

  const counts = new Map<string, number>();
  for (const answer of answers) {
    const key = `${answer.questionIndex}:${answer.optionIndex}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const questions: QuestionStat[] = surveyQuestions.map((question, questionIndex) => ({
    questionIndex,
    category: question.category,
    question: question.question,
    options: question.options.map((optionText, optionIndex) => {
      const count = counts.get(`${questionIndex}:${optionIndex}`) ?? 0;
      const percentage =
        totalCompleted > 0 ? Math.round((count / totalCompleted) * 1000) / 10 : 0;
      return { optionIndex, optionText, count, percentage };
    }),
  }));

  return { totalCompleted, questions };
}

export type Respondent = {
  userId: string;
  name: string;
  email: string;
  completed: boolean;
  startedAt: Date;
  completedAt: Date | null;
};

// Every user who has saved at least one answer, whether they finished the
// survey or not — so the admin can see who has (and hasn't yet) responded.
export async function getRespondents(): Promise<Respondent[]> {
  const responses = await prisma.surveyResponse.findMany({
    select: {
      userId: true,
      startedAt: true,
      completedAt: true,
      user: { select: { studentName: true, email: true } },
    },
    orderBy: { startedAt: "desc" },
  });

  return responses.map((response) => ({
    userId: response.userId,
    name: response.user.studentName ?? "بدون اسم",
    email: response.user.email,
    completed: response.completedAt !== null,
    startedAt: response.startedAt,
    completedAt: response.completedAt,
  }));
}

// Up to 5 options per question, keyed by ordinal position (not by option
// text, which differs per question) so every question's answers stack
// against the same fixed, colorblind-validated slot order.
export type QuestionChartRow = {
  questionNumber: number;
  questionText: string;
  category: string;
} & Record<`option${number}`, number | undefined> &
  Record<`option${number}Text`, string | undefined>;

// One row per question (1..20), all in a single chart — not grouped or
// split by category, so the chart stays one glanceable whole.
export function buildQuestionChartRows(questions: QuestionStat[]): QuestionChartRow[] {
  return questions.map((question, index) => {
    const row: QuestionChartRow = {
      questionNumber: index + 1,
      questionText: question.question,
      category: question.category,
    };

    question.options.forEach((option, optionPosition) => {
      row[`option${optionPosition + 1}`] = option.percentage;
      row[`option${optionPosition + 1}Text`] = option.optionText;
    });

    return row;
  });
}
