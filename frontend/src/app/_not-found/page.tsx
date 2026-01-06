'use client';

export default function NotFoundPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">Sorry, the page you are looking for does not exist.</p>
            </div>
        </div>
    );
}
