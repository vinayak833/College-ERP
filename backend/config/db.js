import mongoose from "mongoose";
import StudentModel from "../models/Student.js";
import FacultyModel from "../models/Faculty.js";
import UserModel from "../models/User.js";
import CourseModel from "../models/Course.js";
import GradeModel from "../models/Grade.js";
import FeeModel from "../models/Fee.js";
import NoticeModel from "../models/Notice.js";
import AttendanceRecordModel from "../models/Attendance.js";
import { seedUsersInMongo } from "../routes/auth.js";
import {
  INITIAL_STUDENTS,
  INITIAL_FACULTY,
  INITIAL_COURSES,
  INITIAL_GRADES,
  INITIAL_FEES,
  INITIAL_NOTICES
} from "../data/mockData.js";

export let isMongoConnected = false;

export async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/college_erp";
  try {
    console.log(`Connecting to MongoDB at: ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000
    });
    isMongoConnected = true;
    console.log("✅ Successfully connected to MongoDB!");

    // Seed collections if empty
    const studentCount = await StudentModel.countDocuments();
    if (studentCount === 0) {
      console.log("Seeding MongoDB with initial ERP data...");
      await StudentModel.insertMany(INITIAL_STUDENTS);
      await FacultyModel.insertMany(INITIAL_FACULTY);
      await CourseModel.insertMany(INITIAL_COURSES);
      await GradeModel.insertMany(INITIAL_GRADES);
      await FeeModel.insertMany(INITIAL_FEES);
      await NoticeModel.insertMany(INITIAL_NOTICES);
      console.log("✅ MongoDB initial seed completed!");
    } else {
      // Migrate existing student records with old inline SVG data URL to the new local asset path
      const oldSvgIndicator = "data:image/svg";
      await StudentModel.updateMany(
        { avatarUrl: { $regex: oldSvgIndicator } },
        { $set: { avatarUrl: '/assets/student-avatar.svg' } }
      );
      
      // Also update any student records that don't have the avatarUrl field at all, or have it null/empty
      await StudentModel.updateMany(
        { $or: [ { avatarUrl: { $exists: false } }, { avatarUrl: null }, { avatarUrl: "" } ] },
        { $set: { avatarUrl: '/assets/student-avatar.svg' } }
      );
    }

    // Migrate any legacy database records containing @studysync.edu.in domain to @studynet.edu.in
    const legacyDomainRegex = /@studysync\.edu\.in$/i;
    
    const legacyStudents = await StudentModel.find({ email: legacyDomainRegex });
    for (const student of legacyStudents) {
      student.email = student.email.replace(/@studysync\.edu\.in$/i, "@studynet.edu.in");
      await student.save();
    }

    const legacyFaculty = await FacultyModel.find({ email: legacyDomainRegex });
    for (const faculty of legacyFaculty) {
      faculty.email = faculty.email.replace(/@studysync\.edu\.in$/i, "@studynet.edu.in");
      await faculty.save();
    }

    const legacyUsers = await UserModel.find({ email: legacyDomainRegex });
    for (const user of legacyUsers) {
      user.email = user.email.replace(/@studysync\.edu\.in$/i, "@studynet.edu.in");
      await user.save();
    }

    await seedUsersInMongo();
  } catch (err) {
    console.error("❌ MongoDB connection/migration error details:", err);
    isMongoConnected = false;
    console.log("ℹ️ MongoDB connection not established or local instance unavailable.");
    console.log("ℹ️ Operating with fast in-memory store. Set MONGODB_URI to connect your MongoDB database.");
  }
}
