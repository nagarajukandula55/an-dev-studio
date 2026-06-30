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
                                    var theme = localStorage.getItem('studio-theme') || 'system';
                                    var isDark = theme === 'dark' ||
                                        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                                    if (isDark) document.documentElement.classList.add('dark');
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
