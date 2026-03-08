import { GUEST_SESSION_STORAGE_KEY } from './auth-storage';

export interface StoredGuestSession {
  id: string;
  identifier: string;
  identifierType: 'phone' | 'email';
  verified: boolean;
  expiresAt: string;
  createdAt: string;
  token: string;
}

export const readStoredGuestSession = (): StoredGuestSession | null => {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(GUEST_SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredGuestSession;
  } catch {
    window.localStorage.removeItem(GUEST_SESSION_STORAGE_KEY);
    return null;
  }
};

export const writeStoredGuestSession = (session: StoredGuestSession | null) => {
  if (typeof window === 'undefined') return;

  if (session) {
    window.localStorage.setItem(GUEST_SESSION_STORAGE_KEY, JSON.stringify(session));
    return;
  }

  window.localStorage.removeItem(GUEST_SESSION_STORAGE_KEY);
};
