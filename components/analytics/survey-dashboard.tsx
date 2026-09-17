import { ChartColumnBig } from "lucide-react";

import { CategoryChart } from "@/components/analytics/category-chart";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { QuestionStat } from "@/lib/analytics";
import { buildCategoryChartRows } from "@/lib/analytics";

type SurveyDashboardProps = {
  totalCompleted: number;
  categoryGroups: { category: string; questions: QuestionStat[] }[];
};

export function SurveyDashboard({ totalCompleted, categoryGroups }: SurveyDashboardProps) {
  if (totalCompleted === 0) {
    return (
      <Card className="mx-auto max-w-lg gap-0 border-0 bg-card/95 p-4 shadow-[0_12px_35px_rgba(60,100,115,0.09)]">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ChartColumnBig />
            </EmptyMedia>
            <EmptyTitle>لا توجد بيانات كافية بعد</EmptyTitle>
            <EmptyDescription>
              ستظهر نتائج الاستبيان هنا بمجرد أن يُكمل الطلاب إجاباتهم.
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

      <div className="grid gap-6 sm:grid-cols-2">
        {categoryGroups.map((group) => (
          <CategoryChart
            key={group.category}
            category={group.category}
            questions={group.questions}
            rows={buildCategoryChartRows(group.questions)}
          />
        ))}
      </div>
    </div>
  );
}
