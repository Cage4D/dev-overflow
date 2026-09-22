"use client"

import { useTransition, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  saveQuestion,
  removeSavedQuestion,
} from "@/lib/actions/collection.action";

interface SaveButtonProps {
  questionId: string;
  isSaved?: boolean;
}

export default function SaveButton({ questionId, isSaved = false }: SaveButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(isSaved);

  const handleSave = () => {
    if (isPending) return;
    startTransition(async () => {
      const result = saved
        ? await removeSavedQuestion({ questionId })
        : await saveQuestion({ questionId });
      if (result.success) {
        setSaved(result.data?.saved ?? !saved);
        toast.success(result.data?.saved ? "Saved to collection" : "Removed from collection");
      } else {
        toast.error(result.error?.message || "Something went wrong");
      }
    });
  };

  return (
    <Button
      onClick={handleSave}
      disabled={isPending}
      aria-label="Save question"
      className="bg-transparent! p-0"
    >
      <Image
        src={saved ? "/icons/star-filled.svg" : "/icons/star.svg"}
        alt="save"
        width={18}
        height={18}
        className="invert-0 dark:invert cursor-pointer"
      />
    </Button>
  );
}
