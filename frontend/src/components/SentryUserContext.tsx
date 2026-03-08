'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { useAuthStore } from '@/stores/auth';

export function SentryUserContext() {
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    Sentry.setUser(
      user
        ? {
            id: user.id,
            email: user.email,
          }
        : null
    );
  }, [user]);

  return null;
}
