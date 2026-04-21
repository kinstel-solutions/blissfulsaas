import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { 
  Search, 
  Filter, 
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  MessageSquare,
  Eye,
  EyeOff,
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

async function getToken() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function getAppointments(token: string) {
  const res = await fetch(`${BACKEND_URL}/sessions/admin/all`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

async function getAllFeedback(token: string) {
  const res = await fetch(`${BACKEND_URL}/feedback/admin/all`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function AppointmentsPage() {
  const token = await getToken();
  if (!token) redirect("/login");

  const [appointments, feedbackItems] = await Promise.all([
    getAppointments(token),
    getAllFeedback(token),
  ]);

  // Aggregate average per therapist
  const feedbackByTherapist: Record<string, { name: string; ratings: number[] }> = {};
  for (const fb of feedbackItems) {
    const tName = `Dr. ${fb.appointment?.therapist?.firstName ?? ""} ${fb.appointment?.therapist?.lastName ?? ""}`.trim();
    const tId = fb.therapistId;
    if (!feedbackByTherapist[tId]) {
      feedbackByTherapist[tId] = { name: tName, ratings: [] };
    }
    feedbackByTherapist[tId].ratings.push(fb.rating);
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/5 text-emerald-600 border border-emerald-500/10 rounded-full text-[10px] font-bold uppercase tracking-widest">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </div>
        );
      case "CONFIRMED":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/5 text-blue-600 border border-blue-500/10 rounded-full text-[10px] font-bold uppercase tracking-widest">
            <CheckCircle2 className="w-3 h-3" /> Confirmed
          </div>
        );
      case "PENDING":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/5 text-amber-600 border border-amber-500/10 rounded-full text-[10px] font-bold uppercase tracking-widest">
            <Clock className="w-3 h-3" /> Pending
          </div>
        );
      case "CANCELLED":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-destructive/5 text-destructive border border-destructive/10 rounded-full text-[10px] font-bold uppercase tracking-widest">
            <XCircle className="w-3 h-3" /> Cancelled
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted/5 text-muted-foreground border border-muted/10 rounded-full text-[10px] font-bold uppercase tracking-widest">
            <AlertCircle className="w-3 h-3" /> {status}
          </div>
        );
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <span className="text-emerald-600 font-bold text-xs uppercase tracking-wider">Paid</span>;
      case "PENDING":
        return <span className="text-amber-600 font-bold text-xs uppercase tracking-wider">Pending</span>;
      case "REFUNDED":
        return <span className="text-destructive font-bold text-xs uppercase tracking-wider">Refunded</span>;
      default:
        return <span className="text-muted-foreground font-bold text-xs uppercase tracking-wider">Unpaid</span>;
    }
  };

  const StarRow = ({ rating, size = 3 }: { rating: number; size?: number }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-${size} h-${size} ${
            s <= rating ? "fill-yellow-400 text-yellow-400" : "text-outline-variant/30"
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-medium text-primary">Appointment Oversight</h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">Monitor all platform bookings and patient reviews</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-2 flex items-center gap-2 group focus-within:ring-2 focus-within:ring-primary/20 transition-all">
             <Search className="w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
             <input placeholder="Search bookings..." className="bg-transparent border-none outline-none text-sm font-medium placeholder:text-muted-foreground/30 w-48" />
          </div>
          <button className="p-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-primary/60 hover:text-primary hover:bg-surface-container-lowest transition-all">
             <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-xl overflow-hidden relative group">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/10 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 bg-primary/[0.01]">
                <th className="px-5 md:px-8 py-5">Patient</th>
                <th className="px-4 md:px-6 py-5">Provider</th>
                <th className="px-4 md:px-6 py-5">Date &amp; Time</th>
                <th className="px-4 md:px-6 py-5">Status</th>
                <th className="px-4 md:px-6 py-5">Mode</th>
                <th className="px-4 md:px-6 py-5">Rating</th>
                <th className="px-4 md:px-6 py-5 text-right">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {appointments?.map((appt: any) => {
                const hasFeedback = feedbackItems.find((f: any) => f.appointmentId === appt.id);
                return (
                  <tr key={appt.id} className="group/row hover:bg-primary/[0.01] transition-colors">
                    <td className="px-5 md:px-8 py-4">
                      <p className="font-heading font-medium text-foreground text-sm">
                        {appt.patient?.firstName} {appt.patient?.lastName}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 tracking-tight">{appt.patient?.user?.email}</p>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <p className="font-heading font-medium text-foreground text-sm">
                        Dr. {appt.therapist?.firstName} {appt.therapist?.lastName}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 tracking-tight">{appt.therapist?.user?.email}</p>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground/50" />
                        <div>
                          <p className="text-xs font-medium text-foreground/80">
                            {new Date(appt.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {new Date(appt.scheduledAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} ({appt.duration}m)
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      {getStatusBadge(appt.status)}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider bg-surface-container px-2 py-1 rounded-md">
                        {appt.mode === 'IN_CLINIC' ? 'In-Clinic' : 'Online'}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      {hasFeedback ? (
                        <div className="flex items-center gap-1.5">
                          <StarRow rating={hasFeedback.rating} size={3} />
                          <span className="text-[10px] font-bold text-muted-foreground">{hasFeedback.rating}/5</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/40 italic">
                          {appt.status === "COMPLETED" ? "No review" : "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right">
                      {getPaymentBadge(appt.paymentStatus)}
                      {appt.amountPaid && (
                        <p className="text-[10px] font-bold text-muted-foreground mt-1">₹{appt.amountPaid}</p>
                      )}
                    </td>
                  </tr>
                );
              })}
              {(!appointments || appointments.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-5 md:px-8 py-20 text-center">
                     <p className="text-muted-foreground italic text-sm">No appointments found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Feedback Review Panel ─── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-heading font-medium text-foreground flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              Feedback Review Panel
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {feedbackItems.length} patient {feedbackItems.length === 1 ? "review" : "reviews"} submitted
            </p>
          </div>

          {/* Provider summary cards */}
          {Object.keys(feedbackByTherapist).length > 0 && (
            <div className="flex gap-3 flex-wrap justify-end">
              {Object.entries(feedbackByTherapist).map(([id, data]) => {
                const avg = data.ratings.reduce((a: number, b: number) => a + b, 0) / data.ratings.length;
                return (
                  <div key={id} className="bg-surface-container-low border border-outline-variant/20 rounded-2xl px-4 py-3 text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{data.name}</p>
                    <div className="flex items-center gap-1 justify-end mt-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-bold text-foreground">{avg.toFixed(1)}</span>
                      <span className="text-[10px] text-muted-foreground">({data.ratings.length})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {feedbackItems.length === 0 ? (
          <div className="py-20 text-center bg-surface-container-low/30 rounded-2xl border border-outline-variant/20">
            <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-yellow-300" />
            </div>
            <p className="text-muted-foreground text-sm">No patient reviews yet.</p>
            <p className="text-muted-foreground/50 text-xs mt-1">Reviews appear here once patients rate their completed sessions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {feedbackItems.map((fb: any) => (
              <div
                key={fb.id}
                className={`bg-surface-container-lowest border rounded-2xl p-5 space-y-3 transition-all hover:shadow-md ${
                  fb.isPublic
                    ? "border-outline-variant/20"
                    : "border-destructive/10 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      {fb.appointment?.patient?.firstName ?? "Patient"} {fb.appointment?.patient?.lastName ?? ""}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      → Dr. {fb.appointment?.therapist?.firstName ?? ""} {fb.appointment?.therapist?.lastName ?? ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= fb.rating ? "fill-yellow-400 text-yellow-400" : "text-outline-variant/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {fb.comment ? (
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-muted-foreground/40 mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground italic leading-relaxed">"{fb.comment}"</p>
                  </div>
                ) : (
                  <p className="text-[10px] text-muted-foreground/40 italic">No written comment</p>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-outline-variant/10">
                  <span className="text-[10px] text-muted-foreground/50">
                    {new Date(fb.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <ToggleVisibilityButton feedbackId={fb.id} isPublic={fb.isPublic} token={token} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// Server-side toggle button using a form action
function ToggleVisibilityButton({ feedbackId, isPublic, token }: { feedbackId: string; isPublic: boolean; token: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await fetch(`${BACKEND_URL}/feedback/admin/${feedbackId}/toggle`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });
      }}
    >
      <button
        type="submit"
        className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg transition-all ${
          isPublic
            ? "text-muted-foreground/60 hover:text-destructive hover:bg-destructive/5"
            : "text-emerald-600 hover:bg-emerald-50"
        }`}
      >
        {isPublic ? (
          <>
            <EyeOff className="w-3 h-3" /> Hide
          </>
        ) : (
          <>
            <Eye className="w-3 h-3" /> Show
          </>
        )}
      </button>
    </form>
  );
}
