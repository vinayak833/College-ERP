import {
  INITIAL_STUDENTS,
  INITIAL_FACULTY,
  INITIAL_COURSES,
  INITIAL_GRADES,
  INITIAL_FEES,
  INITIAL_NOTICES
} from "../data/mockData";

// Helper to inject Authorization header and handle auto-logout on 401
async function authFetch(url, options = {}) {
  const token = localStorage.getItem("erp_token");
  const headers = {
    ...options.headers
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    // Token expired or unauthenticated -> Auto-logout
    window.dispatchEvent(new Event("auth:logout"));
  }

  return res;
}

// Auth API endpoints
export async function loginUser(credentials) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Login failed");
  }
  return data; // { token, user }
}

export async function registerUser(userData) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Registration failed");
  }
  return data;
}

export async function fetchCurrentUser() {
  const res = await authFetch("/api/auth/me");
  if (!res.ok) throw new Error("Failed to fetch current user profile");
  return res.json();
}

// Student APIs
export async function fetchStudents() {
  try {
    const res = await authFetch("/api/students");
    if (!res.ok) throw new Error("Failed to fetch students");
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : INITIAL_STUDENTS;
  } catch (err) {
    console.warn("fetchStudents error, falling back to mock data:", err);
    return INITIAL_STUDENTS;
  }
}

export async function createStudent(student) {
  const res = await authFetch("/api/students", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(student)
  });
  if (!res.ok) throw new Error("Failed to create student");
  return res.json();
}

export async function updateStudent(id, student) {
  const res = await authFetch(`/api/students/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(student)
  });
  if (!res.ok) throw new Error("Failed to update student");
  return res.json();
}

export async function deleteStudent(id) {
  const res = await authFetch(`/api/students/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete student");
}

// Faculty APIs
export async function fetchFaculty() {
  try {
    const res = await authFetch("/api/faculty");
    if (!res.ok) throw new Error("Failed to fetch faculty");
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : INITIAL_FACULTY;
  } catch (err) {
    console.warn("fetchFaculty error, falling back to mock data:", err);
    return INITIAL_FACULTY;
  }
}

export async function createFaculty(facultyMember) {
  const res = await authFetch("/api/faculty", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(facultyMember)
  });
  if (!res.ok) throw new Error("Failed to create faculty");
  return res.json();
}

export async function updateFaculty(id, facultyMember) {
  const res = await authFetch(`/api/faculty/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(facultyMember)
  });
  if (!res.ok) throw new Error("Failed to update faculty");
  return res.json();
}

// Course APIs
export async function fetchCourses() {
  try {
    const res = await authFetch("/api/courses");
    if (!res.ok) throw new Error("Failed to fetch courses");
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : INITIAL_COURSES;
  } catch (err) {
    console.warn("fetchCourses error, falling back to mock data:", err);
    return INITIAL_COURSES;
  }
}

export async function createCourse(course) {
  const res = await authFetch("/api/courses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(course)
  });
  if (!res.ok) throw new Error("Failed to create course");
  return res.json();
}

export async function enrollCourse(courseId, studentId, action) {
  const res = await authFetch(`/api/courses/${courseId}/enroll`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId, action })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update course enrollment");
  return data;
}

// Grade APIs
export async function fetchGrades() {
  try {
    const res = await authFetch("/api/grades");
    if (!res.ok) throw new Error("Failed to fetch grades");
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : INITIAL_GRADES;
  } catch (err) {
    console.warn("fetchGrades error, falling back to mock data:", err);
    return INITIAL_GRADES;
  }
}

export async function saveGrade(grade) {
  const res = await authFetch("/api/grades", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(grade)
  });
  if (!res.ok) throw new Error("Failed to save grade");
  return res.json();
}

// Fee APIs
export async function fetchFees() {
  try {
    const res = await authFetch("/api/fees");
    if (res.status === 403) return [];
    if (!res.ok) throw new Error("Failed to fetch fees");
    const data = await res.json();
    return Array.isArray(data) ? data : INITIAL_FEES;
  } catch (err) {
    console.warn("fetchFees error, falling back to mock data:", err);
    return INITIAL_FEES;
  }
}

export async function payFee(feeId, amountPaid) {
  const res = await authFetch("/api/fees/pay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ feeId, amountPaid })
  });
  if (!res.ok) throw new Error("Failed to process payment");
  return res.json();
}

export async function updateFeeRecord(feeId, feeData) {
  const res = await authFetch(`/api/fees/${feeId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(feeData)
  });
  if (!res.ok) throw new Error("Failed to update fee record");
  return res.json();
}

export async function createFeeRecord(feeData) {
  const res = await authFetch("/api/fees", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(feeData)
  });
  if (!res.ok) throw new Error("Failed to create fee record");
  return res.json();
}

export async function resetDueFees() {
  const res = await authFetch("/api/fees/reset-due", {
    method: "POST"
  });
  if (!res.ok) throw new Error("Failed to reset due fees");
  const data = await res.json();
  return data.fees;
}

// Payment Gateway (Razorpay Integration)
export async function createRazorpayOrder(feeId, amount, customKeys = {}) {
  const res = await authFetch("/api/payment/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      feeId,
      amount,
      keyId: customKeys.keyId,
      keySecret: customKeys.keySecret
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create Razorpay payment order");
  return data;
}

export async function verifyRazorpayPayment(paymentData) {
  const res = await authFetch("/api/payment/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paymentData)
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Razorpay payment verification failed");
  }
  return data; // { success, message, fee, paymentId }
}

// Notice APIs
export async function fetchNotices() {
  try {
    const res = await authFetch("/api/notices");
    if (!res.ok) throw new Error("Failed to fetch notices");
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : INITIAL_NOTICES;
  } catch (err) {
    console.warn("fetchNotices error, falling back to mock data:", err);
    return INITIAL_NOTICES;
  }
}

export async function createNotice(notice) {
  const res = await authFetch("/api/notices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(notice)
  });
  if (!res.ok) throw new Error("Failed to create notice");
  return res.json();
}

// Attendance APIs
export async function startAttendanceSession(courseId, facultyId, roomNumber, timeSlot, refreshIntervalSeconds) {
  const res = await authFetch("/api/attendance/session/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courseId, facultyId, roomNumber, timeSlot, refreshIntervalSeconds })
  });
  if (!res.ok) throw new Error("Failed to start attendance session");
  return res.json();
}

export async function updateAttendanceSession(courseId, params) {
  const res = await authFetch("/api/attendance/session/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courseId, ...params })
  });
  if (!res.ok) throw new Error("Failed to update attendance session time");
  return res.json();
}

export async function getActiveAttendanceSession(courseId) {
  try {
    const res = await authFetch(`/api/attendance/session/active/${courseId}`);
    if (!res.ok) return { isActive: false };
    return await res.json();
  } catch (err) {
    return { isActive: false };
  }
}

export async function getAllActiveAttendanceSessions() {
  try {
    const res = await authFetch("/api/attendance/sessions/active");
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function stopAttendanceSession(courseId) {
  const res = await authFetch("/api/attendance/session/stop", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courseId })
  });
  if (!res.ok) throw new Error("Failed to stop session");
}

export async function scanAttendance(params) {
  const res = await authFetch("/api/attendance/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to record attendance");
  return data;
}

export async function fetchAttendanceRecords(courseId, studentId) {
  try {
    const query = new URLSearchParams();
    if (courseId) query.append("courseId", courseId);
    if (studentId) query.append("studentId", studentId);
    const res = await authFetch(`/api/attendance/records?${query.toString()}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    return [];
  }
}
