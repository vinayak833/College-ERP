import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["ADMIN", "FACULTY", "STUDENT"],
      default: "STUDENT"
    },
    name: {
      type: String,
      required: true
    },
    linkedStudentId: {
      type: String,
      default: ""
    },
    linkedFacultyId: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
export default UserModel;
