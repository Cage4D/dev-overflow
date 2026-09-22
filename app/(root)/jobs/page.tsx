import Image from "next/image";
import ROUTES from "@/constants/routes";
import { Suspense } from "react";
import LocalSearch from "@/components/search/LocalSearch";

export default function FindJobs() {
  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Find Jobs</h1>
      <section className="mt-11">
        <Suspense fallback={null}>
          <LocalSearch
            route={ROUTES.JOBS}
            imgSrc="/icons/search.svg"
            placeholder="Search for remote friendly jobs..."
            otherClasses="flex-1"
          />
        </Suspense>
      </section>

      <section className="background-light900_dark200 light-border mt-10 flex flex-col items-center gap-6 rounded-2xl border p-12 text-center">
        <Image
          src="/icons/job-search.svg"
          alt="jobs illustration"
          width={72}
          height={72}
          className="invert-0 dark:invert"
        />
        <h2 className="h2-semibold text-dark200_light900">
          No Jobs Posted Yet
        </h2>
        <p className="body-regular text-dark400_light700 max-w-md">
          We are working on bringing remote-friendly job listings to our
          community. Check back soon to discover your next opportunity.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <div className="background-light900_dark200 light-border flex items-start gap-4 rounded-2xl border p-6">
          <div className="flex-center background-light800_dark400 size-12 shrink-0 rounded-lg">
            <Image
              src="/icons/suitcase.svg"
              alt="company"
              width={24}
              height={24}
              className="invert-0 dark:invert"
            />
          </div>
          <div>
            <h3 className="paragraph-semibold text-dark300_light700">
              Why job listings?
            </h3>
            <p className="small-medium text-dark400_light700 mt-1">
              Soon, hiring partners will list positions here, along with salary,
              location, and application links tailored to the DevFlow community.
            </p>
          </div>
        </div>

        <div className="background-light900_dark200 light-border flex items-start gap-4 rounded-2xl border p-6">
          <div className="flex-center background-light800_dark400 size-12 shrink-0 rounded-lg">
            <Image
              src="/icons/location.svg"
              alt="location"
              width={24}
              height={24}
              className="invert-0 dark:invert"
            />
          </div>
          <div>
            <h3 className="paragraph-semibold text-dark300_light700">
              Remote-first
            </h3>
            <p className="small-medium text-dark400_light700 mt-1">
              We focus on remote and flexible roles so the best talent can work
              from anywhere in the world.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
