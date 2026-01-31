'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log exception to service
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h2>
                <p className="text-muted-foreground mb-6">
                    We apologize for the inconvenience. An unexpected error has occurred.
                </p>
                {error.digest && (
                    <p className="text-xs text-gray-400 mb-4 font-mono">Reference: {error.digest}</p>
                )}
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => reset()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                        Try again
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        </div>
    );
}
