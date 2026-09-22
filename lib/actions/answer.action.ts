"use server";

import mongoose, { type QueryFilter } from "mongoose";
import action from "../handlers/action";
import handleError from "../handlers/error";
import {
  CreateAnswerSchema,
  DeleteAnswerSchema,
  GetAnswersSchema,
} from "../validations";
import Answer from "@/database/answer.model";
import Question from "@/database/question.model";

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

export async function getAnswers(
  params: GetAnswersParams,
): Promise<ActionResponse<{ answers: Answer[]; isNext: boolean; totalAnswers: number }>> {
  const validatedResult = await action({
    params,
    schema: GetAnswersSchema,
  });

  if (validatedResult instanceof Error) {
    return handleError(validatedResult) as ErrorResponse;
  }

  const { questionId, page = 1, pageSize = 5 } = validatedResult.params!;
  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  try {
    const filterQuery: QueryFilter<typeof Answer> = { question: questionId };

    const totalAnswers = await Answer.countDocuments(filterQuery);

    const answers = await Answer.find(filterQuery)
      .select("content upvotes downvotes author createdAt")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 1 })
      .lean();

    const authorIds = [
      ...new Set(answers.map((answer) => answer.author)),
    ];
    const authorObjectIds = authorIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    const users = authorObjectIds.length
      ? await mongoose.connection
          .getClient()
          .db("DevFlow")
          .collection("user")
          .find({ _id: { $in: authorObjectIds } })
          .project({ name: 1, image: 1 })
          .toArray()
      : [];
    const usersById = new Map(users.map((user) => [String(user._id), user]));

    const answersWithAuthor = answers.map((answer) => {
      const user = usersById.get(String(answer.author));
      return {
        ...answer,
        author: {
          _id: answer.author,
          name: user?.name ?? "Unknown user",
          image: user?.image ?? "",
        },
      };
    });

    const isNext = totalAnswers > skip + answers.length;

    return {
      success: true,
      data: {
        answers: JSON.parse(JSON.stringify(answersWithAuthor)),
        isNext,
        totalAnswers,
      },
    };
  } catch (err) {
    return handleError(err) as ErrorResponse;
  }
}

export async function deleteAnswer(
  params: DeleteAnswerParams,
): Promise<ActionResponse<{ success: boolean }>> {
  const validatedResult = await action({
    params,
    schema: DeleteAnswerSchema,
    authorize: true,
  });

  if (validatedResult instanceof Error) {
    return handleError(validatedResult) as ErrorResponse;
  }

  const { answerId } = validatedResult.params!;
  const userId = validatedResult?.session?.user?.id;

  try {
    const answer = await Answer.findById(answerId);
    if (!answer) {
      throw new Error("Answer not found");
    }
    if (answer.author.toString() !== userId) {
      throw new Error("Unauthorized");
    }

    const questionId = answer.question as unknown as string;
    await Answer.findByIdAndDelete(answerId);
    await Question.findByIdAndUpdate(questionId, { $inc: { answers: -1 } });

    return { success: true, data: { success: true } };
  } catch (err) {
    return handleError(err) as ErrorResponse;
  }
}
