"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Input } from "../ui/input";
import Image from "next/image"
import { useEffect, useState } from "react"
import { formUrlQuery, removekeysFromQuery } from "@/lib/url";


interface Search  {
    route: string;
    imgSrc: string;
    placeholder: string;
    otherClasses: string;
}

export default function LocalSearch({ route, imgSrc, placeholder, otherClasses}: Search) {
    const router = useRouter();
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const query = searchParams.get("query") || ""
    const [searchQuery, setSearchQuery] = useState(query)
    useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
        if (searchQuery) {
            const newUrl = formUrlQuery({
                params: searchParams.toString(),
                key: "query",
                value: searchQuery,
            });
            router.push(newUrl, { scroll: false });
        } else {
            if (pathname === route) {
                const newUrl = removekeysFromQuery({
                    params: searchParams.toString(),
                    keysToRemove: ["query"],
                });
                router.push(newUrl, { scroll: false });
            }
        }
    }, 300);

    return () => clearTimeout(delayDebounceFn)
}, [searchQuery, route, pathname]);
    return (
        <div className={`background-light800_darkgradient flex min-h-14 grow items-center gap-4 rounded-[10px] px-4 ${otherClasses}`}>
            <Image
            src={imgSrc}
            width={24}
            height={24}
            alt="Search"
            className="cursor-pointer"/>
            <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="paragraph-regular no-focus text-dark400_light700 border-none shadow-none outline-none dark:bg-transparent"/>
        </div>
    );
};