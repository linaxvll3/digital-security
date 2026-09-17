import { headers } from "next/headers";

import { getStudentName, saveStudentName } from "@/app/actions/profile";
import { completeSurveyResponse, getSurveyProgress, saveSurveyAnswer } from "@/app/actions/survey";
import { SurveyDashboard } from "@/components/analytics/survey-dashboard";
import { GoogleSignInCard } from "@/components/survey/google-sign-in-card";
import { SignOutButton } from "@/components/survey/sign-out-button";
import { StudentNameForm } from "@/components/survey/student-name-form";
import { SurveyExperience } from "@/components/survey/survey-experience";
import { auth } from "@/lib/auth";
import { getRespondents, getSurveyAnalytics } from "@/lib/analytics";
import { surveyQuestions } from "@/lib/survey-data";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session?.user?.role === "admin") {
    const [{ totalCompleted, questions }, respondents] = await Promise.all([
      getSurveyAnalytics(),
      getRespondents(),
    ]);

    return (
      <main className="relative z-10 mx-auto w-[92%] max-w-[1050px] py-9 pb-16">
        <div className="mb-6 flex justify-end">
          <SignOutButton />
        </div>
        <SurveyDashboard
          totalCompleted={totalCompleted}
          questions={questions}
          respondents={respondents}
        />
      </main>
    );
  }

  const [studentName, progress] = session?.user
    ? await Promise.all([
        getStudentName(session.user.id),
        getSurveyProgress(session.user.id),
      ])
    : [null, null];

  const answeredCount = progress ? Object.keys(progress.answers).length : 0;
  const resumeIndex = Math.min(answeredCount, surveyQuestions.length - 1);

  let initialStep: "welcome" | "survey" | "result" = "welcome";
  if (progress?.completed) {
    initialStep = "result";
  } else if (answeredCount > 0) {
    initialStep = "survey";
  }

  function renderContent() {
    if (!session?.user) {
      return <GoogleSignInCard />;
    }

    if (!studentName) {
      return <StudentNameForm onSubmit={saveStudentName} />;
    }

    return (
      <SurveyExperience
        initialStep={initialStep}
        initialQuestionIndex={resumeIndex}
        initialAnswers={progress?.answers ?? {}}
        onSaveAnswer={saveSurveyAnswer}
        onComplete={completeSurveyResponse}
      />
    );
  }

  return (
    <main className="relative z-10 mx-auto w-[92%] max-w-[1050px] py-9 pb-12">
      <div className="mb-4 flex items-start justify-between gap-4 text-sm font-medium text-muted-foreground">
        <div>
          <div>
            عمل الطالبة/ <span className="font-bold text-foreground">لاتين الحرّي</span>
          </div>
          <div>
            مشرفة النشاط/{" "}
            <span className="font-bold text-foreground">أ/ مرزوقه الحرّي</span>
          </div>
        </div>
        {session?.user ? <SignOutButton /> : null}
      </div>

      {renderContent()}
    </main>
  );
}
