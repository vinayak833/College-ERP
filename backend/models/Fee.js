import mongoose from "mongoose";

const feeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentId: String,
  studentName: String,
  studentRoll: String,
  department: String,
  semester: Number,
  academicYear: String,
  totalFee: Number,
  amountPaid: Number,
  dueDate: String,
  status: String,
  lastPaymentDate: String,
  receiptNumber: String
}, { timestamps: true });

export default mongoose.model("Fee", feeSchema);
