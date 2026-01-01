import Link from 'next/link';
import { HomeIcon, MagnifyingGlassIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            <span className="text-9xl font-bold text-primary-200">404</span>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-24 h-24 text-primary-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Oops! Page Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track!
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <HomeIcon className="w-5 h-5" />
            Go Home
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
            Find Meal Train
          </Link>
        </div>

        {/* Create CTA */}
        <div className="mt-12 pt-8 border-t border-primary-100">
          <p className="text-gray-600 mb-4">
            Want to start helping someone in need?
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700"
          >
            <PlusCircleIcon className="w-5 h-5" />
            Create a Meal Train
          </Link>
        </div>
      </div>
    </div>
  );
}
