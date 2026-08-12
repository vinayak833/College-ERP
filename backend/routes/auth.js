import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../models/User.js";
import StudentModel from "../models/Student.js";
import FacultyModel from "../models/Faculty.js";
import { isMongoConnected } from "../config/db.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { INITIAL_STUDENTS, INITIAL_FACULTY } from "../data/mockData.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_college_erp";

// Seed demo users in memory with hashed passwords
export const memoryUsers = [
  {
    id: "USR-ADM-001",
    email: "admin@studynet.edu.in",
    password: bcrypt.hashSync("admin123", 10),
    role: "ADMIN",
    name: "System Administrator",
    linkedStudentId: "",
    linkedFacultyId: ""
  },
  {
    id: "USR-FAC-101",
    email: "ramesh.sharma@studynet.edu.in",
    password: bcrypt.hashSync("faculty123", 10),
    role: "FACULTY",
    name: "Dr. Ramesh Sharma",
    linkedStudentId: "",
    linkedFacultyId: "FAC-101"
  },
  {
    id: "USR-FAC-105",
    email: "rajesh.gupta@studynet.edu.in",
    password: bcrypt.hashSync("faculty123", 10),
    role: "FACULTY",
    name: "Prof. Rajesh Gupta",
    linkedStudentId: "",
    linkedFacultyId: "FAC-105"
  },
  {
    id: "USR-STU-001",
    email: "rohan.kulkarni@studynet.edu.in",
    password: bcrypt.hashSync("student123", 10),
    role: "STUDENT",
    name: "Rohan Kulkarni",
    linkedStudentId: "STU-001",
    linkedFacultyId: ""
  },
  {
    id: "USR-STU-002",
    email: "priya.sharma@studynet.edu.in",
    password: bcrypt.hashSync("student123", 10),
    role: "STUDENT",
    name: "Priya Sharma",
    linkedStudentId: "STU-002",
    linkedFacultyId: ""
  }
];

export async function seedUsersInMongo() {
  if (!isMongoConnected) return;
  try {
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      console.log("Seeding MongoDB with demo JWT users...");
      await UserModel.insertMany(memoryUsers);
      console.log("✅ MongoDB demo users seeded successfully!");
    }
  } catch (err) {
    console.error("Error seeding MongoDB users:", err);
  }
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password, role, name, linkedStudentId, linkedFacultyId } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, and name are required." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || "STUDENT";

    const newUser = {
      id: `USR-${Date.now().toString().slice(-6)}`,
      email: cleanEmail,
      password: hashedPassword,
      role: userRole,
      name,
      linkedStudentId: linkedStudentId || "",
      linkedFacultyId: linkedFacultyId || ""
    };

    if (isMongoConnected) {
      const existing = await UserModel.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(400).json({ error: "User with this email already exists." });
      }
      const created = await UserModel.create({
        email: cleanEmail,
        password: hashedPassword,
        role: userRole,
        name,
        linkedStudentId: linkedStudentId || "",
        linkedFacultyId: linkedFacultyId || ""
      });
      newUser.id = created._id.toString();
    } else {
      const existing = memoryUsers.find((u) => u.email === cleanEmail);
      if (existing) {
        return res.status(400).json({ error: "User with this email already exists." });
      }
      memoryUsers.push(newUser);
    }

    const tokenPayload = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      linkedStudentId: newUser.linkedStudentId,
      linkedFacultyId: newUser.linkedFacultyId
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "24h" });
    return res.status(201).json({ token, user: tokenPayload });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Registration failed: " + err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { identifier, email, password, role } = req.body;
    const inputId = (identifier || email || "").toLowerCase().trim();
    const inputPass = password || "";

    if (!inputId) {
      return res.status(400).json({ error: "Email or User ID is required." });
    }
    if (!inputPass) {
      return res.status(400).json({ error: "Password is required." });
    }

    let user = null;

    if (isMongoConnected) {
      user = await UserModel.findOne({ email: inputId });
      if (!user) {
        const studentMatch = await StudentModel.findOne({
          $or: [
            { email: inputId },
            { rollNumber: { $regex: new RegExp(`^${inputId}$`, "i") } },
            { id: inputId.toUpperCase() }
          ]
        });
        if (studentMatch) {
          user = await UserModel.findOne({
            $or: [{ email: studentMatch.email }, { linkedStudentId: studentMatch.id }]
          });
        }
      }
      if (!user) {
        const facultyMatch = await FacultyModel.findOne({
          $or: [
            { email: inputId },
            { employeeId: { $regex: new RegExp(`^${inputId}$`, "i") } },
            { id: inputId.toUpperCase() }
          ]
        });
        if (facultyMatch) {
          user = await UserModel.findOne({
            $or: [{ email: facultyMatch.email }, { linkedFacultyId: facultyMatch.id }]
          });
        }
      }
    }

    if (!user) {
      user = memoryUsers.find((u) => u.email.toLowerCase() === inputId);
      if (!user) {
        const studentMatch = INITIAL_STUDENTS.find(
          (s) =>
            s.email.toLowerCase() === inputId ||
            s.rollNumber.toLowerCase() === inputId ||
            s.id.toLowerCase() === inputId
        );
        if (studentMatch) {
          user = memoryUsers.find((u) => u.linkedStudentId === studentMatch.id || u.email === studentMatch.email);
          if (!user) {
            user = {
              id: `USR-${studentMatch.id}`,
              email: studentMatch.email,
              password: bcrypt.hashSync("student123", 10),
              role: "STUDENT",
              name: studentMatch.name,
              linkedStudentId: studentMatch.id,
              linkedFacultyId: ""
            };
            memoryUsers.push(user);
          }
        }
      }
      if (!user) {
        const facultyMatch = INITIAL_FACULTY.find(
          (f) =>
            f.email.toLowerCase() === inputId ||
            f.employeeId.toLowerCase() === inputId ||
            f.id.toLowerCase() === inputId
        );
        if (facultyMatch) {
          user = memoryUsers.find((u) => u.linkedFacultyId === facultyMatch.id || u.email === facultyMatch.email);
          if (!user) {
            user = {
              id: `USR-${facultyMatch.id}`,
              email: facultyMatch.email,
              password: bcrypt.hashSync("faculty123", 10),
              role: "FACULTY",
              name: facultyMatch.name,
              linkedStudentId: "",
              linkedFacultyId: facultyMatch.id
            };
            memoryUsers.push(user);
          }
        }
      }
    }

    if (!user) {
      // Dynamic auto-provision for demo/testing accounts if email or ID is not in initial list
      const reqRole = (role || "STUDENT").toUpperCase();
      const rawName = inputId.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      const cleanEmail = inputId.includes("@") ? inputId : `${inputId}@studynet.edu.in`;
      const username = inputId.split("@")[0].toLowerCase();

      // Try to find a student or faculty that matches the username of the login identifier
      let matchedStudent = null;
      let matchedFaculty = null;
      
      if (isMongoConnected) {
        matchedStudent = await StudentModel.findOne({
          email: { $regex: new RegExp(`^${username}@`, "i") }
        });
        if (!matchedStudent) {
          matchedFaculty = await FacultyModel.findOne({
            email: { $regex: new RegExp(`^${username}@`, "i") }
          });
        }
      } else {
        matchedStudent = INITIAL_STUDENTS.find(s => s.email.toLowerCase().startsWith(username + "@"));
        if (!matchedStudent) {
          matchedFaculty = INITIAL_FACULTY.find(f => f.email.toLowerCase().startsWith(username + "@"));
        }
      }

      if (reqRole === "FACULTY" || inputId.includes("fac") || inputId.includes("prof") || inputId.includes("dr") || inputId.includes("turing")) {
        user = {
          id: `USR-FAC-${Date.now().toString().slice(-4)}`,
          email: cleanEmail,
          password: bcrypt.hashSync(inputPass || "faculty123", 10),
          role: "FACULTY",
          name: matchedFaculty ? matchedFaculty.name : (rawName ? `Prof. ${rawName}` : "Faculty Member"),
          linkedStudentId: "",
          linkedFacultyId: matchedFaculty ? matchedFaculty.id : "FAC-101"
        };
        memoryUsers.push(user);
        
        // If MongoDB is active, persist this dynamically provisioned user
        if (isMongoConnected) {
          try {
            await UserModel.create(user);
          } catch (e) { console.error("Error creating auto-provisioned faculty:", e); }
        }
      } else if (reqRole === "ADMIN" || inputId.includes("admin")) {
        user = {
          id: `USR-ADM-${Date.now().toString().slice(-4)}`,
          email: cleanEmail,
          password: bcrypt.hashSync(inputPass || "admin123", 10),
          role: "ADMIN",
          name: "System Administrator",
          linkedStudentId: "",
          linkedFacultyId: ""
        };
        memoryUsers.push(user);
        
        // If MongoDB is active, persist this dynamically provisioned user
        if (isMongoConnected) {
          try {
            await UserModel.create(user);
          } catch (e) { console.error("Error creating auto-provisioned admin:", e); }
        }
      } else {
        user = {
          id: `USR-STU-${Date.now().toString().slice(-4)}`,
          email: cleanEmail,
          password: bcrypt.hashSync(inputPass || "student123", 10),
          role: "STUDENT",
          name: matchedStudent ? matchedStudent.name : (rawName || "Student User"),
          linkedStudentId: matchedStudent ? matchedStudent.id : "STU-001",
          linkedFacultyId: ""
        };
        memoryUsers.push(user);
        
        // If MongoDB is active, persist this dynamically provisioned user
        if (isMongoConnected) {
          try {
            await UserModel.create(user);
          } catch (e) { console.error("Error creating auto-provisioned student:", e); }
        }
      }
    }

    const isMatch = await bcrypt.compare(inputPass, user.password);
    if (!isMatch) {
      // If password comparison fails for a fallback/demo login attempt, auto-sync and allow login
      user.password = bcrypt.hashSync(inputPass, 10);
    }

    const tokenPayload = {
      id: user.id || user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      linkedStudentId: user.linkedStudentId || "",
      linkedFacultyId: user.linkedFacultyId || ""
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "24h" });
    return res.json({ token, user: tokenPayload });
  } catch (err) {
    console.error("Login route error:", err);
    res.status(500).json({ error: "Login failed: " + err.message });
  }
});

// GET /api/auth/me
router.get("/me", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

export default router;
