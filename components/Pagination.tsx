"use client"

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formUrlQuery } from "@/lib/url";
import Image from "next/image";

interface PaginationProps {
  page: number;
  isNext: boolean;
  totalPages: number;
}

export default function Pagination({ page, isNext, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleNavigation = (type: "prev" | "next") => {
    const nextPageNumber = type === "prev" ? page - 1 : page + 1;
    if (nextPageNumber < 1 || nextPageNumber > totalPages) return;
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "page",
      value: nextPageNumber.toString(),
    });
    router.push(newUrl, { scroll: false });
  };

  if (!isNext && page === 1) return null;

  return (
    <div className="flex items-center justify-center gap-3.5 mt-10">
      <Button
        disabled={page <= 1}
        onClick={() => handleNavigation("prev")}
        className="small-medium light-border-2 background-light800_dark400 flex min-h-9 items-center justify-center gap-1 rounded-lg border px-3.5 py-2 text-dark300_light900"
      >
        <Image src="/icons/arrow-left.svg" alt="arrow left" width={14} height={14} />
        <p className="line-clamp-1">Prev</p>
      </Button>
      <div className="flex items-center justify-center rounded-md bg-primary-500 px-3.5 py-2 text-light-900">
        <p className="small-medium">{page}/{totalPages}</p>
      </div>
      <Button
        disabled={!isNext}
        onClick={() => handleNavigation("next")}
        className="small-medium light-border-2 background-light800_dark400 flex min-h-9 items-center justify-center gap-1 rounded-lg border px-3.5 py-2 text-dark300_light900"
      >
        <p className="line-clamp-1">Next</p>
        <Image src="/icons/arrow-right.svg" alt="arrow right" width={14} height={14} />
      </Button>
    </div>
  );
}
