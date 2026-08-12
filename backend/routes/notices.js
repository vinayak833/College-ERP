import express from "express";
import NoticeModel from "../models/Notice.js";
import { isMongoConnected } from "../config/db.js";
import { INITIAL_NOTICES } from "../data/mockData.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();
let memoryNotices = [...INITIAL_NOTICES];

router.get("/", verifyToken, async (req, res) => {
  if (isMongoConnected) {
    try {
      const data = await NoticeModel.find().sort({ createdAt: -1 });
      return res.json(data);
    } catch (e) { console.error(e); }
  }
  res.json(memoryNotices);
});

router.post("/", verifyToken, requireRole("ADMIN", "FACULTY"), async (req, res) => {
  const newNotice = {
    ...req.body,
    id: `NOT-${Date.now().toString().slice(-4)}`,
    postedDate: new Date().toISOString().split("T")[0]
  };

  if (isMongoConnected) {
    try {
      const created = await NoticeModel.create(newNotice);
      return res.status(201).json(created);
    } catch (e) { console.error(e); }
  }

  memoryNotices.unshift(newNotice);
  res.status(201).json(newNotice);
});

export default router;
