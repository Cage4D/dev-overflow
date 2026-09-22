"use server";

import Question, { IQuestionDoc } from "@/database/question.model";
import action from "../handlers/action";
import handleError from "../handlers/error";
import {
  AskQuestionSchema,
  EditQuestionSchema,
  GetQuestionSchema,
  GetUserQuestionsSchema,
  IncrementViewsSchema,
  PaginatedSearchParamsSchema,
} from "../validations";
import mongoose, { type QueryFilter } from "mongoose";
import Tag, { ITagDoc } from "@/database/tag.model";
import TagQuestion from "@/database/tag-question.model";

export async function createQuestion(
  params: CreateQuestionParams,
): Promise<ActionResponse<Question>> {
  const validatedResult = await action({
    params,
    schema: AskQuestionSchema,
    authorize: true,
  });

  if (validatedResult instanceof Error) {
    return handleError(validatedResult) as ErrorResponse;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const { title, content, tags } = validatedResult.params!;
  const userId = validatedResult?.session?.user?.id;

  try {
    const [question] = await Question.create(
      [{ title, content, author: userId }],
      {
        session,
      },
    );
    if (!question) {
      throw new Error("Failed to create question");
    }
    const tagIds: mongoose.Types.ObjectId[] = [];
    const tagQuestionDocuments = [];

    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
        { upsert: true, new: true, session },
      );
      tagIds.push(existingTag._id);
      tagQuestionDocuments.push({
        tag: existingTag._id,
        question: question._id,
      });
    }

    await TagQuestion.insertMany(tagQuestionDocuments, { session });
    await Question.findByIdAndUpdate(
      question._id,
      { $push: { tags: { $each: tagIds } } },
      { session },
    );

    await session.commitTransaction();
    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (err) {
    await session.abortTransaction();
    return handleError(err) as ErrorResponse;
  } finally {
    session.endSession();
  }
}

export async function editQuestion(
  params: EditQuestionParams,
): Promise<ActionResponse<IQuestionDoc>> {
  const validatedResult = await action({
    params,
    schema: EditQuestionSchema,
    authorize: true,
  });

  if (validatedResult instanceof Error) {
    return handleError(validatedResult) as ErrorResponse;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const { title, content, tags, questionId } = validatedResult.params!;
  const userId = validatedResult?.session?.user?.id;

  try {
    const question = await Question.findById(questionId).populate("tags");
    if (!question) {
      throw new Error("Question not found");
    }

    if (question.author.toString() !== userId) {
      throw new Error("Unauthorized");
    }

    if (question.title !== title || question.content !== content) {
      question.title = title;
      question.content = content;
      await question.save({ session });
    }

    const populatedTags = question.tags as unknown as ITagDoc[];
    const tagsToAdd = tags.filter(
      (tag) =>
        !populatedTags.some(
          (questionTag) => questionTag.name.toLowerCase() === tag.toLowerCase(),
        ),
    );
    const tagsToRemove = populatedTags.filter(
      (tag) => !tags.includes(tag.name.toLowerCase()),
    );

    const newTagDocuments = [];
    if (tagsToAdd.length > 0) {
      for (const tag of tagsToAdd) {
        const existingTag = await Tag.findOneAndUpdate(
          { name: { $regex: `^${tag}$`, $options: "i" } },
          { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
          { upsert: true, new: true, session },
        );
        if (existingTag) {
          newTagDocuments.push({
            tag: existingTag._id,
            question: questionId,
          });

          question.tags.push(existingTag._id);
        }
      }
    }

    if (tagsToRemove.length > 0) {
      const tagIdsToRemove = tagsToRemove.map((tag) => tag._id);
      await Tag.updateMany(
        { _id: { $in: tagIdsToRemove } },
        { $inc: { questions: -1 } },
        { session },
      );

      await TagQuestion.deleteMany(
        { tag: { $in: tagIdsToRemove }, question: questionId },
        { session },
      );

      question.tags = question.tags.filter(
        (tagId: mongoose.Types.ObjectId) =>
          !tagIdsToRemove.some((removedTagId) => removedTagId.equals(tagId)),
      );
    }

    if (newTagDocuments.length > 0) {
      await TagQuestion.insertMany(newTagDocuments, { session });
    }

    await question.save({ session });
    await session.commitTransaction();

    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (err) {
    await session.abortTransaction();
    return handleError(err) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function getQuestion(
  params: GetQuestionParams,
): Promise<ActionResponse<Question>> {
  const validatedResult = await action({
    params,
    schema: GetQuestionSchema,
  });

  if (validatedResult instanceof Error) {
    return handleError(validatedResult) as ErrorResponse;
  }

  const { questionId } = validatedResult.params!;

  try {
    const question = await Question.findById(questionId).populate("tags");
    if (!question) {
      throw new Error("Question not found");
    }

    const authorId = question.author;
    const user = mongoose.Types.ObjectId.isValid(authorId)
      ? await mongoose.connection
          .getClient()
          .db("DevFlow")
          .collection("user")
          .findOne({ _id: new mongoose.Types.ObjectId(authorId) })
      : null;

    const questionData = JSON.parse(JSON.stringify(question));

    return {
      success: true,
      data: {
        ...questionData,
        author: {
          _id: authorId,
          name: user?.name ?? "Unknown user",
          image: user?.image ?? "",
        },
      },
    };
  } catch (err) {
    return handleError(err) as ErrorResponse;
  }
}

export async function getQuestions(
  params: PaginatedSearchParams,
): Promise<ActionResponse<{ questions: Question[]; isNext: boolean }>> {
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

  const filterQuery: QueryFilter<typeof Question> = {};

  if (filter === "recommended")
    return { success: true, data: { questions: [], isNext: false } };
  if (query) {
    filterQuery.$or = [
      { title: { $regex: new RegExp(query, "i") } },
      { content: { $regex: new RegExp(query, "i") } },
    ];
  }

  let sortCriteria = {};
  switch (filter) {
    case "newest":
      sortCriteria = { createdAt: -1 };
      break;
    case "oldest":
      filterQuery.answers = 0;
      sortCriteria = { createdAt: -1 };
      break;
    case "popular":
      sortCriteria = { upvotes: -1 };
      break;
    default:
      sortCriteria = { createdAt: -1 };
      break;
  }

  try {
    const totalQuestions = await Question.countDocuments(filterQuery);

    const questions = await Question.find(filterQuery)
      .populate("tags", "name")
      .lean()
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);

    const authorIds = [
      ...new Set(questions.map((question) => question.author)),
    ];

    const authorObjectIds = authorIds
      .filter((authorId) => mongoose.Types.ObjectId.isValid(authorId))
      .map((authorId) => new mongoose.Types.ObjectId(authorId));

    const users = await mongoose.connection
      .getClient()
      .db("DevFlow")
      .collection("user")
      .find({ _id: { $in: authorObjectIds } })
      .project({ name: 1, image: 1 })
      .toArray();
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

    const isNext = totalQuestions > skip + questions.length;

    return {
      success: true,
      data: {
        questions: JSON.parse(JSON.stringify(questionsWithAuthors)),
        isNext,
      },
    };
  } catch (err) {
    return handleError(err) as ErrorResponse;
  }
}

export async function incrementViews(params: IncrementViewsParams): Promise<ActionResponse<{ views: number }>> {
  const validationResult = await action({
    params,
    schema: IncrementViewsSchema
  })

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse
  }

  const { questionId } = validationResult.params!;

  try {
    const question = await Question.findById(questionId)
    if (!question) {
      throw new Error("Question not found")
    }
    question.views += 1
    await question.save();

    return {
      success: true,
      data: { views: question.views }
    }
  } catch(err) {
    return handleError(err) as ErrorResponse
  }
}

export async function getHotQuestions(): Promise<ActionResponse<Question[]>> {
  try {
    const questions = await Question.find()
      .sort({ upvotes: -1, views: -1 })
      .limit(5)
      .select("title")
      .lean();
    return { success: true, data: JSON.parse(JSON.stringify(questions)) };
  } catch (err) {
    return handleError(err) as ErrorResponse;
  }
}

export async function getUserQuestions(
  params: GetUserQuestionsParams,
): Promise<ActionResponse<{ questions: Question[]; isNext: boolean }>> {
  const validatedResult = await action({
    params,
    schema: GetUserQuestionsSchema,
  });

  if (validatedResult instanceof Error) {
    return handleError(validatedResult) as ErrorResponse;
  }

  const { userId, page = 1, pageSize = 5 } = validatedResult.params!;
  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  try {
    const filterQuery: QueryFilter<typeof Question> = { author: userId };
    const totalQuestions = await Question.countDocuments(filterQuery);

    const questions = await Question.find(filterQuery)
      .populate("tags", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const authorIds = [...new Set(questions.map((q) => q.author))];
    const user = await mongoose.connection
      .getClient()
      .db("DevFlow")
      .collection("user")
      .findOne({ _id: new mongoose.Types.ObjectId(userId) });

    const questionsWithAuthor = questions.map((question) => ({
      ...question,
      author: {
        _id: userId,
        name: user?.name ?? "Unknown user",
        image: user?.image ?? "",
      },
    }));

    const isNext = totalQuestions > skip + questions.length;
    return {
      success: true,
      data: {
        questions: JSON.parse(JSON.stringify(questionsWithAuthor)),
        isNext,
      },
    };
  } catch (err) {
    return handleError(err) as ErrorResponse;
  }
}

