import { useState } from "react";
import {
  FileText,
  Plus,
  Clock,
  CheckCircle,
  UploadCloud,
  Award,
  X,
  Filter,
  ExternalLink
} from "lucide-react";
export const AssignmentsModule = ({
  role,
  selectedStudent,
  courses,
  assignments,
  submissions,
  onAddAssignment,
  onSubmitAssignment,
  onGradeSubmission
}) => {
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState("assignments");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(null);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxMarks, setMaxMarks] = useState(100);
  const [submissionText, setSubmissionText] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [gradeInput, setGradeInput] = useState(0);
  const [feedbackInput, setFeedbackInput] = useState("");
  const filteredAssignments = assignments.filter((a) => {
    if (selectedCourseFilter === "ALL") return true;
    return a.courseId === selectedCourseFilter;
  });
  const handleCreateAssignment = (e) => {
    e.preventDefault();
    const courseObj = courses.find((c) => c.id === courseId);
    const newAsn = {
      id: `ASN-${Date.now().toString().slice(-4)}`,
      courseId,
      courseCode: courseObj?.code || "CS301",
      courseTitle: courseObj?.title || "Data Structures",
      title,
      description,
      dueDate,
      maxMarks: Number(maxMarks),
      facultyName: courseObj?.facultyName || "Faculty Advisor"
    };
    onAddAssignment(newAsn);
    setShowAddModal(false);
    setTitle("");
    setDescription("");
    setDueDate("");
  };
  const handleStudentSubmit = (e) => {
    e.preventDefault();
    if (!showSubmitModal || !selectedStudent) return;
    const newSub = {
      id: `SUB-${Date.now().toString().slice(-4)}`,
      assignmentId: showSubmitModal.id,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      studentRoll: selectedStudent.rollNumber,
      submittedAt: (/* @__PURE__ */ new Date()).toLocaleString(),
      submissionText,
      fileUrl: fileUrl || void 0,
      status: "Submitted"
    };
    onSubmitAssignment(newSub);
    setShowSubmitModal(null);
    setSubmissionText("");
    setFileUrl("");
  };
  const handleSaveGrade = (e) => {
    e.preventDefault();
    if (!gradingSubmission) return;
    onGradeSubmission(gradingSubmission.id, Number(gradeInput), feedbackInput);
    setGradingSubmission(null);
  };
  return <div className="space-y-6">
      {
    /* Header */
  }
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600 shrink-0" />
            <span>Coursework & Assignments Portal</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track lab reports, project submissions, deadlined tasks, and grade feedback.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 max-w-full">
          {/* View toggle for Faculty/Admin */}
          {(role === "FACULTY" || role === "ADMIN") && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto max-w-full no-scrollbar shrink-0">
              <button
                onClick={() => setActiveTab("assignments")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === "assignments"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Assignments List
              </button>
              <button
                onClick={() => setActiveTab("submissions")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === "submissions"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Student Submissions ({submissions.length})
              </button>
            </div>
          )}

          {/* Create button */}
          {(role === "FACULTY" || role === "ADMIN") && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-xs shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Assignment</span>
            </button>
          )}
        </div>
      </div>

      {
    /* Main Content View */
  }
      {activeTab === "assignments" ? <div className="space-y-4">
          {
    /* Filter Bar */
  }
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-xs max-w-full overflow-hidden">
            <div className="flex items-center gap-1.5 shrink-0">
              <Filter className="w-4 h-4 text-slate-400 ml-0.5" />
              <span className="text-xs font-medium text-slate-600">Filter by Course:</span>
            </div>
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="w-full sm:w-auto min-w-0 max-w-full truncate text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Courses</option>
              {courses.map((c) => <option key={c.id} value={c.id}>
                  {c.code} - {c.title}
                </option>)}
            </select>
          </div>

          {
    /* Assignments Grid */
  }
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAssignments.map((asn) => {
    const mySubmission = selectedStudent ? submissions.find((s) => s.assignmentId === asn.id && s.studentId === selectedStudent.id) : null;
    return <div key={asn.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {asn.courseCode}
                      </span>
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Due: <strong className="text-slate-800">{asn.dueDate}</strong>
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{asn.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-3">{asn.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500">
                      <span>Max Score: <strong>{asn.maxMarks} pts</strong></span> • <span>Instructor: {asn.facultyName}</span>
                    </div>

                    {role === "STUDENT" && <div>
                        {mySubmission ? <div className="flex items-center gap-1.5">
                            {mySubmission.status === "Graded" ? <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                <Award className="w-3.5 h-3.5" /> Graded: {mySubmission.gradeObtained}/{asn.maxMarks}
                              </span> : <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> Submitted
                              </span>}
                          </div> : <button
      onClick={() => setShowSubmitModal(asn)}
      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-xs"
    >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>Submit Work</span>
                          </button>}
                      </div>}
                  </div>
                </div>;
  })}

            {filteredAssignments.length === 0 && <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
                No active assignments found for the selected course filter.
              </div>}
          </div>
        </div> : (
    /* Submissions View (For Faculty / Admin) */
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Student Submissions Queue ({submissions.length})
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {submissions.map((sub) => {
      const parentAsn = assignments.find((a) => a.id === sub.assignmentId);
      return <div key={sub.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{sub.studentName}</span>
                      <span className="text-[11px] font-mono font-semibold px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-600">
                        {sub.studentRoll}
                      </span>
                      <span className="text-xs font-semibold text-indigo-700">
                        [{parentAsn?.courseCode}] {parentAsn?.title}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 italic font-mono bg-slate-50 p-2 rounded-lg border border-slate-200/60 max-w-2xl">
                      "{sub.submissionText}"
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span>Submitted: {sub.submittedAt}</span>
                      {sub.fileUrl && <a
        href={sub.fileUrl}
        target="_blank"
        rel="noreferrer"
        className="text-blue-600 hover:underline flex items-center gap-0.5 font-medium"
      >
                          <ExternalLink className="w-3 h-3" /> View Work Link
                        </a>}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    {sub.status === "Graded" ? <div className="text-right">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg block">
                          Score: {sub.gradeObtained} / {parentAsn?.maxMarks || 100}
                        </span>
                        {sub.feedback && <span className="text-[10px] text-slate-500 truncate max-w-[150px] block mt-0.5">
                            "{sub.feedback}"
                          </span>}
                      </div> : <button
        onClick={() => {
          setGradingSubmission(sub);
          setGradeInput(90);
          setFeedbackInput("Good work!");
        }}
        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs"
      >
                        Evaluate Submission
                      </button>}
                  </div>
                </div>;
    })}

            {submissions.length === 0 && <div className="p-8 text-center text-slate-400 text-xs italic">
                No student submissions received yet.
              </div>}
          </div>
        </div>
  )}

      {
    /* Add Assignment Modal */
  }
      {showAddModal && <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4">
            <button onClick={() => setShowAddModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>Create New Coursework Assignment</span>
            </h3>

            <form onSubmit={handleCreateAssignment} className="space-y-3">
              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">Target Course *</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full min-w-0 max-w-full truncate bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                >
                  {courses.map((c) => <option key={c.id} value={c.id}>
                      [{c.code}] {c.title}
                    </option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">Assignment Title *</label>
                <input
    type="text"
    required
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    placeholder="e.g. Lab 4: Memory Profiling & Graph Algorithms"
    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
  />
              </div>

              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">Instructions & Guidelines *</label>
                <textarea
    required
    rows={3}
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    placeholder="Explain requirements, deliverables, and format..."
    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
  />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Due Date *</label>
                  <input
    type="date"
    required
    value={dueDate}
    onChange={(e) => setDueDate(e.target.value)}
    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Maximum Marks</label>
                  <input
    type="number"
    value={maxMarks}
    onChange={(e) => setMaxMarks(Number(e.target.value))}
    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
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
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>}

      {
    /* Student Submit Work Modal */
  }
      {showSubmitModal && <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4">
            <button onClick={() => setShowSubmitModal(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-indigo-600" />
              <span>Submit Assignment Solution</span>
            </h3>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-800">{showSubmitModal.title}</div>
              <div className="text-slate-500">Course: {showSubmitModal.courseCode} • Due: {showSubmitModal.dueDate}</div>
            </div>

            <form onSubmit={handleStudentSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">Submission Response & Notes *</label>
                <textarea
    required
    rows={4}
    value={submissionText}
    onChange={(e) => setSubmissionText(e.target.value)}
    placeholder="Summarize your approach, key findings, or code execution notes..."
    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
  />
              </div>

              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">GitHub / Drive / File URL Link</label>
                <input
    type="url"
    value={fileUrl}
    onChange={(e) => setFileUrl(e.target.value)}
    placeholder="https://github.com/username/project-repo"
    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
  />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
    type="button"
    onClick={() => setShowSubmitModal(null)}
    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-semibold"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs"
  >
                  Submit Deliverable
                </button>
              </div>
            </form>
          </div>
        </div>}

      {
    /* Grade Submission Modal */
  }
      {gradingSubmission && <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-4">
            <button onClick={() => setGradingSubmission(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <span>Evaluate Student Submission</span>
            </h3>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <p className="font-bold text-slate-900">{gradingSubmission.studentName} ({gradingSubmission.studentRoll})</p>
              <p className="text-slate-600 mt-1 italic font-mono">"{gradingSubmission.submissionText}"</p>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-3">
              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">Score Obtained *</label>
                <input
    type="number"
    required
    value={gradeInput}
    onChange={(e) => setGradeInput(Number(e.target.value))}
    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white"
  />
              </div>

              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">Faculty Feedback</label>
                <textarea
    rows={3}
    value={feedbackInput}
    onChange={(e) => setFeedbackInput(e.target.value)}
    placeholder="Optional remarks..."
    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white"
  />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
    type="button"
    onClick={() => setGradingSubmission(null)}
    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-semibold"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs"
  >
                  Save Grade
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
};
