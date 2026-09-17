"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { SaveStudentNameResult } from "@/app/actions/profile";

type StudentNameFormProps = {
  onSubmit: (name: string) => Promise<SaveStudentNameResult>;
};

export function StudentNameForm({ onSubmit }: StudentNameFormProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startSubmit] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!name.trim()) {
      setError("يرجى إدخال اسمك للمتابعة.");
      return;
    }

    startSubmit(async () => {
      const result = await onSubmit(name);
      if (result.ok) {
        window.location.reload();
        return;
      }

      if (result.error === "unauthenticated") {
        window.alert("انتهت جلسة تسجيل الدخول. يرجى تسجيل الدخول مرة أخرى.");
        window.location.reload();
        return;
      }

      setError("يرجى إدخال اسمك للمتابعة.");
    });
  }

  return (
    <Card className="decor-corner-start mx-auto max-w-[560px] gap-0 border-0 bg-card/90 px-9 py-11 text-center shadow-[0_15px_45px_rgba(60,100,115,0.10)]">
      <p className="mb-2 text-[13px] text-muted-foreground">قبل البدء</p>
      <h2 className="mb-2 text-[27px] font-semibold text-primary">ما اسمك؟</h2>
      <p className="mx-auto mb-6 max-w-md text-sm leading-8 text-muted-foreground">
        يُستخدم اسمك لتوثيق مشاركتك في الاستبيان فقط.
      </p>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mx-auto flex w-full max-w-[390px] flex-col items-stretch gap-3"
      >
        <Input
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (error) setError(null);
          }}
          placeholder="الاسم الكامل"
          aria-invalid={error ? true : undefined}
          disabled={isPending}
          autoFocus
          className="h-13 rounded-[13px] border-input bg-white px-4 text-center text-[15px] shadow-[0_5px_16px_rgba(60,100,115,0.07)]"
        />
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <Button
          type="submit"
          disabled={isPending}
          className="h-13 rounded-[13px] text-[15px] font-semibold shadow-[0_8px_20px_rgba(71,111,128,0.18)] hover:-translate-y-0.5"
        >
          {isPending ? "جارٍ الحفظ..." : "متابعة"}
        </Button>
      </form>
    </Card>
  );
}
