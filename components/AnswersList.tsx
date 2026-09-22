import Preview from "@/components/editor/Preview";
import UserAvatar from "@/components/UserAvatar";
import VoteButtons from "@/components/VoteButtons";
import DeleteAnswerButton from "@/components/DeleteAnswerButton";
import ROUTES from "@/constants/routes";
import { getAnswers } from "@/lib/actions/answer.action";
import { formatNumber, getTimeStamp } from "@/lib/utils";
import { getAuth } from "@/auth";
import { headers } from "next/headers";
import Link from "next/link";

interface AnswersListProps {
  questionId: string;
}

export default async function AnswersList({ questionId }: AnswersListProps) {
  const { success, data } = await getAnswers({
    questionId,
    page: 1,
    pageSize: 10,
  });
  const session = await (await getAuth()).api.getSession({ headers: await headers() });
  const currentUserId = session?.user?.id;

  if (!success) return null;
  const { answers, totalAnswers } = data || { answers: [], totalAnswers: 0 };
  if (!answers || answers.length === 0) return null;

  return (
    <section className="mt-8">
      <h3 className="primary-text-gradient h3-bold w-full px-4 sm:px-0">
        {totalAnswers} {totalAnswers === 1 ? "Answer" : "Answers"}
      </h3>
      <div className="mt-5 flex w-full flex-col gap-7">
        {answers.map((answer) => (
          <article
            key={answer._id}
            className="body-regular background-light900_dark200 light-border rounded-2xl border px-5 py-3 sm:px-10"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex w-full flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
                <div className="flex items-center justify-start gap-1">
                  <UserAvatar
                    id={answer.author._id}
                    name={answer.author.name}
                    className="size-5.5"
                    fallBackClassName="text-[10px]"
                  />
                  <Link
                    href={ROUTES.PROFILE(answer.author._id)}
                    className="flex items-center gap-1"
                  >
                    <p className="paragraph-semibold text-dark300_light700">
                      {answer.author.name}
                    </p>
                  </Link>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <VoteButtons
                    targetType="answer"
                    targetId={answer._id}
                    upvotes={answer.upvotes}
                    downvotes={answer.downvotes}
                  />
                  {currentUserId === answer.author._id && (
                    <DeleteAnswerButton answerId={answer._id} />
                  )}
                </div>
              </div>
            </div>
            <div className="mt-3">
              <Preview content={answer.content} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <p className="flex items-center gap-1.5">
                <span className="text-dark400_light900 subtle-medium">
                  {formatNumber(answer.upvotes - answer.downvotes)} votes
                </span>
              </p>
              <p className="flex items-center gap-1.5 text-dark400_light900 subtle-medium">
                answered on {getTimeStamp(new Date(answer.createdAt))}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
