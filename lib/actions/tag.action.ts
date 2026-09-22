"use server";

import action from "../handlers/action";
import {
  GetTagQuestionsSchema,
  PaginatedSearchParamsSchema,
} from "../validations";
import handleError from "../handlers/error";
import Tag from "@/database/tag.model";
import mongoose, { type QueryFilter } from "mongoose";
import Question from "@/database/question.model";

export async function getTags(
  params: PaginatedSearchParams,
): Promise<ActionResponse<{ tags: Tag[]; isNext: boolean }>> {
  const validatedResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
  });

  if (validatedResult instanceof Error) {
    return handleError(validatedResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query, filter } = params;
  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  const filterQuery: QueryFilter<typeof Tag> = {};
  if (query) {
    filterQuery.$or = [{ name: { $regex: query, $options: "i" } }];
  }

  let sortCriteria = {};
  switch (filter) {
    case "popular":
      sortCriteria = { questions: -1 };
      break;
    case "recent":
      sortCriteria = { createdAt: -1 };
      break;
    case "oldest":
      sortCriteria = { createdAt: 1 };
      break;
    case "name":
      sortCriteria = { name: 1 };
    default:
      sortCriteria = { questions: -1 };
      break;
  }

  try {
    const totalTags = await Tag.countDocuments(filterQuery);
    const tags = await Tag.find(filterQuery)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);

    const isNext = totalTags > skip + tags.length;
    return {
      success: true,
      data: {
        tags: JSON.parse(JSON.stringify(tags)),
        isNext,
      },
    };
  } catch (err) {
    return handleError(err) as ErrorResponse;
  }
}

export async function getTagQuestions(
  params: GetTagQuestionsParams,
): Promise<
  ActionResponse<{ tag: Tag; questions: Question[]; isNext: boolean }>
> {
  const validatedResult = await action({
    params,
    schema: GetTagQuestionsSchema,
  });

  if (validatedResult instanceof Error) {
    return handleError(validatedResult) as ErrorResponse;
  }

  const { tagId, page = 1, pageSize = 10, query } = params;
  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  try {
    const tag = await Tag.findById(tagId);
    if (!tag) throw new Error("Tag not found");
    const filterQuery: QueryFilter<typeof Question> = {
      tags: { $in: [tagId]}
    };
    if (query) {
      filterQuery.title = { $regex: query, $options: "i" };
    }
    const totalQuestions = await Question.countDocuments(filterQuery);
    const questions = await Question.find(filterQuery)
      .select("_id title view answers upvotes downvotes author createdAt")
      .populate([
        { path: "author", select: "name image" },
        { path: "tags", select: "name" }
      ])
      .skip(skip)
      .limit(limit);

    const isNext = totalQuestions > skip + questions.length;
    return {
      success: true,
      data: {
        tag: JSON.parse(JSON.stringify(tag)),
        questions: JSON.parse(JSON.stringify(questions)),
        isNext,
      },
    };
  } catch (err) {
    return handleError(err) as ErrorResponse;
  }
}

export async function getTopTags(): Promise<ActionResponse<Tag[]>> {
  try {
    const tags = await Tag.find()
      .sort({ questions: -1 })
      .limit(5)
      .lean();
    return { success: true, data: JSON.parse(JSON.stringify(tags)) };
  } catch (err) {
    return handleError(err) as ErrorResponse;
  }
}
