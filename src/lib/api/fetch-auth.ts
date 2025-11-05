import { getToken, removeToken } from '@/contexts/auth-context';

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(input, { ...init, headers });

  if (response.status === 401) {
    // Invalidate local session and let guards redirect
    removeToken();
  }

  return response;
}


