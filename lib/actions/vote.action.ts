"use server";

import action from "../handlers/action";
import handleError from "../handlers/error";
import { ToggleVoteSchema, HasVotedSchema } from "../validations";
import Answer from "@/database/answer.model";
import Question from "@/database/question.model";
import Vote from "@/database/vote.model";

export async function toggleVote(
  params: ToggleVoteParams,
): Promise<ActionResponse<VoteResponse>> {
  const validatedResult = await action({
    params,
    schema: ToggleVoteSchema,
    authorize: true,
  });

  if (validatedResult instanceof Error) {
    return handleError(validatedResult) as ErrorResponse;
  }

  const { targetId, targetType, voteType } = validatedResult.params!;
  const userId = validatedResult?.session?.user?.id;

  const targetModel = targetType === "question" ? Question : Answer;
  const countField = voteType === "upvote" ? "upvotes" : "downvotes";
  const oppositeField = voteType === "upvote" ? "downvotes" : "upvotes";

  try {
    const existingVote = await Vote.findOne({
      author: userId,
      id: targetId,
      type: targetType,
    }).lean();

    let update: Record<string, unknown> = {};

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        await Vote.findByIdAndDelete(existingVote._id);
        update = { $inc: { [countField]: -1 } };
      } else {
        await Vote.findByIdAndUpdate(existingVote._id, { voteType });
        update = { $inc: { [countField]: 1, [oppositeField]: -1 } };
      }
    } else {
      await Vote.create({
        author: userId,
        id: targetId,
        type: targetType,
        voteType,
      });
      update = { $inc: { [countField]: 1 } };
    }

    const updatedTarget = await targetModel.findByIdAndUpdate(
      targetId,
      update,
      { new: true },
    );

    const hasUpvoted =
      existingVote && existingVote.voteType === voteType
        ? false
        : voteType === "upvote";
    const hasDownvoted =
      existingVote && existingVote.voteType === voteType
        ? false
        : voteType === "downvote";

    return {
      success: true,
      data: {
        upvotes: updatedTarget?.upvotes ?? 0,
        downvotes: updatedTarget?.downvotes ?? 0,
        hasUpvoted,
        hasDownvoted,
      },
    };
  } catch (err) {
    return handleError(err) as ErrorResponse;
  }
}

export async function hasVoted(
  params: HasVotedParams,
): Promise<ActionResponse<VoteResponse>> {
  const validatedResult = await action({
    params,
    schema: HasVotedSchema,
    authorize: true,
  });

  if (validatedResult instanceof Error) {
    return handleError(validatedResult) as ErrorResponse;
  }

  const { targetId, targetType } = validatedResult.params!;
  const userId = validatedResult?.session?.user?.id;

  try {
    const existingVote = await Vote.findOne({
      author: userId,
      id: targetId,
      type: targetType,
    }).lean();

    return {
      success: true,
      data: {
        upvotes: 0,
        downvotes: 0,
        hasUpvoted: existingVote?.voteType === "upvote",
        hasDownvoted: existingVote?.voteType === "downvote",
      },
    };
  } catch (err) {
    return handleError(err) as ErrorResponse;
  }
}
