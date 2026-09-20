import TagCard from "@/components/cards/TagCard";
import DataRenderer from "@/components/DataRenderer";
import LocalSearch from "@/components/search/LocalSearch";
import ROUTES from "@/constants/routes";
import { EMPTY_TAGS } from "@/constants/states";
import { getTags } from "@/lib/actions/tag.action";

export default async function Tags({ searchParams }: RouteParams) {
  const { page, pageSize, query, filter } = await searchParams;
  const { success, error, data } = await getTags({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query,
    filter,
  });

  const { tags } = data || {};
  return (
    <>
      <h1 className="h1-bold text-dark100_light900 text-3xl">Tags</h1>
      <section className="mt-11">
        <LocalSearch
          route={ROUTES.TAGS}
          imgSrc="/icons/search.svg"
          placeholder="Search by tag name..."
          otherClasses="flex-1"
        />
      </section>
      <DataRenderer
        success={success}
        data={tags}
        error={error}
        empty={EMPTY_TAGS}
        render={(tags) => (
          <div className="mt-10 grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tags.map((tag) => (
              <TagCard key={tag._id} {...tag}/>
            ))}
          </div>
        )}
      />
    </>
  );
}