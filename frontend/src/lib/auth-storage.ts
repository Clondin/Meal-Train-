export const AUTH_TOKEN_STORAGE_KEY = 'auth-token';
export const GUEST_SESSION_STORAGE_KEY = 'guest-session';

export const readStoredAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
};

export const writeStoredAuthToken = (token: string | null) => {
  if (typeof window === 'undefined') return;

  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
};
