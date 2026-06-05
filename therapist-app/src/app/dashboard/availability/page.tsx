"use client";

import { useState, useEffect, useCallback } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import * as Switch from "@radix-ui/react-switch";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import {
  Calendar,
  Clock,
  Monitor,
  Building2,
  Plus,
  Trash2,
  Save,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  CalendarOff,
  CalendarClock,
  Globe,
} from "lucide-react";
import { api } from "@/lib/api";
import type {
  WeeklyAvailabilityRule,
  ScheduleOverride,
  ConsultationMode,
  WeeklyScheduleItem,
  CreateOverridePayload,
} from "@/lib/api";
import { AlexButton } from "@/components/ui/AlexButton";

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = [
  { label: "Sunday", short: "Sun", index: 0 },
  { label: "Monday", short: "Mon", index: 1 },
  { label: "Tuesday", short: "Tue", index: 2 },
  { label: "Wednesday", short: "Wed", index: 3 },
  { label: "Thursday", short: "Thu", index: 4 },
  { label: "Friday", short: "Fri", index: 5 },
  { label: "Saturday", short: "Sat", index: 6 },
];

const TIME_OPTIONS: string[] = [];
for (let h = 6; h <= 22; h++) {
  TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:00`);
  TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:15`);
  TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:30`);
  TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:45`);
}
TIME_OPTIONS.push("23:00");

function formatTime12(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

function formatDateDisplay(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── Day Row (Standard Hours Tab) ────────────────────────────────────────────

interface DayRowProps {
  day: (typeof DAYS)[0];
  onlineRule?: WeeklyAvailabilityRule;
  clinicRule?: WeeklyAvailabilityRule;
  draft: DayDraft;
  onChange: (draft: DayDraft) => void;
}

interface DayDraft {
  online: { active: boolean; startTime: string; endTime: string };
  clinic: { active: boolean; startTime: string; endTime: string };
}

function TimeSelect({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  id: string;
}) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger
        id={id}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/40 bg-white text-sm font-medium text-foreground hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-w-[90px] justify-between"
      >
        <Select.Value />
        <Select.Icon>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className="bg-white border border-outline-variant/30 rounded-xl shadow-xl z-50 overflow-hidden"
          position="popper"
          sideOffset={4}
        >
          <Select.Viewport className="max-h-64 overflow-y-auto p-1">
            {TIME_OPTIONS.map((t) => (
              <Select.Item
                key={t}
                value={t}
                className="flex items-center px-3 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-primary/5 focus:bg-primary/10 outline-none transition-colors"
              >
                <Select.ItemText>{formatTime12(t)}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

function DayRow({ day, draft, onChange }: DayRowProps) {
  const anyActive = draft.online.active || draft.clinic.active;
  const isDayOff = !draft.online.active && !draft.clinic.active;

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${
        anyActive
          ? "border-primary/20 bg-white shadow-sm"
          : "border-outline-variant/20 bg-surface-container-low/30"
      }`}
    >
      {/* Day Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-3">
          <span
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
              anyActive
                ? "bg-primary text-white"
                : "bg-outline-variant/20 text-muted-foreground"
            }`}
          >
            {day.short}
          </span>
          <div>
            <p className="font-semibold text-foreground text-sm">{day.label}</p>
            {anyActive ? (
              <p className="text-xs text-primary font-medium">Working day</p>
            ) : (
              <p className="text-xs text-muted-foreground">Day off</p>
            )}
          </div>
        </div>

        {/* Mode toggle pills */}
        <div className="flex flex-col items-start sm:items-end gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...draft,
                  online: { ...draft.online, active: false },
                  clinic: { ...draft.clinic, active: false },
                })
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 shadow-sm ${
                isDayOff
                  ? "bg-red-600 text-white border-red-600 hover:bg-red-700 shadow-md shadow-red-200/50"
                  : "bg-slate-50 text-slate-700 border-slate-300/80 hover:bg-slate-100 hover:border-slate-400 hover:text-slate-900"
              }`}
            >
              <CalendarOff className="w-3 h-3" />
              Day Off
            </button>
            <ModeToggle
              mode="ONLINE"
              active={draft.online.active}
              onToggle={(v) =>
                onChange({ ...draft, online: { ...draft.online, active: v } })
              }
            />
            <ModeToggle
              mode="IN_CLINIC"
              active={draft.clinic.active}
              onToggle={(v) =>
                onChange({ ...draft, clinic: { ...draft.clinic, active: v } })
              }
            />
          </div>
          <span className="text-[11px] text-muted-foreground">
            Select a mode to set hours, or mark as Day Off.
          </span>
        </div>
      </div>

      {/* Time Range Inputs */}
      {(draft.online.active || draft.clinic.active) && (
        <div className="px-5 pb-4 space-y-3 border-t border-outline-variant/10 pt-4">
          {draft.online.active && (
            <TimeRangeRow
              icon={<Monitor className="w-3.5 h-3.5" />}
              label="Online"
              color="text-blue-600"
              bgColor="bg-blue-50"
              startTime={draft.online.startTime}
              endTime={draft.online.endTime}
              onStartChange={(v) =>
                onChange({
                  ...draft,
                  online: { ...draft.online, startTime: v },
                })
              }
              onEndChange={(v) =>
                onChange({ ...draft, online: { ...draft.online, endTime: v } })
              }
              dayIndex={day.index}
              modeKey="online"
            />
          )}
          {draft.clinic.active && (
            <TimeRangeRow
              icon={<Building2 className="w-3.5 h-3.5" />}
              label="In-Clinic"
              color="text-emerald-600"
              bgColor="bg-emerald-50"
              startTime={draft.clinic.startTime}
              endTime={draft.clinic.endTime}
              onStartChange={(v) =>
                onChange({
                  ...draft,
                  clinic: { ...draft.clinic, startTime: v },
                })
              }
              onEndChange={(v) =>
                onChange({ ...draft, clinic: { ...draft.clinic, endTime: v } })
              }
              dayIndex={day.index}
              modeKey="clinic"
            />
          )}
        </div>
      )}
    </div>
  );
}

function ModeToggle({
  mode,
  active,
  onToggle,
}: {
  mode: ConsultationMode;
  active: boolean;
  onToggle: (v: boolean) => void;
}) {
  const isOnline = mode === "ONLINE";
  return (
    <button
      type="button"
      onClick={() => onToggle(!active)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 shadow-sm ${
        active
          ? isOnline
            ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200/50"
            : "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200/50"
          : "bg-slate-50 text-slate-700 border-slate-300/80 hover:bg-slate-100 hover:border-slate-400 hover:text-slate-900"
      }`}
    >
      {isOnline ? (
        <Monitor className="w-3 h-3" />
      ) : (
        <Building2 className="w-3 h-3" />
      )}
      {isOnline ? "Online" : "In-Clinic"}
    </button>
  );
}

function TimeRangeRow({
  icon,
  label,
  color,
  bgColor,
  startTime,
  endTime,
  onStartChange,
  onEndChange,
  dayIndex,
  modeKey,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
  startTime: string;
  endTime: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  dayIndex: number;
  modeKey: string;
}) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${bgColor} ${color} text-xs font-bold w-24`}
      >
        {icon}
        {label}
      </div>
      <div className="flex items-center gap-2">
        <TimeSelect
          id={`start-${dayIndex}-${modeKey}`}
          value={startTime}
          onChange={onStartChange}
        />
        <span className="text-muted-foreground text-sm font-medium">to</span>
        <TimeSelect
          id={`end-${dayIndex}-${modeKey}`}
          value={endTime}
          onChange={onEndChange}
        />
      </div>
    </div>
  );
}

// ─── Override Card ────────────────────────────────────────────────────────────

function OverrideCard({
  override,
  onDelete,
}: {
  override: ScheduleOverride;
  onDelete: (id: string) => void;
}) {
  const dateStr = formatDateDisplay(override.date);
  const isPast = new Date(override.date) < new Date(todayString() + "T00:00:00.000Z");

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
        isPast
          ? "border-outline-variant/20 bg-surface-container-low/30 opacity-60"
          : override.isAvailable
          ? "border-blue-200 bg-blue-50/50"
          : "border-red-200 bg-red-50/50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            override.isAvailable
              ? "bg-blue-100 text-blue-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {override.isAvailable ? (
            <CalendarClock className="w-4 h-4" />
          ) : (
            <CalendarOff className="w-4 h-4" />
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">{dateStr}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {override.isAvailable
              ? override.startTime && override.endTime
                ? `${formatTime12(override.startTime)} – ${formatTime12(override.endTime)}${override.mode ? ` (${override.mode === "ONLINE" ? "Online" : "In-Clinic"})` : " (All modes)"}`
                : "Custom hours"
              : `Day off${override.reason ? ` — ${override.reason}` : ""}`}
            {override.mode && override.isAvailable
              ? ""
              : !override.mode
              ? ""
              : ""}
          </p>
        </div>
      </div>

      {!isPast && (
        <button
          onClick={() => onDelete(override.id)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-100 hover:text-red-600 transition-colors"
          title="Remove override"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ─── Add Override Dialog ──────────────────────────────────────────────────────

interface AddOverrideDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (payload: CreateOverridePayload) => Promise<void>;
}

function AddOverrideDialog({ open, onClose, onSave }: AddOverrideDialogProps) {
  const [date, setDate] = useState(todayString());
  const [blockType, setBlockType] = useState<"off" | "custom">("off");
  const [mode, setMode] = useState<ConsultationMode | "ALL">("ALL");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("13:00");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    if (!date) {
      setError("Please select a date");
      return;
    }
    if (blockType === "custom" && startTime >= endTime) {
      setError("End time must be after start time");
      return;
    }

    setSaving(true);
    try {
      const payload: CreateOverridePayload = {
        date,
        isAvailable: blockType === "custom",
        reason: reason || undefined,
        ...(mode !== "ALL" ? { mode } : {}),
        ...(blockType === "custom"
          ? { startTime, endTime }
          : {}),
      };
      await onSave(payload);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save override");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-lg font-bold text-foreground">
              Add Date Exception
            </Dialog.Title>
            <Dialog.Close className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-muted-foreground transition-colors">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          <div className="space-y-5">
            {/* Date Picker */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                min={todayString()}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/40 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
              />
            </div>

            {/* Block Type */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Exception Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBlockType("off")}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                    blockType === "off"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-outline-variant/30 text-muted-foreground hover:border-primary/20"
                  }`}
                >
                  <CalendarOff className="w-5 h-5" />
                  Block Whole Day
                </button>
                <button
                  type="button"
                  onClick={() => setBlockType("custom")}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                    blockType === "custom"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-outline-variant/30 text-muted-foreground hover:border-primary/20"
                  }`}
                >
                  <CalendarClock className="w-5 h-5" />
                  Set Specific Hours
                </button>
              </div>
            </div>

            {/* Custom Hours */}
            {blockType === "custom" && (
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    From
                  </label>
                  <TimeSelect
                    id="override-start"
                    value={startTime}
                    onChange={setStartTime}
                  />
                </div>
                <span className="text-muted-foreground mt-6">to</span>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Until
                  </label>
                  <TimeSelect
                    id="override-end"
                    value={endTime}
                    onChange={setEndTime}
                  />
                </div>
              </div>
            )}

            {/* Mode */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Applies To
              </label>
              <div className="flex gap-2 flex-wrap">
                {(["ALL", "ONLINE", "IN_CLINIC"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                      mode === m
                        ? "border-primary bg-primary text-white"
                        : "border-outline-variant/30 text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {m === "ALL" ? (
                      <Globe className="w-3.5 h-3.5" />
                    ) : m === "ONLINE" ? (
                      <Monitor className="w-3.5 h-3.5" />
                    ) : (
                      <Building2 className="w-3.5 h-3.5" />
                    )}
                    {m === "ALL" ? "All Modes" : m === "ONLINE" ? "Online" : "In-Clinic"}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Reason (optional)
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Conference, Holiday, Personal"
                className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
              />
            </div>

            {/* Timezone note */}
            <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 font-medium">
                Times are stored in UTC. Your current timezone offset is{" "}
                <strong>
                  {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </strong>
                . The backend converts times automatically.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-outline-variant/30 text-sm font-semibold text-muted-foreground hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <AlexButton
              onClick={handleSave}
              disabled={saving}
              size="md"
              icon={
                saving ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary group-hover:text-white" />
                ) : undefined
              }
              className="flex-1"
            >
              Save Exception
            </AlexButton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ─── Toast Notification ───────────────────────────────────────────────────────

function Toast({
  type,
  message,
  onDismiss,
}: {
  type: "success" | "error";
  message: string;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-300 ${
        type === "success"
          ? "bg-emerald-600 text-white"
          : "bg-red-600 text-white"
      }`}
    >
      {type === "success" ? (
        <CheckCircle2 className="w-5 h-5 shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 shrink-0" />
      )}
      <p className="text-sm font-semibold">{message}</p>
      <button onClick={onDismiss} className="ml-2 hover:opacity-70 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const DEFAULT_DRAFT: DayDraft = {
  online: { active: false, startTime: "09:00", endTime: "17:00" },
  clinic: { active: false, startTime: "09:00", endTime: "17:00" },
};

export default function AvailabilityPage() {
  const [activeTab, setActiveTab] = useState("schedule");

  // Weekly Schedule state
  const [weeklyRules, setWeeklyRules] = useState<WeeklyAvailabilityRule[]>([]);
  const [drafts, setDrafts] = useState<Record<number, DayDraft>>(
    Object.fromEntries(DAYS.map((d) => [d.index, { ...DEFAULT_DRAFT }]))
  );
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleSaving, setScheduleSaving] = useState(false);

  // Overrides state
  const [overrides, setOverrides] = useState<ScheduleOverride[]>([]);
  const [overridesLoading, setOverridesLoading] = useState(true);
  const [addOverrideOpen, setAddOverrideOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = useCallback(
    (type: "success" | "error", message: string) => {
      setToast({ type, message });
    },
    []
  );

  // ── Load Weekly Schedule ──────────────────────────────────────────────────

  const fetchSchedule = useCallback(async () => {
    setScheduleLoading(true);
    try {
      const rules: WeeklyAvailabilityRule[] = await api.availability.getSchedule();
      setWeeklyRules(rules);

      // Hydrate drafts from rules
      setDrafts((prev) => {
        const next = { ...prev };
        // Reset all
        for (const day of DAYS) {
          next[day.index] = { ...DEFAULT_DRAFT };
        }
        // Apply rules
        for (const rule of rules) {
          const cur = next[rule.dayOfWeek] ?? { ...DEFAULT_DRAFT };
          if (rule.mode === "ONLINE") {
            cur.online = {
              active: rule.isActive ?? true,
              startTime: rule.startTime,
              endTime: rule.endTime,
            };
          } else {
            cur.clinic = {
              active: rule.isActive ?? true,
              startTime: rule.startTime,
              endTime: rule.endTime,
            };
          }
          next[rule.dayOfWeek] = cur;
        }
        return next;
      });
    } catch (e) {
      console.error("Failed to fetch schedule", e);
      showToast("error", "Could not load your schedule.");
    } finally {
      setScheduleLoading(false);
    }
  }, [showToast]);

  // ── Load Overrides ────────────────────────────────────────────────────────

  const fetchOverrides = useCallback(async () => {
    setOverridesLoading(true);
    try {
      const data: ScheduleOverride[] = await api.availability.getOverrides();
      setOverrides(data);
    } catch (e) {
      console.error("Failed to fetch overrides", e);
    } finally {
      setOverridesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
    fetchOverrides();
  }, [fetchSchedule, fetchOverrides]);

  // ── Save Weekly Schedule ──────────────────────────────────────────────────

  const handleSaveSchedule = async () => {
    setScheduleSaving(true);
    try {
      const schedule: WeeklyScheduleItem[] = [];

      for (const day of DAYS) {
        const draft = drafts[day.index];
        if (draft.online.active) {
          schedule.push({
            dayOfWeek: day.index,
            startTime: draft.online.startTime,
            endTime: draft.online.endTime,
            mode: "ONLINE",
            isActive: true,
          });
        }
        if (draft.clinic.active) {
          schedule.push({
            dayOfWeek: day.index,
            startTime: draft.clinic.startTime,
            endTime: draft.clinic.endTime,
            mode: "IN_CLINIC",
            isActive: true,
          });
        }
      }

      const updated = await api.availability.upsertSchedule(schedule);
      setWeeklyRules(updated);
      showToast("success", "Your weekly schedule has been saved!");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to save schedule";
      showToast("error", msg);
    } finally {
      setScheduleSaving(false);
    }
  };

  // ── Override CRUD ─────────────────────────────────────────────────────────

  const handleSaveOverride = async (payload: CreateOverridePayload) => {
    await api.availability.createOverride(payload);
    await fetchOverrides();
    showToast("success", "Date exception saved!");
  };

  const handleDeleteOverride = async (id: string) => {
    try {
      await api.availability.deleteOverride(id);
      setOverrides((prev) => prev.filter((o) => o.id !== id));
      showToast("success", "Exception removed.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to remove exception";
      showToast("error", msg);
    }
  };

  const hasChanges = () => {
    for (const day of DAYS) {
      const draft = drafts[day.index] ?? DEFAULT_DRAFT;
      
      // Online check
      const onlineRule = weeklyRules.find(
        (r) => r.dayOfWeek === day.index && r.mode === "ONLINE"
      );
      const onlineActive = onlineRule ? (onlineRule.isActive ?? true) : false;
      if (draft.online.active !== onlineActive) return true;
      if (draft.online.active) {
        if (draft.online.startTime !== onlineRule?.startTime) return true;
        if (draft.online.endTime !== onlineRule?.endTime) return true;
      }

      // Clinic check
      const clinicRule = weeklyRules.find(
        (r) => r.dayOfWeek === day.index && r.mode === "IN_CLINIC"
      );
      const clinicActive = clinicRule ? (clinicRule.isActive ?? true) : false;
      if (draft.clinic.active !== clinicActive) return true;
      if (draft.clinic.active) {
        if (draft.clinic.startTime !== clinicRule?.startTime) return true;
        if (draft.clinic.endTime !== clinicRule?.endTime) return true;
      }
    }
    return false;
  };

  // ─── Timezone display ───────────────────────────────────────────────────

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // ─── Active working days count ──────────────────────────────────────────

  const activeDaysCount = DAYS.filter(
    (d) => drafts[d.index]?.online.active || drafts[d.index]?.clinic.active
  ).length;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-2xl text-primary">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-medium text-foreground">
              Availability
            </h1>
            <p className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              Timezone: <strong>{userTimezone}</strong>
            </p>
          </div>
        </div>

        {/* Stats chips */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-xl border border-primary/10">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary">
              {activeDaysCount} working day{activeDaysCount !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-xl border border-amber-200">
            <CalendarOff className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-bold text-amber-700">
              {overrides.filter((o) => !o.isAvailable && new Date(o.date) >= new Date()).length} upcoming exception{overrides.filter((o) => !o.isAvailable && new Date(o.date) >= new Date()).length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Two-Tab Interface */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="flex gap-1 p-1 bg-surface-container-low rounded-2xl border border-outline-variant/20 mb-6 w-fit">
          <Tabs.Trigger
            value="schedule"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeTab === "schedule"
                ? "bg-white text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="w-4 h-4" />
            Standard Hours
          </Tabs.Trigger>
          <Tabs.Trigger
            value="overrides"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeTab === "overrides"
                ? "bg-white text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CalendarClock className="w-4 h-4" />
            Date Exceptions
            {overrides.filter((o) => new Date(o.date) >= new Date()).length > 0 && (
              <span className="ml-1 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                {overrides.filter((o) => new Date(o.date) >= new Date()).length}
              </span>
            )}
          </Tabs.Trigger>
        </Tabs.List>

        {/* ── Tab 1: Standard Hours ─────────────────────────────────────── */}
        <Tabs.Content value="schedule" className="outline-none">
          {scheduleLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Info Banner */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <strong>How this works:</strong> Toggle days on/off and set
                  your working hours. Sessions are booked in{" "}
                  <strong>50-minute slots</strong> with a 10-minute buffer.
                  Date exceptions (e.g., holidays) override these hours.
                </div>
              </div>

              {/* Day Rows */}
              <div className="space-y-3">
                {DAYS.map((day) => (
                  <DayRow
                    key={day.index}
                    day={day}
                    onlineRule={weeklyRules.find(
                      (r) => r.dayOfWeek === day.index && r.mode === "ONLINE"
                    )}
                    clinicRule={weeklyRules.find(
                      (r) => r.dayOfWeek === day.index && r.mode === "IN_CLINIC"
                    )}
                    draft={drafts[day.index] ?? DEFAULT_DRAFT}
                    onChange={(d) =>
                      setDrafts((prev) => ({ ...prev, [day.index]: d }))
                    }
                  />
                ))}
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <AlexButton
                  onClick={handleSaveSchedule}
                  disabled={scheduleSaving || !hasChanges()}
                  size="md"
                  icon={
                    scheduleSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary group-hover:text-white" />
                    ) : (
                      <Save className="w-4 h-4 text-primary group-hover:text-white" />
                    )
                  }
                  className="shadow-xl"
                >
                  Save Schedule
                </AlexButton>
              </div>
            </div>
          )}
        </Tabs.Content>

        {/* ── Tab 2: Date Exceptions ────────────────────────────────────── */}
        <Tabs.Content value="overrides" className="outline-none">
          <div className="space-y-4">
            {/* Info + Add Button */}
            <div className="flex items-start justify-between gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <CalendarOff className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-700">
                  <strong>Date exceptions</strong> override your standard
                  schedule. Block a whole day (holiday, sick leave) or set
                  different hours for a specific date.
                </div>
              </div>
              <button
                onClick={() => setAddOverrideOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shrink-0 shadow-md"
              >
                <Plus className="w-4 h-4" />
                Add Exception
              </button>
            </div>

            {/* Override List */}
            {overridesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : overrides.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <CalendarClock className="w-12 h-12 mb-3 opacity-30" />
                <p className="font-semibold">No exceptions yet</p>
                <p className="text-sm mt-1">
                  Add holidays, time-off, or schedule changes above.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Future overrides first */}
                {overrides
                  .sort(
                    (a, b) =>
                      new Date(a.date).getTime() - new Date(b.date).getTime()
                  )
                  .map((override) => (
                    <OverrideCard
                      key={override.id}
                      override={override}
                      onDelete={handleDeleteOverride}
                    />
                  ))}
              </div>
            )}
          </div>
        </Tabs.Content>
      </Tabs.Root>

      {/* Add Override Dialog */}
      <AddOverrideDialog
        open={addOverrideOpen}
        onClose={() => setAddOverrideOpen(false)}
        onSave={handleSaveOverride}
      />

      {/* Toast Notifications */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
