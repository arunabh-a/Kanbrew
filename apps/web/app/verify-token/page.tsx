"use client";

import { apiRoutes } from "@/service/app.api";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const VerifyToken = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const router = useRouter();
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            apiRoutes.auth
                .verifyEmail(token)
                .then(() => {
                    setIsVerified(true);
                    setInterval(() => {
                        router.push("/login");
                    }, 2500);
                })
                .catch((error) => {
                    setError(error.message);
                });
        }
    }, [token]);

    return (
        <div className="flex items-center justify-center min-h-screen w-full bg-background text-foreground p-4">
            <div className="w-full max-w-sm p-8 rounded-2xl bg-card border border-border shadow-sm text-center">
                {error ? (
                    <div className="space-y-4">
                        <p className="text-sm font-medium text-destructive">{error}</p>
                        <button
                            onClick={() => router.push("/home")}
                            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                            Go back
                        </button>
                    </div>
                ) : isVerified === false ? (
                    <div className="space-y-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate mx-auto" />
                        <p className="text-sm font-medium text-ink">Verifying your email...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-moss mx-auto" />
                        <p className="text-sm font-medium text-moss">Verified! Redirecting to login...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const Page = () => (
    <Suspense>
        <VerifyToken />
    </Suspense>
);

export default Page;
