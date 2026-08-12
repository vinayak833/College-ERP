import express from "express";
import GradeModel from "../models/Grade.js";
import StudentModel from "../models/Student.js";
import CourseModel from "../models/Course.js";
import { isMongoConnected } from "../config/db.js";
import { INITIAL_GRADES, INITIAL_STUDENTS, INITIAL_COURSES } from "../data/mockData.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();
let memoryGrades = [...INITIAL_GRADES];

router.get("/", verifyToken, async (req, res) => {
  if (isMongoConnected) {
    try {
      const data = await GradeModel.find().sort({ createdAt: -1 });
      return res.json(data);
    } catch (e) { console.error(e); }
  }
  res.json(memoryGrades);
});

router.post("/", verifyToken, requireRole("FACULTY", "ADMIN"), async (req, res) => {
  const { studentId, courseId, assignments, midterm, finalExam } = req.body;

  let student, course;
  if (isMongoConnected) {
    student = await StudentModel.findOne({ id: studentId });
    course = await CourseModel.findOne({ id: courseId });
  } else {
    student = INITIAL_STUDENTS.find((s) => s.id === studentId);
    course = INITIAL_COURSES.find((c) => c.id === courseId);
  }

  if (!student || !course) {
    return res.status(404).json({ error: "Student or course not found" });
  }

  const totalScore = Math.round((assignments * 0.3 + midterm * 0.3 + finalExam * 0.4) * 10) / 10;
  let letterGrade = "F";
  let gradePoint = 0;
  if (totalScore >= 95) { letterGrade = "A+"; gradePoint = 4; }
  else if (totalScore >= 90) { letterGrade = "A"; gradePoint = 4; }
  else if (totalScore >= 85) { letterGrade = "A-"; gradePoint = 3.7; }
  else if (totalScore >= 80) { letterGrade = "B+"; gradePoint = 3.3; }
  else if (totalScore >= 75) { letterGrade = "B"; gradePoint = 3; }
  else if (totalScore >= 70) { letterGrade = "B-"; gradePoint = 2.7; }
  else if (totalScore >= 65) { letterGrade = "C+"; gradePoint = 2.3; }
  else if (totalScore >= 60) { letterGrade = "C"; gradePoint = 2; }
  else if (totalScore >= 50) { letterGrade = "D"; gradePoint = 1; }

  const gradeData = {
    id: `GRD-${Date.now().toString().slice(-4)}`,
    studentId,
    studentName: student.name,
    studentRoll: student.rollNumber,
    courseId,
    courseCode: course.code,
    courseTitle: course.title,
    semester: course.semester,
    assignments,
    midterm,
    finalExam,
    totalScore,
    letterGrade,
    gradePoint
  };

  if (isMongoConnected) {
    try {
      const existing = await GradeModel.findOneAndUpdate(
        { studentId, courseId },
        gradeData,
        { new: true, upsert: true }
      );
      return res.json(existing);
    } catch (e) { console.error(e); }
  }

  const existingIndex = memoryGrades.findIndex((g) => g.studentId === studentId && g.courseId === courseId);
  if (existingIndex !== -1) {
    gradeData.id = memoryGrades[existingIndex].id;
    memoryGrades[existingIndex] = gradeData;
  } else {
    memoryGrades.unshift(gradeData);
  }
  res.json(gradeData);
});

export default router;
