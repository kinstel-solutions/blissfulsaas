import { createClient } from "./supabase/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export async function fetchWithAuthContent(path: string, options: RequestInit = {}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as any) || {}),
  };

  if (session) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      ...options,
      headers,
      cache: 'no-store',
      signal: controller.signal
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error: any) {
    console.error(`Fetch failed for path ${path}:`, error.message || error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  therapists: {
    getById: (id: string) => fetchWithAuthContent(`/therapists/public/${id}`),
  },
  sessions: {
    all: () => fetchWithAuthContent("/sessions/all"),
    getById: (id: string) => fetchWithAuthContent(`/sessions/${id}`),
  },
  intake: {
    get: () => fetchWithAuthContent("/patients/intake"),
  }
};
