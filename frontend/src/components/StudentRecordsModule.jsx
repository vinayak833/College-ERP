import { useState } from "react";
import ImageCropperModal from "./ImageCropperModal";
import { DEPARTMENTS, STUDENT_GRADUATION_AVATAR } from "../data/mockData";
import {
  Search,
  UserPlus,
  Mail,
  Phone,
  GraduationCap,
  Award,
  FileText,
  X,
  Building,
  Trash2,
  Printer,
  Edit3,
  MapPin,
  Shield,
  Camera,
  Upload,
  Image
} from "lucide-react";
export const StudentRecordsModule = ({
  role,
  students,
  courses,
  grades,
  selectedStudent,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedSem, setSelectedSem] = useState("ALL");
  const [viewDetailStudent, setViewDetailStudent] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [cropTarget, setCropTarget] = useState("modal");

  const handleAvatarFileUpload = (e, target = "modal") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert("Please select an image smaller than 8MB");
      return;
    }
    setCropTarget(target);
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result;
      if (rawDataUrl) {
        setImageToCrop(rawDataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropComplete = (croppedDataUrl) => {
    if (cropTarget === "direct" && currentStudentProfile) {
      onUpdateStudent(currentStudentProfile.id, {
        avatarUrl: croppedDataUrl
      });
      if (viewDetailStudent?.id === currentStudentProfile.id) {
        setViewDetailStudent((prev) => prev ? { ...prev, avatarUrl: croppedDataUrl } : prev);
      }
    } else {
      setEditForm((prev) => ({ ...prev, avatarUrl: croppedDataUrl }));
    }
    setImageToCrop(null);
  };
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    department: "",
    program: "",
    semester: 1,
    address: "",
    guardianName: "",
    guardianPhone: ""
  });
  const [newRoll, setNewRoll] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDept, setNewDept] = useState(DEPARTMENTS[0]);
  const [newProgram, setNewProgram] = useState("B.Tech Computer Science");
  const [newSem, setNewSem] = useState(1);
  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) || s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === "ALL" || s.department === selectedDept;
    const matchesSem = selectedSem === "ALL" || s.semester === Number(selectedSem);
    return matchesSearch && matchesDept && matchesSem;
  });
  const openEditModal = (st) => {
    setEditStudent(st);
    setEditForm({
      name: st.name,
      email: st.email,
      phone: st.phone,
      department: st.department,
      program: st.program,
      semester: st.semester,
      address: st.address || "",
      guardianName: st.guardianName || "",
      guardianPhone: st.guardianPhone || "",
      avatarUrl: st.avatarUrl || STUDENT_GRADUATION_AVATAR
    });
  };
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editStudent) return;
    onUpdateStudent(editStudent.id, {
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      department: editForm.department,
      program: editForm.program,
      semester: Number(editForm.semester),
      address: editForm.address,
      guardianName: editForm.guardianName,
      guardianPhone: editForm.guardianPhone,
      avatarUrl: editForm.avatarUrl
    });
    if (viewDetailStudent?.id === editStudent.id) {
      setViewDetailStudent({
        ...viewDetailStudent,
        ...editForm,
        semester: Number(editForm.semester),
        avatarUrl: editForm.avatarUrl
      });
    }
    setEditStudent(null);
  };
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newName || !newRoll || !newEmail) return;
    onAddStudent({
      rollNumber: newRoll,
      name: newName,
      email: newEmail,
      phone: newPhone || "+91 98765 43210",
      department: newDept,
      program: newProgram,
      semester: Number(newSem),
      section: "A",
      admissionYear: 2025,
      gpa: 8.5,
      avatarUrl: STUDENT_GRADUATION_AVATAR,
      status: "Active",
      address: "#142, 4th Cross, Indiranagar, Bengaluru, Karnataka - 560038",
      guardianName: "Guardian Name",
      guardianPhone: "+91 98765 00000"
    });
    setShowAddModal(false);
    setNewRoll("");
    setNewName("");
    setNewEmail("");
  };
  const currentStudentProfile = selectedStudent || students[0];
  return <div className="space-y-6">
      {
    /* Header & Controls */
  }
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-600" />
            <span>{role === "STUDENT" ? "My Student Profile" : "Student Records & Roster"}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {role === "STUDENT"
              ? "View and manage your academic profile, transcript details, enrolled courses, and guardian information."
              : role === "ADMIN"
              ? "Manage student enrollment profiles, edit credentials, view transcripts, and departmental allocations."
              : "View student enrollment profiles, transcripts, and departmental allocations."}
          </p>
        </div>

        {role === "ADMIN" && <button
    onClick={() => setShowAddModal(true)}
    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-all shrink-0"
  >
            <UserPlus className="w-4 h-4" />
            <span>Add New Student</span>
          </button>}
      </div>

      {
    /* When ROLE IS STUDENT: Show dedicated Current Student Profile view ONLY */
  }
      {role === "STUDENT" ? currentStudentProfile && <div className="space-y-6">
            {/* Main Student Profile Banner */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 text-slate-900 shadow-xs relative overflow-hidden">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 w-full lg:w-auto">
                  <div className="relative shrink-0">
                    <img
                      src={currentStudentProfile.avatarUrl}
                      alt={currentStudentProfile.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-2 ring-indigo-500/20 bg-slate-100"
                    />
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{currentStudentProfile.name}</h3>
                      <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono text-xs font-bold rounded-lg shrink-0">
                        {currentStudentProfile.rollNumber}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      {currentStudentProfile.program} • Semester {currentStudentProfile.semester} (Section {currentStudentProfile.section})
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{currentStudentProfile.department}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="truncate">{currentStudentProfile.email}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{currentStudentProfile.phone}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full lg:w-auto shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200">
                  <button
                    onClick={() => setViewDetailStudent(currentStudentProfile)}
                    className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer whitespace-nowrap"
                  >
                    <FileText className="w-4 h-4 shrink-0" />
                    <span>View Transcript</span>
                  </button>

                  <button
                    onClick={() => openEditModal(currentStudentProfile)}
                    className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Edit3 className="w-4 h-4 shrink-0" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Academic Highlights & Contact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {
    /* Card 1: Academic Summary */
  }
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                    Academic Standing
                  </span>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    GPA {currentStudentProfile.gpa.toFixed(2)}
                  </span>
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Admission Year:</span>
                    <span className="font-semibold text-slate-800">{currentStudentProfile.admissionYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Semester:</span>
                    <span className="font-semibold text-slate-800">Semester {currentStudentProfile.semester}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Enrolled Courses:</span>
                    <span className="font-semibold text-indigo-600">
                      {courses.filter((c) => c.enrolledStudents.includes(currentStudentProfile.id)).length} Active Courses
                    </span>
                  </div>
                </div>
              </div>

              {
    /* Card 2: Guardian Details */
  }
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    Guardian Contact
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">Verified</span>
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Guardian Name:</span>
                    <span className="font-semibold text-slate-800">{currentStudentProfile.guardianName || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contact Number:</span>
                    <span className="font-semibold text-slate-800">{currentStudentProfile.guardianPhone || "N/A"}</span>
                  </div>
                </div>
              </div>

              {
    /* Card 3: Address & Location */
  }
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    Campus Residence
                  </span>
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-500 block mb-0.5">Residential Address:</span>
                    <span className="font-medium text-slate-800">{currentStudentProfile.address || "#142, 4th Cross, Indiranagar, Bengaluru, Karnataka - 560038"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div> : (
    /* When ROLE IS ADMIN or FACULTY: Show full student directory and search/filter controls */
    <>
          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative sm:col-span-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
      type="text"
      placeholder="Search student by name, roll no, or email..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full bg-slate-50 text-slate-800 text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white"
    />
            </div>

            <div>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full min-w-0 max-w-full truncate bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white"
              >
                <option value="ALL">All Departments ({DEPARTMENTS.length})</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>
                    {d}
                  </option>)}
              </select>
            </div>

            <div>
              <select
                value={selectedSem}
                onChange={(e) => setSelectedSem(e.target.value)}
                className="w-full min-w-0 max-w-full truncate bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white"
              >
                <option value="ALL">All Semesters (1 - 8)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => <option key={sem} value={sem}>
                    Semester {sem}
                  </option>)}
              </select>
            </div>
          </div>

          {
      /* Student Grid / Roster Table */
    }
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((st) => {
      const stCourses = courses.filter((c) => c.enrolledStudents.includes(st.id));
      return <div
        key={st.id}
        className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 transition-all shadow-xs flex flex-col justify-between group"
      >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={st.avatarUrl}
                          alt={st.name}
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/20 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate" title={st.name}>
                            {st.name}
                          </h3>
                          <span className="text-[11px] font-mono text-indigo-600 font-bold block truncate">
                            {st.rollNumber}
                          </span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full shrink-0">
                        {st.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{st.department}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{st.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{st.phone}</span>
                      </div>
                    </div>

                    {
        /* Academic Metrics Pill */
      }
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center mb-4">
                      <div>
                        <div className="text-[10px] text-slate-500 font-medium">Cumulative GPA</div>
                        <div className="text-sm font-bold text-amber-600">{st.gpa.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-medium">Courses Enrolled</div>
                        <div className="text-sm font-bold text-indigo-600">{stCourses.length}</div>
                      </div>
                    </div>
                  </div>

                  {
        /* Actions Footer */
      }
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                    <button
        onClick={() => setViewDetailStudent(st)}
        className="flex-1 py-1.5 px-3 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-xl text-xs font-semibold transition-all text-center border border-indigo-100"
      >
                      View Profile & Transcript
                    </button>

                    {role === "ADMIN" && (
                      <button
                        onClick={() => openEditModal(st)}
                        className="p-1.5 bg-slate-100 hover:bg-indigo-600 text-slate-600 hover:text-white rounded-xl border border-slate-200 transition-all"
                        title="Edit Student Profile"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}

                    {role === "ADMIN" && <button
        onClick={() => onDeleteStudent(st.id)}
        className="p-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl border border-rose-200 transition-all"
        title="Remove Record"
      >
                        <Trash2 className="w-4 h-4" />
                      </button>}
                  </div>
                </div>;
    })}
          </div>

          {filteredStudents.length === 0 && <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
              <p className="text-slate-400 text-sm">No student records found matching your filters.</p>
            </div>}
        </>
  )}

      {
    /* Add Student Modal */
  }
      {showAddModal && <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-4 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
    onClick={() => setShowAddModal(false)}
    className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
  >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              <span>Enroll New Student</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter official university student credentials.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Roll Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS2025-099"
                    value={newRoll}
                    onChange={(e) => setNewRoll(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Smith"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="arun.kumar@studynet.edu.in"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98450 12345"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">Department</label>
                <select
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full min-w-0 max-w-full truncate bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Program</label>
                  <input
    type="text"
    value={newProgram}
    onChange={(e) => setNewProgram(e.target.value)}
    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Semester</label>
                  <select
                    value={newSem}
                    onChange={(e) => setNewSem(Number(e.target.value))}
                    className="w-full min-w-0 max-w-full truncate bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <option key={s} value={s}>
                        Semester {s}
                      </option>)}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
    type="button"
    onClick={() => setShowAddModal(false)}
    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-semibold"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs"
  >
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>}

      {
    /* Edit Student Profile Modal */
  }
      {editStudent && <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-4 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
    onClick={() => setEditStudent(null)}
    className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
  >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-indigo-600" />
              <span>Edit Student Profile</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Update official contact, academic, and guardian details for <strong className="text-slate-800">{editStudent.rollNumber}</strong>.
            </p>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              {/* Profile Picture Upload & Edit Control */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3.5">
                <div className="flex items-center gap-3">
                  <img
                    src={editForm.avatarUrl || STUDENT_GRADUATION_AVATAR}
                    alt="Profile Avatar"
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/30 bg-slate-100 shadow-xs shrink-0"
                  />
                  <div>
                    <label className="text-xs font-bold text-slate-800 block">Profile Picture</label>
                    <span className="text-[11px] text-slate-500">Official student photo ID</span>
                  </div>
                </div>

                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-2xs cursor-pointer transition-all active:scale-95 shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleAvatarFileUpload(e, "modal")}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Program</label>
                  <input
                    type="text"
                    value={editForm.program}
                    onChange={(e) => setEditForm({ ...editForm, program: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Department</label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={editForm.department}
                    className="w-full bg-slate-100 border border-slate-200 text-slate-500 text-xs p-2.5 rounded-xl cursor-not-allowed select-none font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Semester</label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={`Semester ${editForm.semester}`}
                    className="w-full bg-slate-100 border border-slate-200 text-slate-500 text-xs p-2.5 rounded-xl cursor-not-allowed select-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">Residential Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Guardian Name</label>
                  <input
    type="text"
    value={editForm.guardianName}
    onChange={(e) => setEditForm({ ...editForm, guardianName: e.target.value })}
    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Guardian Contact</label>
                  <input
    type="text"
    value={editForm.guardianPhone}
    onChange={(e) => setEditForm({ ...editForm, guardianPhone: e.target.value })}
    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
    type="button"
    onClick={() => setEditStudent(null)}
    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-semibold"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs"
  >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>}

      {
    /* Student Detail Drawer & Transcript Preview */
  }
      {viewDetailStudent && <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white border-l border-slate-200 h-full overflow-y-auto p-6 shadow-2xl relative space-y-6">
            <button
    onClick={() => setViewDetailStudent(null)}
    className="absolute right-5 top-5 text-slate-400 hover:text-slate-700 p-1 bg-slate-100 rounded-lg"
  >
              <X className="w-5 h-5" />
            </button>

            {
    /* Header */
  }
            <div className="flex items-center justify-between border-b border-slate-200 pb-5">
              <div className="flex items-center gap-4">
                <img
    src={viewDetailStudent.avatarUrl}
    alt={viewDetailStudent.name}
    className="w-16 h-16 rounded-2xl object-cover ring-4 ring-indigo-500/20"
  />
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{viewDetailStudent.name}</h3>
                  <p className="text-xs font-mono text-indigo-600 font-bold">{viewDetailStudent.rollNumber}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{viewDetailStudent.program} • Sem {viewDetailStudent.semester}</p>
                </div>
              </div>

              {role === "ADMIN" && (
                <button
                  onClick={() => openEditModal(viewDetailStudent)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-xl text-xs font-semibold border border-slate-200 transition-all shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            {
    /* Profile Info */
  }
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="font-semibold text-slate-900">{viewDetailStudent.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-semibold text-slate-900">{viewDetailStudent.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-semibold text-slate-900">{viewDetailStudent.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Address:</span>
                <span className="font-semibold text-slate-900">{viewDetailStudent.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Guardian:</span>
                <span className="font-semibold text-slate-900">{viewDetailStudent.guardianName} ({viewDetailStudent.guardianPhone})</span>
              </div>
            </div>

            {
    /* Academic Breakdown */
  }
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Academic Performance</span>
                </h4>
                <button
    onClick={() => setShowTranscriptModal(true)}
    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs"
  >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Official Transcript</span>
                </button>
              </div>

              <div className="space-y-2">
                {grades.filter((g) => g.studentId === viewDetailStudent.id).map((g) => <div
    key={g.id}
    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
  >
                      <div>
                        <div className="font-bold text-slate-900">{g.courseCode}: {g.courseTitle}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Score: {g.totalScore}/100 (Assgn: {g.assignments} | Mid: {g.midterm} | End: {g.finalExam})
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {g.letterGrade}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">{g.gradePoint} GP</div>
                      </div>
                    </div>)}
              </div>
            </div>

            {
    /* Transcript Modal */
  }
            {showTranscriptModal && <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl p-4 sm:p-6 shadow-2xl text-slate-800 relative max-h-[90vh] overflow-y-auto">
                  <button
    onClick={() => setShowTranscriptModal(false)}
    className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="text-center border-b border-slate-200 pb-4 mb-4">
                    <h2 className="text-lg font-bold tracking-wider text-indigo-700">STUDYNET UNIVERSITY OF TECHNOLOGY</h2>
                    <p className="text-xs text-slate-500">Office of the Academic Registrar • Official Grade Report</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                      <div><span className="text-slate-500">Student:</span> <strong className="text-slate-900">{viewDetailStudent.name}</strong></div>
                      <div><span className="text-slate-500">Roll No:</span> <strong className="text-slate-900">{viewDetailStudent.rollNumber}</strong></div>
                    </div>
                    <div>
                      <div><span className="text-slate-500">Department:</span> <strong className="text-slate-900">{viewDetailStudent.department}</strong></div>
                      <div><span className="text-slate-500">Cumulative GPA:</span> <strong className="text-amber-600">{viewDetailStudent.gpa} / 10.00</strong></div>
                    </div>
                  </div>

                  <div className="overflow-x-auto mb-6">
                    <table className="w-full min-w-[450px] text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase whitespace-nowrap">
                          <th className="py-2 px-1">Course</th>
                          <th className="py-2 px-1">Title</th>
                          <th className="py-2 px-1">Score</th>
                          <th className="py-2 px-1 text-right">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {grades.filter((g) => g.studentId === viewDetailStudent.id).map((g) => <tr key={g.id} className="whitespace-nowrap">
                            <td className="py-2 px-1 font-mono font-semibold text-indigo-700">{g.courseCode}</td>
                            <td className="py-2 px-1 text-slate-800">{g.courseTitle}</td>
                            <td className="py-2 px-1 text-slate-600">{g.totalScore} / 100</td>
                            <td className="py-2 px-1 text-right font-bold text-indigo-700">{g.letterGrade}</td>
                          </tr>)}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-4 border-t border-slate-200">
                    <div className="text-slate-500">
                      Digitally Verified by StudyNet Registrar • {(/* @__PURE__ */ new Date()).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <button
    onClick={() => window.print()}
    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-xs"
  >
                        <Printer className="w-3.5 h-3.5" /> Print Transcript
                      </button>
                    </div>
                  </div>
                </div>
              </div>}

          </div>
        </div>}

      {imageToCrop && (
        <ImageCropperModal
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={() => setImageToCrop(null)}
          title="Crop Student Profile Picture"
        />
      )}
    </div>;
};
