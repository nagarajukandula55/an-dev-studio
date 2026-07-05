// ============================================================================
// AN Dev Studio — Optional access gate
//
// This app has no built-in user accounts, and several routes are sensitive
// on a public deployment: /api/config can read/write which AI provider keys
// are configured (and can point ANu's Ollama host anywhere), and /api/chat
// burns through your free-tier provider quotas on every request. Without
// this gate, anyone who finds your Vercel URL can hit both.
//
// Set STUDIO_PASSWORD as an environment variable (in Vercel: Project ->
// Settings -> Environment Variables) to require an HTTP Basic Auth password
// for every request. If STUDIO_PASSWORD is unset, this middleware is a
// no-op — local development stays frictionless by default.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";

export const config = {
    // Run on everything except static assets and the Next.js internals.
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let mismatch = 0;
    for (let i = 0; i < a.length; i++) {
        mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return mismatch === 0;
}

export function middleware(req: NextRequest): NextResponse {
    const password = process.env.STUDIO_PASSWORD;

    // No password configured — access gate is disabled.
    if (!password) {
        return NextResponse.next();
    }

    const header = req.headers.get("authorization");

    if (header?.startsWith("Basic ")) {
        try {
            const decoded = atob(header.slice(6));
            const separatorIndex = decoded.indexOf(":");
            const suppliedPassword = separatorIndex === -1 ? decoded : decoded.slice(separatorIndex + 1);
            if (timingSafeEqual(suppliedPassword, password)) {
                return NextResponse.next();
            }
        } catch {
            // fall through to 401
        }
    }

    return new NextResponse("Authentication required.", {
        status: 401,
        headers: {
            "WWW-Authenticate": 'Basic realm="AN Dev Studio", charset="UTF-8"',
        },
    });
}
