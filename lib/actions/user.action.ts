"use server";

import mongoose from "mongoose";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { EditProfileSchema, GetUserIdParamsSchema, PaginatedSearchParamsSchema } from "../validations";
import Question from "@/database/question.model";
import Answer from "@/database/answer.model";
import Collection from "@/database/collection.model";

const userCollection = () =>
  mongoose.connection.getClient().db("DevFlow").collection("user");

export async function getUser(
  params: UserIdParams,
): Promise<ActionResponse<UserWithStats>> {
  const validatedResult = await action({
    params,
    schema: GetUserIdParamsSchema,
  });

  if (validatedResult instanceof Error) {
    return handleError(validatedResult) as ErrorResponse;
  }

  const { userId } = validatedResult.params!;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("User not found");
    }

    const user = await userCollection().findOne({
      _id: new mongoose.Types.ObjectId(userId),
    });
    if (!user) {
      throw new Error("User not found");
    }

    const [questions, answers, saves] = await Promise.all([
      Question.countDocuments({ author: userId }),
      Answer.countDocuments({ author: userId }),
      Collection.countDocuments({ author: userId }),
    ]);

    return {
      success: true,
      data: {
        _id: String(user._id),
        name: user.name ?? "",
        username: user.username ?? "",
        email: user.email ?? "",
        image: user.image,
        bio: user.bio,
        portfolio: user.portfolio,
        questions,
        answers,
        saves,
      },
    };
  } catch (err) {
    return handleError(err) as ErrorResponse;
  }
}

export async function editProfile(
  params: EditProfileParams,
): Promise<ActionResponse<UserWithStats>> {
  const validatedResult = await action({
    params,
    schema: EditProfileSchema,
    authorize: true,
  });

  if (validatedResult instanceof Error) {
    return handleError(validatedResult) as ErrorResponse;
  }

  const currentUserId = validatedResult?.session?.user?.id as string;
  const { userId } = validatedResult.params!;

  try {
    if (!currentUserId || currentUserId !== userId) {
      return handleError(new Error("Unauthorized")) as ErrorResponse;
    }

    const { name, username, bio, image, portfolio } = validatedResult.params!;
    const allowUpdates = {
      name,
      username,
      ...(bio !== undefined ? { bio } : {}),
      ...(image !== undefined ? { image } : {}),
      ...(portfolio !== undefined ? { portfolio } : {}),
    };

    const user = await userCollection().findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: allowUpdates },
      { returnDocument: "after" },
    );

    if (!user) {
      throw new Error("User not found");
    }

    const [questions, answers, saves] = await Promise.all([
      Question.countDocuments({ author: userId }),
      Answer.countDocuments({ author: userId }),
      Collection.countDocuments({ author: userId }),
    ]);

    return {
      success: true,
      data: {
        _id: userId,
        name: user.name ?? "",
        username: user.username ?? "",
        email: user.email ?? "",
        image: user.image,
        bio: user.bio,
        portfolio: user.portfolio,
        questions,
        answers,
        saves,
      },
    };
  } catch (err) {
    return handleError(err) as ErrorResponse;
  }
}

export async function getUsers(
  params: PaginatedSearchParams,
): Promise<
  ActionResponse<{ users: UserWithStats[]; isNext: boolean }>
> {
  const validatedResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
  });

  if (validatedResult instanceof Error) {
    return handleError(validatedResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query } = params;
  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);
  const searchFilter = query
    ? {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { username: { $regex: query, $options: "i" } },
        ],
      }
    : {};

  try {
    const totalUsers = await userCollection().countDocuments(searchFilter);
    const users = await userCollection()
      .find(searchFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const userIds = users.map((user) => String(user._id));

    const [questionCounts, answerCounts, saveCounts] = await Promise.all([
      Question.aggregate([
        { $match: { author: { $in: userIds } } },
        { $group: { _id: "$author", count: { $sum: 1 } } },
      ]),
      Answer.aggregate([
        { $match: { author: { $in: userIds } } },
        { $group: { _id: "$author", count: { $sum: 1 } } },
      ]),
      Collection.aggregate([
        { $match: { author: { $in: userIds } } },
        { $group: { _id: "$author", count: { $sum: 1 } } },
      ]),
    ]);

    const countMap = (rows: { _id: string; count: number }[]) => {
      const map = new Map<string, number>();
      rows.forEach((row) => map.set(String(row._id), row.count));
      return map;
    };
    const qMap = countMap(questionCounts);
    const aMap = countMap(answerCounts);
    const sMap = countMap(saveCounts);

    const usersWithStats = users.map((user) => ({
      _id: String(user._id),
      name: user.name ?? "",
      username: user.username ?? "",
      email: user.email ?? "",
      image: user.image,
      bio: user.bio,
      portfolio: user.portfolio,
      questions: qMap.get(String(user._id)) ?? 0,
      answers: aMap.get(String(user._id)) ?? 0,
      saves: sMap.get(String(user._id)) ?? 0,
    }));

    const isNext = totalUsers > skip + users.length;

    return {
      success: true,
      data: { users: usersWithStats, isNext },
    };
  } catch (err) {
    return handleError(err) as ErrorResponse;
  }
}
