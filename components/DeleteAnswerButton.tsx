"use client"

import { useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteAnswer } from "@/lib/actions/answer.action";

interface DeleteAnswerButtonProps {
  answerId: string;
  onDeleted?: () => void;
}

export default function DeleteAnswerButton({ answerId, onDeleted }: DeleteAnswerButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (isPending) return;
    startTransition(async () => {
      const result = await deleteAnswer({ answerId });
      if (result.success) {
        toast.success("Answer deleted");
        onDeleted?.();
      } else {
        toast.error(result.error?.message || "Something went wrong");
      }
    });
  };

  return (
    <Button
      onClick={handleDelete}
      disabled={isPending}
      aria-label="Delete answer"
      className="bg-transparent! p-0"
    >
      <Image
        src="/icons/trash.svg"
        alt="Delete"
        width={16}
        height={16}
        className="invert-0 dark:invert cursor-pointer"
      />
    </Button>
  );
}
