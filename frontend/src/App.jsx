import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import {
  fetchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  fetchFaculty,
  createFaculty,
  updateFaculty,
  fetchCourses,
  createCourse,
  enrollCourse,
  fetchGrades,
  saveGrade,
  fetchFees,
  payFee,
  updateFeeRecord,
  createFeeRecord,
  resetDueFees,
  fetchNotices,
  createNotice
} from "./services/api";
import {
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_BOOKS,
  INITIAL_ISSUED_BOOKS,
  INITIAL_HOSTEL_ALLOCATIONS,
  INITIAL_TRANSPORT_PASSES,
  INITIAL_EVENTS
} from "./data/mockData";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { DashboardOverview } from "./components/DashboardOverview";
import { StudentRecordsModule } from "./components/StudentRecordsModule";
import { CourseEnrollmentModule } from "./components/CourseEnrollmentModule";
import { GradingModule } from "./components/GradingModule";
import { FacultyManagementModule } from "./components/FacultyManagementModule";
import { DynamicQRAttendanceModule } from "./components/DynamicQRAttendanceModule";
import { FeeManagementModule } from "./components/FeeManagementModule";
import { TimetableModule } from "./components/TimetableModule";
import { NoticeBoardModule } from "./components/NoticeBoardModule";
import { AssignmentsModule } from "./components/AssignmentsModule";
import { LibraryModule } from "./components/LibraryModule";
import { HostelTransportModule } from "./components/HostelTransportModule";
import { EventsClubsModule } from "./components/EventsClubsModule";

function MainERPContent() {
  const { user, role, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [fees, setFees] = useState([]);
  const [notices, setNotices] = useState([]);
  const [readNoticeIds, setReadNoticeIds] = useState(() => {
    try {
      const saved = localStorage.getItem("studynet_read_notice_ids");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // When user views Notice Board, mark all current notice IDs as read
  useEffect(() => {
    if (activeTab === "notices" && notices.length > 0) {
      const allNoticeIds = notices.map((n) => n.id);
      setReadNoticeIds((prev) => {
        const hasUnread = allNoticeIds.some((id) => !prev.includes(id));
        if (!hasUnread) return prev;
        const updated = Array.from(new Set([...prev, ...allNoticeIds]));
        try {
          localStorage.setItem("studynet_read_notice_ids", JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }
  }, [activeTab, notices]);

  const unseenNoticeCount = notices.filter((n) => !readNoticeIds.includes(n.id)).length;
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
  const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS);
  const [books, setBooks] = useState(INITIAL_BOOKS);
  const [issuedBooks, setIssuedBooks] = useState(INITIAL_ISSUED_BOOKS);
  const [hostelAllocations, setHostelAllocations] = useState(INITIAL_HOSTEL_ALLOCATIONS);
  const [transportPasses, setTransportPasses] = useState(INITIAL_TRANSPORT_PASSES);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  useEffect(() => {
    async function loadInitialData() {
      if (!user) return;
      try {
        const [stRes, facRes, crsRes, grdRes, feeRes, notRes] = await Promise.all([
          fetchStudents(),
          fetchFaculty(),
          fetchCourses(),
          fetchGrades(),
          fetchFees(),
          fetchNotices()
        ]);
        
        const finalStudents = (Array.isArray(stRes) && stRes.length > 0) ? stRes : INITIAL_STUDENTS;
        const finalFaculty = (Array.isArray(facRes) && facRes.length > 0) ? facRes : INITIAL_FACULTY;
        const finalCourses = (Array.isArray(crsRes) && crsRes.length > 0) ? crsRes : INITIAL_COURSES;
        const finalGrades = (Array.isArray(grdRes) && grdRes.length > 0) ? grdRes : INITIAL_GRADES;
        const finalFees = Array.isArray(feeRes) ? feeRes : INITIAL_FEES;
        const finalNotices = (Array.isArray(notRes) && notRes.length > 0) ? notRes : INITIAL_NOTICES;

        setStudents(finalStudents);
        setFacultyList(finalFaculty);
        setCourses(finalCourses);
        setGrades(finalGrades);
        setFees(finalFees);
        setNotices(finalNotices);

        // Auto select student/faculty linked to user or defaults
        if (finalStudents.length > 0) {
          const matchedStudent = user?.linkedStudentId
            ? finalStudents.find((s) => s.id === user.linkedStudentId)
            : null;
          setSelectedStudent(matchedStudent || finalStudents[0]);
        }
        if (finalFaculty.length > 0) {
          const matchedFaculty = user?.linkedFacultyId
            ? finalFaculty.find((f) => f.id === user.linkedFacultyId)
            : null;
          setSelectedFaculty(matchedFaculty || finalFaculty[0]);
        }
      } catch (err) {
        console.error("Failed to load initial ERP data:", err);
        setStudents(INITIAL_STUDENTS);
        setFacultyList(INITIAL_FACULTY);
        setCourses(INITIAL_COURSES);
        setGrades(INITIAL_GRADES);
        setFees(INITIAL_FEES);
        setNotices(INITIAL_NOTICES);
        setSelectedStudent(INITIAL_STUDENTS[0]);
        setSelectedFaculty(INITIAL_FACULTY[0]);
      }
    }
    loadInitialData();
  }, [user]);

  const handleAddStudent = async (studentData) => {
    const created = await createStudent(studentData);
    setStudents((prev) => [created, ...prev]);
  };
  const handleUpdateStudent = async (id, data) => {
    try {
      const updated = await updateStudent(id, data);
      setStudents((prev) => prev.map((s) => s.id === id ? updated : s));
      if (selectedStudent?.id === id) {
        setSelectedStudent(updated);
      }
    } catch (err) {
      console.warn("API updateStudent failed, updating local state fallback:", err);
      setStudents((prev) => prev.map((s) => s.id === id ? { ...s, ...data } : s));
      if (selectedStudent?.id === id) {
        setSelectedStudent((prev) => prev ? { ...prev, ...data } : prev);
      }
    }
  };
  const handleDeleteStudent = async (id) => {
    await deleteStudent(id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };
  const handleAddFaculty = async (facData) => {
    const created = await createFaculty(facData);
    setFacultyList((prev) => [created, ...prev]);
  };
  const handleUpdateFaculty = async (id, facData) => {
    const updated = await updateFaculty(id, facData);
    setFacultyList((prev) => prev.map((f) => (f.id === id ? updated : f)));
    if (selectedFaculty?.id === id) {
      setSelectedFaculty(updated);
    }
  };
  const handleCreateCourse = async (courseData) => {
    const created = await createCourse(courseData);
    setCourses((prev) => [created, ...prev]);
  };
  const handleEnrollCourse = async (courseId, studentId, action) => {
    const updated = await enrollCourse(courseId, studentId, action);
    setCourses((prev) => prev.map((c) => c.id === courseId ? updated : c));
  };
  const handleSaveGrade = async (gradeData) => {
    const saved = await saveGrade(gradeData);
    setGrades((prev) => {
      const idx = prev.findIndex((g) => g.id === saved.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };
  const handlePayFee = async (feeId, amountPaid, preVerifiedFeeRecord, isExamFee = false) => {
    let updated = preVerifiedFeeRecord;
    if (!updated) {
      try {
        updated = await payFee(feeId, amountPaid, isExamFee);
      } catch (e) {
        console.warn("payFee API error, applying local state update:", e);
      }
    }
    setFees((prev) =>
      prev.map((f) => {
        if (f.id === feeId) {
          if (updated) return updated;
          const newPaid = (f.amountPaid || 0) + Number(amountPaid);
          const total =
            (f.tuitionFee || 0) +
            (f.labFee || 0) +
            (f.libraryFee || 0) +
            (f.examFee || 0) +
            (f.otherFee || 0);
          const isExamPaid = f.examFeePaid || isExamFee || Number(amountPaid) === Number(f.examFee) || newPaid >= total;
          return {
            ...f,
            amountPaid: newPaid,
            status: newPaid >= total ? "Paid" : newPaid > 0 ? "Partial" : "Pending",
            examFeePaid: isExamPaid,
            lastPaymentDate: new Date().toISOString().split("T")[0]
          };
        }
        return f;
      })
    );
    return updated;
  };
  const handleUpdateFee = async (feeId, feeData) => {
    const updated = await updateFeeRecord(feeId, feeData);
    setFees((prev) => prev.map((f) => (f.id === feeId ? updated : f)));
    return updated;
  };
  const handleCreateFee = async (feeData) => {
    const created = await createFeeRecord(feeData);
    setFees((prev) => [created, ...prev]);
    return created;
  };
  const handleResetFees = async () => {
    const updatedFees = await resetDueFees();
    setFees(updatedFees);
  };
  const handleCreateNotice = async (noticeData) => {
    const created = await createNotice(noticeData);
    setNotices((prev) => [created, ...prev]);
  };
  const handleAddAssignment = (asn) => {
    setAssignments((prev) => [asn, ...prev]);
  };
  const handleSubmitAssignment = (sub) => {
    setSubmissions((prev) => [sub, ...prev]);
  };
  const handleGradeSubmission = (submissionId, grade, feedback) => {
    setSubmissions(
      (prev) => prev.map(
        (s) => s.id === submissionId ? { ...s, gradeObtained: grade, feedback, status: "Graded" } : s
      )
    );
  };
  const handleAddBook = (bk) => {
    setBooks((prev) => [bk, ...prev]);
  };
  const handleIssueBook = (rec) => {
    setIssuedBooks((prev) => [rec, ...prev]);
    setBooks(
      (prev) => prev.map((b) => b.id === rec.bookId ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) } : b)
    );
  };
  const handleReturnBook = (recordId) => {
    setIssuedBooks(
      (prev) => prev.map((i) => i.id === recordId ? { ...i, status: "Returned" } : i)
    );
  };
  const handleClearFine = (recordId) => {
    setIssuedBooks(
      (prev) => prev.map((i) => i.id === recordId ? { ...i, fineAmount: 0 } : i)
    );
  };
  const handleAddHostel = (alloc) => {
    setHostelAllocations((prev) => [alloc, ...prev]);
  };
  const handleAddTransport = (pass) => {
    setTransportPasses((prev) => [pass, ...prev]);
  };
  const handleAddEvent = (evt) => {
    setEvents((prev) => [evt, ...prev]);
  };
  const handleRegisterEvent = (eventId, studentId) => {
    setEvents(
      (prev) => prev.map(
        (e) => e.id === eventId ? { ...e, registeredStudentIds: [...e.registeredStudentIds, studentId] } : e
      )
    );
  };

  useEffect(() => {
    if (role === "FACULTY" && (activeTab === "fees" || activeTab === "hostel-transport")) {
      setActiveTab("dashboard");
    }
  }, [role, activeTab]);

  return (
    <ProtectedRoute students={students} facultyList={facultyList}>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col selection:bg-blue-600 selection:text-white overflow-x-hidden w-full max-w-full">
        {/* Top Navbar */}
        <Navbar
          currentRole={role}
          setRole={() => {}}
          selectedStudent={selectedStudent}
          setSelectedStudent={(s) => setSelectedStudent(s)}
          selectedFaculty={selectedFaculty}
          setSelectedFaculty={(f) => setSelectedFaculty(f)}
          students={students}
          facultyList={facultyList}
          onLogout={logout}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Main App Layout */}
        <div className="flex-1 flex max-w-7xl w-full mx-auto relative">
          {/* Sidebar Navigation */}
          <Sidebar
            role={role}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            unseenNoticeCount={unseenNoticeCount}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />

          {/* Main Workspace Area */}
          <main className="flex-1 p-3 sm:p-6 overflow-x-hidden min-w-0">
            {activeTab === "dashboard" && (
              <DashboardOverview
                role={role}
                students={students}
                facultyList={facultyList}
                courses={courses}
                grades={grades}
                fees={fees}
                notices={notices}
                selectedStudent={selectedStudent}
                selectedFaculty={selectedFaculty}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === "qr-attendance" && (
              <DynamicQRAttendanceModule
                role={role}
                courses={courses}
                students={students}
                facultyList={facultyList}
                selectedStudent={selectedStudent}
                selectedFaculty={selectedFaculty}
              />
            )}

            {activeTab === "students" && (
              <StudentRecordsModule
                role={role}
                students={students}
                courses={courses}
                grades={grades}
                selectedStudent={selectedStudent}
                onAddStudent={handleAddStudent}
                onUpdateStudent={handleUpdateStudent}
                onDeleteStudent={handleDeleteStudent}
              />
            )}

            {activeTab === "courses" && (
              <CourseEnrollmentModule
                role={role}
                courses={courses}
                facultyList={facultyList}
                students={students}
                selectedStudent={selectedStudent}
                onEnrollCourse={handleEnrollCourse}
                onCreateCourse={handleCreateCourse}
              />
            )}

            {activeTab === "grades" && (
              <GradingModule
                role={role}
                grades={grades}
                courses={courses}
                students={students}
                selectedStudent={selectedStudent}
                onSaveGrade={handleSaveGrade}
              />
            )}

            {(activeTab === "faculty" || activeTab === "faculty-profile") && (
              <FacultyManagementModule
                role={role}
                facultyList={facultyList}
                courses={courses}
                selectedFaculty={selectedFaculty}
                onAddFaculty={handleAddFaculty}
                onUpdateFaculty={handleUpdateFaculty}
                initialView={activeTab === "faculty-profile" ? "my-profile" : "directory"}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === "fees" && (role === "ADMIN" || role === "STUDENT") && (
              <FeeManagementModule
                role={role}
                fees={fees}
                students={students}
                selectedStudent={selectedStudent}
                onPayFee={handlePayFee}
                onUpdateFee={handleUpdateFee}
                onCreateFee={handleCreateFee}
                onResetFees={handleResetFees}
              />
            )}

            {activeTab === "timetable" && (
              <TimetableModule
                role={role}
                courses={courses}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === "assignments" && (
              <AssignmentsModule
                role={role}
                selectedStudent={selectedStudent || void 0}
                courses={courses}
                assignments={assignments}
                submissions={submissions}
                onAddAssignment={handleAddAssignment}
                onSubmitAssignment={handleSubmitAssignment}
                onGradeSubmission={handleGradeSubmission}
              />
            )}

            {activeTab === "library" && (
              <LibraryModule
                role={role}
                selectedStudent={selectedStudent || void 0}
                students={students}
                books={books}
                issuedBooks={issuedBooks}
                onAddBook={handleAddBook}
                onIssueBook={handleIssueBook}
                onReturnBook={handleReturnBook}
                onClearFine={handleClearFine}
              />
            )}

            {activeTab === "hostel-transport" && (role === "ADMIN" || role === "STUDENT") && (
              <HostelTransportModule
                role={role}
                selectedStudent={selectedStudent || void 0}
                students={students}
                hostelAllocations={hostelAllocations}
                transportPasses={transportPasses}
                onAddHostel={handleAddHostel}
                onAddTransport={handleAddTransport}
              />
            )}

            {activeTab === "events" && (
              <EventsClubsModule
                role={role}
                selectedStudent={selectedStudent || void 0}
                events={events}
                onAddEvent={handleAddEvent}
                onRegisterEvent={handleRegisterEvent}
              />
            )}

            {activeTab === "notices" && (
              <NoticeBoardModule
                role={role}
                notices={notices}
                readNoticeIds={readNoticeIds}
                onCreateNotice={handleCreateNotice}
              />
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainERPContent />
    </AuthProvider>
  );
}
