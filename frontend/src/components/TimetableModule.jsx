import { useState } from "react";
import { INITIAL_TIMETABLE } from "../data/mockData";
import { CalendarDays, Clock, MapPin, UserCheck, QrCode } from "lucide-react";

export const TimetableModule = ({ role, courses, onNavigateTab }) => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const [selectedMobileDay, setSelectedMobileDay] = useState("ALL");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-purple-600" />
            <span>Class Timetable & Lecture Schedule</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Weekly academic schedule grid for lectures, lab sessions, and direct link to live QR check-ins.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab("qr-attendance")}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
        >
          <QrCode className="w-4 h-4" />
          <span>Launch Today's Attendance</span>
        </button>
      </div>

      {/* Mobile & Tablet Day Filter Bar */}
      <div className="flex xl:hidden items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedMobileDay("ALL")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            selectedMobileDay === "ALL"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          All Days
        </button>
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedMobileDay(d)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedMobileDay === d
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Timetable Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {days
          .filter((day) => selectedMobileDay === "ALL" || selectedMobileDay === day)
          .map((day) => {
            const daySlots = INITIAL_TIMETABLE.filter((tt) => tt.day === day);
            return (
              <div
                key={day}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-xs"
              >
                <div className="border-b border-slate-200 pb-2 text-center">
                  <h3 className="text-sm font-bold text-purple-700">{day}</h3>
                  <span className="text-[10px] text-slate-500 font-mono font-semibold">
                    {daySlots.length} Classes Scheduled
                  </span>
                </div>

                <div className="space-y-2.5 min-h-[220px] md:min-h-[300px]">
                  {daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-purple-300 transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200 rounded">
                          {slot.courseCode}
                        </span>
                        <span className="text-[9px] font-bold uppercase text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                          {slot.type}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-slate-900">{slot.courseTitle}</div>

                      <div className="space-y-1 text-[11px] text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{slot.roomNumber}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-800">
                          <UserCheck className="w-3 h-3 text-slate-400" />
                          <span className="truncate font-medium">{slot.facultyName}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {daySlots.length === 0 && (
                    <div className="h-full flex items-center justify-center text-center p-6 text-slate-400 text-xs italic">
                      No lectures on {day}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
