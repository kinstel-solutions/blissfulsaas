import { createClient } from "./supabase";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// ─── Availability Type Definitions ───────────────────────────────────────────

export type ConsultationMode = 'ONLINE' | 'IN_CLINIC';

export interface WeeklyScheduleItem {
  dayOfWeek: number;       // 0 = Sunday … 6 = Saturday
  startTime: string;       // "HH:mm" UTC
  endTime: string;         // "HH:mm" UTC
  mode: ConsultationMode;
  isActive?: boolean;
}

export interface WeeklyAvailabilityRule extends WeeklyScheduleItem {
  id: string;
  therapistId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleOverride {
  id: string;
  therapistId: string;
  date: string;            // ISO 8601 UTC
  isAvailable: boolean;
  startTime?: string | null;
  endTime?: string | null;
  mode?: ConsultationMode | null;
  reason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOverridePayload {
  date: string;            // "YYYY-MM-DD"
  endDate?: string;        // "YYYY-MM-DD"
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
  mode?: ConsultationMode;
  reason?: string;
}

export interface TimeSlot {
  startTime: string;       // "HH:mm" UTC
  endTime: string;         // "HH:mm" UTC
  startUtc: string;        // ISO 8601
  endUtc: string;          // ISO 8601
  mode: ConsultationMode;
  available: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────


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
    // ── Weekly Schedule (baseline working hours) ──────────────────────────
    getSchedule: () => fetchWithAuth('/availability/schedule'),
    upsertSchedule: (schedule: WeeklyScheduleItem[]) =>
      fetchWithAuth('/availability/schedule', {
        method: 'PUT',
        body: JSON.stringify({ schedule }),
      }),

    // ── Date Overrides (exceptions) ───────────────────────────────────────
    getOverrides: () => fetchWithAuth('/availability/overrides'),
    createOverride: (data: CreateOverridePayload) =>
      fetchWithAuth('/availability/overrides', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    deleteOverride: (id: string) =>
      fetchWithAuth(`/availability/overrides/${id}`, { method: 'DELETE' }),

    // ── Slot Preview (therapist sees their own available slots for a date) ─
    getMySlots: (date: string, mode?: 'ONLINE' | 'IN_CLINIC') =>
      fetchWithAuth(
        `/availability/slots?date=${date}${mode ? `&mode=${mode}` : ''}`,
      ),

    // ── Public Slot Lookup (patient booking) ─────────────────────────────
    getTherapistSlots: (
      therapistId: string,
      date: string,
      mode?: 'ONLINE' | 'IN_CLINIC',
    ) =>
      fetchWithAuth(
        `/availability/therapist/${therapistId}/slots?date=${date}${mode ? `&mode=${mode}` : ''}`,
      ),

    // ── Legacy bulk-update — kept for backward compatibility if needed ─────
    bulkUpdate: (data: {
      create: { dayOfWeek: number; startTime: string; endTime: string; mode?: 'ONLINE' | 'IN_CLINIC' }[];
      delete: string[];
    }) => fetchWithAuth('/availability/bulk', { method: 'POST', body: JSON.stringify(data) }),
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
    deleteAll: () => fetchWithAuth('/notifications', { method: 'DELETE' }),
  },
};
