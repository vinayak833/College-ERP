# 🎓 StudyNet College ERP - Separated Full-Stack Architecture

This project is organized into clean, modular **Frontend** and **Backend** directories for easy development in VS Code, standalone API testing, and deployment.

---

## 📁 Directory Architecture

```
├── frontend/                 # 🔵 React / Tailwind CSS Frontend App
│   ├── src/                  # React UI Components, Pages, Services
│   │   ├── components/       # Student Records, Dynamic QR Attendance, etc.
│   │   ├── services/         # API Integration Services
│   │   ├── App.jsx           # Main React Application
│   │   └── main.jsx          # DOM Entry Point
│   ├── index.html            # Vite HTML Template
│   ├── package.json          # Standalone Frontend Dependencies
│   └── vite.config.js        # Vite Configuration
│
├── backend/                  # 🟢 Node.js / Express / MongoDB Backend API
│
├── server.js                 # Unified launcher for full-stack deployment
├── package.json              # Full project root dependencies
└── README.md                 # Setup & Deployment documentation
```

---

## 💻 How to Run Locally in VS Code

### Option 1: Run Backend & Frontend Separately in VS Code

1. **Start the Backend:**
   ```bash
   cd backend
   npm install
   # Ensure MongoDB is running locally (e.g., mongodb://localhost:27017/college_erp)
   npm start
   ```
   *The backend will run on `http://localhost:5000` and automatically seed your MongoDB database with sample ERP records if empty.*

2. **Start the Frontend:**
   Open a second terminal window in VS Code:
   ```bash
   npm install
   npm run dev
   ```
   *The app will open at `http://localhost:3000`.*

---

## 🍃 MongoDB Connection Options

Edit `backend/.env.example` or set `MONGODB_URI`:
- **Local MongoDB Community Server:** `mongodb://localhost:27017/college_erp`
- **MongoDB Atlas Cloud:** `mongodb+srv://<username>:<password>@cluster.mongodb.net/college_erp?retryWrites=true&w=majority`

*(Note: If MongoDB is unavailable or disconnected, the backend gracefully operates in fast local in-memory fallback mode!)*

---

## 🚀 Deployment Instructions

### Deploying to Cloud Run / Vercel / Render / Railway

- **Start Command:** `npm start` (Runs `node dist/server.cjs`)
- **Build Command:** `npm run build`
- **Port:** `3000`
- **Environment Variables:**
  - `MONGODB_URI` = `your_mongodb_connection_string`
  - `GEMINI_API_KEY` = *(Optional, for online AI academic suggestions)*

---

## ⚡ API Endpoint Cheat Sheet

- `GET /api/students` - Retrieve all student records
- `POST /api/students` - Create a new student record
- `GET /api/courses` - List all courses & enrollments
- `POST /api/attendance/session/start` - Initiate a dynamic QR attendance session
- `POST /api/attendance/scan` - Validate student dynamic QR scanner token
- `POST /api/ai/advisor` - Request AI Academic Advisor performance evaluation
