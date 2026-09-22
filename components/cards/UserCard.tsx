import ROUTES from "@/constants/routes";
import UserAvatar from "@/components/UserAvatar";
import Link from "next/link";

interface UserCardProps {
  _id: string;
  name: string;
  username: string;
  image?: string;
}

export default function UserCard({ _id, name, username, image }: UserCardProps) {
  return (
    <Link href={ROUTES.PROFILE(_id)} className="shadow-light100_darknone">
      <article className="background-light900_dark200 light-border flex w-full flex-col items-center justify-center rounded-2xl border px-5 py-8 sm:w-65">
        <UserAvatar
          id={_id}
          name={name}
          imageUrl={image}
          className="size-16"
          fallBackClassName="text-[12px]"
        />
        <p className="paragraph-semibold text-dark300_light700 mt-2">{name}</p>
        <p className="body-medium text-light400_dark500 mt-1">{username}</p>
      </article>
    </Link>
  );
}
