"use client";

import { useState, useEffect, useMemo } from "react";
import { Clock, Calendar, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, CreditCard, Monitor, Building2, MapPin, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import MockPaymentModal from "./MockPaymentModal";

type ConsultationMode = "ONLINE" | "IN_CLINIC";

interface TimeSlot {
  startTime: string;   // "HH:mm" UTC
  endTime: string;     // "HH:mm" UTC
  startUtc: string;    // ISO 8601
  endUtc: string;      // ISO 8601
  mode: ConsultationMode;
  available: boolean;
}

interface ScheduleDay {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  mode: ConsultationMode;
  isActive: boolean;
}

export default function SlotSelectionClient({ therapist }: { therapist: any }) {
  const [selectedMode, setSelectedMode] = useState<ConsultationMode>("ONLINE");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const clinicAddress = therapist.clinicAddress;

  // Fetch the weekly schedule on mount to know which days have availability
  useEffect(() => {
    async function fetchSchedule() {
      setLoadingSchedule(true);
      try {
        const data = await api.availability.getTherapistSchedule(therapist.id);
        setSchedule(Array.isArray(data) ? data : []);
      } catch {
        setSchedule([]);
      } finally {
        setLoadingSchedule(false);
      }
    }
    fetchSchedule();
  }, [therapist.id]);

  // Fetch slots when date changes
  useEffect(() => {
    if (!selectedDate) return;
    
    async function fetchSlots() {
      setLoadingSlots(true);
      setSelectedSlot(null);
      setError(null);
      try {
        const data = await api.availability.getTherapistSlots(therapist.id, selectedDate);
        setSlots(Array.isArray(data) ? data : []);
      } catch {
        setSlots([]);
        setError("Could not load slots. Please try another date.");
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [therapist.id, selectedDate]);

  // Filter slots by mode
  const onlineSlots = slots.filter((s) => s.mode === "ONLINE");
  const clinicSlots = slots.filter((s) => s.mode === "IN_CLINIC");
  const activeSlots = selectedMode === "ONLINE" ? onlineSlots : clinicSlots;
  const availableActiveSlots = activeSlots.filter((s) => s.available);

  const hasOnline = onlineSlots.length > 0;
  const hasClinic = clinicSlots.length > 0;

  // Determine which days of the week have availability (from the schedule)
  const availableDays = useMemo(() => {
    const days = new Set<number>();
    schedule.forEach(s => {
      if (s.isActive) days.add(s.dayOfWeek);
    });
    return days;
  }, [schedule]);

  const handleModeSelect = (mode: ConsultationMode) => {
    setSelectedMode(mode);
    setSelectedSlot(null);
  };

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedSlot(null);
  };

  const handleProceedToPayment = async () => {
    if (!selectedSlot || !selectedDate) return;

    setLoadingOrder(true);
    setError(null);

    try {
      const order = await api.payments.createOrder({
        therapistId: therapist.id,
        scheduledAt: selectedSlot.startUtc,
        notes: "Booking from patient portal",
        mode: selectedMode,
      });

      setOrderData({
        ...order,
        therapistId: therapist.id,
        scheduledAt: selectedSlot.startUtc,
        mode: selectedMode,
        clinicAddress,
      });
    } catch (err: any) {
      setError(err.message || "Could not initiate payment. Please try again.");
    } finally {
      setLoadingOrder(false);
    }
  };

  // ─── Calendar Helpers ───────────────────────────────────────────────
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }
  function getFirstDayOfWeek(year: number, month: number) {
    return new Date(year, month, 1).getDay();
  }
  function formatDateStr(year: number, month: number, day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const DAY_HEADERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const daysInMonth = getDaysInMonth(calendarMonth.year, calendarMonth.month);
  const firstDayOffset = getFirstDayOfWeek(calendarMonth.year, calendarMonth.month);

  const canGoPrev = calendarMonth.year > today.getFullYear() || calendarMonth.month > today.getMonth();

  const isDayAvailable = (day: number) => {
    const date = new Date(calendarMonth.year, calendarMonth.month, day);
    const dateStr = formatDateStr(calendarMonth.year, calendarMonth.month, day);
    if (dateStr < todayStr) return false;
    if (dateStr === todayStr) return true; // today is always selectable if schedule matches
    return availableDays.has(date.getDay());
  };

  // Format selected date for display
  const selectedDateDisplay = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric"
      })
    : null;

  // Convert UTC time to IST for display
  const formatSlotTime = (utcIso: string) => {
    return new Date(utcIso).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  return (
    <>
      {/* Mock Payment Modal */}
      {orderData && (
        <MockPaymentModal
          orderData={orderData}
          onClose={() => {
            setOrderData(null);
            setError(null);
          }}
        />
      )}

      <div className="space-y-8">
        {/* ── Mode Selector ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ModeCard
            id="mode-online"
            mode="ONLINE"
            selected={selectedMode === "ONLINE"}
            available={!selectedDate || hasOnline || onlineSlots.length === 0}
            slotCount={availableActiveSlots.length}
            isSlotMode={selectedMode === "ONLINE"}
            onClick={() => handleModeSelect("ONLINE")}
          />
          <ModeCard
            id="mode-in-clinic"
            mode="IN_CLINIC"
            selected={selectedMode === "IN_CLINIC"}
            available={!selectedDate || hasClinic || clinicSlots.length === 0}
            slotCount={selectedMode === "IN_CLINIC" ? availableActiveSlots.length : clinicSlots.filter(s => s.available).length}
            isSlotMode={selectedMode === "IN_CLINIC"}
            clinicAddress={clinicAddress}
            onClick={() => handleModeSelect("IN_CLINIC")}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ── Calendar + Slot Grid ───────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date Picker Calendar */}
            <div className="bg-surface-container-low/30 backdrop-blur-sm border border-outline-variant/20 rounded-xl p-5 md:p-8 shadow-sm">
              <h3 className="text-xl font-heading font-normal text-foreground mb-6 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                Select a Date
              </h3>

              {loadingSchedule ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  <span className="ml-3 text-sm text-muted-foreground">Loading schedule…</span>
                </div>
              ) : (
                <div>
                  {/* Calendar Month Navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      disabled={!canGoPrev}
                      onClick={() => {
                        setCalendarMonth(prev => {
                          if (prev.month === 0) return { year: prev.year - 1, month: 11 };
                          return { ...prev, month: prev.month - 1 };
                        });
                      }}
                      className="p-2 rounded-lg hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <p className="text-sm font-bold uppercase tracking-widest text-foreground">
                      {MONTH_NAMES[calendarMonth.month]} {calendarMonth.year}
                    </p>
                    <button
                      onClick={() => {
                        setCalendarMonth(prev => {
                          if (prev.month === 11) return { year: prev.year + 1, month: 0 };
                          return { ...prev, month: prev.month + 1 };
                        });
                      }}
                      className="p-2 rounded-lg hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Day-of-week headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {DAY_HEADERS.map(d => (
                      <div key={d} className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 py-2">
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells for offset */}
                    {Array.from({ length: firstDayOffset }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    {/* Day cells */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dateStr = formatDateStr(calendarMonth.year, calendarMonth.month, day);
                      const isPast = dateStr < todayStr;
                      const isToday = dateStr === todayStr;
                      const isSelected = dateStr === selectedDate;
                      const hasAvail = isDayAvailable(day);

                      return (
                        <button
                          key={day}
                          disabled={isPast || !hasAvail}
                          onClick={() => handleDateSelect(dateStr)}
                          className={`relative aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 ${
                            isPast
                              ? "text-muted-foreground/20 cursor-not-allowed"
                              : !hasAvail
                              ? "text-muted-foreground/30 cursor-not-allowed"
                              : isSelected
                              ? "bg-primary text-white shadow-lg shadow-primary/20 -translate-y-0.5 font-bold"
                              : isToday
                              ? "bg-primary/10 text-primary font-bold hover:bg-primary/20 border border-primary/20"
                              : "text-foreground hover:bg-primary/5 hover:text-primary"
                          }`}
                        >
                          {day}
                          {hasAvail && !isPast && !isSelected && (
                            <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary/40" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {availableDays.size === 0 && (
                    <p className="text-center text-sm text-muted-foreground/60 mt-6 italic">
                      This therapist hasn't set up their availability schedule yet.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Slot Grid (appears after date selection) */}
            {selectedDate && (
              <div className="bg-surface-container-low/30 backdrop-blur-sm border border-outline-variant/20 rounded-xl p-5 md:p-10 shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-500">
                <h3 className="text-xl font-heading font-normal text-foreground mb-2 flex items-center gap-3">
                  {selectedMode === "ONLINE" ? (
                    <Monitor className="w-5 h-5 text-primary" />
                  ) : (
                    <Building2 className="w-5 h-5 text-primary" />
                  )}
                  {selectedMode === "ONLINE" ? "Online" : "In-Clinic"} Slots
                </h3>
                <p className="text-sm text-muted-foreground mb-8">{selectedDateDisplay}</p>

                {loadingSlots ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    <span className="ml-3 text-sm text-muted-foreground">Loading available slots…</span>
                  </div>
                ) : activeSlots.length === 0 ? (
                  <div className="text-center py-6 md:py-12 px-6 bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant/30">
                    {selectedMode === "IN_CLINIC" ? (
                      <>
                        <Building2 className="w-10 h-10 text-primary/20 mx-auto mb-3" />
                        <p className="text-muted-foreground italic text-sm">
                          No in-clinic slots available on this date.
                        </p>
                        <p className="text-muted-foreground/60 text-xs mt-2">
                          Try online consultation or pick another date.
                        </p>
                      </>
                    ) : (
                      <>
                        <Monitor className="w-10 h-10 text-primary/20 mx-auto mb-3" />
                        <p className="text-muted-foreground italic text-sm">
                          No online slots available on this date.
                        </p>
                        <p className="text-muted-foreground/60 text-xs mt-2">
                          Try another date or check in-clinic availability.
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {activeSlots.map((slot, idx) => {
                      const isSelected = selectedSlot?.startUtc === slot.startUtc && selectedSlot?.mode === slot.mode;
                      const isUnavailable = !slot.available;
                      const isClinic = selectedMode === "IN_CLINIC";

                      return (
                        <button
                          key={`${slot.startUtc}-${slot.mode}-${idx}`}
                          disabled={isUnavailable}
                          onClick={() => setSelectedSlot(slot)}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 group ${
                            isUnavailable
                              ? "bg-slate-100 border-slate-200 cursor-not-allowed opacity-60"
                              : isSelected
                              ? "bg-primary border-primary shadow-xl shadow-primary/20 -translate-y-1"
                              : isClinic
                              ? "bg-surface-container-lowest border-outline-variant/20 hover:border-primary/40 hover:bg-primary/5"
                              : "bg-surface-container-lowest border-outline-variant/20 hover:border-primary/40 hover:bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl transition-colors ${
                              isUnavailable
                                ? "bg-slate-200 text-slate-500"
                                : isSelected
                                ? "bg-white/20 text-white"
                                : "bg-primary/5 text-primary"
                            }`}>
                              <Clock className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col items-start">
                              <span className={`font-semibold text-sm ${
                                isUnavailable
                                  ? "text-slate-500"
                                  : isSelected
                                  ? "text-white"
                                  : "text-foreground"
                              }`}>
                                {formatSlotTime(slot.startUtc)}
                              </span>
                              {isUnavailable && (
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                                  Booked
                                </span>
                              )}
                            </div>
                          </div>
                          {isSelected && !isUnavailable && (
                            <CheckCircle2 className="w-5 h-5 text-white animate-in zoom-in" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Booking Summary Sidebar ───────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 md:p-8 shadow-xl shadow-primary/5">
              <h3 className="text-lg font-heading font-medium text-foreground mb-6">Booking Summary</h3>

              <div className="space-y-6 mb-8">
                {/* Therapist info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {therapist.firstName?.[0]}{therapist.lastName?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {therapist.firstName} {therapist.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Selected Expert</p>
                  </div>
                </div>

                {/* Visit Type */}
                <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
                  selectedMode === "IN_CLINIC"
                    ? "bg-primary/5 border-primary/20"
                    : "bg-primary/5 border-primary/10"
                }`}>
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    {selectedMode === "IN_CLINIC" ? <Building2 className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Visit Type</p>
                    <p className="text-sm font-semibold text-primary">
                      {selectedMode === "IN_CLINIC" ? "In-Clinic Visit" : "Online Consultation"}
                    </p>
                  </div>
                </div>

                {/* Clinic address (shown only for in-clinic) */}
                {selectedMode === "IN_CLINIC" && clinicAddress && (
                  <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-start gap-3 animate-in fade-in duration-300">
                    <MapPin className="w-4 h-4 text-primary/70 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-1">Clinic Location</p>
                      <p className="text-sm text-foreground font-medium leading-snug">{clinicAddress}</p>
                    </div>
                  </div>
                )}

                {/* Selected date */}
                {selectedDate && (
                  <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl animate-in fade-in duration-300">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-1">Selected Date</p>
                    <p className="text-sm text-foreground font-medium">{selectedDateDisplay}</p>
                  </div>
                )}

                {/* Selected slot */}
                {selectedSlot ? (
                  <div className={`p-5 rounded-2xl animate-in fade-in duration-500 border ${
                    selectedMode === "IN_CLINIC"
                      ? "bg-primary/5 border-primary/20"
                      : "bg-primary/5 border-primary/10"
                  }`}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-2 text-primary">Selected Time</p>
                    <p className="text-lg font-bold text-primary">
                      {formatSlotTime(selectedSlot.startUtc)} – {formatSlotTime(selectedSlot.endUtc)}
                    </p>
                  </div>
                ) : (
                  <div className="p-5 md:p-10 border-2 border-dashed border-outline-variant/30 rounded-2xl text-center">
                    <Calendar className="w-6 h-6 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground italic">
                      {selectedDate ? "Select a time slot" : "Select a date first"}
                    </p>
                  </div>
                )}

                {/* Amount */}
                {selectedSlot && (
                  <div className="flex items-center justify-between px-2 animate-in fade-in duration-500">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Session Fee</p>
                    <p className="text-lg font-heading font-medium text-primary">
                      ₹{therapist.hourlyRate?.toLocaleString("en-IN") ?? "1,500"}
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-xs font-medium animate-in fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                id="proceed-to-payment-btn"
                disabled={!selectedSlot || loadingOrder}
                onClick={handleProceedToPayment}
                className={`w-full py-5 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 ${
                  !selectedSlot || loadingOrder
                    ? "bg-outline-variant/30 text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-1 active:scale-95"
                }`}
              >
                {loadingOrder ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Proceed to Payment
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="mt-6 text-xs text-center text-muted-foreground/60 leading-relaxed uppercase tracking-widest px-4 font-bold">
                Secure payment • 256-bit SSL • No real charge in dev mode
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ModeCard({
  id,
  mode,
  selected,
  available,
  slotCount,
  isSlotMode,
  clinicAddress,
  onClick,
}: {
  id: string;
  mode: ConsultationMode;
  selected: boolean;
  available: boolean;
  slotCount: number;
  isSlotMode: boolean;
  clinicAddress?: string;
  onClick: () => void;
}) {
  const isClinic = mode === "IN_CLINIC";

  return (
    <button
      id={id}
      onClick={onClick}
      className={`relative flex items-start gap-4 p-6 rounded-2xl border-2 text-left transition-all duration-300 w-full group ${
        selected
          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
          : "border-outline-variant/20 bg-surface-container-lowest hover:border-primary/30 hover:shadow-md"
      }`}
    >
      <div className={`p-3 rounded-xl flex-shrink-0 transition-colors ${
        selected
          ? "bg-primary text-primary-foreground"
          : "bg-surface-container-low text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
      }`}>
        {isClinic ? <Building2 className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-bold text-sm tracking-tight mb-1 ${
          selected ? "text-primary" : "text-foreground"
        }`}>
          {isClinic ? "In-Clinic Visit" : "Online Consultation"}
        </p>
        <p className="text-xs text-muted-foreground leading-snug">
          {isClinic
            ? clinicAddress || "Visit the therapist's clinic"
            : "Video call from anywhere"}
        </p>
      </div>
      {selected && (
        <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-primary" />
      )}
    </button>
  );
}
