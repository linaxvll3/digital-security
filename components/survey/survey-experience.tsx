"use client";

import { useRef, useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { surveyQuestions } from "@/lib/survey-data";
import type { CompleteSurveyResult, SaveAnswerResult } from "@/app/actions/survey";

type Step = "welcome" | "survey" | "result";

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

type SurveyExperienceProps = {
  initialStep: Step;
  initialQuestionIndex: number;
  initialAnswers: Record<number, string>;
  onSaveAnswer: (questionIndex: number, optionText: string) => Promise<SaveAnswerResult>;
  onComplete: () => Promise<CompleteSurveyResult>;
};

export function SurveyExperience({
  initialStep,
  initialQuestionIndex,
  initialAnswers,
  onSaveAnswer,
  onComplete,
}: SurveyExperienceProps) {
  const [step, setStep] = useState<Step>(initialStep);
  const [current, setCurrent] = useState(initialQuestionIndex);
  const [answers, setAnswers] = useState<Record<number, string>>(initialAnswers);
  const [isSubmitting, startSubmit] = useTransition();
  // Mirrors `current` synchronously so bounds checks stay correct even if
  // this handler fires again before React re-renders with the new state.
  const currentRef = useRef(initialQuestionIndex);

  const total = surveyQuestions.length;
  const question = surveyQuestions[current];
  const percentage = Math.round(((current + 1) / total) * 100);
  const selected = answers[current];

  function goToQuestion(index: number) {
    currentRef.current = index;
    setCurrent(index);
    scrollToTop();
  }

  function handleStartSurvey() {
    setStep("survey");
    scrollToTop();
  }

  function handleSessionExpired() {
    window.alert("انتهت جلسة تسجيل الدخول. يرجى تسجيل الدخول مرة أخرى.");
    window.location.reload();
  }

  function handleNext() {
    const answer = answers[currentRef.current];
    if (!answer) {
      window.alert("يرجى اختيار إجابة قبل الانتقال إلى السؤال التالي.");
      return;
    }

    startSubmit(async () => {
      const saveResult = await onSaveAnswer(currentRef.current, answer);
      if (!saveResult.ok) {
        if (saveResult.error === "unauthenticated") {
          handleSessionExpired();
        } else {
          window.alert("تعذّر حفظ الإجابة. يرجى المحاولة مرة أخرى.");
        }
        return;
      }

      if (currentRef.current < total - 1) {
        goToQuestion(currentRef.current + 1);
        return;
      }

      const completeResult = await onComplete();
      if (completeResult.ok) {
        setStep("result");
        scrollToTop();
        return;
      }

      if (completeResult.error === "unauthenticated") {
        handleSessionExpired();
      } else {
        window.alert("تعذّر إرسال الاستبيان. يرجى مراجعة إجاباتك والمحاولة مرة أخرى.");
      }
    });
  }

  function handlePrevious() {
    if (currentRef.current > 0) {
      goToQuestion(currentRef.current - 1);
    }
  }

  if (step === "welcome") {
    return (
      <Card className="decor-corner-end gap-0 border-0 bg-card/90 px-8 py-13 text-center shadow-[0_15px_45px_rgba(60,100,115,0.10)] sm:px-11">
        <p className="mb-2.5 text-sm text-muted-foreground">استبيان توعوي</p>
        <h1 className="mb-3 text-[clamp(30px,5vw,48px)] leading-snug font-bold text-primary">
          سفراء الأمن الرقمي
        </h1>
        <p className="mx-auto mb-7 max-w-[650px] text-base leading-8 text-muted-foreground">
          استبيان حول استخدام الإنترنت ومخاطره، والتنمر الإلكتروني، وأخلاقيات المواطن
          الرقمي والاستخدام الآمن والمسؤول للتقنية.
        </p>
        <Button
          type="button"
          size="lg"
          onClick={handleStartSurvey}
          className="mx-auto h-auto rounded-2xl px-10 py-3.5 text-base font-semibold shadow-[0_8px_20px_rgba(71,111,128,0.18)] hover:-translate-y-0.5"
        >
          ابدأ الاستبيان
        </Button>
      </Card>
    );
  }

  if (step === "survey") {
    return (
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-5 text-sm text-muted-foreground">
          <span>
            السؤال {current + 1} من {total}
          </span>
          <span>{percentage}%</span>
        </div>

        <Progress
          value={percentage}
          className="mb-5 [&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-track]]:bg-[#c6dce5]"
        />

        <Card className="gap-0 border-0 bg-card/95 p-9 shadow-[0_12px_35px_rgba(60,100,115,0.09)]">
          <Badge
            variant="secondary"
            className="mb-4 h-auto w-fit rounded-full px-3.5 py-1.5 text-xs font-normal"
          >
            {question.category}
          </Badge>

          <h2 className="mb-6 text-xl leading-relaxed font-semibold text-foreground sm:text-2xl">
            {question.question}
          </h2>

          <RadioGroup
            value={selected ?? ""}
            onValueChange={(value) => {
              setAnswers((prev) => ({ ...prev, [current]: value as string }));
            }}
            className="gap-3"
          >
            {question.options.map((option, index) => {
              const id = `q${current}-option${index}`;
              return (
                <FieldLabel key={option} htmlFor={id} className="w-full">
                  <Field
                    orientation="horizontal"
                    className="gap-3 rounded-2xl border-input bg-muted px-4.5 py-4 text-foreground/90 hover:bg-accent"
                  >
                    <RadioGroupItem value={option} id={id} />
                    <FieldTitle className="text-sm font-normal sm:text-[15px]">
                      {option}
                    </FieldTitle>
                  </Field>
                </FieldLabel>
              );
            })}
          </RadioGroup>

          <div className="mt-7 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handlePrevious}
              disabled={isSubmitting}
              className={cn(
                "h-auto rounded-xl px-7 py-3 text-sm font-semibold",
                current === 0 && "invisible"
              )}
            >
              السابق
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="h-auto rounded-xl px-7 py-3 text-sm font-semibold"
            >
              {current === total - 1 ? "إنهاء الاستبيان" : "التالي"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <Card className="mt-6 gap-0 border-0 bg-card/95 px-8 py-14 text-center shadow-[0_12px_35px_rgba(60,100,115,0.09)]">
      <h2 className="mb-3 text-[30px] font-bold text-primary">شكرًا لمشاركتك</h2>
      <p className="leading-8 text-muted-foreground">
        تم الانتهاء من الاستبيان بنجاح.
        <br />
        نقدر وقتك ومساهمتك في تعزيز الوعي بالاستخدام الآمن والمسؤول للإنترنت.
      </p>
    </Card>
  );
}
