import express from "express";
import StudentModel from "../models/Student.js";
import { isMongoConnected } from "../config/db.js";
import { INITIAL_STUDENTS } from "../data/mockData.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();
let memoryStudents = [...INITIAL_STUDENTS];

router.get("/", verifyToken, async (req, res) => {
  if (isMongoConnected) {
    try {
      const data = await StudentModel.find().sort({ createdAt: -1 });
      return res.json(data);
    } catch (e) { console.error(e); }
  }
  res.json(memoryStudents);
});

router.post("/", verifyToken, requireRole("ADMIN"), async (req, res) => {
  const newStudent = {
    ...req.body,
    id: req.body.id || `STU-${Date.now().toString().slice(-4)}`
  };

  if (isMongoConnected) {
    try {
      const created = await StudentModel.create(newStudent);
      return res.status(201).json(created);
    } catch (e) { console.error(e); }
  }

  memoryStudents.unshift(newStudent);
  res.status(201).json(newStudent);
});

router.put("/:id", verifyToken, requireRole("ADMIN", "STUDENT"), async (req, res) => {
  const { id } = req.params;

  if (isMongoConnected) {
    try {
      const updated = await StudentModel.findOneAndUpdate({ id }, req.body, { new: true });
      if (updated) return res.json(updated);
    } catch (e) { console.error(e); }
  }

  const index = memoryStudents.findIndex((s) => s.id === id);
  if (index !== -1) {
    memoryStudents[index] = { ...memoryStudents[index], ...req.body };
    res.json(memoryStudents[index]);
  } else {
    res.status(404).json({ error: "Student not found" });
  }
});

router.delete("/:id", verifyToken, requireRole("ADMIN"), async (req, res) => {
  const { id } = req.params;

  if (isMongoConnected) {
    try {
      await StudentModel.deleteOne({ id });
    } catch (e) { console.error(e); }
  }

  memoryStudents = memoryStudents.filter((s) => s.id !== id);
  res.json({ success: true });
});

export default router;
