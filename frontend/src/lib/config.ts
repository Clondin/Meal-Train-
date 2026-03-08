const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const getApiBaseUrl = () =>
  rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api`;
