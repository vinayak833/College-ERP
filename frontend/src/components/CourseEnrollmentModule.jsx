import { useState } from "react";
import { DEPARTMENTS } from "../data/mockData";
import {
  BookOpen,
  UserCheck,
  Calendar,
  MapPin,
  Users,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  BookMarked
} from "lucide-react";
export const CourseEnrollmentModule = ({
  role,
  courses,
  facultyList,
  students,
  selectedStudent,
  onEnrollCourse,
  onCreateCourse
}) => {
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [viewRosterCourse, setViewRosterCourse] = useState(null);
  const [enrollError, setEnrollError] = useState(null);
  const [enrollSuccess, setEnrollSuccess] = useState(null);
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [dept, setDept] = useState(DEPARTMENTS[0]);
  const [credits, setCredits] = useState(4);
  const [semester, setSemester] = useState(5);
  const [facultyId, setFacultyId] = useState(facultyList[0]?.id || "");
  const [schedule, setSchedule] = useState("Mon, Wed 10:00 AM - 11:30 AM");
  const [roomNumber, setRoomNumber] = useState("Lecture Hall 202");
  const [maxCapacity, setMaxCapacity] = useState(60);
  const [description, setDescription] = useState("");
  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.code.toLowerCase().includes(searchTerm.toLowerCase()) || c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.facultyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === "ALL" || c.department === selectedDept;
    return matchesSearch && matchesDept;
  });
  const handleEnrollClick = async (courseId, action) => {
    if (!selectedStudent) return;
    setEnrollError(null);
    setEnrollSuccess(null);
    try {
      await onEnrollCourse(courseId, selectedStudent.id, action);
      setEnrollSuccess(
        action === "enroll" ? "Successfully enrolled in course!" : "Successfully dropped course."
      );
      setTimeout(() => setEnrollSuccess(null), 3e3);
    } catch (err) {
      setEnrollError(err.message || "Enrollment failed");
      setTimeout(() => setEnrollError(null), 4e3);
    }
  };
  const handleAddCourseSubmit = async (e) => {
    e.preventDefault();
    if (!code || !title) return;
    const selectedFacultyObj = facultyList.find((f) => f.id === facultyId);
    await onCreateCourse({
      code,
      title,
      department: dept,
      credits: Number(credits),
      semester: Number(semester),
      facultyId,
      facultyName: selectedFacultyObj ? selectedFacultyObj.name : "Faculty Professor",
      schedule,
      roomNumber,
      maxCapacity: Number(maxCapacity),
      prerequisites: [],
      description
    });
    setShowAddCourseModal(false);
    setCode("");
    setTitle("");
  };
  return <div className="space-y-6">
      {
    /* Toast Feedback */
  }
      {enrollSuccess && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-pulse">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{enrollSuccess}</span>
        </div>}
      {enrollError && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{enrollError}</span>
        </div>}

      {
    /* Header & Controls */
  }
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span>Course Catalog & Enrollment</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse accredited university courses, check capacity, and register with prerequisite verification.
          </p>
        </div>

        {role === "ADMIN" && <button
    onClick={() => setShowAddCourseModal(true)}
    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-all shrink-0"
  >
            <Plus className="w-4 h-4" />
            <span>Add New Course</span>
          </button>}
      </div>

      {
    /* Search & Dept Filter */
  }
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <input
    type="text"
    placeholder="Search by course code, title, or instructor..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full bg-slate-50 text-slate-800 text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white"
  />
        </div>
        <div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full min-w-0 max-w-full truncate bg-slate-50 text-slate-800 text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="ALL">All Departments ({DEPARTMENTS.length})</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>
                {d}
              </option>)}
          </select>
        </div>
      </div>

      {
    /* Course Grid */
  }
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((c) => {
    const isEnrolled = selectedStudent ? c.enrolledStudents.includes(selectedStudent.id) : false;
    const isFull = c.enrolledStudents.length >= c.maxCapacity;
    return <div
      key={c.id}
      className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 transition-all shadow-xs flex flex-col justify-between"
    >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-1 text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">
                    {c.code}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {c.credits} Credits • Sem {c.semester}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">{c.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">{c.description}</p>

                <div className="space-y-2 text-xs text-slate-700 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate font-medium">{c.facultyName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{c.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{c.roomNumber}</span>
                  </div>
                </div>

                {
      /* Prerequisites Badge */
    }
                {c.prerequisites.length > 0 && <div className="mb-4 flex items-center gap-1.5 text-[11px] text-slate-500">
                    <BookMarked className="w-3 h-3 text-amber-500" />
                    <span>Prereqs:</span>
                    {c.prerequisites.map((p) => <span key={p} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[10px]">
                        {p}
                      </span>)}
                  </div>}
              </div>

              {
      /* Roster & Enroll Footer */
    }
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" /> Enrolled:
                  </span>
                  <span
      className={`font-bold ${isFull ? "text-rose-600" : "text-emerald-600"}`}
    >
                    {c.enrolledStudents.length} / {c.maxCapacity} Seats
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
      onClick={() => setViewRosterCourse(c)}
      className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold text-center border border-slate-200"
    >
                    View Roster
                  </button>

                  {role === "STUDENT" && <button
      onClick={() => handleEnrollClick(c.id, isEnrolled ? "drop" : "enroll")}
      disabled={!isEnrolled && isFull}
      className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all ${isEnrolled ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-600 hover:text-white" : isFull ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200" : "bg-blue-600 hover:bg-blue-500 text-white shadow-xs"}`}
    >
                      {isEnrolled ? "Drop Course" : isFull ? "Class Full" : "Enroll Now"}
                    </button>}
                </div>
              </div>
            </div>;
  })}
      </div>

      {
    /* Add Course Modal */
  }
      {showAddCourseModal && <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-4 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
    onClick={() => setShowAddCourseModal(false)}
    className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
  >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              <span>Create Accredited Course</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add a new course offering to the university academic calendar.
            </p>

            <form onSubmit={handleAddCourseSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Course Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS401"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Course Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Distributed Systems"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Department</label>
                  <select
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    className="w-full min-w-0 max-w-full truncate bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Instructor Faculty</label>
                  <select
                    value={facultyId}
                    onChange={(e) => setFacultyId(e.target.value)}
                    className="w-full min-w-0 max-w-full truncate bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    {facultyList.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.department.split(" ")[0]})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Schedule</label>
                  <input
    type="text"
    value={schedule}
    onChange={(e) => setSchedule(e.target.value)}
    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Room Number</label>
                  <input
    type="text"
    value={roomNumber}
    onChange={(e) => setRoomNumber(e.target.value)}
    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">Syllabus Overview</label>
                <textarea
    rows={2}
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    placeholder="Short course description and topics covered..."
    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
  />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
    type="button"
    onClick={() => setShowAddCourseModal(false)}
    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-semibold"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs"
  >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>}

      {
    /* Roster Drawer */
  }
      {viewRosterCourse && <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white border-l border-slate-200 h-full p-6 shadow-2xl relative space-y-4">
            <button
    onClick={() => setViewRosterCourse(null)}
    className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
  >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded">
                {viewRosterCourse.code}
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">{viewRosterCourse.title}</h3>
              <p className="text-xs text-slate-500">Instructor: {viewRosterCourse.facultyName}</p>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <h4 className="text-xs font-bold text-slate-700 mb-2">
                Enrolled Students ({viewRosterCourse.enrolledStudents.length})
              </h4>

              <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                {students.filter((s) => viewRosterCourse.enrolledStudents.includes(s.id)).map((s) => <div
    key={s.id}
    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
  >
                      <div className="flex items-center gap-2.5">
                        <img
    src={s.avatarUrl}
    alt={s.name}
    className="w-8 h-8 rounded-full object-cover"
  />
                        <div>
                          <div className="font-semibold text-slate-900">{s.name}</div>
                          <div className="text-[10px] font-mono text-slate-500">{s.rollNumber}</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-amber-600">GPA {s.gpa}</span>
                    </div>)}

                {viewRosterCourse.enrolledStudents.length === 0 && <p className="text-xs text-slate-400 italic">No students currently enrolled.</p>}
              </div>
            </div>
          </div>
        </div>}
    </div>;
};
