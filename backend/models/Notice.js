import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  content: String,
  category: String,
  author: String,
  postedDate: String,
  priority: String,
  department: String
}, { timestamps: true });

export default mongoose.model("Notice", noticeSchema);
