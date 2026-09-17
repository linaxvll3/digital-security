"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { DeleteResponseResult } from "@/app/actions/admin";

type DeleteRespondentButtonProps = {
  name: string;
  onDelete: () => Promise<DeleteResponseResult>;
};

export function DeleteRespondentButton({ name, onDelete }: DeleteRespondentButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await onDelete();
      if (!result.ok) {
        window.alert("تعذّر حذف الإجابة. حاول مرة أخرى.");
      }
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`حذف إجابات ${name}`}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 />
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>حذف إجابات {name}؟</AlertDialogTitle>
          <AlertDialogDescription>
            سيتم حذف جميع إجابات هذا الطالب نهائيًا، ولا يمكن التراجع عن هذا الإجراء.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={handleConfirm}
          >
            {isPending ? "جارٍ الحذف..." : "حذف"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
