'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body className="bg-gray-50">
        <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-6">
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100">
            <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
            <p className="mt-3 text-sm text-gray-600">
              The error has been recorded. You can retry the page now.
            </p>
            <button
              type="button"
              onClick={() => reset()}
              className="mt-6 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
