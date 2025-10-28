'use client';

import { SignUp } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'

export default function Page() {
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirect_url') || '/dashboard';
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                    <p className="text-gray-600">Start selling your digital products today</p>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                    <SignUp 
                        forceRedirectUrl={redirectUrl}
                        signInUrl="/sign-in"
                        appearance={{
                            elements: {
                                rootBox: "mx-auto",
                                card: "shadow-none",
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    )
}