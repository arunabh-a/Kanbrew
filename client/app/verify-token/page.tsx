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
        <div className="flex items-center justify-center h-screen">
            {error ? (
                <div>
                    <p>{error}</p>
                    <button onClick={() => router.push("/home")}>
                        Go back
                    </button>
                </div>
            ) : isVerified === false ? (
                <div>
                    <p>Verifying...</p>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                </div>
            ) : (
                <div>
                    <p>Verified, Redirecting to login....</p>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                </div>
            )}
        </div>
    );
};

const Page = () => (
    <Suspense>
        <VerifyToken />
    </Suspense>
);

export default Page;
