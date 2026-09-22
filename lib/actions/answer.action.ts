"use server";

import action from "../handlers/action";
import handleError from "../handlers/error";
import { CreateAnswerSchema } from "../validations";
import Answer from "@/database/answer.model";
import Question from "@/database/question.model";
import mongoose from "mongoose";

export async function createAnswer(
  params: CreateAnswerParams,
): Promise<ActionResponse<Answer>> {
  const validatedResult = await action({
    params,
    schema: CreateAnswerSchema,
    authorize: true,
  });

  if (validatedResult instanceof Error) {
    return handleError(validatedResult) as ErrorResponse;
  }

  const { questionId, content } = validatedResult.params!;
  const userId = validatedResult.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const question = await Question.findById(questionId).session(session);
    if (!question) {
      throw new Error("Question not found");
    }

    const [answer] = await Answer.create(
      [{ author: userId, question: questionId, content }],
      { session },
    );
    if (!answer) {
      throw new Error("Failed to create answer");
    }

    await Question.findByIdAndUpdate(
      questionId,
      { $inc: { answers: 1 } },
      { session },
    );

    await session.commitTransaction();

    const answerData = JSON.parse(JSON.stringify(answer));
    return { success: true, data: { ...answerData, author: { _id: userId } } };
  } catch (err) {
    await session.abortTransaction();
    return handleError(err) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}