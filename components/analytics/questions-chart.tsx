"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { TooltipContentProps } from "recharts/types/component/Tooltip";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { QuestionChartRow, QuestionStat } from "@/lib/analytics";

type QuestionTooltipProps = Partial<TooltipContentProps<number, string>>;

// Fixed identity per option position (never per option text, which differs
// question to question) — a validated categorical order, never re-ordered.
const optionChartConfig = {
  option1: { label: "الخيار الأول", color: "var(--chart-1)" },
  option2: { label: "الخيار الثاني", color: "var(--chart-2)" },
  option3: { label: "الخيار الثالث", color: "var(--chart-3)" },
  option4: { label: "الخيار الرابع", color: "var(--chart-4)" },
  option5: { label: "الخيار الخامس", color: "var(--chart-5)" },
} satisfies ChartConfig;

function QuestionTooltip({ active, payload }: QuestionTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const row = payload[0]?.payload as QuestionChartRow | undefined;
  if (!row) {
    return null;
  }

  return (
    <div className="grid min-w-56 gap-2 rounded-lg border border-border/50 bg-background px-3 py-2.5 text-xs shadow-xl">
      <div>
        <p className="text-muted-foreground">{row.category}</p>
        <p className="font-medium text-foreground">{row.questionText}</p>
      </div>
      <div className="grid gap-1.5">
        {payload.map((item) => {
          const key = item.dataKey as string;
          const optionText = row[`${key}Text` as keyof QuestionChartRow] as string | undefined;
          if (!optionText) {
            return null;
          }
          const config = optionChartConfig[key as keyof typeof optionChartConfig];

          return (
            <div key={key} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: config?.color }}
                />
                {optionText}
              </span>
              <span className="font-mono font-medium text-foreground tabular-nums">
                {item.value}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type QuestionsChartProps = {
  questions: QuestionStat[];
  rows: QuestionChartRow[];
};

export function QuestionsChart({ questions, rows }: QuestionsChartProps) {
  const [view, setView] = useState("chart");

  const maxOptionCount = Math.max(...questions.map((q) => q.options.length));
  const optionKeys = Array.from({ length: maxOptionCount }, (_, i) => `option${i + 1}`);

  return (
    <Card className="gap-0 border-0 bg-card/95 p-6 shadow-[0_12px_35px_rgba(60,100,115,0.09)]">
      <CardHeader className="mb-4 px-0">
        <CardTitle className="text-base font-semibold text-foreground">
          توزيع إجابات الطلاب حسب كل سؤال
        </CardTitle>
        <CardDescription>
          كل عمود يمثل أحد أسئلة الاستبيان الـ{questions.length}، ويوضح نسبة كل خيار من إجاباته
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0">
        <Tabs value={view} onValueChange={setView}>
          <TabsList className="mb-4">
            <TabsTrigger value="chart">الرسم البياني</TabsTrigger>
            <TabsTrigger value="table">جدول البيانات</TabsTrigger>
          </TabsList>

          <TabsContent value="chart">
            <div className="overflow-x-auto">
              <ChartContainer
                config={optionChartConfig}
                className="aspect-[2/1] min-w-[720px]"
              >
                <BarChart accessibilityLayer data={rows} maxBarSize={24}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="questionNumber"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => `س${value}`}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    domain={[0, 100]}
                    ticks={[0, 50, 100]}
                    tickFormatter={(value) => `${value}%`}
                    width={40}
                  />
                  <ChartTooltip cursor={false} content={<QuestionTooltip />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  {optionKeys.map((key, index) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      stackId="options"
                      fill={`var(--color-${key})`}
                      stroke="var(--card)"
                      strokeWidth={2}
                      radius={
                        index === 0
                          ? [0, 0, 0, 0]
                          : index === optionKeys.length - 1
                            ? [4, 4, 0, 0]
                            : [0, 0, 0, 0]
                      }
                    />
                  ))}
                </BarChart>
              </ChartContainer>
            </div>
          </TabsContent>

          <TabsContent value="table">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[20%]">الفئة</TableHead>
                  <TableHead className="w-[35%]">السؤال</TableHead>
                  <TableHead className="w-[30%]">الخيار</TableHead>
                  <TableHead className="w-[15%] text-left">النسبة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question) =>
                  question.options.map((option, index) => (
                    <TableRow key={`${question.questionIndex}-${option.optionIndex}`}>
                      {index === 0 ? (
                        <>
                          <TableCell
                            rowSpan={question.options.length}
                            className="align-top break-words whitespace-normal text-muted-foreground"
                          >
                            {question.category}
                          </TableCell>
                          <TableCell
                            rowSpan={question.options.length}
                            className="align-top font-medium break-words whitespace-normal text-foreground"
                          >
                            {question.question}
                          </TableCell>
                        </>
                      ) : null}
                      <TableCell className="break-words whitespace-normal text-muted-foreground">
                        {option.optionText}
                      </TableCell>
                      <TableCell className="text-left font-mono tabular-nums">
                        {option.percentage}%
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
