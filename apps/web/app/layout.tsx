import type { Metadata } from "next";
import { Manrope, IBM_Plex_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";


const manrope = Manrope({
    variable: "--font-manrope",
    subsets: ["latin"],
})

const ibmMono = IBM_Plex_Mono({
    variable: "--font-ibm-mono",
    subsets: ["latin"],
    weight: ["400", "500", "600"],
});

const petrona = localFont({
    src: [
        {
            path: "../public/fonts/Petrona-Regular.woff2",
            weight: "500",
        },
        {
            path: "../public/fonts/Petrona-Medium.woff2",
            weight: "600",
        },
        {
            path: "../public/fonts/Petrona-Semibold.woff2",
            weight: "700",
        },
        {
            path: "../public/fonts/Petrona-Bold.woff2",
            weight: "800",
        },
    ],
    variable: "--font-petrona",
});

export const metadata: Metadata = {
    title: "Yohaku - Your Personal Task Manager",
    description:
        "Yohaku helps you organize, prioritize, and track your tasks with ease.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${manrope.variable} ${ibmMono.variable} ${petrona.variable} font-sans antialiased bg-background text-foreground`}
            >
                <main className="flex justify-center w-full">

                {children}
                </main>
            </body>
        </html>
    );
}
