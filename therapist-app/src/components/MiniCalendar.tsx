"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface MiniCalendarProps {
  sessions: any[];
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MiniCalendar({ sessions }: MiniCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getSessionsForDay = (day: number) => {
    return sessions.filter((session) => {
      const date = new Date(session.scheduledAt);
      return (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day
      );
    });
  };

  const selectedDaySessions = selectedDay ? getSessionsForDay(selectedDay) : [];

  return (
    <div className="h-auto lg:h-[592px] bg-white border border-outline-variant/30 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col gap-6">
      {/* Schedule Header inside the Card */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
            Today&apos;s Schedule
          </h3>
          {sessions.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
              {sessions.length}
            </span>
          )}
        </div>
        <Link href="/dashboard/appointments" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider flex items-center gap-1 group">
          View Full Calendar <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="md:col-span-2 flex flex-col justify-between md:h-full min-h-0">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h3 className="text-xl font-heading font-medium text-foreground">
              {monthName} {year}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mb-2 shrink-0">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="py-2">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 flex-1 min-h-0">
            {days.map((day, idx) => {
              const sessionsForDay = day ? getSessionsForDay(day) : [];
              const hasSession = sessionsForDay.length > 0;
              const isSelected = selectedDay === day;
              const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

              return (
                <div
                  key={idx}
                  className={`h-11 flex flex-col items-center justify-center rounded-xl relative transition-all ${
                    day === null
                      ? ""
                      : isSelected
                      ? "bg-primary text-white font-bold shadow-lg shadow-primary/20 cursor-pointer"
                      : isToday && hasSession
                      ? "bg-blue-100 text-blue-800 font-bold border-2 border-primary/40 hover:bg-blue-200 cursor-pointer"
                      : isToday
                      ? "border-2 border-primary/30 text-primary font-bold hover:bg-primary/5 cursor-pointer"
                      : hasSession
                      ? "bg-blue-100 text-blue-800 font-bold hover:bg-blue-200 cursor-pointer border border-blue-200/60"
                      : "hover:bg-slate-50 cursor-pointer text-sm font-medium text-foreground"
                  }`}
                  onClick={() => day && setSelectedDay(day)}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-1 border-t md:border-t-0 md:border-l border-outline-variant/20 pt-6 md:pt-0 md:pl-6 flex flex-col justify-between md:h-full min-h-0">
          <div className="flex flex-col md:h-full min-h-0">
            <p className="label-md text-muted-foreground/60 mb-4 shrink-0">
              {selectedDay ? `Sessions for ${monthName} ${selectedDay}` : "Select a day"}
            </p>
            
            {selectedDaySessions.length > 0 ? (
              <div className="space-y-4 max-h-[360px] lg:max-h-[380px] overflow-y-auto pr-2 flex-1 min-h-0">
                {selectedDaySessions.map((session: any) => (
                  <div key={session.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex flex-col gap-1">
                    <p className="text-sm font-bold text-foreground capitalize">
                      {session.patient?.firstName} {session.patient?.lastName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {new Date(session.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                        session.mode === 'IN_CLINIC' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        {session.mode === 'IN_CLINIC' ? 'Clinic' : 'Online'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground/60 text-sm italic">
                No sessions scheduled for this day.
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-outline-variant/10">
            <div className="flex items-center gap-2 text-[10px] font-bold text-primary/40 uppercase tracking-widest">
              <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded-md shrink-0" />
              <span>Has Session</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
