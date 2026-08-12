import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";

import authRouter from "./routes/auth.js";
import studentsRouter from "./routes/students.js";
import facultyRouter from "./routes/faculty.js";
import coursesRouter from "./routes/courses.js";
import gradesRouter from "./routes/grades.js";
import feesRouter from "./routes/fees.js";
import noticesRouter from "./routes/notices.js";
import attendanceRouter from "./routes/attendance.js";
import paymentRouter from "./routes/payment.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize DB
connectDB();

// Mount API Routes
app.use("/api/auth", authRouter);
app.use("/api/students", studentsRouter);
app.use("/api/faculty", facultyRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/grades", gradesRouter);
app.use("/api/fees", feesRouter);
app.use("/api/notices", noticesRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/payment", paymentRouter);

export default app;
