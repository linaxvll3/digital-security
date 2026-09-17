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

// Up to 5 options per question, keyed by ordinal position (not by option
// text, which differs per question) so every question's answers stack
// against the same fixed, colorblind-validated slot order.
export const MAX_OPTION_SLOTS = 5;

export type CategoryChartRow = {
  questionNumber: number;
  questionText: string;
} & Record<`option${number}`, number | undefined> &
  Record<`option${number}Text`, string | undefined>;

export function buildCategoryChartRows(questions: QuestionStat[]): CategoryChartRow[] {
  return questions.map((question, index) => {
    const row: CategoryChartRow = {
      questionNumber: index + 1,
      questionText: question.question,
    };

    question.options.forEach((option, optionPosition) => {
      row[`option${optionPosition + 1}`] = option.percentage;
      row[`option${optionPosition + 1}Text`] = option.optionText;
    });

    return row;
  });
}

export function groupQuestionsByCategory(
  questions: QuestionStat[]
): { category: string; questions: QuestionStat[] }[] {
  const order: string[] = [];
  const groups = new Map<string, QuestionStat[]>();

  for (const question of questions) {
    if (!groups.has(question.category)) {
      groups.set(question.category, []);
      order.push(question.category);
    }
    groups.get(question.category)!.push(question);
  }

  return order.map((category) => ({ category, questions: groups.get(category)! }));
}
