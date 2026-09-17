import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { SurveyDashboard } from "@/components/analytics/survey-dashboard";
import { auth } from "@/lib/auth";
import { getRespondents, getSurveyAnalytics } from "@/lib/analytics";

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  const [{ totalCompleted, questions }, respondents] = await Promise.all([
    getSurveyAnalytics(),
    getRespondents(),
  ]);

  return (
    <main className="relative z-10 mx-auto w-[92%] max-w-[1050px] py-9 pb-16">
      <SurveyDashboard
        totalCompleted={totalCompleted}
        questions={questions}
        respondents={respondents}
      />
    </main>
  );
}
