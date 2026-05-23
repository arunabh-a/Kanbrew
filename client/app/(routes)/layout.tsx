'use client'
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
// import type { Metadata } from "next";



// export const metadata: Metadata = {
//     title: "Kanbrew - Your Personal Task Manager",
//     description:
//         "Kanbrew helps you organize, prioritize, and track your tasks with ease.",
// };

export default function PageLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { user, logout } = useAuth();
    return (
            <body
                className={'antialiased dark'}
            >'
                <main className="flex flex-col items-center justify-center w-full">
                    {user && <Header user={user} onLogout={logout} />}
                {children}
                </main>
            </body>
    );
}
