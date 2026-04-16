"use client";

import { useState, useEffect } from "react";
import { Clock, Plus, Trash2, Calendar, Save } from "lucide-react";
import { api } from "@/lib/api";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AvailabilityPage() {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSlot, setNewSlot] = useState({ dayOfWeek: 1, startTime: "09:00", endTime: "10:00" });

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

  const handleAddSlot = async () => {
    try {
      await api.availability.createSlot(newSlot);
      fetchSlots();
    } catch (error) {
      console.error("Failed to add slot", error);
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

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            My Availability
          </h1>
          <p className="text-slate-500 mt-1">Manage your recurring weekly consulting hours.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add New Slot */}
        <div className="lg:col-span-1 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            Add New Slot
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Day of Week</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={newSlot.dayOfWeek}
                onChange={(e) => setNewSlot({...newSlot, dayOfWeek: parseInt(e.target.value)})}
              >
                {DAYS.map((day, idx) => (
                  <option key={day} value={idx}>{day}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                <input 
                  type="time" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                <input 
                  type="time" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={newSlot.endTime}
                  onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
                />
              </div>
            </div>
            <button 
              onClick={handleAddSlot}
              className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Weekly Slot
            </button>
          </div>
        </div>

        {/* Existing Slots List */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Weekly Schedule
          </h2>
          {loading ? (
            <div className="flex justify-center py-6 md:py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-6 md:py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400">No availability slots added yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {DAYS.map((day, dayIdx) => {
                const daySlots = slots.filter(s => s.dayOfWeek === dayIdx);
                if (daySlots.length === 0) return null;
                return (
                  <div key={day} className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{day}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {daySlots.map((slot) => (
                        <div key={slot.id} className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-50 p-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              <Clock className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-slate-700">
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>
                          <button 
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
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
          )}
        </div>
      </div>
    </div>
  );
}
