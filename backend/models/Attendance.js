import mongoose from "mongoose";

const attendanceRecordSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  sessionId: String,
  courseId: String,
  courseCode: String,
  studentId: String,
  studentName: String,
  studentRoll: String,
  timestamp: String,
  status: String,
  verificationMethod: String,
  locationVerified: Boolean
}, { timestamps: true });

export default mongoose.model("AttendanceRecord", attendanceRecordSchema);
