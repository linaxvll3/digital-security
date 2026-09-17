"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export function GoogleSignInCard() {
  const [isRedirecting, setIsRedirecting] = useState(false);

  async function handleGoogleLogin() {
    setIsRedirecting(true);
    await authClient.signIn.social({ provider: "google", callbackURL: "/" });
  }

  return (
    <Card className="decor-corner-start mx-auto max-w-[620px] gap-0 border-0 bg-card/90 px-9 py-11 text-center shadow-[0_15px_45px_rgba(60,100,115,0.10)]">
      <p className="mb-2 text-[13px] text-muted-foreground">الدخول إلى الاستبيان</p>
      <h2 className="mb-2 text-[27px] font-semibold text-primary">مرحبًا بك</h2>
      <p className="mx-auto mb-6 max-w-md text-sm leading-8 text-muted-foreground">
        سجّل الدخول باستخدام حساب Google للمتابعة إلى الاستبيان.
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
        disabled={isRedirecting}
        className="mx-auto flex h-13 w-full max-w-[390px] items-center justify-center gap-3 rounded-[13px] border-input bg-white text-[15px] font-semibold text-foreground shadow-[0_5px_16px_rgba(60,100,115,0.07)] hover:border-ring/50 hover:-translate-y-0.5"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-muted text-[17px] font-bold text-[#4285f4]">
          G
        </span>
        <span>{isRedirecting ? "جارٍ التحويل إلى Google..." : "تسجيل الدخول باستخدام Google"}</span>
      </Button>
      <p className="mt-3.5 text-[11px] text-muted-foreground/80">
        سيتم الانتقال إلى الاستبيان بعد تسجيل الدخول.
      </p>
    </Card>
  );
}
