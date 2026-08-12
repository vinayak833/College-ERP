import React from "react";
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  School,
  Clock,
  LogOut,
  Menu,
  X
} from "lucide-react";

export const Navbar = ({
  currentRole,
  setRole,
  selectedStudent,
  setSelectedStudent,
  selectedFaculty,
  setSelectedFaculty,
  students,
  facultyList,
  onLogout,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) => {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-30 shadow-xs w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-1.5 sm:gap-4 min-w-0">
        {/* Left Branding & Mobile Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {setIsMobileMenuOpen && (
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 sm:p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all md:hidden cursor-pointer"
              title="Toggle Navigation Menu"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-indigo-600" />
              ) : (
                <Menu className="w-5 h-5 text-slate-700" />
              )}
            </button>
          )}

          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <School className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-sm sm:text-lg text-slate-900 tracking-tight leading-none">
              StudyNet
            </h1>
          </div>
        </div>

        {/* Center - Authenticated User & Role Badge */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          <div
            className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1 sm:gap-1.5 shadow-xs ${
              currentRole === "ADMIN"
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : currentRole === "FACULTY"
                ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            {currentRole === "ADMIN" ? (
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
            ) : currentRole === "FACULTY" ? (
              <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 shrink-0" />
            ) : (
              <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
            )}
            <span className="uppercase tracking-wider font-extrabold text-[9px] sm:text-[11px]">
              {currentRole === "ADMIN"
                ? "Admin"
                : currentRole === "FACULTY"
                ? "Faculty"
                : "Student"}
            </span>
          </div>
        </div>

        {/* Right Section - Active Persona Dropdown & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          {/* Live Clock */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-mono text-slate-800 font-semibold">
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
              })}
            </span>
          </div>

          {/* Active Logged-in User Profile Display */}
          {currentRole === "STUDENT" && selectedStudent && (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 min-w-0 max-w-[135px] sm:max-w-none">
              <img
                src={selectedStudent.avatarUrl}
                alt={selectedStudent.name}
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover shrink-0"
              />
              <span className="truncate" title={`${selectedStudent.name} (${selectedStudent.rollNumber})`}>
                {selectedStudent.name} <span className="hidden sm:inline">({selectedStudent.rollNumber})</span>
              </span>
            </div>
          )}

          {currentRole === "FACULTY" && selectedFaculty && (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 min-w-0 max-w-[135px] sm:max-w-none">
              <img
                src={selectedFaculty.avatarUrl}
                alt={selectedFaculty.name}
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover shrink-0"
              />
              <span className="truncate" title={selectedFaculty.name}>
                {selectedFaculty.name}
              </span>
            </div>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-semibold border border-slate-200 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              title="Sign Out / Change User"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
