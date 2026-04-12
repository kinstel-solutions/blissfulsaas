import { createClient } from "./supabase";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export async function fetchWithAuth(path: string, options: RequestInit = {}) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as any) || {}),
  };

  if (session) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Request failed");
  }

  return response.json();
}

export const api = {
  availability: {
    getMySlots: () => fetchWithAuth("/availability"),
    createSlot: (data: any) => fetchWithAuth("/availability", { method: "POST", body: JSON.stringify(data) }),
    deleteSlot: (id: string) => fetchWithAuth(`/availability/${id}`, { method: "DELETE" }),
  },
  sessions: {
    upcoming: () => fetchWithAuth("/sessions/upcoming"),
    cancel: (id: string) => fetchWithAuth(`/sessions/${id}/cancel`, { method: "PATCH" }),
    complete: (id: string) => fetchWithAuth(`/sessions/${id}/complete`, { method: "PATCH" }),
    getToken: (id: string) => fetchWithAuth(`/sessions/${id}/token`),
  },
  messages: {
    send: (appointmentId: string, content: string) =>
      fetchWithAuth('/messages', { method: 'POST', body: JSON.stringify({ appointmentId, content }) }),
    history: (appointmentId: string) =>
      fetchWithAuth(`/messages/${appointmentId}`),
  },
  therapists: {
    getProfile: () => fetchWithAuth("/therapists/profile"),
    updateProfile: (data: any) => fetchWithAuth("/therapists/profile", { method: "PATCH", body: JSON.stringify(data) }),
  },
};
