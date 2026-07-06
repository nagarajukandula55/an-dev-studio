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

export const metadata: Metadata = {
    title:       "AN Dev Studio",
    description: "AI-powered Software Engineering Platform by AN GROUP",
    icons:       { icon: "/favicon.ico" },
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
