import LocalSearch from "@/components/search/LocalSearch";
import DataRenderer from "@/components/DataRenderer";
import Pagination from "@/components/Pagination";
import UserCard from "@/components/cards/UserCard";
import ROUTES from "@/constants/routes";
import { DEFAULT_EMPTY } from "@/constants/states";
import { getUsers } from "@/lib/actions/user.action";
import { EMPTY_USER } from "@/constants/states";

export default async function Community({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; query?: string }>;
}) {
  const { page = "1", query } = await searchParams;

  const { success, data, error } = await getUsers({
    page: Number(page) || 1,
    pageSize: 12,
    query,
  });

  const { users, isNext } = data || {};

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">All Users</h1>
      <section className="mt-11">
        <LocalSearch
          route={ROUTES.COMMUNITY}
          imgSrc="/icons/search.svg"
          placeholder="Search for amazing minds..."
          otherClasses="flex-1"
        />
      </section>
      <DataRenderer
        success={success}
        data={users}
        error={error}
        empty={EMPTY_USER}
        render={(users) => (
          <div className="mt-12 flex flex-wrap gap-4">
            {users.map((user) => (
              <UserCard
                key={user._id}
                _id={user._id}
                name={user.name}
                username={user.username}
                image={user.image}
              />
            ))}
          </div>
        )}
      />
      <Pagination
        page={Number(page) || 1}
        isNext={!!isNext}
        totalPages={Math.max(1, Math.ceil((users?.length || 1) / 12))}
      />
    </>
  );
}
