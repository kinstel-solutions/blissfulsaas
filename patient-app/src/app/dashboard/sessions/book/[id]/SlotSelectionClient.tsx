"use client";

import { useState } from "react";
import { Clock, Calendar, ArrowRight, CheckCircle2, AlertCircle, CreditCard, Monitor, Building2, MapPin } from "lucide-react";
import { api } from "@/lib/api";
import MockPaymentModal from "./MockPaymentModal";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type ConsultationMode = "ONLINE" | "IN_CLINIC";

export default function SlotSelectionClient({ therapist, slots }: { therapist: any; slots: any[] }) {
  const [selectedMode, setSelectedMode] = useState<ConsultationMode>("ONLINE");
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);

  const clinicAddress = therapist.clinicAddress || slots.find(s => s.therapist?.clinicAddress)?.therapist?.clinicAddress;

  const onlineSlots = slots.filter((s) => s.mode === "ONLINE" || !s.mode);
  const clinicSlots = slots.filter((s) => s.mode === "IN_CLINIC");
  const activeSlots = selectedMode === "ONLINE" ? onlineSlots : clinicSlots;

  const hasOnline = onlineSlots.length > 0;
  const hasClinic = clinicSlots.length > 0;

  const getNextOccurrence = (dayOfWeek: number, startTime: string) => {
    const today = new Date();
    const currentDay = today.getDay();
    let daysUntil = (dayOfWeek - currentDay + 7) % 7;
    if (daysUntil === 0) daysUntil = 7;

    const date = new Date();
    date.setDate(today.getDate() + daysUntil);
    const [hours, minutes] = startTime.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const isSlotBookedForNextDate = (slot: any) => {
    const nextDate = getNextOccurrence(slot.dayOfWeek, slot.startTime);
    return slot.appointments?.some((appt: any) => {
      const apptDate = new Date(appt.scheduledAt);
      return (
        apptDate.getTime() === nextDate.getTime() &&
        ["PENDING", "CONFIRMED"].includes(appt.status)
      );
    });
  };

  const handleModeSelect = (mode: ConsultationMode) => {
    setSelectedMode(mode);
    setSelectedSlot(null); // reset slot on mode change
  };

  const handleProceedToPayment = async () => {
    if (!selectedSlot) return;

    setLoadingOrder(true);
    setError(null);

    try {
      const targetDay = selectedSlot.dayOfWeek;
      const today = new Date();
      const currentDay = today.getDay();
      let daysUntil = (targetDay - currentDay + 7) % 7;
      if (daysUntil === 0) daysUntil = 7;

      const bookingDate = new Date();
      bookingDate.setDate(today.getDate() + daysUntil);
      bookingDate.setHours(
        parseInt(selectedSlot.startTime.split(":")[0]),
        parseInt(selectedSlot.startTime.split(":")[1]),
        0,
        0
      );

      const order = await api.payments.createOrder({
        slotId: selectedSlot.id,
        date: bookingDate.toISOString(),
        notes: "Booking from patient portal",
        mode: selectedMode,
      });

      setOrderData({ ...order, mode: selectedMode, clinicAddress });
    } catch (err: any) {
      setError(err.message || "Could not initiate payment. Please try again.");
    } finally {
      setLoadingOrder(false);
    }
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
            available={hasOnline}
            slotCount={onlineSlots.length}
            onClick={() => handleModeSelect("ONLINE")}
          />
          <ModeCard
            id="mode-in-clinic"
            mode="IN_CLINIC"
            selected={selectedMode === "IN_CLINIC"}
            available={hasClinic}
            slotCount={clinicSlots.length}
            clinicAddress={clinicAddress}
            onClick={() => handleModeSelect("IN_CLINIC")}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ── Slot Grid ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface-container-low/30 backdrop-blur-sm border border-outline-variant/20 rounded-xl p-5 md:p-10 shadow-sm">
              <h3 className="text-xl font-heading font-normal text-foreground mb-8 flex items-center gap-3">
                {selectedMode === "ONLINE" ? (
                  <Monitor className="w-5 h-5 text-primary" />
                ) : (
                  <Building2 className="w-5 h-5 text-primary" />
                )}
                {selectedMode === "ONLINE" ? "Online" : "In-Clinic"} Available Slots
              </h3>

              {activeSlots.length === 0 ? (
                <div className="text-center py-6 md:py-12 px-6 bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant/30">
                  {selectedMode === "IN_CLINIC" ? (
                    <>
                      <Building2 className="w-10 h-10 text-primary/20 mx-auto mb-3" />
                      <p className="text-muted-foreground italic text-sm">
                        This therapist has no in-clinic slots available.
                      </p>
                      <p className="text-muted-foreground/60 text-xs mt-2">
                        Try online consultation instead.
                      </p>
                    </>
                  ) : (
                    <p className="text-muted-foreground italic">No availability slots found for this therapist.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  {DAYS.map((day, dayIdx) => {
                    const daySlots = activeSlots.filter((s) => s.dayOfWeek === dayIdx);
                    if (daySlots.length === 0) return null;

                    return (
                      <div key={day} className="space-y-3">
                        <h4 className={`text-xs font-bold uppercase tracking-widest pl-2 ${
                          selectedMode === "IN_CLINIC" ? "text-primary/60" : "text-primary/40"
                        }`}>{day}s</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {daySlots.map((slot) => {
                            const booked = isSlotBookedForNextDate(slot);
                            const isSelected = selectedSlot?.id === slot.id;
                            const isClinic = selectedMode === "IN_CLINIC";

                            return (
                              <button
                                key={slot.id}
                                disabled={booked}
                                onClick={() => setSelectedSlot(slot)}
                                className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all duration-300 group ${
                                  booked
                                    ? "bg-slate-100 border-slate-200 cursor-not-allowed opacity-60"
                                    : isSelected
                                    ? isClinic
                                      ? "bg-primary border-primary shadow-xl shadow-primary/20 -translate-y-1"
                                      : "bg-primary border-primary shadow-xl shadow-primary/20 -translate-y-1"
                                    : isClinic
                                    ? "bg-surface-container-lowest border-outline-variant/20 hover:border-primary/40 hover:bg-primary/5"
                                    : "bg-surface-container-lowest border-outline-variant/20 hover:border-primary/40 hover:bg-white"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-xl transition-colors ${
                                    booked
                                      ? "bg-slate-200 text-slate-500"
                                      : isSelected
                                      ? "bg-white/20 text-white"
                                      : isClinic
                                      ? "bg-primary/5 text-primary"
                                      : "bg-primary/5 text-primary"
                                  }`}>
                                    <Clock className="w-4 h-4" />
                                  </div>
                                  <span className={`font-semibold ${
                                    booked
                                      ? "text-slate-500"
                                      : isSelected
                                      ? "text-white"
                                      : "text-foreground"
                                  }`}>
                                    {slot.startTime} – {slot.endTime}
                                  </span>
                                </div>
                                {booked && (
                                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Booked</span>
                                )}
                                {isSelected && !booked && (
                                  <CheckCircle2 className="w-5 h-5 text-white animate-in zoom-in" />
                                )}
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
                      Dr. {therapist.firstName} {therapist.lastName}
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
                  <div className={`p-2 rounded-xl ${
                    selectedMode === "IN_CLINIC" ? "bg-primary/10 text-primary" : "bg-primary/10 text-primary"
                  }`}>
                    {selectedMode === "IN_CLINIC" ? <Building2 className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Visit Type</p>
                    <p className={`text-sm font-semibold ${selectedMode === "IN_CLINIC" ? "text-primary" : "text-primary"}`}>
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

                {/* Selected slot */}
                {selectedSlot ? (
                  <div className={`p-5 rounded-2xl animate-in fade-in duration-500 border ${
                    selectedMode === "IN_CLINIC"
                      ? "bg-primary/5 border-primary/20"
                      : "bg-primary/5 border-primary/10"
                  }`}>
                    <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${
                      selectedMode === "IN_CLINIC" ? "text-primary" : "text-primary"
                    }`}>Selected Time</p>
                    <p className="text-sm font-medium text-foreground">Every {DAYS[selectedSlot.dayOfWeek]}</p>
                    <p className={`text-lg font-bold ${selectedMode === "IN_CLINIC" ? "text-primary" : "text-primary"}`}>
                      {selectedSlot.startTime} (IST)
                    </p>
                  </div>
                ) : (
                  <div className="p-5 md:p-10 border-2 border-dashed border-outline-variant/30 rounded-2xl text-center">
                    <Calendar className="w-6 h-6 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground italic">Select a slot</p>
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
                    : selectedMode === "IN_CLINIC"
                    ? "bg-primary text-white shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-1 active:scale-95"
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
  clinicAddress,
  onClick,
}: {
  id: string;
  mode: ConsultationMode;
  selected: boolean;
  available: boolean;
  slotCount: number;
  clinicAddress?: string;
  onClick: () => void;
}) {
  const isClinic = mode === "IN_CLINIC";

  return (
    <button
      id={id}
      onClick={onClick}
      disabled={!available}
      className={`relative flex items-start gap-4 p-6 rounded-2xl border-2 text-left transition-all duration-300 w-full group ${
        !available
          ? "opacity-40 cursor-not-allowed border-outline-variant/20 bg-surface-container-low/30"
          : selected
          ? isClinic
            ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
            : "border-primary bg-primary/5 shadow-lg shadow-primary/10"
          : "border-outline-variant/20 bg-surface-container-lowest hover:border-primary/30 hover:shadow-md"
      }`}
    >
      <div className={`p-3 rounded-xl flex-shrink-0 transition-colors ${
        selected
          ? isClinic
            ? "bg-primary text-white"
            : "bg-primary text-primary-foreground"
          : "bg-surface-container-low text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
      }`}>
        {isClinic ? <Building2 className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-bold text-sm tracking-tight mb-1 ${
          selected ? isClinic ? "text-primary" : "text-primary" : "text-foreground"
        }`}>
          {isClinic ? "In-Clinic Visit" : "Online Consultation"}
        </p>
        <p className="text-xs text-muted-foreground leading-snug">
          {isClinic
            ? clinicAddress || "Visit the therapist's clinic"
            : "Video call from anywhere"}
        </p>
        {available && (
          <p className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${
            isClinic ? "text-primary/70" : "text-primary/60"
          }`}>
            {slotCount} slot{slotCount !== 1 ? "s" : ""} available
          </p>
        )}
        {!available && (
          <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-muted-foreground/50">
            Not available
          </p>
        )}
      </div>
      {selected && (
        <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${isClinic ? "text-primary" : "text-primary"}`} />
      )}
    </button>
  );
}
