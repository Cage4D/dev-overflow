"use client";

import { sidebarLinks } from "@/constants";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import React from "react";
import { SheetClose } from "@/components/ui/sheet";

export default function NavLinks({
  isMobileNav = false,
  userId,
}: {
  isMobileNav?: boolean;
  userId?: string;
}) {
  const pathname = usePathname();
  return (
    <>
      {sidebarLinks.map((item) => {
        const route =
          item.route === "/profile"
            ? userId
              ? `${item.route}/${userId}`
              : null
            : item.route;

        if (!route) return null;

        const isActive =
          (pathname.includes(route) && route.length > 1) || pathname === route;
        const LinkComponent = (
          <Link
            href={route}
            key={item.label}
            className={cn(
              isActive
                ? "primary-gradient rounded-lg text-light-900"
                : "text-dark300_light900",
              "flex items-center justify-start gap-4 bg-transparent p-4",
            )}
          >
            <Image
              src={item.imgURL}
              alt={item.label}
              width={20}
              height={20}
              className={cn(!isActive && "invert-colors")}
            />
            <p
              className={cn(
                isActive ? "base-bold" : "base-medium",
                !isMobileNav && "max-lg:hidden",
              )}
            >
              {item.label}
            </p>
          </Link>
        );

        return isMobileNav ? (
          <SheetClose key={route} render={LinkComponent} nativeButton={false} />
        ) : (
          <React.Fragment key={route}>{LinkComponent}</React.Fragment>
        );
      })}
    </>
  );
}
