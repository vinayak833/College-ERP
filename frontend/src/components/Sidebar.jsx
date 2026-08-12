import {
  LayoutDashboard,
  Users,
  BookOpen,
  Award,
  UserCheck,
  User,
  QrCode,
  CreditCard,
  CalendarDays,
  Bell,
  FileText,
  Book,
  Home,
  Trophy,
  X,
  School
} from "lucide-react";

export const Sidebar = ({
  role,
  activeTab,
  setActiveTab,
  unseenNoticeCount = 1,
  isMobileMenuOpen = false,
  setIsMobileMenuOpen
}) => {
  const rawMenuItems = [
    { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
    ...(role === "FACULTY"
      ? [{ id: "faculty-profile", label: "My Faculty Profile", icon: User }]
      : []),
    {
      id: "qr-attendance",
      label:
        role === "FACULTY"
          ? "Launch QR Session"
          : role === "STUDENT"
          ? "Scan Attendance"
          : "Dynamic QR Attendance",
      icon: QrCode,
      badge: "Live QR"
    },
    { id: "students", label: "Student Records", icon: Users },
    {
      id: "courses",
      label: role === "STUDENT" ? "My Course Enrollment" : "Course Catalog",
      icon: BookOpen
    },
    {
      id: "assignments",
      label: role === "STUDENT" ? "My Coursework" : "Coursework & Lab Tasks",
      icon: FileText
    },
    {
      id: "grades",
      label: role === "STUDENT" ? "My Grade Report" : "Grading & Transcripts",
      icon: Award
    },
    {
      id: "timetable",
      label: role === "FACULTY" ? "Teaching Timetable" : "Class Timetable",
      icon: CalendarDays
    },
    {
      id: "library",
      label: role === "STUDENT" ? "Library & Books" : "Library Catalog",
      icon: Book
    },
    {
      id: "hostel-transport",
      label:
        role === "STUDENT"
          ? "My Hostel & Transit Pass"
          : "Hostel & Transport Allotments",
      icon: Home
    },
    {
      id: "events",
      label: "Events & Club Hub",
      icon: Trophy
    },
    {
      id: "faculty",
      label: role === "ADMIN" ? "Faculty Management" : "Faculty Directory",
      icon: UserCheck
    },
    {
      id: "fees",
      label: role === "STUDENT" ? "My Fees & Payments" : "Fee Management",
      icon: CreditCard
    },
    { id: "notices", label: "Notice Board", icon: Bell, count: unseenNoticeCount }
  ];

  const menuItems = rawMenuItems
    .map((item) => {
      if (item.id === "students" && role === "STUDENT") {
        return { ...item, label: "My Student Profile" };
      }
      if (item.id === "students" && role === "FACULTY") {
        return { ...item, label: "Student Directory" };
      }
      return item;
    })
    .filter((item) => {
      if (role === "FACULTY") {
        return item.id !== "fees" && item.id !== "hostel-transport";
      }
      return true;
    });

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const renderNavItems = () => (
    <div className="space-y-1">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        const isHighlight = item.id === "qr-attendance";
        return (
          <button
            key={item.id}
            onClick={() => handleSelectTab(item.id)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              isActive
                ? isHighlight
                  ? "bg-blue-600 text-white font-semibold shadow-xs"
                  : "bg-indigo-600 text-white font-semibold shadow-xs"
                : isHighlight
                ? "text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={`w-4 h-4 ${
                  isActive
                    ? "text-white"
                    : isHighlight
                    ? "text-blue-600"
                    : "text-slate-500"
                }`}
              />
              <span>{item.label}</span>
            </div>

            {item.badge && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700 border border-blue-200 animate-pulse">
                {item.badge}
              </span>
            )}

            {item.count !== undefined && item.count > 0 && (
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 shrink-0 min-h-[calc(100vh-4rem)] p-4 flex-col justify-between">
        {renderNavItems()}
      </aside>

      {/* Mobile Overlay Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
          />

          {/* Drawer Container */}
          <aside className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl p-4 flex flex-col justify-between overflow-y-auto z-10 border-r border-slate-200">
            <div>
              {/* Mobile Drawer Header */}
              <div className="flex items-center justify-between pb-4 mb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                    <School className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-slate-900 text-sm">Navigation</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                  title="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              {renderNavItems()}
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
