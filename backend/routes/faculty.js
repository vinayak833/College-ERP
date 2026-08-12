import express from "express";
import FacultyModel from "../models/Faculty.js";
import { isMongoConnected } from "../config/db.js";
import { INITIAL_FACULTY } from "../data/mockData.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();
let memoryFaculty = [...INITIAL_FACULTY];

router.get("/", verifyToken, async (req, res) => {
  if (isMongoConnected) {
    try {
      const data = await FacultyModel.find().sort({ createdAt: -1 });
      return res.json(data);
    } catch (e) { console.error(e); }
  }
  res.json(memoryFaculty);
});

router.post("/", verifyToken, requireRole("ADMIN"), async (req, res) => {
  const newFaculty = {
    ...req.body,
    id: req.body.id || `FAC-${Date.now().toString().slice(-4)}`
  };

  if (isMongoConnected) {
    try {
      const created = await FacultyModel.create(newFaculty);
      return res.status(201).json(created);
    } catch (e) { console.error(e); }
  }

  memoryFaculty.unshift(newFaculty);
  res.status(201).json(newFaculty);
});

router.put("/:id", verifyToken, requireRole("ADMIN", "FACULTY"), async (req, res) => {
  const { id } = req.params;

  if (isMongoConnected) {
    try {
      const updated = await FacultyModel.findOneAndUpdate({ id }, req.body, { new: true });
      if (updated) return res.json(updated);
    } catch (e) { console.error(e); }
  }

  const index = memoryFaculty.findIndex((f) => f.id === id);
  if (index !== -1) {
    memoryFaculty[index] = { ...memoryFaculty[index], ...req.body };
    res.json(memoryFaculty[index]);
  } else {
    res.status(404).json({ error: "Faculty not found" });
  }
});

router.delete("/:id", verifyToken, requireRole("ADMIN"), async (req, res) => {
  const { id } = req.params;

  if (isMongoConnected) {
    try {
      await FacultyModel.deleteOne({ id });
    } catch (e) { console.error(e); }
  }

  memoryFaculty = memoryFaculty.filter((f) => f.id !== id);
  res.json({ success: true });
});

export default router;
