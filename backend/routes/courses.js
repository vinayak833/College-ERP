import express from "express";
import CourseModel from "../models/Course.js";
import { isMongoConnected } from "../config/db.js";
import { INITIAL_COURSES } from "../data/mockData.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();
let memoryCourses = [...INITIAL_COURSES];

router.get("/", verifyToken, async (req, res) => {
  if (isMongoConnected) {
    try {
      const data = await CourseModel.find().sort({ createdAt: -1 });
      return res.json(data);
    } catch (e) { console.error(e); }
  }
  res.json(memoryCourses);
});

router.post("/", verifyToken, requireRole("ADMIN", "FACULTY"), async (req, res) => {
  const newCourse = {
    ...req.body,
    id: `CRS-${req.body.code || Date.now().toString().slice(-4)}`,
    enrolledStudents: req.body.enrolledStudents || []
  };

  if (isMongoConnected) {
    try {
      const created = await CourseModel.create(newCourse);
      return res.status(201).json(created);
    } catch (e) { console.error(e); }
  }

  memoryCourses.unshift(newCourse);
  res.status(201).json(newCourse);
});

router.post("/:id/enroll", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { studentId, action } = req.body;

  let course;
  if (isMongoConnected) {
    course = await CourseModel.findOne({ id });
  } else {
    course = memoryCourses.find((c) => c.id === id);
  }

  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }

  let updatedList = [...(course.enrolledStudents || [])];
  if (action === "enroll") {
    if (updatedList.includes(studentId)) {
      return res.status(400).json({ error: "Already enrolled in this course" });
    }
    if (updatedList.length >= course.maxCapacity) {
      return res.status(400).json({ error: "Course capacity reached" });
    }
    updatedList.push(studentId);
  } else if (action === "drop") {
    updatedList = updatedList.filter((stId) => stId !== studentId);
  }

  if (isMongoConnected) {
    try {
      course.enrolledStudents = updatedList;
      await course.save();
      return res.json(course);
    } catch (e) { console.error(e); }
  }

  course.enrolledStudents = updatedList;
  res.json(course);
});

export default router;
