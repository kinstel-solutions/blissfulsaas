"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

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
    <div className="bg-white border border-outline-variant/30 rounded-[2rem] p-6 md:p-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-heading font-medium text-foreground">
            {monthName} {year}
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mb-4">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="py-2">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            const sessionsForDay = day ? getSessionsForDay(day) : [];
            const hasSession = sessionsForDay.length > 0;
            const isSelected = selectedDay === day;
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

            return (
              <div
                key={idx}
                className={`h-12 flex flex-col items-center justify-center rounded-xl relative transition-all ${
                  day === null
                    ? ""
                    : isSelected
                    ? "bg-primary text-white font-bold shadow-lg shadow-primary/20"
                    : isToday
                    ? "border-2 border-primary/30 text-primary font-bold hover:bg-primary/5 cursor-pointer"
                    : "hover:bg-slate-50 cursor-pointer text-sm font-medium text-foreground"
                }`}
                onClick={() => day && setSelectedDay(day)}
              >
                {day}
                {day !== null && hasSession && !isSelected && (
                  <div className="w-1.5 h-1.5 bg-primary rounded-full absolute bottom-1.5" />
                )}
                {day !== null && hasSession && isSelected && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full absolute bottom-1.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="md:col-span-1 border-t md:border-t-0 md:border-l border-outline-variant/20 pt-6 md:pt-0 md:pl-6 flex flex-col justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-4">
            {selectedDay ? `Sessions for ${monthName} ${selectedDay}` : "Select a day"}
          </p>
          
          {selectedDaySessions.length > 0 ? (
            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
              {selectedDaySessions.map((session: any) => (
                <div key={session.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1">
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
            <div className="w-2 h-2 bg-primary rounded-full" />
            <span>Has Session</span>
          </div>
        </div>
      </div>
    </div>
  );
}
