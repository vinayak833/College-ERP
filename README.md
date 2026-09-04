# 🎓 StudyNet ERP - Modern College & University Management Portal


StudyNet ERP is a full-featured College and University Enterprise Resource Planning (ERP) platform built using **React 19**, **Vite**, **Node.js**, **Express.js**, and **MongoDB**. The system provides dedicated portals for Administrators, Faculty, and Students to manage academic activities, attendance, fees, assignments, schedules, and institutional operations through a centralized platform.

---

## 🌟 Features

### 🛡️ Role-Based Access Control (RBAC)

#### Administrator Portal
- Manage students, faculty, departments, and courses
- Monitor fee collections and academic records
- Publish campus-wide announcements
- Access institution-wide reports

#### Faculty Portal
- View teaching schedules
- Conduct attendance sessions
- Manage assignments and grading
- Track student performance

#### Student Portal
- View enrolled courses
- Track attendance and GPA
- Pay academic fees
- Submit assignments
- Access notices and announcements

---

## 📚 Academic Management

### Student Records
- Student directory
- Search and filtering
- Semester tracking
- Profile management

### Faculty Management
- Faculty directory
- Department details
- Office hours management

### Course Management
- Course catalog
- Credit allocation
- Enrollment tracking
- Prerequisite management

### Grading & GPA
- Assignment grading
- Internal and final assessments
- Automated GPA calculation
- Transcript generation

---

## 📍 Smart Attendance System

### Dynamic Geofenced QR Attendance
- Dynamic QR tokens with expiration
- Geofence validation using Haversine Formula
- Real-time attendance verification
- Instant attendance confirmation

### Benefits
- Reduces proxy attendance
- Location-based validation
- Secure attendance tracking

---

## 💳 Fee Management

- Tuition fee tracking
- Library fee management
- Examination fee tracking
- Lab fee tracking
- Razorpay payment integration
- Digital receipt generation

---

## 📅 Timetable Management

- Weekly schedule view
- Classroom allocation
- Faculty schedules
- Course timetable management

---

## 📝 Assignment Management

- Assignment creation
- Student submissions
- Faculty feedback
- Marks management

---

## 📚 Library Management

- Book catalog
- Issue and return tracking
- Fine calculation
- Search functionality

---

## 🏠 Hostel & Transport Management

- Hostel room allocation
- Student accommodation records
- Transport pass management

---

## 🎉 Events & Clubs

- Event announcements
- Student registrations
- Club activities
- Campus engagement programs

---

## 📢 Notice Board

- Real-time announcements
- Important notifications
- Read and unread tracking
- Emergency alerts

---

## 📋 Demo Credentials

| Role | Email | Password |
|--------|--------|--------|
| Admin | admin@studynet.edu.in | admin123 |
| Faculty | ramesh.sharma@studynet.edu.in | faculty123 |
| Faculty | ananya.iyer@studynet.edu.in | faculty123 |
| Student | priya.sharma@studynet.edu.in | student123 |
| Student | rohan.kulkarni@studynet.edu.in | student123 |

> Quick Demo Login buttons are available on the login page for easy access.

---

## 📁 Project Structure

```text
StudyNet-ERP/
│
├── backend/
│   ├── config/
│   ├── data/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── app.js
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
│
├── package.json
├── server.js
└── .env.example
```

---

## 🚀 Technology Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- React Context API

### Backend
- Node.js
- Express.js
- JWT Authentication

### Database
- MongoDB
- Mongoose

### Payment Gateway
- Razorpay

---

## 💻 Local Development Setup

### Prerequisites

- Node.js v18 or later
- npm v9 or later
- MongoDB (Optional)

### Clone Repository

```bash
git clone https://github.com/your-username/studynet-erp.git

cd studynet-erp
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Example:

```env
PORT=5000

MONGO_URI=mongodb://localhost:27017/studynet_erp

JWT_SECRET=your_secret_key

RAZORPAY_KEY_ID=your_key_id

RAZORPAY_KEY_SECRET=your_secret
```

### Run Development Server

```bash
npm run dev
```

Application URL:

```text
http://localhost:3000
```

---

## 🔒 Security Features

- JWT Authentication
- Role-Based Authorization
- Protected Routes
- Dynamic QR Attendance Tokens
- Geofence Validation
- Secure Payment Verification

---

## 👨‍💻 Author

**Vinayak S**  


**StudyNet ERP – College & University Management System**
