import LocalSearch from "@/components/search/LocalSearch";
import QuestionCard from "@/components/cards/QuestionCard";
import DataRenderer from "@/components/DataRenderer";
import Pagination from "@/components/Pagination";
import ROUTES from "@/constants/routes";
import { EMPTY_QUESTION } from "@/constants/states";
import { getTagQuestions } from "@/lib/actions/tag.action";
import { notFound } from "next/navigation";

export default async function TagDetails({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; query?: string }>;
}) {
  const { id } = await params;
  const { page = "1", query } = await searchParams;

  const { success, data, error } = await getTagQuestions({
    tagId: id,
    page: Number(page) || 1,
    pageSize: 10,
    query,
  });

  const { tag, questions, isNext } = data || {};

  if (!tag) notFound();

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">
        <span className="text-light-500">Tag:</span>{" "}
        <span className="primary-text-gradient">{tag?.name}</span>
      </h1>
      <section className="mt-11">
        <LocalSearch
          route={ROUTES.TAG(id)}
          imgSrc="/icons/search.svg"
          placeholder="Search questions in this tag..."
          otherClasses="flex-1"
        />
      </section>
      <DataRenderer
        success={success}
        data={questions}
        error={error}
        empty={EMPTY_QUESTION}
        render={(questions) => (
          <div className="mt-10 flex w-full flex-col gap-6">
            {questions.map((question) => (
              <QuestionCard key={question._id} question={question} />
            ))}
          </div>
        )}
      />
      <Pagination
        page={Number(page) || 1}
        isNext={!!isNext}
        totalPages={Math.max(1, Math.ceil((questions?.length || 1) / 10))}
      />
    </>
  );
}
