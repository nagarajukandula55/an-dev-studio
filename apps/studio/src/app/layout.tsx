/**
 * ============================================================================
 * AN Dev Studio
 * Root Layout
 * ============================================================================
 */

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets:  ["latin"],
    variable: "--font-inter",
    display:  "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://andevstudio.com";
const SITE_NAME = "AN Dev Studio";
const SITE_DESCRIPTION =
    "AN Dev Studio is a local-first AI app builder by AN Group. Six AI agents plan, build, review, fix, and " +
    "deploy real software from a prompt — every file write and command gated behind your approval, running on " +
    "your own machine. Your code never leaves your computer.";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: `${SITE_NAME} — Local-first AI App Builder`,
        template: `%s · ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    keywords: [
        "AI app builder",
        "local-first AI",
        "AI coding agent",
        "private AI code generator",
        "AI software engineering platform",
        "Ollama app builder",
        "self-hosted AI developer tool",
    ],
    icons: { icon: "/favicon.ico" },
    authors: [{ name: "AN Group" }],
    creator: "AN Group",
    publisher: "AN Group",
    openGraph: {
        type: "website",
        siteName: SITE_NAME,
        title: `${SITE_NAME} — Local-first AI App Builder`,
        description: SITE_DESCRIPTION,
        url: SITE_URL,
        images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
        card: "summary_large_image",
        title: `${SITE_NAME} — Local-first AI App Builder`,
        description: SITE_DESCRIPTION,
        images: ["/opengraph-image"],
    },
    alternates: {
        canonical: "/",
    },
};

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#f8f9fc" },
        { media: "(prefers-color-scheme: dark)",  color: "#0d0f14" },
    ],
};

export default function RootLayout({
    children,
}: Readonly<{ children: ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                {/* Prevent FOUC for dark mode */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                try {
                                    // Default is light. Dark only applies if the user has
                                    // explicitly chosen it via the theme toggle (persisted
                                    // in localStorage). We do NOT fall back to OS preference,
                                    // so the app looks the same regardless of system theme
                                    // until the user opts into dark mode themselves.
                                    var theme = localStorage.getItem('studio-theme') || 'light';
                                    if (theme === 'dark') document.documentElement.classList.add('dark');
                                } catch(e) {}
                            })();
                        `,
                    }}
                />
            </head>
            <body className={inter.variable}>
                {children}
            </body>
        </html>
    );
}
