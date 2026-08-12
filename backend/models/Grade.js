import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentId: String,
  studentName: String,
  studentRoll: String,
  courseId: String,
  courseCode: String,
  courseTitle: String,
  semester: Number,
  assignments: Number,
  midterm: Number,
  finalExam: Number,
  totalScore: Number,
  letterGrade: String,
  gradePoint: Number
}, { timestamps: true });

export default mongoose.model("Grade", gradeSchema);
