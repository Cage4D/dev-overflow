"use client"

import { useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { toggleVote } from "@/lib/actions/vote.action";

interface VoteButtonsProps {
  targetType: "question" | "answer";
  targetId: string;
  upvotes: number;
  downvotes: number;
  hasUpvoted?: boolean;
  hasDownvoted?: boolean;
}

export default function VoteButtons({
  targetType,
  targetId,
  upvotes,
  downvotes,
  hasUpvoted = false,
  hasDownvoted = false,
}: VoteButtonsProps) {
  const [isPending, startTransition] = useTransition();

  const handleVote = (voteType: "upvote" | "downvote") => {
    if (isPending) return;
    startTransition(async () => {
      const result = await toggleVote({ targetId, targetType, voteType });
      if (result.success) {
        toast.success(voteType === "upvote" ? "Upvoted" : "Downvoted");
      } else {
        toast.error(result.error?.message || "Something went wrong");
      }
    });
  };

  return (
    <div className="flex-center gap-2.5">
      <div className="flex-center flex-col gap-2.5">
        <Button
          onClick={() => handleVote("upvote")}
          disabled={isPending}
          aria-label="Upvote"
          className={`${hasUpvoted ? "bg-primary-100 dark:bg-dark-400" : ""} bg-transparent! p-0`}
        >
          <Image
            src={hasUpvoted ? "/icons/upvoted.svg" : "/icons/upvote.svg"}
            alt="upvote"
            width={18}
            height={18}
            className="invert-0 dark:invert cursor-pointer"
          />
        </Button>
        <div className="flex-center background-light700_dark400 min-w-5 rounded-sm px-1.5 py-1">
          <p className="subtle-medium text-dark400_light900">
            {upvotes - downvotes}
          </p>
        </div>
        <Button
          onClick={() => handleVote("downvote")}
          disabled={isPending}
          aria-label="Downvote"
          className={`${hasDownvoted ? "bg-primary-100 dark:bg-dark-400" : ""} bg-transparent! p-0`}
        >
          <Image
            src={hasDownvoted ? "/icons/downvoted.svg" : "/icons/downvote.svg"}
            alt="downvote"
            width={18}
            height={18}
            className="invert-0 dark:invert cursor-pointer"
          />
        </Button>
      </div>
    </div>
  );
}
