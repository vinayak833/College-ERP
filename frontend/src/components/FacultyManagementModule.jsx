import { useState, useEffect, useRef } from "react";
import ImageCropperModal from "./ImageCropperModal";
import { DEPARTMENTS } from "../data/mockData";
import {
  UserCheck,
  Building,
  Mail,
  BookOpen,
  MapPin,
  Plus,
  Search,
  X,
  Award,
  Eye,
  Phone,
  Calendar,
  Copy,
  Check,
  User,
  ExternalLink,
  ShieldCheck,
  Pencil,
  Save,
  QrCode,
  CalendarDays,
  Camera,
  Upload,
  Image as ImageIcon,
  RotateCcw
} from "lucide-react";

export const generateInitialAvatarSvg = (name, hexColor = "%234f46e5") => {
  const initials = (name || "Faculty")
    .replace(/(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)/gi, "")
    .trim()
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "FC";

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="60" fill="${hexColor}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="700">${initials}</text></svg>`;
};

export const FacultyManagementModule = ({
  role,
  facultyList,
  courses,
  selectedFaculty,
  onAddFaculty,
  onUpdateFaculty,
  initialView = "directory",
  onNavigateTab
}) => {
  const [activeView, setActiveView] = useState(() => {
    if (role !== "FACULTY") return "directory";
    if (initialView) return initialView;
    return "my-profile";
  });

  useEffect(() => {
    if (role !== "FACULTY") {
      setActiveView("directory");
    } else if (initialView) {
      setActiveView(initialView);
    }
  }, [initialView, role]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [profileModalFaculty, setProfileModalFaculty] = useState(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const fileInputRef = useRef(null);

  // Edit My Profile Modal State
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    phone: "",
    officeRoom: "",
    specialization: "",
    officeHours: "Monday & Wednesday: 02:00 PM - 04:00 PM | Friday: 11:00 AM - 01:00 PM",
    avatarUrl: ""
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Form State for Add Faculty
  const [employeeId, setEmployeeId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [designation, setDesignation] = useState("Professor");
  const [specialization, setSpecialization] = useState("");
  const [officeRoom, setOfficeRoom] = useState("Tech Block 101");

  // Determine current logged-in/selected faculty profile
  const myFaculty =
    selectedFaculty ||
    facultyList.find((f) => f.email === selectedFaculty?.email) ||
    facultyList[0];

  const filteredFaculty = facultyList.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.specialization && f.specialization.toLowerCase().includes(searchTerm.toLowerCase())) ||
      f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === "ALL" || f.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !employeeId) return;
    const defaultAvatar = generateInitialAvatarSvg(name, "%234f46e5");
    await onAddFaculty({
      employeeId,
      name,
      email,
      phone: phone || "+91 98000 00000",
      department,
      designation,
      specialization: specialization || "Computer Science & Engineering",
      joiningYear: 2025,
      officeRoom,
      avatarUrl: defaultAvatar,
      status: "Active",
      coursesAssigned: []
    });
    setShowAddModal(false);
    setEmployeeId("");
    setName("");
    setEmail("");
  };

  const handleOpenEditModal = () => {
    if (!myFaculty) return;
    setEditProfileData({
      phone: myFaculty.phone || "+91 98455 99599",
      officeRoom: myFaculty.officeRoom || "Tech Block 101",
      specialization: myFaculty.specialization || "Computer Science & Engineering",
      officeHours: myFaculty.officeHours || "Monday & Wednesday: 02:00 PM - 04:00 PM | Friday: 11:00 AM - 01:00 PM",
      avatarUrl: myFaculty.avatarUrl || generateInitialAvatarSvg(myFaculty.name)
    });
    setShowEditProfileModal(true);
  };

  const handleSaveProfileEdit = async (e) => {
    e.preventDefault();
    if (!myFaculty || !onUpdateFaculty) return;
    try {
      setIsUpdating(true);
      await onUpdateFaculty(myFaculty.id, editProfileData);
      setShowEditProfileModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile: " + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const [imageToCrop, setImageToCrop] = useState(null);
  const [cropTarget, setCropTarget] = useState("modal");

  const handleDirectAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !myFaculty) return;
    if (file.size > 8 * 1024 * 1024) {
      alert("Please select an image smaller than 8MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result;
      if (base64Url) {
        setCropTarget("direct");
        setImageToCrop(base64Url);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleModalAvatarFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert("Please select an image smaller than 8MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result;
      if (base64Url) {
        setCropTarget("modal");
        setImageToCrop(base64Url);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleFacultyCropComplete = async (croppedDataUrl) => {
    if (cropTarget === "direct" && myFaculty && onUpdateFaculty) {
      try {
        await onUpdateFaculty(myFaculty.id, { avatarUrl: croppedDataUrl });
      } catch (err) {
        console.error("Failed to update avatar photo:", err);
      }
    } else {
      setEditProfileData((prev) => ({ ...prev, avatarUrl: croppedDataUrl }));
    }
    setImageToCrop(null);
  };

  const handleCopyEmail = (emailStr) => {
    navigator.clipboard.writeText(emailStr);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const avatarPresets = [
    { name: "Indigo", hex: "%234f46e5", bgClass: "bg-indigo-600" },
    { name: "Emerald", hex: "%23059669", bgClass: "bg-emerald-600" },
    { name: "Sky", hex: "%230284c7", bgClass: "bg-sky-600" },
    { name: "Violet", hex: "%237c3aed", bgClass: "bg-violet-600" },
    { name: "Rose", hex: "%23e11d48", bgClass: "bg-rose-600" },
    { name: "Amber", hex: "%23d97706", bgClass: "bg-amber-600" }
  ];

  return (
    <div className="space-y-6">
      {/* Hidden File Input for direct header upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleDirectAvatarUpload}
      />

      {/* Top Section & View Tabs Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-indigo-600 shrink-0" />
              <span>{role === "FACULTY" && activeView === "my-profile" ? "My Faculty Profile" : "Faculty Directory"}</span>
            </h2>
            {role === "FACULTY" && (
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                Faculty Portal
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {role === "FACULTY" && activeView === "my-profile"
              ? "View and manage your faculty profile, upload profile picture, office room, assigned teaching workload, and consultation hours."
              : "Academic staff directory, departmental leadership, office hours, and teaching workload assignments."}
          </p>
        </div>

        {/* View Selection Tabs & Admin Actions */}
        <div className="flex flex-wrap items-center gap-2 max-w-full">
          {role === "FACULTY" && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto max-w-full no-scrollbar shrink-0">
              <button
                onClick={() => setActiveView("my-profile")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeView === "my-profile"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => setActiveView("directory")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeView === "directory"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Faculty Directory</span>
              </button>
            </div>
          )}

          {role === "ADMIN" && activeView === "directory" && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Faculty</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: MY FACULTY PROFILE */}
      {role === "FACULTY" && activeView === "my-profile" && myFaculty && (
        <div className="space-y-6">
          {/* Main Profile Header Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
              {/* Profile Avatar with Hover Upload Camera Overlay */}
              <div className="relative group shrink-0">
                <img
                  src={myFaculty.avatarUrl || generateInitialAvatarSvg(myFaculty.name)}
                  alt={myFaculty.name}
                  className="w-24 h-24 rounded-2xl object-cover ring-4 ring-indigo-500/20 shadow-md bg-indigo-50"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload / Change Profile Picture"
                  className="absolute inset-0 bg-slate-900/65 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer p-1"
                >
                  <Camera className="w-6 h-6 mb-1 text-white" />
                  <span className="text-[10px] font-bold text-center">Upload Photo</span>
                </button>
              </div>

              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <h3 className="text-2xl font-bold text-slate-900">{myFaculty.name}</h3>
                  <span className="px-3 py-0.5 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                    {myFaculty.designation}
                  </span>
                  <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                    {myFaculty.status || "Active Faculty"}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-600 flex items-center justify-center md:justify-start gap-1.5">
                  <Building className="w-4 h-4 text-indigo-600" />
                  <span>{myFaculty.department}</span>
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1 text-xs text-slate-500 font-mono">
                  <span className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                    Employee ID: <strong className="text-slate-800">{myFaculty.employeeId}</strong>
                  </span>
                  <span className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                    Joined: <strong className="text-slate-800">{myFaculty.joiningYear || 2021}</strong>
                  </span>
                  <span className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                    Office: <strong className="text-slate-800">{myFaculty.officeRoom}</strong>
                  </span>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap md:flex-col items-center justify-center gap-2 shrink-0 w-full md:w-auto">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer w-full justify-center"
                >
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Upload Photo</span>
                </button>

                <button
                  onClick={handleOpenEditModal}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer w-full justify-center"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>

                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab("timetable")}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer w-full justify-center border border-slate-200"
                  >
                    <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
                    <span>View Timetable</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 block">Assigned Workload</span>
              <div className="text-xl font-bold font-mono text-indigo-600">
                {courses.filter((c) => c.facultyId === myFaculty.id).length} Courses
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 block">Academic Department</span>
              <div className="text-xs font-bold text-slate-800 truncate">{myFaculty.department}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 block">Office Room</span>
              <div className="text-xs font-bold text-slate-800 font-mono">{myFaculty.officeRoom}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 block">Verification Status</span>
              <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Staff
              </div>
            </div>
          </div>

          {/* Detailed Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact & Location Details */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between text-indigo-700 border-b border-slate-100 pb-2">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4" /> Contact & Location Information
                </span>
                <button
                  onClick={handleOpenEditModal}
                  className="text-[11px] text-indigo-600 hover:underline font-semibold"
                >
                  Edit
                </button>
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="font-medium truncate">{myFaculty.email}</span>
                  </div>
                  <button
                    onClick={() => handleCopyEmail(myFaculty.email)}
                    className="px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    {copiedEmail ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                    <span>{copiedEmail ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">{myFaculty.phone || "+91 98455 99599"}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Mobile / Direct</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-medium">Room {myFaculty.officeRoom} (Central Academic Block)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Specialization & Research Area */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-blue-700 border-b border-slate-100 pb-2">
                <Award className="w-4 h-4" /> Academic Specialization & Research Domain
              </h4>

              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-slate-800 leading-relaxed font-medium space-y-2">
                <p>{myFaculty.specialization}</p>
                <div className="text-[11px] text-slate-500 pt-1 border-t border-blue-100">
                  Primary Research Focus: Distributed Systems, Higher Education Pedagogy, and Academic Excellence.
                </div>
              </div>

              {/* Consultation Hours */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Calendar className="w-4 h-4 text-indigo-600" /> Office Consultation Hours
                </div>
                <p className="text-xs text-slate-600">
                  {myFaculty.officeHours || "Monday & Wednesday: 02:00 PM - 04:00 PM | Friday: 11:00 AM - 01:00 PM"}
                </p>
              </div>
            </div>
          </div>

          {/* Assigned Courses / Teaching Workload */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Assigned Teaching Courses</span>
              </h4>
              <span className="text-xs font-mono px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 rounded-full text-indigo-700 font-bold">
                {courses.filter((c) => c.facultyId === myFaculty.id).length} Active Classes
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {courses
                .filter((c) => c.facultyId === myFaculty.id)
                .map((course) => (
                  <div
                    key={course.id}
                    className="p-4 bg-slate-50 hover:bg-white hover:border-indigo-300 rounded-xl border border-slate-200 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-mono text-[10px] font-bold rounded">
                          {course.code}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {course.credits} Credits
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-900 line-clamp-1">{course.title}</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">{course.department}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-mono">Room: {course.roomNumber || "301"}</span>
                      <span className="text-indigo-600 font-bold">
                        {course.enrolledStudentIds?.length || 0} Enrolled
                      </span>
                    </div>
                  </div>
                ))}

              {courses.filter((c) => c.facultyId === myFaculty.id).length === 0 && (
                <div className="col-span-full p-6 text-center text-xs text-slate-400 italic bg-slate-50 rounded-xl border border-slate-200">
                  No active course assignments recorded for the current semester.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: FACULTY DIRECTORY */}
      {activeView === "directory" && (
        <div className="space-y-6">
          {/* Search & Dept Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search faculty name, specialization, employee ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>
            <div>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full min-w-0 max-w-full truncate bg-slate-50 text-slate-800 text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white"
              >
                <option value="ALL">All Departments ({DEPARTMENTS.length})</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Faculty Directory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFaculty.map((fac) => {
              const assignedCourseObjs = courses.filter((c) => c.facultyId === fac.id);
              const isMyProfile = selectedFaculty?.id === fac.id || selectedFaculty?.email === fac.email;

              return (
                <div
                  key={fac.id}
                  className={`bg-white border rounded-2xl p-4 sm:p-5 transition-all shadow-xs flex flex-col justify-between relative group ${
                    isMyProfile ? "border-indigo-300 ring-2 ring-indigo-500/10" : "border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <img
                          src={fac.avatarUrl || generateInitialAvatarSvg(fac.name)}
                          alt={fac.name}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover ring-2 ring-indigo-500/20 shrink-0 bg-indigo-50"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug truncate" title={fac.name}>
                            {fac.name}
                          </h3>
                          <span
                            className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full inline-block mt-0.5 max-w-full truncate"
                            title={fac.designation}
                          >
                            {fac.designation}
                          </span>
                          <div className="text-[10px] font-mono text-slate-500 font-bold mt-0.5">{fac.employeeId}</div>
                        </div>
                      </div>

                      {isMyProfile && (
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full shrink-0">
                          You
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2 min-w-0">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate" title={fac.department}>{fac.department}</span>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate text-slate-800 font-medium" title={fac.specialization}>{fac.specialization}</span>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">Office: {fac.officeRoom}</span>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate" title={fac.email}>{fac.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Workload & Action Button */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" /> Assigned ({assignedCourseObjs.length}):
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {assignedCourseObjs.map((c) => (
                          <span
                            key={c.id}
                            className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold border border-indigo-200"
                          >
                            {c.code}
                          </span>
                        ))}
                        {assignedCourseObjs.length === 0 && (
                          <span className="text-[10px] text-slate-400 italic">No courses</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setProfileModalFaculty(fac)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      <span>View Info</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: VIEW FACULTY DETAILS (FOR DIRECTORY GRID) */}
      {profileModalFaculty && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setProfileModalFaculty(null)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-all cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-6 border-b border-slate-200">
              <img
                src={profileModalFaculty.avatarUrl || generateInitialAvatarSvg(profileModalFaculty.name)}
                alt={profileModalFaculty.name}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-500/20 shadow-md shrink-0 bg-indigo-50"
              />
              <div className="text-center sm:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  <h3 className="text-xl font-bold text-slate-900">{profileModalFaculty.name}</h3>
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                    {profileModalFaculty.designation}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                    {profileModalFaculty.status || "Active"}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center justify-center sm:justify-start gap-1">
                  <Building className="w-3.5 h-3.5 text-indigo-600" />
                  {profileModalFaculty.department}
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 font-mono">
                  <span className="bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                    ID: <strong>{profileModalFaculty.employeeId}</strong>
                  </span>
                  <span className="bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                    Joined: <strong>{profileModalFaculty.joiningYear || 2021}</strong>
                  </span>
                  <span className="bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                    Office: <strong>{profileModalFaculty.officeRoom}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Contact & Quick Actions Bar */}
            <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-4 text-slate-700 font-medium">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-indigo-600" />
                  <span>{profileModalFaculty.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>{profileModalFaculty.phone || "+91 98455 99599"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyEmail(profileModalFaculty.email)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedEmail ? "Copied!" : "Copy Email"}</span>
                </button>

                <a
                  href={`mailto:${profileModalFaculty.email}`}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Contact</span>
                </a>
              </div>
            </div>

            {/* Main Profile Info Grid */}
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-indigo-700">
                  <Award className="w-4 h-4" /> Academic Specialization & Research Area
                </h4>
                <p className="text-xs text-slate-700 font-medium bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 leading-relaxed">
                  {profileModalFaculty.specialization}
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between text-indigo-700">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" /> Assigned Teaching Workload
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded-full text-indigo-700 font-bold">
                    {courses.filter((c) => c.facultyId === profileModalFaculty.id).length} Active Courses
                  </span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {courses
                    .filter((c) => c.facultyId === profileModalFaculty.id)
                    .map((course) => (
                      <div
                        key={course.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-mono text-[10px] font-bold rounded">
                              {course.code}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500">
                              {course.credits} Credits
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-slate-900 line-clamp-1">{course.title}</h5>
                        </div>
                        <div className="mt-2 text-[10px] text-slate-500 font-medium flex items-center justify-between">
                          <span>{course.department}</span>
                          <span className="text-indigo-600 font-bold">{course.enrolledStudentIds?.length || 0} Enrolled</span>
                        </div>
                      </div>
                    ))}

                  {courses.filter((c) => c.facultyId === profileModalFaculty.id).length === 0 && (
                    <div className="col-span-2 p-4 text-center text-xs text-slate-400 italic bg-slate-50 rounded-xl border border-slate-200">
                      No active courses assigned for the current semester.
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
                    <Calendar className="w-4 h-4 text-indigo-600" /> Office Consultation Hours
                  </div>
                  <p className="text-xs text-slate-600">
                    {profileModalFaculty.officeHours || "Monday & Wednesday: 02:00 PM - 04:00 PM | Friday: 11:00 AM - 01:00 PM"}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
                    <MapPin className="w-4 h-4 text-emerald-600" /> Physical Location
                  </div>
                  <p className="text-xs text-slate-600">
                    Faculty Office Block, Room <strong>{profileModalFaculty.officeRoom}</strong><br />
                    Central Academic Building
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified Faculty Member
              </div>
              <button
                onClick={() => setProfileModalFaculty(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT MY FACULTY PROFILE */}
      {showEditProfileModal && myFaculty && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowEditProfileModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0">
                <Pencil className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Faculty Profile</h3>
                <p className="text-xs text-slate-500">{myFaculty.name} ({myFaculty.employeeId})</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfileEdit} className="space-y-4">
              {/* Profile Photo Uploader Section */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-indigo-600" /> Profile Picture / Avatar
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">Upload photo or pick theme</span>
                </label>

                <div className="flex items-center gap-4">
                  <img
                    src={editProfileData.avatarUrl || generateInitialAvatarSvg(myFaculty.name)}
                    alt="Preview"
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/20 shadow-xs shrink-0 bg-white"
                  />

                  <div className="space-y-2 flex-1">
                    <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-all w-full">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload New Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleModalAvatarFileUpload}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setEditProfileData((prev) => ({
                          ...prev,
                          avatarUrl: generateInitialAvatarSvg(myFaculty.name, "%234f46e5")
                        }))
                      }
                      className="flex items-center justify-center gap-1 px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-semibold transition-all cursor-pointer w-full"
                    >
                      <RotateCcw className="w-3 h-3 text-slate-500" />
                      <span>Reset to Initial Avatar</span>
                    </button>
                  </div>
                </div>

                {/* Preset Avatar Color Badges */}
                <div className="pt-2 border-t border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-500 block mb-1.5">
                    Avatar Initial Color Themes:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {avatarPresets.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() =>
                          setEditProfileData((prev) => ({
                            ...prev,
                            avatarUrl: generateInitialAvatarSvg(myFaculty.name, preset.hex)
                          }))
                        }
                        className={`w-7 h-7 rounded-full ${preset.bgClass} flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-white hover:scale-110 transition-all cursor-pointer shadow-xs`}
                        title={`Use ${preset.name} Theme`}
                      >
                        ✓
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editProfileData.phone}
                  onChange={(e) => setEditProfileData({ ...editProfileData, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">Office Room Number</label>
                <input
                  type="text"
                  value={editProfileData.officeRoom}
                  onChange={(e) => setEditProfileData({ ...editProfileData, officeRoom: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">Specialization & Research Focus</label>
                <textarea
                  rows={2}
                  value={editProfileData.specialization}
                  onChange={(e) => setEditProfileData({ ...editProfileData, specialization: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 font-medium resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">Office Consultation Hours</label>
                <input
                  type="text"
                  value={editProfileData.officeHours}
                  onChange={(e) => setEditProfileData({ ...editProfileData, officeHours: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isUpdating ? "Saving..." : "Save Profile"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW FACULTY MEMBER (ADMIN ONLY) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-4 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              <span>Add Faculty Member</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Register new professor or department lecturer profile.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="EMP-CS-09"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Marie Curie"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="marie.curie@studynet.edu.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Designation</label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full min-w-0 max-w-full truncate bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                  >
                    <option value="Head of Department">Head of Department</option>
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full min-w-0 max-w-full truncate bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Office Room</label>
                  <input
                    type="text"
                    value={officeRoom}
                    onChange={(e) => setOfficeRoom(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">Specialization & Research</label>
                <input
                  type="text"
                  placeholder="e.g. Quantum Computing & Distributed Algorithms"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Save Faculty Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {imageToCrop && (
        <ImageCropperModal
          imageSrc={imageToCrop}
          onCropComplete={handleFacultyCropComplete}
          onCancel={() => setImageToCrop(null)}
          title="Crop Faculty Profile Picture"
        />
      )}
    </div>
  );
};
