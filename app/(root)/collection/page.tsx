import LocalSearch from "@/components/search/LocalSearch";
import QuestionCard from "@/components/cards/QuestionCard";
import DataRenderer from "@/components/DataRenderer";
import Pagination from "@/components/Pagination";
import ROUTES from "@/constants/routes";
import { EMPTY_COLLECTIONS } from "@/constants/states";
import { getSavedQuestions } from "@/lib/actions/collection.action";

export default async function Collections({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; query?: string }>;
}) {
  const { page = "1", query } = await searchParams;

  const { success, data, error } = await getSavedQuestions({
    page: Number(page) || 1,
    pageSize: 10,
    query,
  });

  const { questions, isNext } = data || {};

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Saved Questions</h1>
      <section className="mt-11">
        <LocalSearch
          route={ROUTES.COLLECTION}
          imgSrc="/icons/search.svg"
          placeholder="Search saved questions..."
          otherClasses="flex-1"
        />
      </section>
      <DataRenderer
        success={success}
        data={questions}
        error={error}
        empty={EMPTY_COLLECTIONS}
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
