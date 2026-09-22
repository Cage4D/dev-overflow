"use server";

import mongoose from "mongoose";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { SaveQuestionSchema, PaginatedSearchParamsSchema } from "../validations";
import Collection from "@/database/collection.model";
import Question from "@/database/question.model";

export async function saveQuestion(
  params: SaveQuestionParams,
): Promise<ActionResponse<{ saved: boolean }>> {
  const validatedResult = await action({
    params,
    schema: SaveQuestionSchema,
    authorize: true,
  });

  if (validatedResult instanceof Error) {
    return handleError(validatedResult) as ErrorResponse;
  }

  const { questionId } = validatedResult.params!;
  const userId = validatedResult?.session?.user?.id;

  try {
    await Collection.create({ author: userId, question: questionId });
    return { success: true, data: { saved: true } };
  } catch (err) {
    return handleError(err) as ErrorResponse;
  }
}

export async function removeSavedQuestion(
  params: SaveQuestionParams,
): Promise<ActionResponse<{ saved: boolean }>> {
  const validatedResult = await action({
    params,
    schema: SaveQuestionSchema,
    authorize: true,
  });

  if (validatedResult instanceof Error) {
    return handleError(validatedResult) as ErrorResponse;
  }

  const { questionId } = validatedResult.params!;
  const userId = validatedResult?.session?.user?.id;

  try {
    await Collection.findOneAndDelete({
      author: userId,
      question: questionId,
    });
    return { success: true, data: { saved: false } };
  } catch (err) {
    return handleError(err) as ErrorResponse;
  }
}

export async function getSavedQuestions(
  params: PaginatedSearchParams,
): Promise<ActionResponse<{ questions: Question[]; isNext: boolean; saved: boolean[] }>> {
  const validatedResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
    authorize: true,
  });

  if (validatedResult instanceof Error) {
    return handleError(validatedResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query } = validatedResult.params!;
  const userId = validatedResult?.session?.user?.id;

  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  try {
    const filterQuery: { author?: string; question?: { $in: mongoose.Types.ObjectId[] } } = { author: userId };

    const collectionEntries = await Collection.find({ author: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const questionIds = collectionEntries.map((entry) => entry.question);

    if (query) {
      const matchedQuestions = await Question.find({
        _id: { $in: questionIds },
        $or: [
          { title: { $regex: new RegExp(query, "i") } },
          { content: { $regex: new RegExp(query, "i") } },
        ],
      })
        .select("_id")
        .lean();
      const matchedIds = matchedQuestions.map((q) => q._id);
      filterQuery.question = { $in: matchedIds };
    }

    const questions = await Question.find(
      filterQuery.question ? filterQuery : { _id: { $in: questionIds } },
    )
      .populate("tags", "name")
      .lean();

    const authorIds = [
      ...new Set(questions.map((question) => question.author)),
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

    const questionsWithAuthors = questions.map((question) => {
      const user = usersById.get(String(question.author));
      return {
        ...question,
        author: {
          _id: question.author,
          name: user?.name ?? "Unknown user",
          image: user?.image ?? "",
        },
      };
    });

    const saved = collectionEntries.map(() => true);
    const isNext = questionsWithAuthors.length === limit;

    return {
      success: true,
      data: {
        questions: JSON.parse(JSON.stringify(questionsWithAuthors)),
        isNext,
        saved,
      },
    };
  } catch (err) {
    return handleError(err) as ErrorResponse;
  }
}
