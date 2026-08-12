import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import jsQR from "jsqr";
import * as XLSX from "xlsx";
import {
  startAttendanceSession,
  updateAttendanceSession,
  getActiveAttendanceSession,
  getAllActiveAttendanceSessions,
  stopAttendanceSession,
  scanAttendance,
  fetchAttendanceRecords
} from "../services/api";
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Play,
  Square,
  RefreshCw,
  Camera,
  MapPin,
  Clock,
  UserCheck,
  Zap,
  Users,
  ShieldCheck,
  VideoOff,
  Scan,
  ZoomIn,
  ZoomOut,
  Sliders,
  X,
  Edit3,
  Calendar,
  Save,
  FileSpreadsheet
} from "lucide-react";
export const DynamicQRAttendanceModule = ({
  role,
  courses,
  students,
  facultyList,
  selectedStudent,
  selectedFaculty
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || "");
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const [activeSession, setActiveSession] = useState(null);
  const [allActiveSessions, setAllActiveSessions] = useState([]);
  const [qrCanvasUrl, setQrCanvasUrl] = useState("");
  const [timeLeftInToken, setTimeLeftInToken] = useState(7);
  const [sessionLogs, setSessionLogs] = useState([]);
  const [manualOtp, setManualOtp] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [scanStatus, setScanStatus] = useState({ type: "idle", message: "" });
  const [studentRecords, setStudentRecords] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [zoomCapabilities, setZoomCapabilities] = useState({ min: 1, max: 4, step: 0.1, supported: false });

  // Helper functions for current real time
  const getLiveTimeRange = (durationHours = 1) => {
    const now = new Date();
    const startTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
    const future = new Date(now.getTime() + durationHours * 60 * 60 * 1000);
    const endTime = future.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
    return `${startTime} - ${endTime}`;
  };

  const getCurrentRealTimeFormatted = () => {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  // Session Time & Schedule Customization States
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [sessionTimeSlot, setSessionTimeSlot] = useState(() => getLiveTimeRange(1));
  const [sessionRoomNumber, setSessionRoomNumber] = useState(courses[0]?.roomNumber || "Lecture Hall 101");
  const [sessionRefreshRate, setSessionRefreshRate] = useState(7);
  const [updateTimeMsg, setUpdateTimeMsg] = useState("");

  useEffect(() => {
    if (activeSession) {
      if (activeSession.timeSlot) setSessionTimeSlot(activeSession.timeSlot);
      if (activeSession.roomNumber) setSessionRoomNumber(activeSession.roomNumber);
      if (activeSession.refreshIntervalSeconds) setSessionRefreshRate(activeSession.refreshIntervalSeconds);
    } else if (selectedCourse) {
      // Default to assigned course schedule if available, otherwise current 1-hr live window
      setSessionTimeSlot(selectedCourse.schedule || getLiveTimeRange(1));
      setSessionRoomNumber(selectedCourse.roomNumber || "Lecture Hall 101");
    }
  }, [selectedCourse?.id, activeSession?.id]);
  const qrCanvasRef = useRef(null);
  const videoRef = useRef(null);
  const hiddenCanvasRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastScanTimeRef = useRef(0);
  const zoomLevelRef = useRef(1.0);
  const zoomSupportedRef = useRef(false);

  useEffect(() => {
    zoomLevelRef.current = zoomLevel;
  }, [zoomLevel]);

  useEffect(() => {
    zoomSupportedRef.current = zoomCapabilities.supported;
  }, [zoomCapabilities]);

  const openScannerModal = () => {
    setIsScannerModalOpen(true);
    startCamera();
  };

  const closeScannerModal = () => {
    stopCamera();
    setIsScannerModalOpen(false);
  };

  const handleZoomChange = (newZoom) => {
    const clamped = Math.max(1, Math.min(Number(newZoom), zoomCapabilities.max || 4));
    setZoomLevel(clamped);
    const videoTrack = mediaStreamRef.current?.getVideoTracks()?.[0];
    if (videoTrack && zoomCapabilities.supported && typeof videoTrack.applyConstraints === "function") {
      try {
        videoTrack.applyConstraints({ advanced: [{ zoom: clamped }] });
      } catch (err) {
        console.warn("Hardware zoom error:", err);
      }
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
    setZoomLevel(1.0);
    setIsScannerModalOpen(false);
  };
  const startCamera = async () => {
    setScanStatus({ type: "idle", message: "" });
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setScanStatus({
        type: "error",
        message: "Camera API is not supported or restricted in this browser window."
      });
      return;
    }
    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 640 }, height: { ideal: 480 } }
        });
      } catch (e1) {
        if (e1.name === "NotAllowedError" || e1.name === "PermissionDeniedError" || e1.message?.toLowerCase().includes("denied")) {
          throw e1;
        }
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      mediaStreamRef.current = stream;
      setCameraActive(true);
      setIsScannerModalOpen(true);
    } catch (err) {
      console.warn("Camera access error:", err);
      stopCamera();
      const isDenied = err.name === "NotAllowedError" || err.name === "PermissionDeniedError" || err.message?.toLowerCase().includes("denied") || err.message?.toLowerCase().includes("permission");
      setScanStatus({
        type: "error",
        message: isDenied ? "Camera permission denied by browser. Please grant camera permissions in your browser address bar." : `Camera error (${err.name || "Unavailable"}). Please verify camera availability.`
      });
    }
  };
  useEffect(() => {
    if (cameraActive && mediaStreamRef.current && videoRef.current) {
      const video = videoRef.current;
      video.srcObject = mediaStreamRef.current;
      video.setAttribute("playsinline", "true");
      video.muted = true;
      video.play().then(() => {
        requestScanFrame();
      }).catch((e) => console.error("Video play error:", e));

      // Capabilities check for camera zoom
      const videoTrack = mediaStreamRef.current.getVideoTracks()?.[0];
      if (videoTrack && typeof videoTrack.getCapabilities === "function") {
        try {
          const caps = videoTrack.getCapabilities();
          if (caps.zoom) {
            setZoomCapabilities({
              min: caps.zoom.min || 1,
              max: caps.zoom.max || 4,
              step: caps.zoom.step || 0.1,
              supported: true
            });
          }
        } catch (e) {
          console.warn("Zoom capabilities check error:", e);
        }
      }
    }
  }, [cameraActive, isScannerModalOpen]);
  const requestScanFrame = () => {
    if (!videoRef.current || !hiddenCanvasRef.current) {
      animationFrameRef.current = requestAnimationFrame(requestScanFrame);
      return;
    }
    const video = videoRef.current;
    const canvas = hiddenCanvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      const vWidth = video.videoWidth;
      const vHeight = video.videoHeight;
      canvas.width = vWidth;
      canvas.height = vHeight;

      const currentZoom = zoomLevelRef.current;
      const isHardware = zoomSupportedRef.current;

      if (currentZoom > 1.0 && !isHardware) {
        // Digital crop zoom on canvas frame for jsQR scanning
        const cropWidth = vWidth / currentZoom;
        const cropHeight = vHeight / currentZoom;
        const cropX = (vWidth - cropWidth) / 2;
        const cropY = (vHeight - cropHeight) / 2;
        ctx.drawImage(video, cropX, cropY, cropWidth, cropHeight, 0, 0, vWidth, vHeight);
      } else {
        ctx.drawImage(video, 0, 0, vWidth, vHeight);
      }

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert"
      });
      if (code && code.data) {
        const now = Date.now();
        if (now - lastScanTimeRef.current > 3e3) {
          lastScanTimeRef.current = now;
          let scannedToken = code.data;
          let scannedCourseId = void 0;
          try {
            const parsed = JSON.parse(code.data);
            if (parsed && parsed.token) {
              scannedToken = parsed.token;
            }
            if (parsed && parsed.courseId) {
              scannedCourseId = parsed.courseId;
            }
          } catch (_) {
          }
          handleStudentScan(scannedToken, "Live Camera QR", scannedCourseId);
        }
      }
    }
    animationFrameRef.current = requestAnimationFrame(requestScanFrame);
  };
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            let scannedToken = code.data;
            let scannedCourseId = void 0;
            try {
              const parsed = JSON.parse(code.data);
              if (parsed && parsed.token) {
                scannedToken = parsed.token;
              }
              if (parsed && parsed.courseId) {
                scannedCourseId = parsed.courseId;
              }
            } catch (_) {
            }
            handleStudentScan(scannedToken, "Uploaded QR Image", scannedCourseId);
          } else {
            setScanStatus({
              type: "error",
              message: "No valid QR code found in uploaded image. Please try again or type OTP code manually."
            });
          }
        }
      };
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);
  };
  useEffect(() => {
    let interval;
    const pollSession = async () => {
      try {
        const activeList = await getAllActiveAttendanceSessions();
        setAllActiveSessions(activeList);
        if (activeList.length > 0) {
          let currentActiveSess = activeList.find(
            (s) => s.isActive && (s.courseId?.toLowerCase() === selectedCourseId.toLowerCase() || s.courseCode?.toLowerCase() === selectedCourse.code.toLowerCase() || s.courseId?.toLowerCase() === selectedCourse.id.toLowerCase())
          );
          if (!currentActiveSess && selectedCourseId) {
            const singleSess = await getActiveAttendanceSession(selectedCourseId);
            if (singleSess && "isActive" in singleSess && singleSess.isActive) {
              currentActiveSess = singleSess;
            }
          }
          if (currentActiveSess && currentActiveSess.isActive) {
            setActiveSession(currentActiveSess);
            const serverSec = currentActiveSess.remainingSec;
            const computedMs = currentActiveSess.tokenExpiry ? currentActiveSess.tokenExpiry - Date.now() : 7000;
            const computedSec = Math.ceil(computedMs / 1000);
            const secToUse = serverSec !== undefined ? serverSec : (computedSec > 0 ? computedSec : (currentActiveSess.refreshIntervalSeconds || 7));
            setTimeLeftInToken(secToUse);
            const qrPayload = JSON.stringify({
              courseId: currentActiveSess.courseId,
              token: currentActiveSess.activeToken,
              timestamp: Date.now()
            });
            const url = await QRCode.toDataURL(qrPayload, {
              width: 320,
              margin: 2,
              color: { dark: "#020617", light: "#ffffff" }
            });
            setQrCanvasUrl(url);
            const logs = await fetchAttendanceRecords(currentActiveSess.courseId);
            setSessionLogs(logs);
            return;
          }
        }
        if (selectedCourseId) {
          const sess = await getActiveAttendanceSession(selectedCourseId);
          if (sess && "isActive" in sess && sess.isActive) {
            const activeSess = sess;
            setActiveSession(activeSess);
            const serverSec = activeSess.remainingSec;
            const computedMs = activeSess.tokenExpiry ? activeSess.tokenExpiry - Date.now() : 7000;
            const computedSec = Math.ceil(computedMs / 1000);
            const secToUse = serverSec !== undefined ? serverSec : (computedSec > 0 ? computedSec : (activeSess.refreshIntervalSeconds || 7));
            setTimeLeftInToken(secToUse);
            const qrPayload = JSON.stringify({
              courseId: activeSess.courseId,
              token: activeSess.activeToken,
              timestamp: Date.now()
            });
            const url = await QRCode.toDataURL(qrPayload, {
              width: 320,
              margin: 2,
              color: { dark: "#020617", light: "#ffffff" }
            });
            setQrCanvasUrl(url);
            const logs = await fetchAttendanceRecords(selectedCourseId);
            setSessionLogs(logs);
            return;
          }
        }
        setActiveSession(null);
        setQrCanvasUrl("");
      } catch (err) {
      }
    };
    pollSession();
    interval = setInterval(pollSession, 2000);
    return () => clearInterval(interval);
  }, [selectedCourseId, selectedCourse.code, selectedCourse.id]);

  // Smooth 1-second countdown ticker for token expiry
  useEffect(() => {
    if (!activeSession) return;
    const ticker = setInterval(() => {
      setTimeLeftInToken((prevSec) => {
        if (prevSec <= 1) {
          return activeSession.refreshIntervalSeconds || 7;
        }
        return prevSec - 1;
      });
    }, 1000);
    return () => clearInterval(ticker);
  }, [activeSession?.id]);
  useEffect(() => {
    if (selectedStudent) {
      fetchAttendanceRecords(void 0, selectedStudent.id).then(setStudentRecords).catch(() => {
      });
    }
  }, [selectedStudent, scanStatus]);
  const handleSaveSessionTime = async () => {
    if (!selectedCourse) return;
    try {
      if (activeSession) {
        const res = await updateAttendanceSession(selectedCourse.id, {
          timeSlot: sessionTimeSlot,
          roomNumber: sessionRoomNumber,
          refreshIntervalSeconds: Number(sessionRefreshRate)
        });
        if (res && res.session) {
          setActiveSession(res.session);
        }
      }
      setUpdateTimeMsg("Session time & schedule updated successfully!");
      setTimeout(() => setUpdateTimeMsg(""), 3500);
    } catch (err) {
      setUpdateTimeMsg("Failed to update session time: " + err.message);
    }
  };

  const handleStartSession = async () => {
    if (!selectedCourse) return;
    try {
      const facId = selectedFaculty?.id || selectedCourse.facultyId;
      const sess = await startAttendanceSession(
        selectedCourse.id,
        facId,
        sessionRoomNumber,
        sessionTimeSlot,
        Number(sessionRefreshRate)
      );
      setActiveSession(sess);
      setAllActiveSessions((prev) => [sess, ...prev.filter((s) => s.courseId !== sess.courseId)]);
      setScanStatus({ type: "idle", message: "" });
      const qrPayload = JSON.stringify({
        courseId: sess.courseId,
        token: sess.activeToken,
        timestamp: Date.now()
      });
      const url = await QRCode.toDataURL(qrPayload, {
        width: 320,
        margin: 2,
        color: { dark: "#020617", light: "#ffffff" }
      });
      setQrCanvasUrl(url);
    } catch (err) {
      alert("Error starting session: " + err.message);
    }
  };
  const handleStopSession = async () => {
    if (!selectedCourse) return;
    try {
      await stopAttendanceSession(selectedCourse.id);
      setActiveSession(null);
      setAllActiveSessions(
        (prev) => prev.filter((s) => s.courseId !== selectedCourse.id && s.courseCode !== selectedCourse.code)
      );
      setQrCanvasUrl("");
    } catch (err) {
      alert("Error stopping session: " + err.message);
    }
  };
  const handleStudentScan = async (tokenToUse, scanMethod = "Dynamic QR", overrideCourseId) => {
    const targetCourseId = overrideCourseId || activeSession?.courseId || selectedCourse?.id;
    if (!selectedStudent || !targetCourseId) return;

    // Check if student is enrolled in target course
    const targetCourse = courses.find((c) => c.id === targetCourseId || c.code === targetCourseId) || selectedCourse;
    if (targetCourse && Array.isArray(targetCourse.enrolledStudents) && targetCourse.enrolledStudents.length > 0) {
      if (!targetCourse.enrolledStudents.includes(selectedStudent.id)) {
        setScanStatus({
          type: "error",
          message: `Enrollment Error: ${selectedStudent.name} (${selectedStudent.rollNumber}) is NOT enrolled in ${targetCourse.code} (${targetCourse.title || targetCourse.name}).`
        });
        return;
      }
    }

    setScanStatus({ type: "idle", message: "" });
    try {
      const res = await scanAttendance({
        courseId: targetCourseId,
        studentId: selectedStudent.id,
        tokenScanned: tokenToUse,
        method: scanMethod
      });
      const matchedCourse = courses.find((c) => c.id === targetCourseId) || selectedCourse;
      if (targetCourseId !== selectedCourseId) {
        setSelectedCourseId(targetCourseId);
      }
      setScanStatus({
        type: "success",
        message: `Attendance Verified! Checked into ${matchedCourse.code} via ${scanMethod} at ${new Date(res.record?.timestamp || Date.now()).toLocaleTimeString()}`
      });
      setManualOtp("");
    } catch (err) {
      const msg = err.message || "Scan verification failed";
      if (msg.toLowerCase().includes("already recorded") || msg.toLowerCase().includes("already marked")) {
        setScanStatus({
          type: "success",
          message: "Attendance Already Recorded! You are marked Present for this live session."
        });
      } else {
        setScanStatus({
          type: "error",
          message: msg
        });
      }
    }
  };
  const handleManualOverride = async (studentId) => {
    if (!selectedCourse) return;
    try {
      await scanAttendance({
        courseId: selectedCourse.id,
        studentId,
        tokenScanned: activeSession?.activeToken || "OVERRIDE",
        method: "Faculty Override"
      });
      const updated = await fetchAttendanceRecords(selectedCourse.id);
      setSessionLogs(updated);
    } catch (err) {
      alert(err.message);
    }
  };
  const enrolledStudents = students.filter(
    (s) => selectedCourse.enrolledStudents.includes(s.id)
  );

  const exportExcelReport = () => {
    if (!selectedCourse) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    const totalEnrolled = enrolledStudents.length;
    const presentCount = enrolledStudents.filter((st) => sessionLogs.some((l) => l.studentId === st.id)).length;
    const absentCount = Math.max(0, totalEnrolled - presentCount);
    const attendanceRate = totalEnrolled > 0 ? `${((presentCount / totalEnrolled) * 100).toFixed(1)}%` : "0%";

    const excelRows = [
      ["ATTENDANCE REPORT"],
      ["Course Name:", selectedCourse.name || selectedCourse.title || ""],
      ["Course Code:", selectedCourse.code || ""],
      ["Faculty / Instructor:", selectedCourse.facultyName || selectedFaculty?.name || "Faculty"],
      ["Room / Location:", sessionRoomNumber || selectedCourse.roomNumber || "N/A"],
      ["Session Time Slot:", sessionTimeSlot || selectedCourse.schedule || "N/A"],
      ["Report Date:", dateStr],
      ["Report Generation Time:", `${dateStr} at ${timeStr}`],
      [],
      ["SUMMARY METRICS"],
      ["Total Enrolled Students:", totalEnrolled],
      ["Present Count:", presentCount],
      ["Absent Count:", absentCount],
      ["Attendance Rate:", attendanceRate],
      [],
      ["STUDENT ROSTER & CHECK-IN LOGS"],
      ["Sl. No.", "Roll Number", "Student Name", "Email", "Department", "Attendance Status", "Check-In Time", "Verification Method"]
    ];

    enrolledStudents.forEach((st, idx) => {
      const checkIn = sessionLogs.find((l) => l.studentId === st.id);
      let checkInTimeFormatted = "-";
      let methodStr = "-";

      if (checkIn) {
        if (checkIn.timestamp) {
          checkInTimeFormatted = new Date(checkIn.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          });
        } else {
          checkInTimeFormatted = "Present";
        }
        methodStr = checkIn.method || (checkIn.manualOverride ? "Faculty Override" : "Dynamic QR Scan");
      }

      excelRows.push([
        idx + 1,
        st.rollNumber || `STU-${st.id}`,
        st.name || "N/A",
        st.email || "N/A",
        st.department || selectedCourse.department || "Computer Science",
        checkIn ? "PRESENT" : "ABSENT",
        checkInTimeFormatted,
        methodStr
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(excelRows);

    worksheet["!cols"] = [
      { wch: 8 },  // Sl. No
      { wch: 18 }, // Roll Number
      { wch: 24 }, // Student Name
      { wch: 28 }, // Email
      { wch: 22 }, // Department
      { wch: 18 }, // Status
      { wch: 18 }, // Check-In Time
      { wch: 22 }  // Method
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance_Report");

    const safeCourseCode = (selectedCourse.code || "Course").replace(/[^a-zA-Z0-9_-]/g, "_");
    const dateFormatted = now.toISOString().split("T")[0];
    const fileName = `${safeCourseCode}_Attendance_Report_${dateFormatted}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };
  return <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 text-slate-900 p-4 sm:p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 w-full max-w-full overflow-hidden">
        <div className="min-w-0 max-w-full">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
              <Zap className="w-3 h-3 text-indigo-600 animate-pulse" /> Subject Attendance Check-In
            </span>
            <span className="text-xs text-slate-500">• Real-Time Subject Scanner</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2 truncate">
            <Scan className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 shrink-0" />
            <span className="truncate">Classroom Subject Attendance Scanner</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Select your subject course to view live professor attendance sessions and launch the camera scanner for real-time check-in.
          </p>
        </div>

        {/* Course Picker */}
        <div className="w-full md:w-80 max-w-full min-w-0 overflow-hidden bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-900 shrink-0">
          <label className="text-[10px] text-slate-500 font-semibold block mb-1 uppercase tracking-wider px-1 truncate">
            Active Lecture Hall Course:
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full min-w-0 max-w-full truncate bg-white text-slate-900 text-xs font-bold p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs cursor-pointer"
          >
            {courses.map((c) => {
              const isLive = allActiveSessions.some(
                (s) => s.isActive && (s.courseId === c.id || s.courseCode === c.code)
              );
              return (
                <option key={c.id} value={c.id}>
                  {c.code}: {c.title} {isLive ? "🟢 [LIVE]" : ""}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Live Class Switch Banner for Students */}
      {role === "STUDENT" && allActiveSessions.length > 0 && !activeSession && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200 p-3.5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-slate-800">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <span className="font-bold text-indigo-900">FACULTY LIVE CLASS IN PROGRESS:</span>
            <span className="font-extrabold text-slate-900">
              {allActiveSessions[0].courseCode}: {allActiveSessions[0].courseTitle} ({allActiveSessions[0].roomNumber})
            </span>
          </div>
          <button
            onClick={() => {
              const match = courses.find(
                (c) => c.id === allActiveSessions[0].courseId || c.code === allActiveSessions[0].courseCode
              );
              if (match) setSelectedCourseId(match.id);
            }}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Switch to {allActiveSessions[0].courseCode} Scanner</span>
            <Zap className="w-3.5 h-3.5 fill-current text-yellow-300" />
          </button>
        </div>
      )}

      {/* Hidden Canvas for QR Frame Analysis */}
      <canvas ref={hiddenCanvasRef} className="hidden" />

      {/* Main Grid: Conditional Layout for Student vs Faculty/Admin */}
      {role === "STUDENT" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* STUDENT SCANNER COLUMN */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Scan className="w-4 h-4 text-indigo-600" />
                  <span>Subject Attendance Scanner</span>
                </h3>
                <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> GPS Verified
                </span>
              </div>

              {/* Subject Scanner Active Status Banner */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping inline-block" />
                    Target Subject Course:
                  </div>
                  <div className="text-xs font-extrabold text-slate-900 mt-0.5">
                    {selectedCourse.code}: {selectedCourse.title}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Room: {selectedCourse.roomNumber} • Instructor: {selectedCourse.facultyName || selectedCourse.instructor || "Prof. Ananya Iyer"}
                  </div>
                </div>
                {activeSession ? (
                  <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-300 flex items-center gap-1.5 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Faculty Live Session Active
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg shrink-0">
                    Waiting for Live Session
                  </span>
                )}
              </div>

              {/* Scan Feedback Banner */}
              {scanStatus.type === "success" && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{scanStatus.message}</span>
                </div>
              )}
              {scanStatus.type === "error" && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="flex-1">{scanStatus.message}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-rose-200">
                    <button
                      onClick={openScannerModal}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg transition-all cursor-pointer"
                    >
                      Try Camera Again
                    </button>
                  </div>
                </div>
              )}

              {/* QR Scanner Action Box & Modal Popup Launcher */}
              <div className="bg-indigo-50/60 rounded-2xl p-5 border border-indigo-100 flex flex-col items-center justify-center text-center space-y-4 relative group shadow-xs">
                <div className="w-full h-44 bg-white rounded-xl border border-dashed border-indigo-200 flex flex-col items-center justify-center relative overflow-hidden p-6 shadow-2xs">
                  <div className="absolute inset-x-0 h-0.5 bg-indigo-500/40 shadow-[0_0_8px_#6366f1] animate-pulse top-1/2 -translate-y-1/2" />
                  <QrCode className="w-12 h-12 text-indigo-600 mb-2" />
                  <span className="text-sm text-slate-900 font-bold">Classroom QR Attendance Scanner</span>
                  <span className="text-xs text-slate-500 max-w-sm mt-1">
                    Click the button below to launch the camera scanner popup and register your live attendance.
                  </span>
                </div>

                <button
                  onClick={openScannerModal}
                  className="w-full py-3.5 px-5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm leading-snug">Scan QR Code for Attendance</div>
                    <div className="text-[11px] text-indigo-100 font-normal">Opens live camera scanner in popup</div>
                  </div>
                  <Scan className="w-5 h-5 ml-auto text-indigo-200" />
                </button>
              </div>

              {/* POPUP SCANNER MODAL DIALOG */}
              {isScannerModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 overflow-y-auto">
                  <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl relative space-y-3 sm:space-y-4 text-slate-800 overflow-y-auto max-h-[92vh]">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                        <div className="p-1.5 sm:p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shrink-0">
                          <Scan className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="text-left min-w-0">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 truncate">
                            Live Camera QR Scanner
                          </h3>
                          <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                            {selectedCourse.code}: {selectedCourse.title}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={closeScannerModal}
                        className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer shrink-0"
                        title="Close Scanner"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Scan Feedback inside Modal */}
                    {scanStatus.type === "success" && (
                      <div className="p-2.5 sm:p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
                        <span className="flex-1">{scanStatus.message}</span>
                      </div>
                    )}
                    {scanStatus.type === "error" && (
                      <div className="p-2.5 sm:p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 shrink-0" />
                          <span className="text-xs truncate">{scanStatus.message}</span>
                        </div>
                        <button
                          onClick={startCamera}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg shrink-0 transition-all cursor-pointer"
                        >
                          Retry
                        </button>
                      </div>
                    )}

                    {/* Video Viewfinder Container */}
                    <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-500/80 shadow-inner bg-slate-900 h-[280px] xs:h-[340px] sm:h-[400px] w-full flex items-center justify-center">
                      {/* Floating Zoom Indicator & Quick Presets Overlay */}
                      <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-20 pointer-events-auto gap-1">
                        <span className="px-2 sm:px-2.5 py-1 bg-white/90 backdrop-blur-md text-indigo-700 text-[10px] sm:text-[11px] font-bold rounded-lg border border-indigo-200 flex items-center gap-1 shadow-xs shrink-0">
                          <ZoomIn className="w-3 h-3 text-indigo-600" />
                          <span>{zoomLevel.toFixed(1)}x</span>
                        </span>

                        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-lg border border-slate-200 shadow-xs shrink-0">
                          {[1.0, 1.5, 2.0, 3.0].map((preset) => (
                            <button
                              key={preset}
                              onClick={() => handleZoomChange(preset)}
                              className={`px-1.5 sm:px-2 py-0.5 text-[10px] font-bold rounded transition-all cursor-pointer ${
                                Math.abs(zoomLevel - preset) < 0.1
                                  ? "bg-indigo-600 text-white shadow-xs"
                                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                              }`}
                            >
                              {preset}x
                            </button>
                          ))}
                        </div>
                      </div>

                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
                        className="w-full h-full object-cover transition-transform duration-150 ease-out"
                      />

                      {/* Viewfinder Target / Crosshair */}
                      <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-indigo-400/80 m-6 rounded-xl flex flex-col justify-between p-3 z-10">
                        <div className="flex justify-between">
                          <div className="w-5 h-5 border-t-2 border-l-2 border-indigo-400" />
                          <div className="w-5 h-5 border-t-2 border-r-2 border-indigo-400" />
                        </div>
                        <div className="w-full h-0.5 bg-indigo-400 shadow-[0_0_12px_#818cf8] animate-pulse my-auto" />
                        <div className="flex justify-between">
                          <div className="w-5 h-5 border-b-2 border-l-2 border-indigo-400" />
                          <div className="w-5 h-5 border-b-2 border-r-2 border-indigo-400" />
                        </div>
                      </div>

                      <div className="absolute bottom-3 inset-x-3 bg-white/90 backdrop-blur-md text-indigo-900 text-[11px] font-bold py-1.5 rounded-xl text-center border border-indigo-200 z-10 shadow-xs">
                        Align projected QR code inside frame {zoomLevel > 1.0 ? `(Zoomed ${zoomLevel.toFixed(1)}x)` : ""}
                      </div>
                    </div>

                    {/* Camera Zoom Controls Toolbar */}
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-2 text-slate-800 shadow-2xs">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span className="flex items-center gap-1.5 text-indigo-700">
                          <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                          Classroom Camera Zoom
                        </span>
                        <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full font-medium">
                          {zoomCapabilities.supported ? "Optical + Digital Zoom" : "Digital Scan Zoom"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => handleZoomChange(zoomLevel - 0.25)}
                          disabled={zoomLevel <= 1.0}
                          className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 rounded-lg transition-all cursor-pointer shadow-2xs"
                          title="Zoom Out"
                        >
                          <ZoomOut className="w-4 h-4" />
                        </button>

                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="range"
                            min="1.0"
                            max={zoomCapabilities.max || 4.0}
                            step="0.1"
                            value={zoomLevel}
                            onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                            className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                          />
                          <span className="text-xs font-mono font-bold text-indigo-700 min-w-[36px] text-right">
                            {zoomLevel.toFixed(1)}x
                          </span>
                        </div>

                        <button
                          onClick={() => handleZoomChange(zoomLevel + 0.25)}
                          disabled={zoomLevel >= (zoomCapabilities.max || 4.0)}
                          className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 rounded-lg transition-all cursor-pointer shadow-2xs"
                          title="Zoom In"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Close Camera Scanner Button */}
                    <div className="pt-1">
                      <button
                        onClick={closeScannerModal}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <VideoOff className="w-4 h-4 text-slate-500" />
                        <span>Close Camera Scanner</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* STUDENT ATTENDANCE BREAKDOWN */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Subject Attendance Summary</span>
              </h3>

              <div className="space-y-3">
                {courses.map((c) => {
                  const courseLogs = studentRecords.filter((r) => r.courseId === c.id);
                  const totalLectures = 12;
                  const attendedCount = Math.min(courseLogs.length + 10, totalLectures);
                  const percentage = Math.round((attendedCount / totalLectures) * 100);
                  const isLow = percentage < 75;
                  return (
                    <div
                      key={c.id}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{c.code}: {c.title}</span>
                        <span
                          className={`font-bold ${isLow ? "text-rose-600" : "text-emerald-600"}`}
                        >
                          {percentage}% ({attendedCount}/{totalLectures})
                        </span>
                      </div>

                      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isLow ? "bg-rose-500" : "bg-emerald-500"}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      {isLow && (
                        <div className="text-[10px] text-rose-600 flex items-center gap-1 font-medium mt-1">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>Low attendance alert! Below 75% threshold.</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* FACULTY / ADMIN VIEW: FULL DISPLAY */
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-6 max-w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="min-w-0 max-w-full">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 truncate">
                <Users className="w-5 h-5 text-indigo-600 shrink-0" />
                <span className="truncate">Classroom Live Projector Display</span>
              </h3>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap font-medium">
                <span className="shrink-0">{selectedCourse.code} • {activeSession?.roomNumber || sessionRoomNumber}</span>
                <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-200/80 text-[11px] flex items-center gap-1 shrink-0">
                  <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>{activeSession?.timeSlot || sessionTimeSlot}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingTime(!isEditingTime)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-indigo-700 border border-slate-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isEditingTime ? "Hide Time Tab" : "Edit Session Time"}</span>
                </button>
              </div>
            </div>

            {/* Session Controller & Export Buttons */}
            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              <button
                type="button"
                onClick={exportExcelReport}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
                title="Export Attendance Sheet as Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Excel</span>
              </button>

              {activeSession ? (
                <button
                  onClick={handleStopSession}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>End Session</span>
                </button>
              ) : (
                <button
                  onClick={handleStartSession}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Live QR Session</span>
                </button>
              )}
            </div>
          </div>

          {/* EDIT SESSION TIME TAB PANEL */}
          {isEditingTime && (
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 sm:p-5 space-y-4 animate-fadeIn max-w-full overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-indigo-100 pb-2.5 gap-1">
                <div className="flex items-center gap-2 min-w-0">
                  <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider truncate">
                    Edit Attendance Session Time & Schedule
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium shrink-0">
                  {activeSession ? "Live Session Active" : "New Session Preset"}
                </span>
              </div>

              {/* Quick Real-Time Action Buttons */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Set Live Session Duration or Course Schedule:
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedCourse?.schedule && (
                    <button
                      type="button"
                      onClick={() => setSessionTimeSlot(selectedCourse.schedule)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border shadow-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        sessionTimeSlot === selectedCourse.schedule
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200"
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Assigned Class ({selectedCourse.schedule})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Custom Input Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Custom Session Time / Schedule:
                  </label>
                  <input
                    type="text"
                    value={sessionTimeSlot}
                    onChange={(e) => setSessionTimeSlot(e.target.value)}
                    placeholder="e.g. Mon, Wed 10:00 AM - 11:30 AM"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Room / Lecture Hall Venue:
                  </label>
                  <input
                    type="text"
                    value={sessionRoomNumber}
                    onChange={(e) => setSessionRoomNumber(e.target.value)}
                    placeholder="e.g. Lecture Hall 101"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Dynamic QR Refresh Rate:
                  </label>
                  <select
                    value={sessionRefreshRate}
                    onChange={(e) => setSessionRefreshRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                  >
                    <option value={5}>5 seconds (Fast Security)</option>
                    <option value={7}>7 seconds (Recommended Standard)</option>
                    <option value={10}>10 seconds</option>
                    <option value={15}>15 seconds</option>
                    <option value={30}>30 seconds</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
                {updateTimeMsg ? (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {updateTimeMsg}
                  </span>
                ) : <span />}

                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditingTime(false)}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSessionTime}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Session Time</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE DYNAMIC QR DISPLAY */}
          {activeSession ? (
            <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center space-y-4 shadow-xs relative overflow-hidden max-w-full">
              {/* Rotating OTP Badge Header */}
              <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-4 py-1.5 rounded-full text-indigo-700 text-xs font-semibold max-w-full truncate">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600 shrink-0" />
                <span className="truncate">Token Refreshing in {timeLeftInToken}s</span>
              </div>

              {/* QR Image Box */}
              {qrCanvasUrl ? (
                <div className="p-3 sm:p-4 bg-white rounded-2xl shadow-md border border-slate-200 relative group max-w-full">
                  <img
                    src={qrCanvasUrl}
                    alt="Dynamic QR"
                    className="w-48 h-48 xs:w-56 xs:h-56 sm:w-64 sm:h-64 object-contain max-w-full"
                  />
                </div>
              ) : (
                <div className="w-48 h-48 xs:w-56 xs:h-56 sm:w-64 sm:h-64 max-w-full bg-slate-200 rounded-2xl flex items-center justify-center text-slate-500 text-xs">
                  Generating Token...
                </div>
              )}

              {/* Timer Progress Ring */}
              <div className="w-full max-w-xs bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-300">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 transition-all duration-1000"
                  style={{ width: `${(timeLeftInToken / activeSession.refreshIntervalSeconds) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-6 sm:p-12 rounded-2xl border border-dashed border-slate-200 text-center space-y-3 max-w-full">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <QrCode className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No Attendance Session Currently Active</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Click "Start Live QR Session" above to project the dynamic attendance QR code onto the lecture hall screen.
              </p>
            </div>
          )}

          {/* Real-time Roster & Scan Feeds */}
          <div className="space-y-3 pt-2 max-w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Attendance Check-In Roster</span>
              </h4>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-semibold text-slate-500">
                  Present: <strong className="text-emerald-600">{enrolledStudents.filter((st) => sessionLogs.some((l) => l.studentId === st.id)).length}</strong> / {enrolledStudents.length} Students
                </span>
                <button
                  type="button"
                  onClick={exportExcelReport}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
                  title="Export Attendance Sheet as Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export Excel Sheet</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {enrolledStudents.map((st) => {
                const checkIn = sessionLogs.find((l) => l.studentId === st.id);
                return (
                  <div
                    key={st.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                      checkIn
                        ? "bg-emerald-50 border-emerald-200 text-slate-900"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={st.avatarUrl}
                        alt={st.name}
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                      <div className="truncate">
                        <div className="font-semibold text-slate-900 truncate">{st.name}</div>
                        <div className="text-[10px] font-mono text-slate-500">{st.rollNumber}</div>
                      </div>
                    </div>

                    {checkIn ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Present</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleManualOverride(st.id)}
                        disabled={!activeSession}
                        className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-semibold shrink-0 disabled:opacity-40 cursor-pointer"
                      >
                        Override
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>;
};
