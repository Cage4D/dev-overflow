"use server";

import Question from "@/database/question.model";
import action from "../handlers/action";
import handleError from "../handlers/error";
import {
  AskQuestionSchema,
  EditQuestionSchema,
  GetQuestionSchema,
} from "../validations";
import mongoose from "mongoose";
import { auth } from "@/auth";
import { headers } from "next/headers";
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
): Promise<ActionResponse<Question>> {
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
      for (const tag of tags) {
        const existingTag = await Tag.findOneAndUpdate(
          { name: { $regex: new RegExp(`^${tag}$`, "i") } },
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
    authorize: true,
  });

  if (validatedResult instanceof Error) {
    return handleError(validatedResult) as ErrorResponse;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const { questionId } = validatedResult.params!;
  try {
    const question = await Question.findById(questionId).populate("tags");
    if (!question) {
      throw new Error("Question not found");
    }
    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (err) {
    return handleError(err) as ErrorResponse;
  }
}
