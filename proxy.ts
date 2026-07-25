import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import ROUTES from "@/constants/routes"

export function proxy(request: NextRequest) {
    const sessionCookie = getSessionCookie(request);
    if (!sessionCookie) {
        return NextResponse.redirect(new URL(ROUTES.SIGN_IN, request.url))
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"],
};