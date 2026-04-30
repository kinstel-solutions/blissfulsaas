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
    createSlot: (data: { dayOfWeek: number; startTime: string; endTime: string; mode?: 'ONLINE' | 'IN_CLINIC' }) => fetchWithAuth("/availability", { method: "POST", body: JSON.stringify(data) }),
    deleteSlot: (id: string) => fetchWithAuth(`/availability/${id}`, { method: "DELETE" }),
  },
  sessions: {
    upcoming: () => fetchWithAuth("/sessions/upcoming"),
    cancel: (id: string) => fetchWithAuth(`/sessions/${id}/cancel`, { method: "PATCH" }),
    confirm: (id: string) => fetchWithAuth(`/sessions/${id}/confirm`, { method: "PATCH" }),
    complete: (id: string) => fetchWithAuth(`/sessions/${id}/complete`, { method: "PATCH" }),
    getToken: (id: string) => fetchWithAuth(`/sessions/${id}/token`),
    getNotes: (id: string) => fetchWithAuth(`/sessions/${id}/notes`),
    updateNotes: (id: string, notes: string) => fetchWithAuth(`/sessions/${id}/notes`, {
      method: "PATCH",
      body: JSON.stringify({ notes }),
    }),
  },
  messages: {
    send: (appointmentId: string, content: string) =>
      fetchWithAuth('/messages', { method: 'POST', body: JSON.stringify({ appointmentId, content }) })
        .then(res => { window.dispatchEvent(new Event('refresh-unread-counts')); return res; }),
    history: (appointmentId: string) =>
      fetchWithAuth(`/messages/${appointmentId}`),
    patientHistory: (patientId: string) =>
      fetchWithAuth(`/messages/patient/${patientId}`),
    unreadCounts: () => fetchWithAuth('/messages/unread/counts'),
    markRead: (appointmentId: string) => 
      fetchWithAuth(`/messages/${appointmentId}/read`, { method: 'POST' })
        .then(res => { window.dispatchEvent(new Event('refresh-unread-counts')); return res; }),
  },
  therapists: {
    getProfile: () => fetchWithAuth("/therapists/profile"),
    updateProfile: (data: any) => fetchWithAuth("/therapists/profile", { method: "PATCH", body: JSON.stringify(data) }),
    myPatients: () => fetchWithAuth("/therapists/my-patients"),
  },
  notifications: {
    getAll: () => fetchWithAuth('/notifications'),
    getUnreadCount: () => fetchWithAuth('/notifications/unread/count'),
    markRead: (id: string) => fetchWithAuth(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => fetchWithAuth('/notifications/read-all', { method: 'PATCH' }),
    delete: (id: string) => fetchWithAuth(`/notifications/${id}`, { method: 'DELETE' }),
  },
};
