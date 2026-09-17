import Link from "next/link"
import Image from "next/image"
import UserAvatar from "./UserAvatar";

export default function Metric({ imgUrl, alt, value, title, href, textStyles, imgStyles, isAuthor }: Metric) {
    const metricContent = (
        <>
            {isAuthor && !imgUrl ? (
                <UserAvatar
                    name={String(value)}
                    href={null}
                    size={16}
                    className="size-4 rounded-full object-contain"
                />
            ) : (
                <Image
                    src={imgUrl}
                    width={16}
                    height={16}
                    alt={alt}
                    className={`rounded-full object-contain ${imgStyles}`}
                />
            )}
            <p className={`${textStyles} flex items-center gap-1`}>
                {value}
                <span className={`small-regular line-clamp-1 ${isAuthor ? "max-sm:hidden" : ""}`}>{title}</span>
            </p>
        </>
    )
    return href ? <Link href={href} className="flex-center gap-1">{metricContent}</Link> : <div className="flex-center gap-1">{metricContent}</div>
}