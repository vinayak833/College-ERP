import express from "express";
import FeeModel from "../models/Fee.js";
import { isMongoConnected } from "../config/db.js";
import { INITIAL_FEES } from "../data/mockData.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();
export let memoryFees = [...INITIAL_FEES];

export async function processFeePayment(feeId, amountPaid, isExamFee = false) {
  let fee;
  if (isMongoConnected) {
    fee = await FeeModel.findOne({ id: feeId });
  } else {
    fee = memoryFees.find((f) => f.id === feeId);
  }

  if (!fee) return null;

  fee.amountPaid = (fee.amountPaid || 0) + Number(amountPaid);

  const calculatedTotal =
    (fee.tuitionFee || 0) +
    (fee.labFee || 0) +
    (fee.libraryFee || 0) +
    (fee.examFee || 0) +
    (fee.supplementaryFee || 0) +
    (fee.otherFee || 0);
  fee.totalFee = fee.totalFee || calculatedTotal;

  if (isExamFee || Number(amountPaid) === Number(fee.examFee) || fee.amountPaid >= fee.totalFee) {
    fee.examFeePaid = true;
  }

  if (fee.amountPaid >= fee.totalFee) {
    fee.status = "Paid";
    fee.examFeePaid = true;
  } else if (fee.amountPaid > 0) {
    fee.status = "Partial";
  }

  fee.lastPaymentDate = new Date().toISOString().split("T")[0];
  fee.receiptNumber = `REC-${Math.floor(100000 + Math.random() * 900000)}`;

  if (isMongoConnected) {
    try {
      await fee.save();
    } catch (e) {
      console.error(e);
    }
  }

  return fee;
}

router.get("/", verifyToken, requireRole("ADMIN", "STUDENT"), async (req, res) => {
  if (isMongoConnected) {
    try {
      const data = await FeeModel.find().sort({ createdAt: -1 });
      return res.json(data);
    } catch (e) { console.error(e); }
  }
  res.json(memoryFees);
});

router.post("/reset-due", verifyToken, requireRole("ADMIN", "STUDENT"), async (req, res) => {
  memoryFees = INITIAL_FEES.map((f) => ({ ...f }));
  if (isMongoConnected) {
    try {
      await FeeModel.deleteMany({});
      await FeeModel.insertMany(memoryFees);
    } catch (e) {
      console.error(e);
    }
  }
  return res.json({ success: true, fees: memoryFees });
});

router.put("/:id", verifyToken, requireRole("ADMIN"), async (req, res) => {
  const { id } = req.params;
  const {
    tuitionFee,
    labFee,
    libraryFee,
    examFee,
    supplementaryFee,
    otherFee,
    amountPaid,
    dueDate,
    academicYear,
    semester,
    studentName,
    studentRoll
  } = req.body;

  let fee;
  if (isMongoConnected) {
    fee = await FeeModel.findOne({ id });
  } else {
    fee = memoryFees.find((f) => f.id === id);
  }

  if (!fee) {
    return res.status(404).json({ error: "Fee record not found" });
  }

  if (tuitionFee !== undefined) fee.tuitionFee = Number(tuitionFee);
  if (labFee !== undefined) fee.labFee = Number(labFee);
  if (libraryFee !== undefined) fee.libraryFee = Number(libraryFee);
  if (examFee !== undefined) fee.examFee = Number(examFee);
  if (supplementaryFee !== undefined) fee.supplementaryFee = Number(supplementaryFee);
  if (otherFee !== undefined) fee.otherFee = Number(otherFee);
  if (amountPaid !== undefined) fee.amountPaid = Number(amountPaid);
  if (dueDate !== undefined) fee.dueDate = dueDate;
  if (academicYear !== undefined) fee.academicYear = academicYear;
  if (semester !== undefined) fee.semester = Number(semester);
  if (studentName !== undefined) fee.studentName = studentName;
  if (studentRoll !== undefined) fee.studentRoll = studentRoll;

  // Recalculate totalFee & status
  fee.totalFee =
    (fee.tuitionFee || 0) +
    (fee.labFee || 0) +
    (fee.libraryFee || 0) +
    (fee.examFee || 0) +
    (fee.supplementaryFee || 0) +
    (fee.otherFee || 0);

  if (fee.amountPaid >= fee.totalFee) {
    fee.status = "Paid";
  } else if (fee.amountPaid > 0) {
    fee.status = "Partial";
  } else if (fee.dueDate && new Date(fee.dueDate) < new Date()) {
    fee.status = "Overdue";
  } else {
    fee.status = "Pending";
  }

  if (isMongoConnected) {
    try {
      await fee.save();
    } catch (e) {
      console.error("Error saving fee:", e);
    }
  }

  res.json(fee);
});

router.post("/", verifyToken, requireRole("ADMIN"), async (req, res) => {
  const {
    studentId,
    studentName,
    studentRoll,
    semester,
    academicYear,
    tuitionFee = 0,
    labFee = 0,
    libraryFee = 0,
    examFee = 0,
    supplementaryFee = 0,
    otherFee = 0,
    dueDate
  } = req.body;

  const totalFee =
    Number(tuitionFee) +
    Number(labFee) +
    Number(libraryFee) +
    Number(examFee) +
    Number(supplementaryFee) +
    Number(otherFee);
  const newFee = {
    id: `FEE-${Date.now().toString().slice(-6)}`,
    studentId: studentId || "STU-001",
    studentName: studentName || "Student",
    studentRoll: studentRoll || "CS2026-001",
    semester: Number(semester) || 1,
    academicYear: academicYear || "2025-2026",
    tuitionFee: Number(tuitionFee),
    labFee: Number(labFee),
    libraryFee: Number(libraryFee),
    examFee: Number(examFee),
    supplementaryFee: Number(supplementaryFee),
    otherFee: Number(otherFee),
    totalFee,
    amountPaid: 0,
    dueDate: dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    status: "Pending"
  };

  if (isMongoConnected) {
    try {
      const created = new FeeModel(newFee);
      await created.save();
    } catch (e) {
      console.error(e);
    }
  }

  memoryFees.unshift(newFee);
  res.status(201).json(newFee);
});

router.post("/pay", verifyToken, requireRole("ADMIN", "STUDENT"), async (req, res) => {
  const { feeId, amountPaid, isExamFee } = req.body;
  const fee = await processFeePayment(feeId, amountPaid, isExamFee);
  if (!fee) {
    return res.status(404).json({ error: "Fee record not found" });
  }
  res.json(fee);
});

export default router;
