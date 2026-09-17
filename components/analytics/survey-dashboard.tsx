import { ChartColumnBig } from "lucide-react";

import { QuestionsChart } from "@/components/analytics/questions-chart";
import { RespondentsList } from "@/components/analytics/respondents-list";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { QuestionStat, Respondent } from "@/lib/analytics";
import { buildQuestionChartRows } from "@/lib/analytics";

type SurveyDashboardProps = {
  totalCompleted: number;
  questions: QuestionStat[];
  respondents: Respondent[];
};

export function SurveyDashboard({ totalCompleted, questions, respondents }: SurveyDashboardProps) {
  if (respondents.length === 0) {
    return (
      <Card className="mx-auto max-w-lg gap-0 border-0 bg-card/95 p-4 shadow-[0_12px_35px_rgba(60,100,115,0.09)]">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ChartColumnBig />
            </EmptyMedia>
            <EmptyTitle>لا توجد بيانات كافية بعد</EmptyTitle>
            <EmptyDescription>
              ستظهر نتائج الاستبيان هنا بمجرد أن يبدأ الطلاب بالإجابة عليه.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-10 text-center">
        <p className="mb-1 text-sm text-muted-foreground">إجمالي المشاركات المكتملة</p>
        <p className="text-5xl font-semibold text-primary">{totalCompleted}</p>
      </div>

      {totalCompleted > 0 ? (
        <QuestionsChart questions={questions} rows={buildQuestionChartRows(questions)} />
      ) : (
        <p className="text-center text-sm leading-8 text-muted-foreground">
          لم يُكمل أي طالب الاستبيان بعد.
        </p>
      )}

      <RespondentsList respondents={respondents} />
    </div>
  );
}
