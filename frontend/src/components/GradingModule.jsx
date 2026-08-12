import { useState } from "react";
import {
  Award,
  Save,
  BarChart3,
  CheckCircle2
} from "lucide-react";
export const GradingModule = ({
  role,
  grades,
  courses,
  students,
  selectedStudent,
  onSaveGrade
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState(
    courses[0]?.id || ""
  );
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [assignments, setAssignments] = useState(85);
  const [midterm, setMidterm] = useState(80);
  const [finalExam, setFinalExam] = useState(88);
  const [toastMessage, setToastMessage] = useState(null);
  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const enrolledInCourse = selectedCourse ? students.filter((s) => selectedCourse.enrolledStudents.includes(s.id)) : [];
  const handleEditClick = (st) => {
    setEditingStudentId(st.id);
    const existing = grades.find(
      (g) => g.studentId === st.id && g.courseId === selectedCourseId
    );
    if (existing) {
      setAssignments(existing.assignments);
      setMidterm(existing.midterm);
      setFinalExam(existing.finalExam);
    } else {
      setAssignments(80);
      setMidterm(80);
      setFinalExam(80);
    }
  };
  const handleSaveSubmit = async (studentId) => {
    try {
      await onSaveGrade({
        studentId,
        courseId: selectedCourseId,
        assignments: Number(assignments),
        midterm: Number(midterm),
        finalExam: Number(finalExam)
      });
      setToastMessage("Grade calculated and recorded successfully!");
      setEditingStudentId(null);
      setTimeout(() => setToastMessage(null), 3e3);
    } catch (err) {
      alert("Failed to save grade: " + err.message);
    }
  };
  const courseGrades = grades.filter((g) => g.courseId === selectedCourseId);
  const letterCounts = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  courseGrades.forEach((g) => {
    const letter = g.letterGrade.charAt(0);
    if (letterCounts[letter] !== void 0) letterCounts[letter]++;
    else letterCounts["F"]++;
  });
  return <div className="space-y-6">
      {
    /* Toast Notification */
  }
      {toastMessage && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>}

      {
    /* Header */
  }
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-600" />
            <span>Grading System & Gradebook</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Faculty assessment portal with dynamic GPA weighting (30% Assignments, 30% Midterm, 40% Final Exam).
          </p>
        </div>

        {
    /* Course Selector for Faculty/Admin */
  }
        {(role === "FACULTY" || role === "ADMIN") && <div className="w-full md:w-64 max-w-full">
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full min-w-0 max-w-full truncate bg-slate-50 text-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white font-semibold"
            >
              {courses.map((c) => <option key={c.id} value={c.id}>
                  {c.code}: {c.title}
                </option>)}
            </select>
          </div>}
      </div>

      {
    /* STUDENT VIEW - Grade Report Card */
  }
      {role === "STUDENT" && selectedStudent && <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Grade Report for {selectedStudent.name}
                </h3>
                <p className="text-xs font-mono text-indigo-600 font-bold">
                  {selectedStudent.rollNumber} • {selectedStudent.program}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-amber-600">
                  {selectedStudent.gpa.toFixed(2)}
                </span>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Cumulative GPA</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider whitespace-nowrap">
                    <th className="pb-3 px-2">Course</th>
                    <th className="pb-3 px-2">Assignments (30%)</th>
                    <th className="pb-3 px-2">Midterm (30%)</th>
                    <th className="pb-3 px-2">Final Exam (40%)</th>
                    <th className="pb-3 px-2">Weighted Total</th>
                    <th className="pb-3 px-2 text-right">Letter Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {grades.filter((g) => g.studentId === selectedStudent.id).map((g) => <tr key={g.id} className="hover:bg-slate-50 transition-colors whitespace-nowrap">
                        <td className="py-3 px-2">
                          <div className="font-bold font-mono text-indigo-700">{g.courseCode}</div>
                          <div className="text-slate-800">{g.courseTitle}</div>
                        </td>
                        <td className="py-3 px-2 font-semibold text-slate-700">{g.assignments} / 100</td>
                        <td className="py-3 px-2 font-semibold text-slate-700">{g.midterm} / 100</td>
                        <td className="py-3 px-2 font-semibold text-slate-700">{g.finalExam} / 100</td>
                        <td className="py-3 px-2 font-bold text-slate-900">{g.totalScore}%</td>
                        <td className="py-3 px-2 text-right">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {g.letterGrade} ({g.gradePoint} GP)
                          </span>
                        </td>
                      </tr>)}
                </tbody>
              </table>

              {grades.filter((g) => g.studentId === selectedStudent.id).length === 0 && <div className="p-8 text-center text-slate-400 text-xs">
                  No grades posted for this semester yet.
                </div>}
            </div>
          </div>
        </div>}

      {
    /* FACULTY / ADMIN VIEW - Interactive Gradebook Table */
  }
      {(role === "FACULTY" || role === "ADMIN") && selectedCourse && <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {
    /* Main Gradebook */
  }
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Course Gradebook: {selectedCourse.code}
                </h3>
                <p className="text-xs text-slate-500">{selectedCourse.title} • Instructor: {selectedCourse.facultyName}</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                {enrolledInCourse.length} Enrolled Students
              </span>
            </div>

            <div className="space-y-3">
              {enrolledInCourse.map((st) => {
    const existingGrade = grades.find(
      (g) => g.studentId === st.id && g.courseId === selectedCourseId
    );
    const isEditing = editingStudentId === st.id;
    return <div
      key={st.id}
      className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all"
    >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <img
      src={st.avatarUrl}
      alt={st.name}
      className="w-9 h-9 rounded-full object-cover"
    />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{st.name}</div>
                          <div className="text-[10px] font-mono text-indigo-600 font-bold">{st.rollNumber}</div>
                        </div>
                      </div>

                      {existingGrade ? <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-600">
                            Total: <strong className="text-slate-900">{existingGrade.totalScore}%</strong>
                          </span>
                          <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {existingGrade.letterGrade}
                          </span>
                        </div> : <span className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">
                          Grade Pending
                        </span>}
                    </div>

                    {isEditing ? <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-500 font-medium block mb-1">Assgn (30%)</label>
                            <input
      type="number"
      min="0"
      max="100"
      value={assignments}
      onChange={(e) => setAssignments(Number(e.target.value))}
      className="w-full bg-slate-50 text-slate-800 text-xs p-2 rounded-lg border border-slate-200 font-semibold focus:outline-none focus:border-indigo-500"
    />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 font-medium block mb-1">Midterm (30%)</label>
                            <input
      type="number"
      min="0"
      max="100"
      value={midterm}
      onChange={(e) => setMidterm(Number(e.target.value))}
      className="w-full bg-slate-50 text-slate-800 text-xs p-2 rounded-lg border border-slate-200 font-semibold focus:outline-none focus:border-indigo-500"
    />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 font-medium block mb-1">Final (40%)</label>
                            <input
      type="number"
      min="0"
      max="100"
      value={finalExam}
      onChange={(e) => setFinalExam(Number(e.target.value))}
      className="w-full bg-slate-50 text-slate-800 text-xs p-2 rounded-lg border border-slate-200 font-semibold focus:outline-none focus:border-indigo-500"
    />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
      onClick={() => setEditingStudentId(null)}
      className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200"
    >
                            Cancel
                          </button>
                          <button
      onClick={() => handleSaveSubmit(st.id)}
      className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs hover:bg-indigo-500"
    >
                            <Save className="w-3.5 h-3.5" /> Save Grade
                          </button>
                        </div>
                      </div> : <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                        <div className="text-slate-500 text-[11px]">
                          {existingGrade ? `Assignments: ${existingGrade.assignments} | Midterm: ${existingGrade.midterm} | Final: ${existingGrade.finalExam}` : "No scores entered yet."}
                        </div>
                        <button
      onClick={() => handleEditClick(st)}
      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
    >
                          {existingGrade ? "Edit Scores" : "+ Enter Scores"}
                        </button>
                      </div>}
                  </div>;
  })}

              {enrolledInCourse.length === 0 && <div className="p-8 text-center text-slate-400 text-xs">
                  No students currently enrolled in this course.
                </div>}
            </div>
          </div>

          {
    /* Grade Distribution Histogram */
  }
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Class Grade Analytics</span>
            </h3>

            <div className="space-y-3">
              {["A", "B", "C", "D", "F"].map((gradeKey) => {
    const count = letterCounts[gradeKey] || 0;
    const total = courseGrades.length || 1;
    const percent = Math.round(count / total * 100);
    return <div key={gradeKey} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-700 font-semibold">
                      <span>Grade {gradeKey}</span>
                      <span>{count} Students ({percent}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
      className={`h-full transition-all rounded-full ${gradeKey === "A" ? "bg-emerald-500" : gradeKey === "B" ? "bg-blue-500" : gradeKey === "C" ? "bg-amber-500" : "bg-rose-500"}`}
      style={{ width: `${percent}%` }}
    />
                    </div>
                  </div>;
  })}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 mt-4 leading-relaxed">
              <p className="font-semibold text-slate-800 mb-1">Auto GPA Scale:</p>
              90–100%: <strong>10.0 (O)</strong> | 80–89%: <strong>8.0–9.0 (A)</strong> | 70–79%: <strong>6.0–7.0 (B)</strong>
            </div>
          </div>
        </div>}
    </div>;
};
