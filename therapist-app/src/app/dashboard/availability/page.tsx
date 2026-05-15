"use client";

import { useState, useEffect } from "react";
import { Clock, Calendar, Save, Monitor, Building2, Check, X, Lock } from "lucide-react";
import { api } from "@/lib/api";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const HOURS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
];

interface AvailabilitySlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  mode: "ONLINE" | "IN_CLINIC";
  therapistId: string;
  isActive: boolean;
}

interface Appointment {
  id: string;
  slot?: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  };
  mode: "ONLINE" | "IN_CLINIC";
  scheduledAt: string | Date;
}

export default function AvailabilityPage() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<"ONLINE" | "IN_CLINIC">("ONLINE");
  const [selectedGridSlots, setSelectedGridSlots] = useState<string[]>([]);
  const [initialGridSlots, setInitialGridSlots] = useState<string[]>([]);

  useEffect(() => {
    fetchSlots();
    fetchAppointments();
  }, []);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const data = await api.availability.getMySlots();
      const slotsData = Array.isArray(data) ? data : [];
      setSlots(slotsData);
      
      const keys = slotsData.map((s: AvailabilitySlot) => `${s.dayOfWeek}-${s.startTime}-${s.mode}`);
      setSelectedGridSlots(keys);
      setInitialGridSlots(keys);
    } catch (error) {
      console.error("Failed to fetch slots", error);
      setError("Failed to fetch availability slots");
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const data = await api.sessions.upcoming();
      const appointmentsData = Array.isArray(data) ? data : [];
      setAppointments(appointmentsData);
    } catch (error) {
      console.error("Failed to fetch appointments", error);
    }
  };

  const toggleSlot = (dayIdx: number, hour: string) => {
    const key = `${dayIdx}-${hour}-${activeMode}`;
    setSelectedGridSlots((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const selectDay = (dayIdx: number) => {
    const keysForDay = HOURS.map((hour) => `${dayIdx}-${hour}-${activeMode}`);
    const allSelected = keysForDay.every((key) => selectedGridSlots.includes(key));

    if (allSelected) {
      // Deselect all for this day
      setSelectedGridSlots((prev) =>
        prev.filter((key) => !keysForDay.includes(key))
      );
    } else {
      // Select all for this day
      setSelectedGridSlots((prev) => {
        const newKeys = [...prev];
        keysForDay.forEach((key) => {
          if (!newKeys.includes(key)) {
            newKeys.push(key);
          }
        });
        return newKeys;
      });
    }
  };

  const selectHour = (hour: string) => {
    const keysForHour = DAYS.map((_, dayIdx) => `${dayIdx}-${hour}-${activeMode}`);
    const allSelected = keysForHour.every((key) => selectedGridSlots.includes(key));

    if (allSelected) {
      // Deselect all for this hour
      setSelectedGridSlots((prev) =>
        prev.filter((key) => !keysForHour.includes(key))
      );
    } else {
      // Select all for this hour
      setSelectedGridSlots((prev) => {
        const newKeys = [...prev];
        keysForHour.forEach((key) => {
          if (!newKeys.includes(key)) {
            newKeys.push(key);
          }
        });
        return newKeys;
      });
    }
  };

  const clearAll = () => {
    setSelectedGridSlots((prev) =>
      prev.filter((k) => !k.endsWith(`-${activeMode}`))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const toCreate = selectedGridSlots.filter((k) => !initialGridSlots.includes(k));
      const toDelete = initialGridSlots.filter((k) => !selectedGridSlots.includes(k));

      const createData = toCreate.map((key) => {
        const [day, hour, mode] = key.split("-");
        const startH = parseInt(hour.split(":")[0]);
        const endH = startH + 1;
        const endTime = `${endH.toString().padStart(2, "0")}:00`;
        return {
          dayOfWeek: parseInt(day),
          startTime: hour,
          endTime: endTime,
          mode: mode as "ONLINE" | "IN_CLINIC",
        };
      });

      const deleteIds = toDelete.map((key) => {
        const [day, hour, mode] = key.split("-");
        const originalSlot = slots.find(
          (s) =>
            s.dayOfWeek === parseInt(day) &&
            s.startTime === hour &&
            s.mode === mode
        );
        return originalSlot?.id;
      }).filter(Boolean) as string[];

      await api.availability.bulkUpdate({
        create: createData,
        delete: deleteIds,
      });
      
      await fetchSlots();
      alert("Availability saved successfully!");
    } catch (err: unknown) {
      console.error("Failed to save availability", err);
      const error = err as Error;
      setError(error.message || "Failed to save availability");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = 
    selectedGridSlots.length !== initialGridSlots.length ||
    selectedGridSlots.some(k => !initialGridSlots.includes(k)) ||
    initialGridSlots.some(k => !selectedGridSlots.includes(k));

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-6">
        <div className="flex items-center gap-4">
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
        
        <div className="flex items-center gap-3">
          <button
            onClick={clearAll}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-slate-50 rounded-xl transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all shadow-lg hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none ${
              hasChanges 
                ? "bg-primary text-white shadow-primary/20 hover:bg-primary/90" 
                : "bg-slate-100 text-slate-400 shadow-none"
            }`}
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Mode Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-surface-container-low p-1 rounded-2xl border border-outline-variant/30 flex gap-1">
          <button
            onClick={() => setActiveMode("ONLINE")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
              activeMode === "ONLINE"
                ? "bg-white text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Monitor className="w-4 h-4" />
            Online Slots
          </button>
          <button
            onClick={() => setActiveMode("IN_CLINIC")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
              activeMode === "IN_CLINIC"
                ? "bg-white text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Building2 className="w-4 h-4" />
            In-Clinic Slots
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mb-6 text-xs font-medium text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-slate-100 border border-slate-200 rounded-full" />
          <span>Booked (Locked)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 border-2 border-slate-200 rounded-full" />
          <span>Available to Select</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="bg-white border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="border-b border-r border-outline-variant/20 p-4 text-xs font-bold text-muted-foreground/60 uppercase tracking-widest text-left w-24">
                    Time
                  </th>
                  {DAYS.map((day, dayIdx) => (
                    <th
                      key={day}
                      className="border-b border-r border-outline-variant/20 p-4 text-xs font-bold text-muted-foreground/60 uppercase tracking-widest text-center cursor-pointer hover:bg-slate-50"
                      onClick={() => selectDay(dayIdx)}
                      title={`Toggle all slots for ${day}`}
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((hour) => (
                  <tr key={hour} className="hover:bg-slate-50/20 transition-colors">
                    <td 
                      className="border-b border-r border-outline-variant/20 p-4 text-sm font-semibold text-foreground bg-slate-50/10 cursor-pointer hover:bg-slate-50"
                      onClick={() => selectHour(hour)}
                      title={`Toggle all slots for ${hour}`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground/60" />
                        {hour}
                      </div>
                    </td>
                    {DAYS.map((_, dayIdx) => {
                      const key = `${dayIdx}-${hour}-${activeMode}`;
                      const isSelected = selectedGridSlots.includes(key);
                      const isBooked = appointments.some((app) => 
                        app.slot?.dayOfWeek === dayIdx && 
                        app.slot?.startTime === hour && 
                        app.mode === activeMode
                      );

                      return (
                        <td
                          key={dayIdx}
                          className={`border-b border-r border-outline-variant/20 p-2 transition-all relative ${
                            isBooked
                              ? "bg-slate-100 cursor-not-allowed"
                              : isSelected
                              ? "bg-primary/5 hover:bg-primary/10 cursor-pointer"
                              : "hover:bg-primary/5 hover:opacity-75 cursor-pointer"
                          }`}
                          onClick={() => {
                            if (!isBooked) {
                              toggleSlot(dayIdx, hour);
                            }
                          }}
                        >
                          <div className="flex justify-center items-center h-12">
                            {isBooked ? (
                              <div className="text-xs font-bold text-muted-foreground/60 flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                Booked
                              </div>
                            ) : isSelected ? (
                              <div className="bg-primary text-white p-1 rounded-full animate-in zoom-in duration-200">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            ) : (
                              <div className="w-3.5 h-3.5 border-2 border-slate-200 rounded-full group-hover:border-primary/30 transition-colors" />
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
