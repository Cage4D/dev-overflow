import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ROUTES from "@/constants/routes";
import Image from "next/image";
import Link from "next/link";
import NavLinks from "./NavLinks";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default async function MobileNavigation() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;
  return (
    <Sheet>
      <SheetTrigger>
        <Image
          src="/icons/hamburger.svg"
          width={36}
          height={36}
          alt="Menu"
          className="invert-colors sm:hidden"
        />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="background-light900_dark200 border-none px-5 py-2"
      >
        <SheetTitle className="hidden">Navigation</SheetTitle>
        <Link href="/" className="flex items-center gap-1">
          <Image
            src="/images/site-logo.svg"
            width={23}
            height={23}
            alt="Logo"
          />
          <p className="h2-bold font-space-grotesk text-dark-100 dark:text-light-900">
            Dev<span className="text-primary-500">Flow</span>
          </p>
        </Link>
        <div className="no-scrollbar flex h-[calc(100vh - 80px)] flex-col justify-between overflow-y-auto">
          <section className="flex h-full flex-col gap-6 pt-16">
            <NavLinks isMobileNav />
          </section>
          <div className="flex flex-col gap-3 mt-3">
            {userId ? (
              <form
                action={async () => {
                  "use server";
                  await auth.api.signOut({ headers: await headers() });
                }}
              >
                <SheetClose
                  render={
                    <Button
                      type="submit"
                      className="base-medium w-fit bg-transparent! px-4 py-3"
                    />
                  }
                >
                  <LogOut className="size-5 text-black dark:text-white" />
                  <span className="text-dark300_light900">
                    Logout
                  </span>
                </SheetClose>
              </form>
            ) : (
              <>
                <SheetClose
                  render={<Link href={ROUTES.SIGN_IN} />}
                  nativeButton={false}
                  className="small-medium btn-secondary min-h-10.25 flex w-full items-center justify-center rounded-lg px-4 py-3 shadow-none"
                >
                  <span className="primary-text-gradient">Log In</span>
                </SheetClose>
                <SheetClose
                  render={<Link href={ROUTES.SIGN_UP} />}
                  nativeButton={false}
                  className="small-medium light-border-2 text-dark400_light900 btn-tertiary min-h-10.25 flex w-full items-center justify-center rounded-lg border px-4 py-3 shadow-none"
                >
                  Sign Up
                </SheetClose>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
