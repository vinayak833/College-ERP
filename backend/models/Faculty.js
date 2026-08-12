import mongoose from "mongoose";

const facultySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  facultyId: String,
  name: String,
  email: String,
  department: String,
  designation: String,
  phone: String,
  specialization: String,
  assignedCourses: [String],
  joiningDate: String,
  status: String,
  avatarUrl: String
}, { timestamps: true });

export default mongoose.model("Faculty", facultySchema);
