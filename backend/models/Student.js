import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  rollNumber: String,
  name: String,
  email: String,
  department: String,
  program: String,
  semester: Number,
  batch: String,
  gpa: Number,
  phone: String,
  address: String,
  guardianName: String,
  guardianContact: String,
  avatarUrl: String
}, { timestamps: true });

export default mongoose.model("Student", studentSchema);
