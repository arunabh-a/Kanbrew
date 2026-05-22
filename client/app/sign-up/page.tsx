'use client';
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignupForm } from "@/components/auth/SignupForm";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function Signup() {
    const router = useRouter();
    const { register, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, router]);

    const handleSignup = async (
        name: string,
        email: string,
        password: string
    ): Promise<{ success: boolean; message?: string }> => {
        const result = await register(name, email, password);
        if (result.success) {
            // User needs to verify their email before they can log in —
            // redirect to a confirmation page, NOT the dashboard.
            router.push(`/verify-email-sent?email=${encodeURIComponent(email)}`);
        }
        return result;
    };

    return (
        <AuthLayout
            title="Create an account"
            subtitle="Get started with Kanbrew today"
        >
            <SignupForm
                onSubmit={handleSignup}
                // onGoogleLogin={handleGoogleLogin}
                // isLoading={isLoading}
                // error={error}
            />
        </AuthLayout>
    );
}
