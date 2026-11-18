import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Route classification
// ---------------------------------------------------------------------------

/**
 * Pages that are fully public — no session required.
 * Authenticated users visiting /home are redirected to the app root.
 */
const PUBLIC_PAGE_PREFIXES = ["/home", "/login", "/sign-up", "/verify-token"];

/**
 * The cookie name the Express server sets for the access token.
 * Mirrors what the server writes — update here if it changes.
 */
const ACCESS_TOKEN_COOKIE = "accessToken";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function isPublicPage(pathname: string): boolean {
    return PUBLIC_PAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function hasSession(request: NextRequest): boolean {
    return !!request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
}

// ---------------------------------------------------------------------------
// Auth guard — the only thing this file should be doing
// ---------------------------------------------------------------------------

/**
 * Enforces session-based access control on page navigation:
 *
 * • Unauthenticated user → protected page  →  redirect /home
 * • Authenticated user   → /home           →  redirect /
 *
 * This is an optimistic check based on cookie presence — the Express backend
 * remains the authoritative verifier. Expired tokens are handled by the
 * refresh/logout flow in interceptor.ts on the first API call.
 *
 * Note: API calls (/api/*) go directly to the Express backend via interceptor.ts.
 * There is no need to proxy them through Next.js.
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
    const { pathname } = request.nextUrl;
    const authenticated = hasSession(request);

    // Unauthenticated user trying to access a protected page
    if (!isPublicPage(pathname) && !authenticated && pathname !== '/home') {
        const url = request.nextUrl.clone();
        url.pathname = "/home";
        url.search = "";
        console.log('DEBUG: redirecting to /home')
        return NextResponse.redirect(url);
    }

    // Authenticated user landing on /home (login/landing page)
    if (pathname === "/home" && authenticated) {
        console.log('DEBUG: redirecting to /')
        const url = request.nextUrl.clone();
        url.pathname = "/";
        url.search = "";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

// ---------------------------------------------------------------------------
// Matcher — only run on page routes, skip Next.js internals and static files
// ---------------------------------------------------------------------------

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)" ],
};
