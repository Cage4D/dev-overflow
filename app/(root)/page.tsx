"use client";

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import ROUTES from "@/constants/routes"

export default function Home() {
    const router = useRouter();

    const handleSignOut = async () => {
        await authClient.signOut();
        router.push(ROUTES.SIGN_IN)
    };
    return (
        <div>
            <h1 className="text-3xl text-light-500 font-black">Welcome to Next.js 👋</h1>
            <div className="px-10 pt-25">
                <Button
                type="submit"
                className="cursor-pointer"
                onClick={handleSignOut}>Log out</Button>
            </div>
        </div>
    );
};