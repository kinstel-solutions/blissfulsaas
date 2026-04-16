"use client";

import { useState } from "react";
import { Clock, Calendar, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function SlotSelectionClient({ therapist, slots }: { therapist: any, slots: any[] }) {
  const router = useRouter();
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getNextOccurrence = (dayOfWeek: number, startTime: string) => {
    const today = new Date();
    const currentDay = today.getDay();
    let daysUntil = (dayOfWeek - currentDay + 7) % 7;
    if (daysUntil === 0) daysUntil = 7; 
    
    const date = new Date();
    date.setDate(today.getDate() + daysUntil);
    const [hours, minutes] = startTime.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const isSlotBookedForNextDate = (slot: any) => {
    const nextDate = getNextOccurrence(slot.dayOfWeek, slot.startTime);
    return slot.appointments?.some((appt: any) => {
      const apptDate = new Date(appt.scheduledAt);
      return (
        apptDate.getTime() === nextDate.getTime() && 
        ['PENDING', 'CONFIRMED'].includes(appt.status)
      );
    });
  };

  const handleBook = async () => {
    if (!selectedSlot) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Calculate next available date for this day of week
      const targetDay = selectedSlot.dayOfWeek;
      const today = new Date();
      const currentDay = today.getDay();
      let daysUntil = (targetDay - currentDay + 7) % 7;
      if (daysUntil === 0) daysUntil = 7; // Book for next week if it's today

      const bookingDate = new Date();
      bookingDate.setDate(today.getDate() + daysUntil);
      bookingDate.setHours(parseInt(selectedSlot.startTime.split(':')[0]), parseInt(selectedSlot.startTime.split(':')[1]), 0, 0);

      await api.sessions.book({
        slotId: selectedSlot.id,
        date: bookingDate.toISOString(),
        notes: "Manual booking from portal"
      });

      router.push("/dashboard/sessions?success=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-surface-container-low/30 backdrop-blur-sm border border-outline-variant/20 rounded-xl p-5 md:p-10 shadow-sm">
          <h3 className="text-xl font-heading font-normal text-foreground mb-8 flex items-center gap-3">
             <Calendar className="w-5 h-5 text-primary" />
             Available Recurring Slots
          </h3>

          {slots.length === 0 ? (
            <div className="text-center py-6 md:py-12 px-6 bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant/30">
               <p className="text-muted-foreground italic">No availability slots found for this therapist.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {DAYS.map((day, dayIdx) => {
                const daySlots = slots.filter(s => s.dayOfWeek === dayIdx);
                if (daySlots.length === 0) return null;
                
                return (
                  <div key={day} className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary/40 pl-2">{day}s</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {daySlots.map((slot) => {
                        const booked = isSlotBookedForNextDate(slot);
                        return (
                          <button
                            key={slot.id}
                            disabled={booked}
                            onClick={() => setSelectedSlot(slot)}
                            className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all duration-300 group ${
                              booked 
                                ? "bg-slate-100 border-slate-200 cursor-not-allowed opacity-60" 
                                : selectedSlot?.id === slot.id 
                                  ? "bg-primary border-primary shadow-xl shadow-primary/20 -translate-y-1" 
                                  : "bg-surface-container-lowest border-outline-variant/20 hover:border-primary/40 hover:bg-white"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl transition-colors ${
                                booked ? "bg-slate-200 text-slate-500" : selectedSlot?.id === slot.id ? "bg-white/20 text-white" : "bg-primary/5 text-primary"
                              }`}>
                                <Clock className="w-4 h-4" />
                              </div>
                              <span className={`font-semibold ${booked ? "text-slate-500" : selectedSlot?.id === slot.id ? "text-white" : "text-foreground"}`}>
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </div>
                            {booked && <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Booked</span>}
                            {selectedSlot?.id === slot.id && !booked && <CheckCircle2 className="w-5 h-5 text-white animate-in zoom-in" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-8 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 md:p-8 shadow-xl shadow-primary/5">
           <h3 className="text-lg font-heading font-medium text-foreground mb-6">Booking Summary</h3>
           
           <div className="space-y-6 mb-8">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {therapist.firstName?.[0]}{therapist.lastName?.[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Dr. {therapist.firstName} {therapist.lastName}</p>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Selected Expert</p>
                </div>
             </div>

             {selectedSlot ? (
               <div className="p-5 bg-primary/5 border border-primary/10 rounded-2xl animate-in fade-in duration-500">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Selected Time</p>
                  <p className="text-sm font-medium text-foreground">Every {DAYS[selectedSlot.dayOfWeek]}</p>
                  <p className="text-lg font-bold text-primary">{selectedSlot.startTime} (IST)</p>
               </div>
             ) : (
               <div className="p-5 md:p-10 border-2 border-dashed border-outline-variant/30 rounded-2xl text-center">
                 <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground italic">Select a slot</p>
               </div>
             )}
           </div>

           {error && (
             <div className="mb-6 p-4 bg-error-container text-error rounded-xl flex items-center gap-3 text-xs font-medium animate-in shake-in">
               <AlertCircle className="w-4 h-4 flex-shrink-0" />
               {error}
             </div>
           )}

           <button
             disabled={!selectedSlot || loading}
             onClick={handleBook}
             className={`w-full py-5 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 ${
               !selectedSlot || loading 
               ? "bg-outline-variant/30 text-muted-foreground cursor-not-allowed" 
               : "bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-1 active:scale-95"
             }`}
           >
             {loading ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
             ) : (
               <>
                 Confirm Booking
                 <ArrowRight className="w-4 h-4" />
               </>
             )}
           </button>
           
           <p className="mt-6 text-xs text-center text-muted-foreground/60 leading-relaxed uppercase tracking-widest px-4 font-bold">
             By booking, you agree to our clinical consultation terms and 24h grace period.
           </p>
        </div>
      </div>
    </div>
  );
}
