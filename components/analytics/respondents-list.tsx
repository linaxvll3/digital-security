import { arSA } from "date-fns/locale";
import { format } from "date-fns";

import { deleteSurveyResponse } from "@/app/actions/admin";
import { DeleteRespondentButton } from "@/components/analytics/delete-respondent-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Respondent } from "@/lib/analytics";

type RespondentsListProps = {
  respondents: Respondent[];
};

export function RespondentsList({ respondents }: RespondentsListProps) {
  return (
    <Card className="mt-6 gap-0 border-0 bg-card/95 p-6 shadow-[0_12px_35px_rgba(60,100,115,0.09)]">
      <CardHeader className="mb-4 px-0">
        <CardTitle className="text-base font-semibold text-foreground">المشاركون</CardTitle>
        <CardDescription>
          {respondents.length} طالبًا شاركوا في الاستبيان حتى الآن
        </CardDescription>
      </CardHeader>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الاسم</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead className="text-left">التاريخ</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {respondents.map((respondent) => (
            <TableRow key={respondent.email}>
              <TableCell>
                <div className="font-medium text-foreground">{respondent.name}</div>
                <div className="text-xs text-muted-foreground">{respondent.email}</div>
              </TableCell>
              <TableCell>
                <Badge variant={respondent.completed ? "secondary" : "outline"}>
                  {respondent.completed ? "مكتمل" : "قيد التقدم"}
                </Badge>
              </TableCell>
              <TableCell className="text-left font-mono tabular-nums text-muted-foreground">
                {format(respondent.completedAt ?? respondent.startedAt, "d MMMM yyyy", {
                  locale: arSA,
                })}
              </TableCell>
              <TableCell>
                <DeleteRespondentButton
                  name={respondent.name}
                  onDelete={deleteSurveyResponse.bind(null, respondent.userId)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
