"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Plus, Trash2, Calendar, Save, Monitor, Building2, ChevronDown } from "lucide-react";
import { api } from "@/lib/api";
import { availabilitySchema, type AvailabilityValues } from "@/lib/validations";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type ConsultationMode = "ONLINE" | "IN_CLINIC";

export default function AvailabilityPage() {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dayDropdownOpen, setDayDropdownOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AvailabilityValues>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "10:00",
      mode: "ONLINE",
    },
  });

  const selectedMode = watch("mode");
  const selectedDay = watch("dayOfWeek");

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const data = await api.availability.getMySlots();
      setSlots(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch slots", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: AvailabilityValues) => {
    setAdding(true);
    setError(null);
    try {
      await api.availability.createSlot(data);
      reset({ ...data }); // Reset but keep the mode/day for convenience
      fetchSlots();
    } catch (err: any) {
      setError(err.message || "Failed to add slot");
    } finally {
      setAdding(false);
      const scrollContainer = document.getElementById('main-content-area');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleDeleteSlot = async (id: string) => {
    try {
      await api.availability.deleteSlot(id);
      fetchSlots();
    } catch (error) {
      console.error("Failed to delete slot", error);
    }
  };

  const onlineSlots = slots.filter((s) => s.mode === "ONLINE");
  const clinicSlots = slots.filter((s) => s.mode === "IN_CLINIC");

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-6">
        <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-2xl text-primary">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-medium text-foreground">Availability</h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Manage your recurring weekly availability for online and in-clinic sessions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Add New Slot Panel ───────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm sticky top-8">
            <h2 className="text-base font-bold text-foreground mb-5 flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              Add New Slot
            </h2>

            <div className="space-y-5">
              {/* Mode Toggle */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                  Session Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setValue("mode", "ONLINE", { shouldValidate: true })}
                    className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] border-2 transition-all duration-300 relative group ${
                      selectedMode === "ONLINE"
                        ? "bg-primary/5 border-primary text-primary shadow-xl shadow-primary/10"
                        : "bg-white border-slate-100 text-slate-400 hover:border-primary/30 hover:text-primary/60"
                    }`}
                  >
                    {selectedMode === "ONLINE" && (
                      <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full" />
                    )}
                    <Monitor className={`w-8 h-8 transition-transform group-hover:scale-110 ${selectedMode === "ONLINE" ? "text-primary" : "text-slate-300"}`} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Online</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue("mode", "IN_CLINIC", { shouldValidate: true })}
                    className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] border-2 transition-all duration-300 relative group ${
                      selectedMode === "IN_CLINIC"
                        ? "bg-primary/5 border-primary text-primary shadow-xl shadow-primary/10"
                        : "bg-white border-slate-100 text-slate-400 hover:border-primary/30 hover:text-primary/60"
                    }`}
                  >
                    {selectedMode === "IN_CLINIC" && (
                      <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full" />
                    )}
                    <Building2 className={`w-8 h-8 transition-transform group-hover:scale-110 ${selectedMode === "IN_CLINIC" ? "text-primary" : "text-slate-300"}`} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">In-Clinic</span>
                  </button>
                </div>
              </div>

              {/* Day */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                  Day of Week
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDayDropdownOpen(!dayDropdownOpen)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm flex items-center justify-between focus:ring-2 focus:ring-primary/30 outline-none transition-all hover:border-primary/30"
                  >
                    <span className="font-medium text-foreground">{DAYS[selectedDay]}</span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${dayDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {dayDropdownOpen && (
                    <>
                      {/* Backdrop for closing */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setDayDropdownOpen(false)} 
                      />
                      <div className="absolute z-50 w-full mt-2 bg-white border border-outline-variant/30 rounded-xl shadow-2xl shadow-primary/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {DAYS.map((day, idx) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              setValue("dayOfWeek", idx, { shouldValidate: true });
                              setDayDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-left text-sm transition-all flex items-center justify-between group ${
                              selectedDay === idx 
                                ? 'bg-primary/5 text-primary font-bold' 
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {day}
                            {selectedDay === idx && <div className="w-1.5 h-1.5 bg-primary rounded-full" />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                    Start
                  </label>
                  <input
                    type="time"
                    className={`w-full bg-surface-container-low border rounded-xl px-3 py-2.5 text-sm outline-none transition-all ${
                      errors.startTime ? 'border-red-500' : 'border-outline-variant/30 focus:ring-2 focus:ring-primary/30'
                    }`}
                    {...register("startTime")}
                  />
                  {errors.startTime && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.startTime.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                    End
                  </label>
                  <input
                    type="time"
                    className={`w-full bg-surface-container-low border rounded-xl px-3 py-2.5 text-sm outline-none transition-all ${
                      errors.endTime ? 'border-red-500' : 'border-outline-variant/30 focus:ring-2 focus:ring-primary/30'
                    }`}
                    {...register("endTime")}
                  />
                  {errors.endTime && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.endTime.message}</p>}
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              <button
                id="add-availability-slot-btn"
                onClick={handleSubmit(onSubmit)}
                disabled={adding}
                className={`w-full py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-white ${
                  selectedMode === "IN_CLINIC"
                    ? "bg-primary hover:bg-primary/90 shadow-primary/20"
                    : "bg-primary shadow-primary/20 hover:bg-primary/90"
                }`}
              >
                {adding ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {selectedMode === "IN_CLINIC" ? "Save In-Clinic Slot" : "Save Online Slot"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Slots List ───────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-20 bg-surface-container-low/30 rounded-2xl border-2 border-dashed border-outline-variant/30">
              <Calendar className="w-12 h-12 text-primary/10 mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">No availability slots added yet.</p>
              <p className="text-muted-foreground/60 text-xs mt-2">Add your first online or in-clinic slot using the panel on the left.</p>
            </div>
          ) : (
            <>
              {/* Online Slots */}
              {onlineSlots.length > 0 && (
                <SlotSection
                  title="Online Consultation"
                  icon={<Monitor className="w-4 h-4" />}
                  slots={onlineSlots}
                  badgeClass="bg-primary/10 text-primary border-primary/20"
                  iconBgClass="bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white"
                  onDelete={handleDeleteSlot}
                />
              )}

              {/* In-Clinic Slots */}
              {clinicSlots.length > 0 && (
                <SlotSection
                  title="In-Clinic Visits"
                  icon={<Building2 className="w-4 h-4" />}
                  slots={clinicSlots}
                  badgeClass="bg-primary/5 text-primary border-primary/20"
                  iconBgClass="bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white"
                  onDelete={handleDeleteSlot}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SlotSection({
  title,
  icon,
  slots,
  badgeClass,
  iconBgClass,
  onDelete,
}: {
  title: string;
  icon: React.ReactNode;
  slots: any[];
  badgeClass: string;
  iconBgClass: string;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
      <h2 className="text-base font-bold text-foreground mb-5 flex items-center gap-2">
        <span className={`p-1.5 rounded-lg ${badgeClass} border`}>{icon}</span>
        {title}
        <span className="ml-auto text-xs font-bold text-muted-foreground/60 bg-surface-container-low px-3 py-1 rounded-full">
          {slots.length} slot{slots.length !== 1 ? "s" : ""}
        </span>
      </h2>
      <div className="space-y-4">
        {DAYS.map((day, dayIdx) => {
          const daySlots = slots.filter((s) => s.dayOfWeek === dayIdx);
          if (daySlots.length === 0) return null;
          return (
            <div key={day} className="space-y-2">
              <h3 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">{day}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {daySlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between bg-surface-container-low/50 border border-outline-variant/20 rounded-xl p-4 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl transition-colors ${iconBgClass}`}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-sm text-foreground">
                          {slot.startTime} – {slot.endTime}
                        </span>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mt-0.5">
                          {day}s (recurring)
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onDelete(slot.id)}
                      className="p-2 text-muted-foreground/30 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
