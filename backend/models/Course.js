import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  code: String,
  title: String,
  department: String,
  credits: Number,
  semester: Number,
  facultyId: String,
  facultyName: String,
  roomNumber: String,
  maxCapacity: Number,
  enrolledStudents: [String],
  syllabus: [String],
  schedule: String
}, { timestamps: true });

export default mongoose.model("Course", courseSchema);
