"use client"

import { apiRoutes } from '@/service/app.api'
import { NextRequest } from 'next/server'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const Page = (request: NextRequest) => {
    const token = request.nextUrl.searchParams.get('token')
    const router = useRouter();
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        if(token){
            apiRoutes.auth.verifyEmail(token)
                .then(() => {
                    setIsVerified(true);
                    setInterval(() => {
                        router.push("/");
                    }, 2500);
                })
                .catch((error) => {
                    setError(error.message);
                });
        }
    }, [token])
  return (
    <div className="flex items-center justify-center h-screen">
        {error ? (
            <div>
                <p>{error}</p>
                <button onClick={() => router.push("/home")}>Go back</button>
            </div>
        ) : isVerified === false ? (
            <div>
                <p>Verifying...</p>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            </div>
        ) : (
            <div>
                <p>Congratulations, you have been verified, Redirecting....</p>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            </div>
        )}
    </div>
  )
}

export default Page