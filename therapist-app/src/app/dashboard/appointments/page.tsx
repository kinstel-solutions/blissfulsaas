import { fetchWithAuthContent } from "@/lib/api-server";
import EnhancedAppointmentsList from "@/components/EnhancedAppointmentsList";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  const sessions = await fetchWithAuthContent("/sessions/all");
  const appointments = Array.isArray(sessions) ? sessions : [];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 leading-none font-sans">
            Appointments
          </h1>
          <p className="text-slate-500 mt-4 text-lg max-w-2xl">
            A comprehensive record of your scheduling and clinical practice. Track upcoming sessions, manage cancellations, and review session notes.
          </p>
        </div>
      </header>

      <EnhancedAppointmentsList initialAppointments={appointments} />
    </div>
  );
}
