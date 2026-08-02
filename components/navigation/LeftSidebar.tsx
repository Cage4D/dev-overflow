import NavLinks from "./navbar/NavLinks";
import { Button } from "@/components/ui/button";

import ROUTES from "@/constants/routes";
import Link from "next/link"
import Image from "next/image"

export default function LeftSidebar() {
    return (
        <section className="custom-scrollbar background-light900_dark200 light-border sticky left-0 top-0 h-screen flex flex-col justify-between overflow-y-auto border-r p-6 pt-36 shadow-light-300 dark:shadow-none max-sm:hidden lg:w-66.5">
            <div className="flex flex-1 flex-col gap-6">
                <NavLinks/>
            </div>
            <div className="flex flex-col gap-3">
                <Button className="small-medium btn-secondary min-h-10.25 w-full rounded-lg px-4 py-3 shadow-none">
                    <Link href={ROUTES.SIGN_IN}>
                        <Image
                        src="/icons/account.svg"
                        alt="Account"
                        width={20}
                        height={20}
                        className="invert-colors lg:hidden"/>
                            <span className="primary-text-gradient max-lg:hidden">Log In</span>
                    </Link>
                </Button>
                <Button className="small-medium light-border-2 text-dark400_light900 btn-tertiary min-h-10.25 w-full rounded-lg border px-4 py-3 shadow-none">
                    <Link href={ROUTES.SIGN_UP}>
                        <Image
                        src="/icons/sign-up.svg"
                        alt="Account"
                        width={20}
                        height={20}
                        className="invert-colors lg:hidden"/>
                            <span className="max-lg:hidden">Sign up</span>
                    </Link>
                </Button>
            </div>
        </section>
    );
};