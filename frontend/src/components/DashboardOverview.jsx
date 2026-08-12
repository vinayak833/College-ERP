import React from "react";
import {
  Users,
  BookOpen,
  Award,
  QrCode,
  CreditCard,
  ArrowUpRight,
  TrendingUp,
  Clock,
  AlertCircle,
  FileText,
  Book,
  Home,
  Trophy
} from "lucide-react";
export const DashboardOverview = ({
  role,
  students,
  facultyList,
  courses,
  grades,
  fees,
  notices,
  selectedStudent,
  selectedFaculty,
  onNavigateTab
}) => {
  const activeStudentCount = students.filter((s) => s.status === "Active").length;
  const activeCourseCount = courses.length;
  const facultyCount = facultyList.length;
  const totalFeesAmount = fees.reduce((acc, f) => acc + f.totalFee, 0);
  const paidFeesAmount = fees.reduce((acc, f) => acc + f.amountPaid, 0);
  const pendingFeesCount = fees.filter((f) => f.status === "Pending" || f.status === "Overdue").length;
  const studentCourses = selectedStudent ? courses.filter((c) => c.enrolledStudents.includes(selectedStudent.id)) : [];
  const studentGrades = selectedStudent ? grades.filter((g) => g.studentId === selectedStudent.id) : [];
  const studentFee = selectedStudent ? fees.find((f) => f.studentId === selectedStudent.id) : null;

  const roleTitle = role === "ADMIN" ? "Administrator Portal" : role === "FACULTY" ? "Faculty Workspace" : "Student Dashboard";
  const userName = role === "ADMIN" ? "Dr. Dean Administrator" : role === "FACULTY" && selectedFaculty ? selectedFaculty.name : selectedStudent ? selectedStudent.name : "User";
  const subDetails = role === "STUDENT" 
    ? `Roll No: ${selectedStudent?.rollNumber} | Program: ${selectedStudent?.program} | Semester ${selectedStudent?.semester}`
    : role === "FACULTY" 
    ? `Dept: ${selectedFaculty?.department} | Designation: ${selectedFaculty?.designation} | Office: ${selectedFaculty?.officeRoom}` 
    : "Central Command Center for StudyNet. Track live student enrollments, marks, dynamic QR attendance, and fees.";

  return <div className="space-y-6">
      {/* Welcome Banner - Clean Light Theme */}
      <div className="relative overflow-hidden bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm transition-all">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {roleTitle}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {role === "STUDENT" && selectedStudent 
                  ? `• Current Sem: Semester ${selectedStudent.semester}` 
                  : "• Current Academic Term"}
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Welcome back,{" "}
              <span className="text-indigo-600">
                {userName}
              </span>
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {subDetails}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab("qr-attendance")}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>{role === "FACULTY" ? "Launch QR Session" : "Scan Live Attendance"}</span>
            </button>
          </div>
        </div>
      </div>

      {
    /* Metrics Row */
  }
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {
    /* Metric 1 */
  }
        <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-all shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {role === "STUDENT" ? "Current GPA" : "Total Students"}
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              {role === "STUDENT" ? <Award className="w-4 h-4" /> : <Users className="w-4 h-4" />}
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">
              {role === "STUDENT" ? selectedStudent?.gpa.toFixed(2) || "0.00" : activeStudentCount}
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              {role === "STUDENT" ? "Top 5%" : "+12% YOY"}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {role === "STUDENT" ? "Out of 10.0 Cumulative Scale" : "Enrolled across 6 Engineering Depts"}
          </p>
        </div>

        {
    /* Metric 2 */
  }
        <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-all shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {role === "STUDENT" ? "Enrolled Courses" : "Active Courses"}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">
              {role === "STUDENT" ? studentCourses.length : activeCourseCount}
            </span>
            <span className="text-xs font-semibold text-blue-600">
              {role === "STUDENT" ? "15 Credits" : "Semester 5 & 7"}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {role === "STUDENT" ? "All prerequisites verified" : "Managed by departmental faculty"}
          </p>
        </div>

        {
    /* Metric 3 */
  }
        <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-all shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Attendance Rating
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center border border-cyan-100">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">94.8%</span>
            <span className="text-xs font-semibold text-cyan-700">Live Sync</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Dynamic OTP verified via student app</p>
        </div>

        {
    /* Metric 4 */
  }
        <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-all shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {role === "STUDENT" ? "Fee Balance" : "Fee Collection"}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">
              {role === "STUDENT" ? studentFee ? `\u20B9${(studentFee.totalFee - studentFee.amountPaid).toLocaleString("en-IN")}` : "\u20B90" : `\u20B9${paidFeesAmount.toLocaleString("en-IN")}`}
            </span>
            <span
    className={`text-xs font-semibold ${role === "STUDENT" && studentFee && studentFee.totalFee - studentFee.amountPaid > 0 ? "text-amber-600" : "text-emerald-600"}`}
  >
              {role === "STUDENT" ? studentFee?.status || "Clear" : `\u20B9${(totalFeesAmount - paidFeesAmount).toLocaleString("en-IN")} Pending`}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {role === "STUDENT" && studentFee && studentFee.totalFee - studentFee.amountPaid > 0 ? `Due Date: ${studentFee.dueDate}` : role === "STUDENT" ? "Digital payment gateway enabled" : "Institutional fee collection tracking"}
          </p>
        </div>
      </div>

      {
    /* Quick Action Shortcuts */
  }
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {
    /* Module Shortcuts Card */
  }
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
            <span>Quick ERP Actions</span>
            <span className="text-xs font-normal text-slate-500">
              Role-specific shortcuts for {role}
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
    onClick={() => onNavigateTab("qr-attendance")}
    className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-left transition-all group"
  >
              <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <QrCode className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-slate-800 group-hover:text-blue-700 flex items-center gap-1">
                <span>{role === "FACULTY" ? "Launch QR" : role === "STUDENT" ? "Scan Attendance" : "Dynamic QR"}</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">7s OTP live classroom check-in</p>
            </button>

            <button
    onClick={() => onNavigateTab("grades")}
    className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all group"
  >
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <Award className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-slate-800 group-hover:text-indigo-700 flex items-center gap-1">
                <span>{role === "STUDENT" ? "My Grade Report" : "Gradebook & Marks"}</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Grade entry, GPA, transcript PDF</p>
            </button>

            <button
    onClick={() => onNavigateTab("courses")}
    className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-left transition-all group"
  >
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-slate-800 group-hover:text-blue-700 flex items-center gap-1">
                <span>{role === "STUDENT" ? "My Courses" : "Course Catalog"}</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Add/Drop courses & prerequisites</p>
            </button>

            <button
    onClick={() => onNavigateTab("students")}
    className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-left transition-all group"
  >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-slate-800 group-hover:text-emerald-700 flex items-center gap-1">
                <span>{role === "STUDENT" ? "My Student Profile" : role === "FACULTY" ? "Student Directory" : "Student Records & Roster"}</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {role === "STUDENT" ? "View transcript, contact details & guardian info" : "Rosters, profiles & guardian contacts"}
              </p>
            </button>

            {(role === "ADMIN" || role === "STUDENT") && <button
    onClick={() => onNavigateTab("fees")}
    className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 text-left transition-all group"
  >
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-800 group-hover:text-amber-700 flex items-center gap-1">
                  <span>{role === "STUDENT" ? "My Fee Dues" : "Fee Management"}</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {role === "STUDENT" ? "Online dues payment & digital receipts" : "Track student dues & view receipts"}
                </p>
              </button>}

            {(role === "FACULTY" || role === "STUDENT") && <button
    onClick={() => onNavigateTab("faculty")}
    className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all group"
  >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-800 group-hover:text-indigo-700 flex items-center gap-1">
                  <span>Faculty Directory</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Office hours, emails & specializations</p>
              </button>}

            <button
    onClick={() => onNavigateTab("assignments")}
    className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all group"
  >
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-slate-800 group-hover:text-indigo-700 flex items-center gap-1">
                <span>{role === "STUDENT" ? "My Coursework" : "Coursework & Tasks"}</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Labs, assignments & grading feedback</p>
            </button>

            <button
    onClick={() => onNavigateTab("library")}
    className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/40 text-left transition-all group"
  >
              <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <Book className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-slate-800 group-hover:text-cyan-700 flex items-center gap-1">
                <span>{role === "STUDENT" ? "Library & Books" : "Library Catalog"}</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Search catalog, due dates & overdue fines</p>
            </button>

            {(role === "ADMIN" || role === "STUDENT") && <button
    onClick={() => onNavigateTab("hostel-transport")}
    className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-left transition-all group"
  >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Home className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-800 group-hover:text-emerald-700 flex items-center gap-1">
                  <span>{role === "STUDENT" ? "Hostel & Transit" : "Hostel & Transport"}</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Room allotments, mess & shuttle passes</p>
              </button>}

            <button
    onClick={() => onNavigateTab("events")}
    className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 text-left transition-all group"
  >
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <Trophy className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-slate-800 group-hover:text-purple-700 flex items-center gap-1">
                <span>Events & Club Hub</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Hackathons, symposiums & RSVP registrations</p>
            </button>

            <button
    onClick={() => onNavigateTab("timetable")}
    className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 text-left transition-all group"
  >
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-slate-800 group-hover:text-purple-700 flex items-center gap-1">
                <span>Class Timetable</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Weekly lecture schedule & room numbers</p>
            </button>

          </div>
        </div>

        {
    /* Notices Widget */
  }
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800">Campus Notices</h3>
              <button
    onClick={() => onNavigateTab("notices")}
    className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
  >
                View All ({notices.length})
              </button>
            </div>

            <div className="space-y-3">
              {notices.slice(0, 3).map((n) => <div
    key={n.id}
    className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all"
  >
                  <div className="flex items-center gap-2 mb-1">
                    {n.urgent && <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-0.5">
                        <AlertCircle className="w-2.5 h-2.5" /> Urgent
                      </span>}
                    <span className="text-[10px] text-slate-500 font-mono">{n.postedDate}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 leading-tight line-clamp-1">
                    {n.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {n.content}
                  </p>
                </div>)}
            </div>
          </div>
        </div>
      </div>
    </div>;
};
