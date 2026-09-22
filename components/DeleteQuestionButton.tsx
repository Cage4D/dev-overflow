"use client"

import { useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteQuestion } from "@/lib/actions/question.action";
import { useRouter } from "next/navigation";
import ROUTES from "@/constants/routes";

interface DeleteQuestionButtonProps {
  questionId: string;
}

export default function DeleteQuestionButton({ questionId }: DeleteQuestionButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (isPending) return;
    startTransition(async () => {
      const result = await deleteQuestion({ questionId });
      if (result.success) {
        toast.success("Question deleted");
        router.push(ROUTES.HOME);
      } else {
        toast.error(result.error?.message || "Something went wrong");
      }
    });
  };

  return (
    <Button
      onClick={handleDelete}
      disabled={isPending}
      aria-label="Delete question"
      className="flex items-center gap-1 bg-transparent! p-0"
    >
      <Image
        src="/icons/trash.svg"
        alt="Delete"
        width={16}
        height={16}
        className="invert-0 dark:invert"
      />
    </Button>
  );
}
