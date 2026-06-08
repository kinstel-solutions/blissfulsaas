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
  therapists: {
    getVerified: (page: number = 1, limit: number = 12) => 
      fetchWithAuth(`/therapists/verified?page=${page}&limit=${limit}`),
  },
  availability: {
    /**
     * Get the weekly schedule (active days) for a therapist — used for
     * rendering which days have availability on the calendar.
     */
    getTherapistSchedule: (therapistId: string) =>
      fetchWithAuth(`/availability/therapist/${therapistId}/schedule`),
    /**
     * Get dynamically generated slots for a specific date.
     * Returns available (non-booked) slots for the given therapistId + date.
     */
    getTherapistSlots: (
      therapistId: string,
      date: string,          // "YYYY-MM-DD"
      mode?: 'ONLINE' | 'IN_CLINIC',
    ) =>
      fetchWithAuth(
        `/availability/therapist/${therapistId}/slots?date=${date}${mode ? `&mode=${mode}` : ''}`,
      ).then((res: any) => res.slots ?? res),
  },
  sessions: {
    book: (data: { therapistId: string; scheduledAt: string; notes?: string; mode?: string }) =>
      fetchWithAuth("/sessions/book", { method: "POST", body: JSON.stringify(data) }),
    upcoming: () => fetchWithAuth("/sessions/upcoming"),
    all: () => fetchWithAuth("/sessions/all"),
    getById: (id: string) => fetchWithAuth(`/sessions/${id}`),
    cancel: (id: string) =>
      fetchWithAuth(`/sessions/${id}/cancel`, { method: "PATCH" }),
    getToken: (id: string) => fetchWithAuth(`/sessions/${id}/token`),
  },
  payments: {
    createOrder: (data: { therapistId: string; scheduledAt: string; notes?: string; mode?: string }) =>
      fetchWithAuth("/payments/create-order", { method: "POST", body: JSON.stringify(data) }),
    verify: (data: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      therapistId: string;
      scheduledAt: string;
      notes?: string;
      mode?: string;
    }) => fetchWithAuth("/payments/verify", { method: "POST", body: JSON.stringify(data) }),
  },
  messages: {
    send: (appointmentId: string, content: string) =>
      fetchWithAuth('/messages', { method: 'POST', body: JSON.stringify({ appointmentId, content }) })
        .then(res => { window.dispatchEvent(new Event('refresh-unread-counts')); return res; }),
    history: (appointmentId: string) =>
      fetchWithAuth(`/messages/${appointmentId}`),
    unreadCounts: () => fetchWithAuth('/messages/unread/counts'),
    markRead: (appointmentId: string) => 
      fetchWithAuth(`/messages/${appointmentId}/read`, { method: 'POST' })
        .then(res => { window.dispatchEvent(new Event('refresh-unread-counts')); return res; }),
  },
  intake: {
    get: () => fetchWithAuth('/patients/intake'),
    update: (data: any) => fetchWithAuth('/patients/intake', { method: 'PATCH', body: JSON.stringify(data) }),
  },
  notifications: {
    getAll: () => fetchWithAuth('/notifications'),
    getUnreadCount: () => fetchWithAuth('/notifications/unread/count'),
    markRead: (id: string) => fetchWithAuth(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => fetchWithAuth('/notifications/read-all', { method: 'PATCH' }),
    delete: (id: string) => fetchWithAuth(`/notifications/${id}`, { method: 'DELETE' }),
    deleteAll: () => fetchWithAuth('/notifications', { method: 'DELETE' }),
  },
};
