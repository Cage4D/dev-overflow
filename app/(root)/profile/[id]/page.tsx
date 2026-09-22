import { getUser } from "@/lib/actions/user.action";
import UserAvatar from "@/components/UserAvatar";
import QuestionCard from "@/components/cards/QuestionCard";
import DataRenderer from "@/components/DataRenderer";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAuth } from "@/auth";
import { headers } from "next/headers";
import { formatNumber } from "@/lib/utils";
import { getUserQuestions } from "@/lib/actions/question.action";
import { getUserAnswers } from "@/lib/actions/answer.action";
import { EMPTY_QUESTION } from "@/constants/states";
import ROUTES from "@/constants/routes";
import { redirect } from "next/navigation";

export default async function Profile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await (await getAuth()).api.getSession({ headers: await headers() });
  const currentUserId = session?.user?.id;

  if (id === "undefined" || id === "null" || !id) redirect("/");

  const { success, data: user } = await getUser({ userId: id });
  if (!success || !user) notFound();

  const questionsResult = await getUserQuestions({ userId: id, page: 1, pageSize: 5 });
  const answersResult = await getUserAnswers({ userId: id, page: 1, pageSize: 5 });

  const { questions } = questionsResult.data || {};
  const { answers } = answersResult.data || {};

  return (
    <>
      <div className="flex flex-col-reverse items-start justify-between sm:flex-row sm:items-center">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
          <UserAvatar
            id={user._id}
            name={user.name}
            imageUrl={user.image}
            className="size-24"
            fallBackClassName="text-[24px]"
          />
          <div className="flex flex-col gap-1">
            <h1 className="h2-bold text-dark300_light900">{user.name}</h1>
            <p className="paragraph-regular text-dark400_light700">
              @{user.username}
            </p>
            {user.bio && (
              <p className="paragraph-medium text-dark400_light700 mt-1 max-w-150">
                {user.bio}
              </p>
            )}
            {user.portfolio && (
              <Link
                href={user.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 flex items-center gap-1"
              >
                <Image
                  src="/icons/arrow-up-right.svg"
                  alt="portfolio"
                  width={14}
                  height={14}
                  className="dark:invert"
                />
                <span className="paragraph-regular text-primary-500 hover:underline">
                  {user.portfolio.replace(/^https?:\/\//, "")}
                </span>
              </Link>
            )}
          </div>
        </div>

        {currentUserId === id && (
          <Link
            href={ROUTES.EDIT_PROFILE}
            className="primary-gradient min-h-9 rounded-lg px-4 py-2 text-sm font-semibold text-light-900"
          >
            Edit Profile
          </Link>
        )}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Questions", value: user.questions },
          { label: "Answers", value: user.answers },
          { label: "Saved", value: user.saves },
        ].map((stat) => (
          <div
            key={stat.label}
            className="background-light900_dark200 light-border flex flex-col items-center justify-center rounded-xl border p-4"
          >
            <p className="h3-bold text-dark200_light900">
              {formatNumber(stat.value)}
            </p>
            <p className="paragraph-regular text-dark400_light700">{stat.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <h3 className="h3-bold text-dark200_light900 mb-5">Questions Asked</h3>
        <DataRenderer
          success={questionsResult.success}
          data={questions}
          error={questionsResult.error}
          empty={EMPTY_QUESTION}
          render={(questions) => (
            <div className="flex w-full flex-col gap-6">
              {questions.map((question) => (
                <QuestionCard key={question._id} question={question} />
              ))}
            </div>
          )}
        />
      </section>

      <section className="mt-10">
        <h3 className="h3-bold text-dark200_light900 mb-5">Answers</h3>
        <DataRenderer
          success={answersResult.success}
          data={answers}
          error={answersResult.error}
          empty={{
            title: "No Answers Yet",
            message: "This user hasn't answered anything yet.",
          }}
          render={(answers) => (
            <div className="flex w-full flex-col gap-6">
              {answers.map((answer) => (
                <Link
                  key={answer._id}
                  href={ROUTES.QUESTION(answer.questionId)}
                  className="background-light900_dark200 light-border block rounded-2xl border p-5"
                >
                  <p className="paragraph-medium line-clamp-3 text-dark300_light700">
                    {answer.content}
                  </p>
                  <p className="small-regular text-light400_dark500 mt-3">
                    {formatNumber(answer.upvotes - answer.downvotes)} votes
                  </p>
                </Link>
              ))}
            </div>
          )}
        />
      </section>
    </>
  );
}
