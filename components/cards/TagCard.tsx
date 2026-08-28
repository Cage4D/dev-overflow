import ROUTES from "@/constants/routes";
import Link from "next/link";
import Image from "next/image";
import type { MouseEvent } from "react";
import { Badge } from "../ui/badge";
import { getDeviconClassName } from "@/lib/utils";

interface Props {
  _id: string;
  name: string;
  questions?: number;
  showCount?: boolean;
  compact?: boolean;
  remove?: boolean;
  isButton?: boolean;
  handleRemove?: () => void;
}

export default function TagCard({
  _id,
  name,
  questions,
  showCount,
  compact,
  remove,
  isButton,
  handleRemove,
}: Props) {
  const iconClass = getDeviconClassName(name);
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
  }
  const content = (
    <>
      <Badge className="subtle-medium background-light800_dark300 text-light400_dark500 rounded-md border-none px-4 py-3 uppercase flex flex-row gap-2">
        <div className="flex-center space-x-2">
          <i className={`${iconClass} text-sm`}></i>
          <span>{name}</span>
        </div>
        {remove && (
          <Image
            src="/icons/close.svg"
            width={12}
            height={12}
            alt="close icon"
            className="cursor-pointer object-contain invert-0 dark:invert"
            onClick={handleRemove}
          />
        )}
      </Badge>
      {showCount && (
        <p className="small-medium text-dark500_light700">{questions}</p>
      )}
    </>
  );

  if (compact) {
    return isButton ? (
      <button onClick={handleClick} className="flex justify-between gap-2">{content}</button>
    ) : (
      <Link href={ROUTES.TAGS(_id)} className="flex justify-between gap-2">
        {content}
      </Link>
    );
  }

  return (
    <Link href={ROUTES.TAGS(_id)} className="shadow-light100_darknone">
      <article className="background-light900_dark200 light-border flex w-full flex-col rounded-2xl border px-8 py-10 sm:w-[260px]">
        <div className="flex items-center justify-between gap-3">
          <div className="background-light800_dark400 w-fit rounded-sm px-5 py-1.5">
            <p className="paragraph-semibold text-dark300_light900">{name}</p>
          </div>
          <i className={`${iconClass} text-2xl`}></i>
        </div>
        <p className="small-regular text-dark500_light700 mt-5 line-clamp-3 w-full">
          {name} related questions and discussions
        </p>
        {showCount && (
          <p className="small-medium text-dark400_light500 mt-3.5">
            <span className="body-semibold primary-text-gradient mr-2.5">{questions}+</span>
            Questions
          </p>
        )}
      </article>
    </Link>
  );
}