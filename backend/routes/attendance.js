import express from "express";
import AttendanceRecordModel from "../models/Attendance.js";
import StudentModel from "../models/Student.js";
import CourseModel from "../models/Course.js";
import { isMongoConnected } from "../config/db.js";
import { INITIAL_COURSES, INITIAL_STUDENTS } from "../data/mockData.js";

const router = express.Router();

function generateDynamicToken() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let token = "";
  for (let i = 0; i < 6; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

function ensureValidToken(session) {
  if (!session) return;
  const now = Date.now();
  if (!session.validTokens) {
    session.validTokens = [session.activeToken];
  }
  if (!session.tokenExpiry || now >= session.tokenExpiry) {
    const newToken = generateDynamicToken();
    session.activeToken = newToken;
    session.tokenExpiry = now + (session.refreshIntervalSeconds || 7) * 1000;
    session.validTokens.push(newToken);
    // Keep last 15 recent tokens (covering ~100s grace period for scan delays)
    if (session.validTokens.length > 15) {
      session.validTokens.shift();
    }
  }
}

const tok1 = generateDynamicToken();
const initSess1 = {
  id: "SESS-INIT-301",
  courseId: "CRS-CS301",
  courseCode: "CS301",
  courseTitle: "Data Structures & Algorithms",
  facultyId: "FAC-101",
  date: new Date().toISOString().split("T")[0],
  timeSlot: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  roomNumber: "Lecture Hall 101",
  activeToken: tok1,
  validTokens: [tok1],
  tokenExpiry: Date.now() + 7000,
  refreshIntervalSeconds: 7,
  isActive: true,
  allowGeoValidation: true,
  requiredGeoLocation: { lat: 37.7749, lng: -122.4194, maxRadiusMeters: 50 }
};

const tok2 = generateDynamicToken();
const initSess2 = {
  id: "SESS-INIT-302",
  courseId: "CRS-CS302",
  courseCode: "CS302",
  courseTitle: "Database Management Systems",
  facultyId: "FAC-102",
  date: new Date().toISOString().split("T")[0],
  timeSlot: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  roomNumber: "CS Lab 2",
  activeToken: tok2,
  validTokens: [tok2],
  tokenExpiry: Date.now() + 7000,
  refreshIntervalSeconds: 7,
  isActive: true,
  allowGeoValidation: true,
  requiredGeoLocation: { lat: 37.7749, lng: -122.4194, maxRadiusMeters: 50 }
};

let activeSessions = new Map([
  ["CRS-CS301", initSess1],
  ["CS301", initSess1],
  ["CRS-CS302", initSess2],
  ["CS302", initSess2]
]);

let memoryAttendanceRecords = [];

router.post("/session/start", async (req, res) => {
  const { courseId, facultyId, roomNumber, timeSlot, refreshIntervalSeconds } = req.body;

  let course;
  if (isMongoConnected) {
    course = await CourseModel.findOne({ id: courseId });
  } else {
    course = INITIAL_COURSES.find((c) => c.id === courseId);
  }

  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }

  const interval = Number(refreshIntervalSeconds) || 7;
  const activeToken = generateDynamicToken();
  const tokenExpiry = Date.now() + interval * 1000;

  const session = {
    id: `SESS-${Date.now()}`,
    courseId: course.id,
    courseCode: course.code,
    courseTitle: course.title,
    facultyId,
    date: new Date().toISOString().split("T")[0],
    timeSlot: timeSlot || course.schedule || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    roomNumber: roomNumber || course.roomNumber,
    activeToken,
    validTokens: [activeToken],
    tokenExpiry,
    refreshIntervalSeconds: interval,
    isActive: true,
    allowGeoValidation: true,
    requiredGeoLocation: { lat: 37.7749, lng: -122.4194, maxRadiusMeters: 50 }
  };

  activeSessions.set(course.id, session);
  activeSessions.set(course.code, session);
  res.json(session);
});

router.post("/session/update", async (req, res) => {
  const { courseId, timeSlot, roomNumber, refreshIntervalSeconds } = req.body;
  let session = activeSessions.get(courseId);
  if (!session || !session.isActive) {
    for (const s of activeSessions.values()) {
      if (s && s.isActive && (s.courseId === courseId || s.courseCode === courseId)) {
        session = s;
        break;
      }
    }
  }

  if (session) {
    if (timeSlot) session.timeSlot = timeSlot;
    if (roomNumber) session.roomNumber = roomNumber;
    if (refreshIntervalSeconds) {
      session.refreshIntervalSeconds = Number(refreshIntervalSeconds);
    }
    return res.json({ success: true, session });
  }

  res.status(404).json({ error: "Active session not found to update" });
});

router.get("/sessions/active", (req, res) => {
  const seenIds = new Set();
  const activeList = [];
  const now = Date.now();
  for (const s of activeSessions.values()) {
    if (!s || !s.isActive) continue;
    if (seenIds.has(s.id)) continue;
    seenIds.add(s.id);

    ensureValidToken(s);
    const remainingSec = Math.max(1, Math.ceil((s.tokenExpiry - now) / 1000));
    activeList.push({ ...s, remainingSec });
  }
  res.json(activeList);
});

router.get("/session/active/:courseId", (req, res) => {
  const { courseId } = req.params;
  let session = activeSessions.get(courseId);

  if (!session || !session.isActive) {
    for (const s of activeSessions.values()) {
      if (s && s.isActive && (s.courseId === courseId || s.courseCode === courseId)) {
        session = s;
        break;
      }
    }
  }

  if (!session || !session.isActive) {
    return res.json({ isActive: false });
  }

  ensureValidToken(session);
  const now = Date.now();
  const remainingSec = Math.max(1, Math.ceil((session.tokenExpiry - now) / 1000));
  res.json({ ...session, remainingSec });
});

router.post("/session/stop", (req, res) => {
  const { courseId } = req.body;
  const session = activeSessions.get(courseId);
  if (session) {
    session.isActive = false;
    activeSessions.delete(courseId);
  }
  res.json({ success: true });
});

router.post("/scan", async (req, res) => {
  const { courseId, studentId, tokenScanned, method } = req.body;

  let cleanToken = (tokenScanned || "").toString().trim();
  try {
    const parsed = JSON.parse(cleanToken);
    if (parsed && parsed.token) {
      cleanToken = parsed.token.toString().trim();
    }
  } catch (_) {}
  cleanToken = cleanToken.toUpperCase();

  let session = activeSessions.get(courseId);

  if (!session || !session.isActive) {
    for (const s of activeSessions.values()) {
      if (!s || !s.isActive) continue;
      ensureValidToken(s);
      const isMatchByCourse = s.courseId === courseId || s.courseCode === courseId;
      const isMatchByToken = cleanToken && (
        s.activeToken.toUpperCase() === cleanToken ||
        (s.validTokens && s.validTokens.some((t) => t.toUpperCase() === cleanToken))
      );
      if (isMatchByCourse || isMatchByToken || method === "Faculty Override") {
        session = s;
        break;
      }
    }
  }

  if (!session || !session.isActive) {
    return res.status(400).json({ error: "No active attendance session for this course" });
  }

  ensureValidToken(session);

  const isTokenValid =
    method === "Faculty Override" ||
    (cleanToken && session.activeToken.toUpperCase() === cleanToken) ||
    (session.validTokens && session.validTokens.some((t) => t.toUpperCase() === cleanToken));

  if (!isTokenValid) {
    return res.status(400).json({ error: "Dynamic QR code expired or invalid code! Scan again." });
  }

  let student;
  if (isMongoConnected) {
    student = await StudentModel.findOne({ id: studentId });
  } else {
    student = INITIAL_STUDENTS.find((s) => s.id === studentId);
  }

  if (!student) {
    return res.status(404).json({ error: "Student record not found" });
  }

  // Validate student course enrollment
  let course;
  if (isMongoConnected) {
    course = await CourseModel.findOne({ id: session.courseId });
  } else {
    course = INITIAL_COURSES.find((c) => c.id === session.courseId || c.code === session.courseCode);
  }

  if (course && Array.isArray(course.enrolledStudents) && course.enrolledStudents.length > 0) {
    if (!course.enrolledStudents.includes(studentId)) {
      return res.status(400).json({
        error: `Student ${student.name} is not enrolled in ${course.code} (${course.title || course.name})!`
      });
    }
  }

  const record = {
    id: `ATT-${Date.now()}`,
    sessionId: session.id,
    courseId: session.courseId,
    courseCode: session.courseCode,
    studentId: student.id,
    studentName: student.name,
    studentRoll: student.rollNumber,
    timestamp: new Date().toISOString(),
    status: "Present",
    verificationMethod: method || "Dynamic QR",
    locationVerified: true
  };

  if (isMongoConnected) {
    try {
      const existing = await AttendanceRecordModel.findOne({ sessionId: session.id, studentId });
      if (existing) {
        return res.status(400).json({ error: "Attendance already recorded for this session!" });
      }
      await AttendanceRecordModel.create(record);
      return res.json({ success: true, record });
    } catch (e) { console.error(e); }
  }

  const existingRecord = memoryAttendanceRecords.find(
    (r) => r.sessionId === session.id && r.studentId === studentId
  );
  if (existingRecord) {
    return res.status(400).json({ error: "Attendance already recorded for this session!" });
  }

  memoryAttendanceRecords.unshift(record);
  res.json({ success: true, record });
});

router.get("/records", async (req, res) => {
  const { courseId, studentId } = req.query;

  if (isMongoConnected) {
    try {
      const filter = {};
      if (courseId) filter.courseId = courseId;
      if (studentId) filter.studentId = studentId;
      const data = await AttendanceRecordModel.find(filter).sort({ createdAt: -1 });
      return res.json(data);
    } catch (e) { console.error(e); }
  }

  let filtered = [...memoryAttendanceRecords];
  if (courseId) {
    filtered = filtered.filter((r) => r.courseId === courseId);
  }
  if (studentId) {
    filtered = filtered.filter((r) => r.studentId === studentId);
  }
  res.json(filtered);
});

export default router;
