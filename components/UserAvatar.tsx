import ROUTES from "@/constants/routes";
import Link from "next/link";
import { Avatar, AvatarFallback } from "./ui/avatar";
import Image from "next/image";

interface AvatarProps {
  id?: string;
  name: string;
  imageUrl?: string | null;
  className?: string;
  size?: number;
  href?: string | null;
}

export default function UserAvatar({
  id,
  name,
  imageUrl,
  className = "h-9 w-9",
  size = 36,
  href,
}: AvatarProps) {
  const initials = name
    .split(" ")
    .map((word: string) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const targetHref = href ?? (id ? ROUTES.PROFILE(id) : null);
  const avatar = (
    <Avatar className={className}>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          className="object-cover"
          width={size}
          height={size}
          quality={100}
        />
      ) : (
        <AvatarFallback className="primary-gradient font-space-grotesk font-bold tracking-wider text-white">
          {initials}
        </AvatarFallback>
      )}
    </Avatar>
  );
  return targetHref ? <Link href={targetHref}>{avatar}</Link> : avatar;
}
