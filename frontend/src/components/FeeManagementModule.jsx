import { useState } from "react";
import {
  CreditCard,
  CheckCircle,
  Clock,
  Printer,
  X,
  FileCheck2,
  FileText,
  ShieldCheck,
  AlertCircle,
  Pencil,
  Plus,
  Save,
  Wallet,
  CheckCircle2,
  TrendingUp,
  PieChart,
  BarChart3,
  QrCode,
  Building2,
  Lock,
  RefreshCw,
  Key
} from "lucide-react";
import { createRazorpayOrder, verifyRazorpayPayment } from "../services/api";

export const FeeManagementModule = ({
  role,
  fees,
  students = [],
  selectedStudent,
  onPayFee,
  onUpdateFee,
  onCreateFee,
  onResetFees
}) => {
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterSemester, setFilterSemester] = useState("ALL");
  const [payFeeRecord, setPayFeeRecord] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(1000);
  const [receiptRecord, setReceiptRecord] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // Custom Razorpay Keys State
  const [showKeyConfigModal, setShowKeyConfigModal] = useState(false);
  const [customKeyId, setCustomKeyId] = useState(() => localStorage.getItem("rzp_custom_key_id") || "rzp_test_TLopZhrCgeEEqG");
  const [customKeySecret, setCustomKeySecret] = useState(() => localStorage.getItem("rzp_custom_key_secret") || "Aw8d37f963OiOPiT3WUSszu1");
  const [keySavedMessage, setKeySavedMessage] = useState("");

  // Razorpay Gateway Popup Modal State
  const [showRzpModal, setShowRzpModal] = useState(false);
  const [rzpCheckoutData, setRzpCheckoutData] = useState(null);
  const [rzpPaymentMethod, setRzpPaymentMethod] = useState("upi");
  const [rzpUpiId, setRzpUpiId] = useState("student@okicici");
  const [rzpCardNumber, setRzpCardNumber] = useState("4111 1111 1111 1111");
  const [rzpCardExpiry, setRzpCardExpiry] = useState("12/28");
  const [rzpCardCvv, setRzpCardCvv] = useState("123");
  const [rzpSelectedBank, setRzpSelectedBank] = useState("HDFC Bank");
  const [isRzpProcessing, setIsRzpProcessing] = useState(false);

  // Admin Edit Fee State
  const [editingFee, setEditingFee] = useState(null);
  const [editFormData, setEditFormData] = useState({
    tuitionFee: 0,
    labFee: 0,
    libraryFee: 0,
    examFee: 0,
    supplementaryFee: 0,
    otherFee: 0,
    amountPaid: 0,
    dueDate: "",
    semester: 1,
    academicYear: "2025-2026"
  });

  // Admin Create Fee State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    studentId: "",
    semester: 3,
    academicYear: "2025-2026",
    tuitionFee: 38000,
    labFee: 5000,
    libraryFee: 1500,
    examFee: 2000,
    supplementaryFee: 0,
    otherFee: 1500,
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]
  });

  const filteredFees = fees.filter((f) => {
    if (role === "STUDENT" && selectedStudent && f.studentId !== selectedStudent.id) {
      return false;
    }
    if (filterSemester !== "ALL" && Number(f.semester) !== Number(filterSemester)) {
      return false;
    }
    if (filterStatus === "ALL") return true;
    return f.status === filterStatus;
  });

  // Calculate Overall Fee Summary Metrics (Across All 8 Semesters / 4 Academic Years)
  const summaryFees = (role === "STUDENT" && selectedStudent)
    ? fees.filter((f) => f.studentId === selectedStudent.id)
    : fees;

  const totalTuitionBilled = summaryFees.reduce((acc, f) => acc + (f.tuitionFee || 50000), 0);
  const totalExamBilled = summaryFees.reduce((acc, f) => acc + (f.examFee || 2000), 0);
  const totalBilled = totalTuitionBilled + totalExamBilled;

  const totalTuitionPaid = summaryFees.reduce((acc, f) => acc + Math.min(f.amountPaid || 0, f.tuitionFee || 50000), 0);
  const totalExamPaid = summaryFees.reduce((acc, f) => {
    const isExamPaid = f.status === "Paid" || f.examFeePaid === true || (f.totalFee && f.amountPaid >= f.totalFee) || (f.tuitionFee === 0 && f.amountPaid >= f.examFee);
    return acc + (isExamPaid ? (f.examFee || 2000) : 0);
  }, 0);
  const totalPaid = totalTuitionPaid + totalExamPaid;
  const totalPending = Math.max(0, totalBilled - totalPaid);
  const paidPercentage = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0;

  // Breakdown by 4 Academic Years (Sem 1-2, 3-4, 5-6, 7-8)
  const yearlyBreakdown = [1, 2, 3, 4].map((yr) => {
    const sem1 = (yr - 1) * 2 + 1;
    const sem2 = (yr - 1) * 2 + 2;
    const yrRecords = summaryFees.filter((f) => Number(f.semester) === sem1 || Number(f.semester) === sem2);

    const yrTuition = yrRecords.reduce((acc, f) => acc + (f.tuitionFee || 50000), 0);
    const yrExamFee = yrRecords.reduce((acc, f) => acc + (f.examFee || 2000), 0);
    const yrTotalWithExam = yrTuition + yrExamFee;

    const yrTuitionPaid = yrRecords.reduce((acc, f) => acc + Math.min(f.amountPaid || 0, f.tuitionFee || 50000), 0);
    const yrExamPaid = yrRecords.reduce((acc, f) => {
      const isExamPaid = f.status === "Paid" || f.examFeePaid === true || (f.totalFee && f.amountPaid >= f.totalFee) || (f.tuitionFee === 0 && f.amountPaid >= f.examFee);
      return acc + (isExamPaid ? (f.examFee || 2000) : 0);
    }, 0);

    const yrPaid = yrTuitionPaid + yrExamPaid;
    const yrPending = Math.max(0, yrTotalWithExam - yrPaid);

    return {
      yearNumber: yr,
      title: `${yr}${yr === 1 ? 'st' : yr === 2 ? 'nd' : yr === 3 ? 'rd' : 'th'} Year (Sem ${sem1} & ${sem2})`,
      tuition: yrTuition,
      examFee: yrExamFee,
      totalWithExam: yrTotalWithExam,
      total: yrTotalWithExam,
      paid: yrPaid,
      pending: yrPending,
      tuitionPaid: yrTuitionPaid,
      examPaid: yrExamPaid,
      count: yrRecords.length
    };
  });

  const handleStartEdit = (fee) => {
    setEditingFee(fee);
    setEditFormData({
      tuitionFee: fee.tuitionFee || 0,
      labFee: fee.labFee || 0,
      libraryFee: fee.libraryFee || 0,
      examFee: fee.examFee || 0,
      supplementaryFee: fee.supplementaryFee || 0,
      otherFee: fee.otherFee || 0,
      amountPaid: fee.amountPaid || 0,
      dueDate: fee.dueDate || new Date().toISOString().split("T")[0],
      semester: fee.semester || 1,
      academicYear: fee.academicYear || "2025-2026"
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingFee) return;
    try {
      setIsProcessing(true);
      await onUpdateFee(editingFee.id, editFormData);
      setEditingFee(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update fee record: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveCreate = async (e) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      const selStudent = students.find((s) => s.id === createFormData.studentId) || students[0];
      await onCreateFee({
        ...createFormData,
        studentId: selStudent?.id || "STU-001",
        studentName: selStudent?.name || "Student",
        studentRoll: selStudent?.rollNo || "CS2026-001"
      });
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create fee record: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(true));
        existingScript.addEventListener("error", () => resolve(false));
        // If already loaded
        if (window.Razorpay) resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!payFeeRecord) return;
    setIsProcessing(true);
    setPaymentError("");

    try {
      const isExamPayment = payFeeRecord && Number(paymentAmount) === Number(payFeeRecord.examFee);

      // 1. Load Razorpay Checkout SDK script from CDN
      const scriptLoaded = await loadRazorpayScript();

      // 2. Create Razorpay order on backend (passing custom keys if configured)
      const customKeys = customKeyId ? { keyId: customKeyId, keySecret: customKeySecret } : {};
      const orderData = await createRazorpayOrder(payFeeRecord.id, paymentAmount, customKeys);

      if (!orderData || !orderData.orderId) {
        throw new Error("Could not initialize Razorpay payment order");
      }

      // Active Key ID for Razorpay SDK window
      const activeKey =
        (customKeyId && customKeyId.trim()) ||
        (orderData.keyId && orderData.keyId !== "rzp_test_placeholder" ? orderData.keyId : null) ||
        "rzp_test_TLopZhrCgeEEqG";

      const currentFeeRecord = payFeeRecord;
      const currentAmount = paymentAmount;

      // 3. Launch official Razorpay Checkout SDK popup window directly
      if (scriptLoaded && typeof window.Razorpay !== "undefined") {
        const options = {
          key: activeKey,
          amount: orderData.amount,
          currency: orderData.currency || "INR",
          name: "StudyNet University ERP",
          description: `Tuition Fee Payment - ${currentFeeRecord.studentName} (${currentFeeRecord.studentRoll})`,
          image: "https://images.unsplash.com/photo-1562774053-701939374585?w=100&q=80",
          prefill: {
            name: selectedStudent?.name || currentFeeRecord.studentName,
            email: selectedStudent?.email || "student@studynet.edu.in",
            contact: selectedStudent?.phone || "9845599599"
          },
          theme: {
            color: "#059669"
          },
          handler: async function (response) {
            try {
              setIsProcessing(true);
              const verification = await verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id || orderData.orderId,
                razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
                razorpay_signature: response.razorpay_signature || "mock_signature_for_test",
                feeId: currentFeeRecord.id,
                amountPaid: currentAmount,
                isExamFee: isExamPayment
              });

              if (verification.success && verification.fee) {
                await onPayFee(currentFeeRecord.id, currentAmount, verification.fee, isExamPayment);
                setReceiptRecord(verification.fee);
                setPayFeeRecord(null);
              } else {
                setPaymentError(verification.error || "Payment verification failed.");
              }
            } catch (vErr) {
              console.error(vErr);
              setPaymentError("Payment verification failed: " + vErr.message);
            } finally {
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            }
          }
        };

        // Attach order_id ONLY if orderData was created live on Razorpay and not mock mode
        if (orderData.orderId && !orderData.isMockMode && !orderData.orderId.startsWith("order_test_")) {
          options.order_id = orderData.orderId;
        }

        try {
          const rzp = new window.Razorpay(options);
          rzp.on("payment.failed", function (resp) {
            console.warn("Razorpay SDK payment failure:", resp);
            setPaymentError(resp.error?.description || "Razorpay Payment Failed.");
            setIsProcessing(false);
          });

          rzp.open();
          setPayFeeRecord(null);
          setIsProcessing(false);
          return;
        } catch (rzpErr) {
          console.error("Razorpay window.open error:", rzpErr);
          setPaymentError("Failed to open Razorpay checkout popup: " + rzpErr.message);
          setIsProcessing(false);
          return;
        }
      } else {
        setPaymentError("Razorpay checkout SDK script failed to load. Please check your network connection.");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      setPaymentError("Payment failed: " + err.message);
    }
  };

  const handleRzpModalPaySuccess = async () => {
    if (!rzpCheckoutData) return;
    setIsRzpProcessing(true);
    try {
      const verification = await verifyRazorpayPayment({
        razorpay_order_id: rzpCheckoutData.orderId,
        razorpay_payment_id: `pay_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        razorpay_signature: "mock_signature_for_test",
        feeId: rzpCheckoutData.feeRecord.id,
        amountPaid: rzpCheckoutData.amountPaid,
        isExamFee: rzpCheckoutData.isExamPayment
      });

      if (verification.success && verification.fee) {
        await onPayFee(
          rzpCheckoutData.feeRecord.id,
          rzpCheckoutData.amountPaid,
          verification.fee,
          rzpCheckoutData.isExamPayment
        );
        setReceiptRecord(verification.fee);
        setShowRzpModal(false);
        setRzpCheckoutData(null);
      } else {
        setPaymentError(verification.error || "Razorpay payment verification failed.");
      }
    } catch (err) {
      console.error("Razorpay payment error:", err);
      setPaymentError("Payment error: " + err.message);
    } finally {
      setIsRzpProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600 shrink-0" />
            <span>Fee & Finance Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {role === "STUDENT"
              ? "Track tuition fee invoices, submit online payments via Razorpay Gateway, and download official receipts."
              : "Monitor student tuition fee invoices, collection status, and payment receipts."}
          </p>
        </div>

        {/* Filter Pills & Reset Button */}
        <div className="flex flex-wrap items-center gap-2 max-w-full">
          {/* Semester Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Sem:</span>
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Semesters (1–8)</option>
              <option value="1">Semester 1 (1st Yr)</option>
              <option value="2">Semester 2 (1st Yr)</option>
              <option value="3">Semester 3 (2nd Yr)</option>
              <option value="4">Semester 4 (2nd Yr)</option>
              <option value="5">Semester 5 (3rd Yr)</option>
              <option value="6">Semester 6 (3rd Yr)</option>
              <option value="7">Semester 7 (4th Yr)</option>
              <option value="8">Semester 8 (4th Yr)</option>
            </select>
          </div>



          {role === "ADMIN" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Fee Record</span>
            </button>
          )}

          <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto max-w-full no-scrollbar shrink-0">
            {["ALL", "Paid", "Partial", "Pending", "Overdue"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  filterStatus === st
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overall Fee Summary Dashboard Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Overall Fee Summary & Collection Status</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive breakdown across all 4 academic years (8 Semesters)
            </p>
          </div>
          <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
            {paidPercentage}% Cleared
          </span>
        </div>

        {/* 3 Main Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Prescribed Fee</span>
              <span className="text-lg sm:text-xl font-black text-slate-900 mt-0.5 block">
                ₹{totalBilled.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
                ₹{totalTuitionBilled.toLocaleString("en-IN")} Tuition + ₹{totalExamBilled.toLocaleString("en-IN")} Exam
              </span>
            </div>
            <div className="p-2.5 bg-indigo-100/70 text-indigo-700 rounded-xl shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Total Paid Fee</span>
              <span className="text-lg sm:text-xl font-black text-emerald-700 mt-0.5 block">
                ₹{totalPaid.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-emerald-600 block mt-0.5 font-medium">
                ₹{totalTuitionPaid.toLocaleString("en-IN")} Tuition + ₹{totalExamPaid.toLocaleString("en-IN")} Exam Paid
              </span>
            </div>
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Total Remaining Pending</span>
              <span className="text-lg sm:text-xl font-black text-amber-900 mt-0.5 block">
                ₹{totalPending.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-amber-700 block mt-0.5 font-medium">
                ₹{(totalTuitionBilled - totalTuitionPaid).toLocaleString("en-IN")} Tuition + ₹{(totalExamBilled - totalExamPaid).toLocaleString("en-IN")} Exam Pending
              </span>
            </div>
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Year-wise Breakdown Mini Grid */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <span className="text-xs font-bold text-slate-700">8 Semesters Fee Structure Breakdown (4 Academic Years):</span>
            <span className="text-[11px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
              Per Semester: ₹50,000 Tuition + ₹2,000 Exam = ₹52,000 Total
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {yearlyBreakdown.map((yr) => {
              const yrPaidPercent = yr.total > 0 ? Math.round((yr.paid / yr.total) * 100) : 0;
              const semA = (yr.yearNumber - 1) * 2 + 1;
              const semB = (yr.yearNumber - 1) * 2 + 2;
              return (
                <div key={yr.yearNumber} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{yr.title}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      yr.pending === 0 && yr.total > 0
                        ? "bg-emerald-100 text-emerald-700"
                        : yr.paid > 0
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-200 text-slate-600"
                    }`}>
                      {yr.pending === 0 && yr.total > 0 ? "Paid" : `${yrPaidPercent}% Cleared`}
                    </span>
                  </div>

                  {/* 2 Semester Pills inside each Year */}
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] font-semibold text-slate-600 bg-white p-1.5 rounded-lg border border-slate-100">
                    <div className="bg-indigo-50/60 p-1 rounded text-center">
                      <div className="text-indigo-900 font-bold">Sem {semA}</div>
                      <div className="text-slate-500 text-[9px]">₹50,000 <span className="text-indigo-600 font-medium">(+₹2k Exam)</span></div>
                    </div>
                    <div className="bg-indigo-50/60 p-1 rounded text-center">
                      <div className="text-indigo-900 font-bold">Sem {semB}</div>
                      <div className="text-slate-500 text-[9px]">₹50,000 <span className="text-indigo-600 font-medium">(+₹2k Exam)</span></div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs pt-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Tuition Billed:</span>
                      <span className="font-semibold text-slate-900">₹{yr.tuition.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-indigo-700">
                      <span>Exam Fee (2 Sems):</span>
                      <span className="font-semibold">₹{yr.examFee.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-200/80">
                      <span>Total with Exam Fee:</span>
                      <span className="text-indigo-900 font-black">₹{yr.totalWithExam.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                      <span>Total Paid:</span>
                      <span className="font-semibold">₹{yr.paid.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-amber-800">
                      <span>Pending:</span>
                      <span className="font-semibold">₹{yr.pending.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>



      {/* Main Semester Fee Table - Tuition Fee Structure */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-5 shadow-xs">
        <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span>All 8 Semesters Tuition Fee Structure</span>
            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
              ₹50,000 / Semester (Tuition Fee)
            </span>
          </h3>
        </div>

        {/* Mobile Stacked Card View (< md) */}
        <div className="block md:hidden space-y-3">
          {filteredFees.map((f) => {
            const displayTotal = f.totalFee || f.tuitionFee || 50000;
            const pendingAmount = displayTotal - (f.amountPaid || 0);

            return (
              <div key={`m-tuition-${f.id}`} className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{f.studentName}</div>
                    <div className="text-xs font-mono text-indigo-600 font-bold">{f.studentRoll}</div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border shrink-0 ${
                      f.status === "Paid"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : f.status === "Partial"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {f.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Semester / Year</span>
                    <span className="font-bold text-slate-800">Sem {f.semester} ({f.academicYear})</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Tuition Fee</span>
                    <span className="font-bold text-slate-900">₹{(f.tuitionFee || 50000).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Total Amount</span>
                    <span className="font-black text-slate-900">₹{displayTotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Paid Amount</span>
                    <span className="font-bold text-emerald-600">₹{(f.amountPaid || 0).toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-end gap-2">
                  {role === "ADMIN" && (
                    <button
                      onClick={() => handleStartEdit(f)}
                      className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold text-xs transition-all cursor-pointer inline-flex items-center gap-1 border border-indigo-200/80"
                      title="Edit Student Fee Details"
                    >
                      <Pencil className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Edit Fee</span>
                    </button>
                  )}

                  {pendingAmount > 0 ? (
                    role === "STUDENT" ? (
                      <button
                        onClick={() => {
                          setPayFeeRecord(f);
                          setPaymentAmount(pendingAmount);
                          setPaymentError("");
                        }}
                        className="w-full sm:w-auto px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Pay ₹{pendingAmount.toLocaleString("en-IN")}</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 text-amber-700 rounded-lg font-semibold text-xs border border-amber-200/60">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>₹{pendingAmount.toLocaleString("en-IN")} Due</span>
                      </span>
                    )
                  ) : (
                    <button
                      onClick={() => setReceiptRecord(f)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Receipt</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table View (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[700px] text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider whitespace-nowrap">
                <th className="pb-3 px-2 sm:px-3">Student</th>
                <th className="pb-3 px-2 sm:px-3">Semester / Year</th>
                <th className="pb-3 px-2 sm:px-3">Tuition Fee</th>
                <th className="pb-3 px-2 sm:px-3">Total Amount</th>
                <th className="pb-3 px-2 sm:px-3">Paid Amount</th>
                <th className="pb-3 px-2 sm:px-3">Status</th>
                <th className="pb-3 px-2 sm:px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFees.map((f) => {
                const displayTotal = f.totalFee || f.tuitionFee || 50000;
                const pendingAmount = displayTotal - (f.amountPaid || 0);

                return (
                  <tr key={f.id} className="hover:bg-slate-50 transition-colors whitespace-nowrap">
                    <td className="py-3.5 px-2 sm:px-3">
                      <div className="font-bold text-slate-900">{f.studentName}</div>
                      <div className="text-[10px] font-mono text-indigo-600 font-bold">{f.studentRoll}</div>
                    </td>
                    <td className="py-3.5 px-2 sm:px-3 text-slate-600 font-medium">
                      Sem {f.semester} ({f.academicYear})
                    </td>
                    <td className="py-3.5 px-2 sm:px-3 font-bold text-slate-800">
                      ₹{(f.tuitionFee || 50000).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-2 sm:px-3 font-black text-slate-900">
                      ₹{displayTotal.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-2 sm:px-3 font-semibold text-emerald-600">
                      ₹{(f.amountPaid || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-2 sm:px-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                          f.status === "Paid"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : f.status === "Partial"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 sm:px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {role === "ADMIN" && (
                          <button
                            onClick={() => handleStartEdit(f)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold text-xs transition-all cursor-pointer inline-flex items-center gap-1 border border-indigo-200/80"
                            title="Edit Student Fee Details"
                          >
                            <Pencil className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Edit Fee</span>
                          </button>
                        )}

                        {pendingAmount > 0 ? (
                          role === "STUDENT" ? (
                            <button
                              onClick={() => {
                                setPayFeeRecord(f);
                                setPaymentAmount(pendingAmount);
                                setPaymentError("");
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Pay ₹{pendingAmount.toLocaleString("en-IN")}</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-lg font-semibold text-[11px] border border-amber-200/60">
                              <Clock className="w-3 h-3 text-amber-500" />
                              <span>₹{pendingAmount.toLocaleString("en-IN")} Due</span>
                            </span>
                          )
                        ) : (
                          <button
                            onClick={() => setReceiptRecord(f)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-all cursor-pointer"
                          >
                            <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Receipt</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredFees.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs">
            No semester fee records found for the selected status filter.
          </div>
        )}
      </div>

      {/* NEW STRUCTURE: Regular Examination Fee Structure */}
      <div className="bg-white border border-indigo-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
              <span>Regular Examination Fee Structure</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dedicated fee structure for regular end-semester main university examinations and admit card processing.
            </p>
          </div>
          {role === "ADMIN" && (
            <button
              onClick={() => {
                setCreateFormData((prev) => ({
                  ...prev,
                  tuitionFee: 0,
                  labFee: 0,
                  libraryFee: 0,
                  examFee: 2000,
                  supplementaryFee: 0,
                  otherFee: 0
                }));
                setShowCreateModal(true);
              }}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Exam Fee</span>
            </button>
          )}
        </div>

        {/* Mobile Stacked Card View for Regular Exam Fee (< md) */}
        <div className="block md:hidden space-y-3">
          {filteredFees
            .filter((f) => (f.examFee || 0) > 0)
            .map((f) => {
              const isExamPaid =
                f.status === "Paid" ||
                f.examFeePaid === true ||
                (f.totalFee && f.amountPaid >= f.totalFee) ||
                (f.tuitionFee === 0 && f.amountPaid >= f.examFee);

              return (
                <div key={`m-exam-${f.id}`} className="bg-indigo-50/30 border border-indigo-100 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-start justify-between gap-2 border-b border-indigo-100 pb-2.5">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{f.studentName}</div>
                      <div className="text-xs font-mono text-indigo-600 font-bold">{f.studentRoll}</div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border shrink-0 ${
                        isExamPaid
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-indigo-50 text-indigo-700 border-indigo-200"
                      }`}
                    >
                      {isExamPaid ? "Paid" : "Pending"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">Exam Term</span>
                      <span className="font-bold text-slate-800">Sem {f.semester} Main Exam</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">Exam Fee</span>
                      <span className="font-extrabold text-indigo-900">₹{(f.examFee || 0).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200/60 col-span-2">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">Due Date</span>
                      <span className="font-medium text-slate-700">{f.dueDate || "2025-09-15"}</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-end gap-2">
                    {role === "ADMIN" && (
                      <button
                        onClick={() => handleStartEdit(f)}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold text-xs transition-all cursor-pointer inline-flex items-center gap-1 border border-indigo-200/80"
                      >
                        <Pencil className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Edit</span>
                      </button>
                    )}

                    {!isExamPaid ? (
                      role === "STUDENT" ? (
                        <button
                          onClick={() => {
                            setPayFeeRecord(f);
                            setPaymentAmount(f.examFee);
                            setPaymentError("");
                          }}
                          className="w-full sm:w-auto px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Pay Exam Fee ₹{f.examFee.toLocaleString("en-IN")}</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-semibold text-xs border border-indigo-200">
                          <Clock className="w-3.5 h-3.5 text-indigo-600" />
                          <span>₹{f.examFee.toLocaleString("en-IN")} Due</span>
                        </span>
                      )
                    ) : (
                      <button
                        onClick={() => setReceiptRecord(f)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Receipt</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          {filteredFees.filter((f) => (f.examFee || 0) > 0).length === 0 && (
            <div className="p-6 text-center text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              No active regular exam fee records found for this student/filter.
            </div>
          )}
        </div>

        {/* Desktop Table View for Regular Exam Fee (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[650px] text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider whitespace-nowrap">
                <th className="pb-3 px-2 sm:px-3">Student</th>
                <th className="pb-3 px-2 sm:px-3">Exam Term</th>
                <th className="pb-3 px-2 sm:px-3">Exam Fee</th>
                <th className="pb-3 px-2 sm:px-3">Due Date</th>
                <th className="pb-3 px-2 sm:px-3">Status</th>
                <th className="pb-3 px-2 sm:px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFees
                .filter((f) => (f.examFee || 0) > 0)
                .map((f) => {
                  const isExamPaid =
                    f.status === "Paid" ||
                    f.examFeePaid === true ||
                    (f.totalFee && f.amountPaid >= f.totalFee) ||
                    (f.tuitionFee === 0 && f.amountPaid >= f.examFee);

                  return (
                    <tr key={`exam-${f.id}`} className="hover:bg-indigo-50/40 transition-colors whitespace-nowrap">
                      <td className="py-3.5 px-2 sm:px-3">
                        <div className="font-bold text-slate-900">{f.studentName}</div>
                        <div className="text-[10px] font-mono text-indigo-600 font-bold">{f.studentRoll}</div>
                      </td>
                      <td className="py-3.5 px-2 sm:px-3 text-slate-600">
                        <span className="font-semibold text-slate-800">Sem {f.semester} Main Exam</span>
                        <div className="text-[10px] text-slate-500 font-mono">Academic Year {f.academicYear}</div>
                      </td>
                      <td className="py-3.5 px-2 sm:px-3">
                        <span className="font-extrabold text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 inline-block">
                          ₹{(f.examFee || 0).toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 sm:px-3 text-slate-600 font-medium">
                        {f.dueDate || "2025-09-15"}
                      </td>
                      <td className="py-3.5 px-2 sm:px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                            isExamPaid
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-indigo-50 text-indigo-700 border-indigo-200"
                          }`}
                        >
                          {isExamPaid ? "Paid" : "Pending"}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 sm:px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {role === "ADMIN" && (
                            <button
                              onClick={() => handleStartEdit(f)}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold text-xs transition-all cursor-pointer inline-flex items-center gap-1 border border-indigo-200/80"
                            >
                              <Pencil className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Edit</span>
                            </button>
                          )}

                          {!isExamPaid ? (
                            role === "STUDENT" ? (
                              <button
                                onClick={() => {
                                  setPayFeeRecord(f);
                                  setPaymentAmount(f.examFee);
                                  setPaymentError("");
                                }}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-xs shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Pay Exam Fee ₹{f.examFee.toLocaleString("en-IN")}</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-semibold text-[11px] border border-indigo-200">
                                <Clock className="w-3 h-3 text-indigo-600" />
                                <span>₹{f.examFee.toLocaleString("en-IN")} Due</span>
                              </span>
                            )
                          ) : (
                            <button
                              onClick={() => setReceiptRecord(f)}
                              className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-all cursor-pointer"
                            >
                              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Receipt</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>

          {filteredFees.filter((f) => (f.examFee || 0) > 0).length === 0 && (
            <div className="p-6 text-center text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              No active regular exam fee records found for this student/filter.
            </div>
          )}
        </div>
      </div>

      {/* NEW STRUCTURE: Supplementary & Backlog Exam Fee Structure (Below Main Table) */}
      <div className="bg-white border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Supplementary & Backlog Exam Fee Structure</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dedicated fee structure for supplementary examinations, backlog papers, and re-evaluation fees.
            </p>
          </div>
          {role === "ADMIN" && (
            <button
              onClick={() => {
                setCreateFormData((prev) => ({
                  ...prev,
                  tuitionFee: 0,
                  labFee: 0,
                  libraryFee: 0,
                  examFee: 0,
                  supplementaryFee: 2000,
                  otherFee: 0
                }));
                setShowCreateModal(true);
              }}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Supply Fee</span>
            </button>
          )}
        </div>

        {/* Mobile Stacked Card View for Backlog Fee (< md) */}
        <div className="block md:hidden space-y-3">
          {filteredFees
            .filter((f) => (f.supplementaryFee || 0) > 0)
            .map((f) => {
              return (
                <div key={`m-supply-${f.id}`} className="bg-amber-50/30 border border-amber-200 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-start justify-between gap-2 border-b border-amber-100 pb-2.5">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{f.studentName}</div>
                      <div className="text-xs font-mono text-indigo-600 font-bold">{f.studentRoll}</div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border shrink-0 ${
                        f.status === "Paid"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {f.status === "Paid" ? "Paid" : "Pending"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">Backlog Details</span>
                      <span className="font-bold text-slate-800">Sem {f.semester} Re-Exam</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">Supply Fee</span>
                      <span className="font-extrabold text-amber-800">₹{f.supplementaryFee.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200/60 col-span-2">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">Due Date</span>
                      <span className="font-medium text-slate-700">{f.dueDate || "2025-10-15"}</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-end gap-2">
                    {role === "ADMIN" && (
                      <button
                        onClick={() => handleStartEdit(f)}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold text-xs transition-all cursor-pointer inline-flex items-center gap-1 border border-indigo-200/80"
                      >
                        <Pencil className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Edit</span>
                      </button>
                    )}

                    {f.status !== "Paid" ? (
                      role === "STUDENT" ? (
                        <button
                          onClick={() => {
                            setPayFeeRecord(f);
                            setPaymentAmount(f.supplementaryFee);
                            setPaymentError("");
                          }}
                          className="w-full sm:w-auto px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Pay Supply Fee ₹{f.supplementaryFee.toLocaleString("en-IN")}</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 text-amber-700 rounded-lg font-semibold text-xs border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>₹{f.supplementaryFee.toLocaleString("en-IN")} Due</span>
                        </span>
                      )
                    ) : (
                      <button
                        onClick={() => setReceiptRecord(f)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Receipt</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          {filteredFees.filter((f) => (f.supplementaryFee || 0) > 0).length === 0 && (
            <div className="p-6 text-center text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              No active supplementary or backlog fee dues recorded for this student/filter.
            </div>
          )}
        </div>

        {/* Desktop Table View for Backlog Fee (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[650px] text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider whitespace-nowrap">
                <th className="pb-3 px-2 sm:px-3">Student</th>
                <th className="pb-3 px-2 sm:px-3">Backlog Details</th>
                <th className="pb-3 px-2 sm:px-3">Supply Fee</th>
                <th className="pb-3 px-2 sm:px-3">Due Date</th>
                <th className="pb-3 px-2 sm:px-3">Status</th>
                <th className="pb-3 px-2 sm:px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFees
                .filter((f) => (f.supplementaryFee || 0) > 0)
                .map((f) => {
                  const supplyPending = f.status === "Paid" ? 0 : f.supplementaryFee;
                  return (
                    <tr key={`supply-${f.id}`} className="hover:bg-amber-50/40 transition-colors whitespace-nowrap">
                      <td className="py-3.5 px-2 sm:px-3">
                        <div className="font-bold text-slate-900">{f.studentName}</div>
                        <div className="text-[10px] font-mono text-indigo-600 font-bold">{f.studentRoll}</div>
                      </td>
                      <td className="py-3.5 px-2 sm:px-3 text-slate-600">
                        <span className="font-semibold text-slate-800">Sem {f.semester} Supplementary Re-Exam</span>
                        <div className="text-[10px] text-slate-500 font-mono">Academic Year {f.academicYear}</div>
                      </td>
                      <td className="py-3.5 px-2 sm:px-3">
                        <span className="font-extrabold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-block">
                          ₹{f.supplementaryFee.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 sm:px-3 text-slate-600 font-medium">
                        {f.dueDate || "2025-10-15"}
                      </td>
                      <td className="py-3.5 px-2 sm:px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                            f.status === "Paid"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {f.status === "Paid" ? "Paid" : "Pending"}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 sm:px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {role === "ADMIN" && (
                            <button
                              onClick={() => handleStartEdit(f)}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold text-xs transition-all cursor-pointer inline-flex items-center gap-1 border border-indigo-200/80"
                            >
                              <Pencil className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Edit</span>
                            </button>
                          )}

                          {f.status !== "Paid" ? (
                            role === "STUDENT" ? (
                              <button
                                onClick={() => {
                                  setPayFeeRecord(f);
                                  setPaymentAmount(f.supplementaryFee);
                                  setPaymentError("");
                                }}
                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold text-xs shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Pay Supply Fee ₹{f.supplementaryFee.toLocaleString("en-IN")}</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-lg font-semibold text-[11px] border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>₹{f.supplementaryFee.toLocaleString("en-IN")} Due</span>
                              </span>
                            )
                          ) : (
                            <button
                              onClick={() => setReceiptRecord(f)}
                              className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-all cursor-pointer"
                            >
                              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Receipt</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>

          {filteredFees.filter((f) => (f.supplementaryFee || 0) > 0).length === 0 && (
            <div className="p-6 text-center text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              No active supplementary or backlog fee dues recorded for this student/filter.
            </div>
          )}
        </div>
      </div>

      {/* Online Pay Modal (Razorpay Integration) */}
      {role === "STUDENT" && payFeeRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-4 sm:p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setPayFeeRecord(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Razorpay Online Fee Payment</h3>
                <p className="text-[11px] text-slate-500">Secure 256-Bit SSL Encrypted Sandbox Gateway</p>
              </div>
            </div>

            {paymentError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{paymentError}</span>
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Student:</span>
                <strong className="text-slate-900">{payFeeRecord.studentName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Roll No:</span>
                <strong className="text-indigo-600 font-mono font-bold">{payFeeRecord.studentRoll}</strong>
              </div>
              <div className="border-t border-slate-200 pt-1.5 space-y-1 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span>Tuition Fee:</span>
                  <span>₹{(payFeeRecord.tuitionFee || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Exam Fee:</span>
                  <span>₹{(payFeeRecord.examFee || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Supplementary Fee:</span>
                  <span>₹{(payFeeRecord.supplementaryFee || 0).toLocaleString("en-IN")}</span>
                </div>
                {Boolean(payFeeRecord.labFee) && (
                  <div className="flex justify-between">
                    <span>Lab Fee:</span>
                    <span>₹{payFeeRecord.labFee.toLocaleString("en-IN")}</span>
                  </div>
                )}
                {Boolean(payFeeRecord.libraryFee) && (
                  <div className="flex justify-between">
                    <span>Library Fee:</span>
                    <span>₹{payFeeRecord.libraryFee.toLocaleString("en-IN")}</span>
                  </div>
                )}
                {Boolean(payFeeRecord.otherFee) && (
                  <div className="flex justify-between">
                    <span>Other Fee:</span>
                    <span>₹{payFeeRecord.otherFee.toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5">
                <span className="text-slate-500 font-medium">Total Semester Fee:</span>
                <strong>₹{payFeeRecord.totalFee.toLocaleString("en-IN")}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Already Paid:</span>
                <span className="text-emerald-600 font-semibold">
                  ₹{payFeeRecord.amountPaid.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <form onSubmit={handlePaySubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">
                  Payment Amount (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  max={payFeeRecord.totalFee - payFeeRecord.amountPaid}
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm p-2.5 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">
                  Payment Gateway Method
                </label>
                <div className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl font-medium flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Razorpay Checkout (UPI, Cards, NetBanking)
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">TEST MODE</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPayFeeRecord(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {isProcessing
                      ? "Initializing Razorpay..."
                      : `Pay ₹${paymentAmount.toLocaleString("en-IN")} via Razorpay`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Razorpay Gateway Checkout Modal */}
      {showRzpModal && rzpCheckoutData && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 max-h-[92vh] overflow-y-auto">
            {/* Dark Navy Header matching Razorpay official styling */}
            <div className="bg-[#0c2340] text-white p-4 sm:p-5 relative">
              <button
                onClick={() => {
                  setShowRzpModal(false);
                  setRzpCheckoutData(null);
                }}
                className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm tracking-wide text-white">Razorpay Checkout</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-1.5 py-0.5 rounded border border-emerald-400/30">
                  TEST GATEWAY
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1 border-t border-white/10">
                <div>
                  <p className="text-xs text-slate-300 font-medium">StudyNet University ERP</p>
                  <p className="text-[11px] text-slate-400">
                    Student: {rzpCheckoutData.feeRecord.studentName} ({rzpCheckoutData.feeRecord.studentRoll})
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-sky-400 font-mono">
                    ₹{Number(rzpCheckoutData.amountPaid).toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">ID: {rzpCheckoutData.orderId.slice(-12)}</p>
                </div>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="bg-slate-50 border-b border-slate-200 p-2 flex gap-1 text-xs">
              <button
                type="button"
                onClick={() => setRzpPaymentMethod("upi")}
                className={`flex-1 py-2 px-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  rzpPaymentMethod === "upi"
                    ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:bg-slate-200/60"
                }`}
              >
                <QrCode className="w-3.5 h-3.5 text-indigo-600" /> UPI / QR
              </button>

              <button
                type="button"
                onClick={() => setRzpPaymentMethod("card")}
                className={`flex-1 py-2 px-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  rzpPaymentMethod === "card"
                    ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:bg-slate-200/60"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-indigo-600" /> Card
              </button>

              <button
                type="button"
                onClick={() => setRzpPaymentMethod("netbanking")}
                className={`flex-1 py-2 px-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  rzpPaymentMethod === "netbanking"
                    ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:bg-slate-200/60"
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-600" /> NetBanking
              </button>
            </div>

            {/* Modal Body depending on Tab */}
            <div className="p-5 space-y-4 text-xs">
              {rzpPaymentMethod === "upi" && (
                <div className="space-y-3">
                  <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center gap-3">
                    <div className="w-16 h-16 bg-white rounded-lg p-1.5 border border-indigo-200 shrink-0 flex items-center justify-center shadow-2xs">
                      {/* Interactive Simulated Razorpay QR Code */}
                      <div className="w-full h-full bg-slate-900 rounded p-1 flex flex-col items-center justify-center text-white text-[8px] font-mono text-center leading-tight">
                        <QrCode className="w-8 h-8 text-sky-400" />
                        <span>RAZORPAY</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">Scan QR with any UPI App</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Google Pay, PhonePe, Paytm, BHIM</p>
                      <span className="inline-block mt-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                        Auto-approved in Test Mode
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-700 block mb-1">Or enter VPA / UPI ID</label>
                    <input
                      type="text"
                      value={rzpUpiId}
                      onChange={(e) => setRzpUpiId(e.target.value)}
                      placeholder="e.g. student@okicici"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-2.5 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {["Google Pay", "PhonePe", "Paytm", "BHIM"].map((app) => (
                      <button
                        key={app}
                        type="button"
                        onClick={() => setRzpUpiId(`student@${app.toLowerCase().replace(/\s+/g, '')}`)}
                        className="p-1.5 bg-slate-100 hover:bg-indigo-50 border border-slate-200 rounded-lg text-[10px] font-medium text-slate-700 text-center transition-all cursor-pointer"
                      >
                        {app}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {rzpPaymentMethod === "card" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 block mb-1">Card Number (Test Card)</label>
                    <input
                      type="text"
                      value={rzpCardNumber}
                      onChange={(e) => setRzpCardNumber(e.target.value)}
                      placeholder="4111 1111 1111 1111"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-2.5 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-slate-700 block mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={rzpCardExpiry}
                        onChange={(e) => setRzpCardExpiry(e.target.value)}
                        placeholder="12/28"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-2.5 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-700 block mb-1">CVV</label>
                      <input
                        type="password"
                        value={rzpCardCvv}
                        maxLength={4}
                        onChange={(e) => setRzpCardCvv(e.target.value)}
                        placeholder="123"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-2.5 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {rzpPaymentMethod === "netbanking" && (
                <div className="space-y-3">
                  <label className="text-[11px] font-medium text-slate-700 block mb-1">Select Bank</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["HDFC Bank", "State Bank of India", "ICICI Bank", "Axis Bank", "Kotak Mahindra"].map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setRzpSelectedBank(bank)}
                        className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer ${
                          rzpSelectedBank === bank
                            ? "bg-indigo-50 border-indigo-500 text-indigo-900 font-bold shadow-2xs"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  disabled={isRzpProcessing}
                  onClick={handleRzpModalPaySuccess}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
                >
                  {isRzpProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Razorpay Payment...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Pay ₹{Number(rzpCheckoutData.amountPaid).toLocaleString("en-IN")} via Razorpay</span>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1 pt-1">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>256-Bit Encryption • Razorpay Secure Checkout</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Digital Receipt Modal */}
      {receiptRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4 text-slate-800">
            <button
              onClick={() => setReceiptRecord(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center border-b border-slate-200 pb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-emerald-700">FEES PAYMENT RECEIPT</h3>
              <p className="text-xs text-slate-500">StudyNet Bursar Office & Razorpay Online System</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt No:</span>
                <span className="font-mono font-bold text-indigo-600">
                  {receiptRecord.receiptNumber || "REC-88231"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-bold text-slate-900">{receiptRecord.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Roll Number:</span>
                <span className="font-mono font-semibold text-slate-800">{receiptRecord.studentRoll}</span>
              </div>
              <div className="border-t border-slate-200 pt-1.5 space-y-1 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span>Tuition Fee:</span>
                  <span>₹{(receiptRecord.tuitionFee || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Exam Fee:</span>
                  <span>₹{(receiptRecord.examFee || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Supplementary Fee:</span>
                  <span>₹{(receiptRecord.supplementaryFee || 0).toLocaleString("en-IN")}</span>
                </div>
                {Boolean(receiptRecord.labFee) && (
                  <div className="flex justify-between">
                    <span>Lab Fee:</span>
                    <span>₹{receiptRecord.labFee.toLocaleString("en-IN")}</span>
                  </div>
                )}
                {Boolean(receiptRecord.libraryFee) && (
                  <div className="flex justify-between">
                    <span>Library Fee:</span>
                    <span>₹{receiptRecord.libraryFee.toLocaleString("en-IN")}</span>
                  </div>
                )}
                {Boolean(receiptRecord.otherFee) && (
                  <div className="flex justify-between">
                    <span>Other Fee:</span>
                    <span>₹{receiptRecord.otherFee.toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5">
                <span className="text-slate-500 font-medium">Total Invoice Fee:</span>
                <strong className="text-slate-900">₹{(receiptRecord.totalFee || receiptRecord.amountPaid).toLocaleString("en-IN")}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-emerald-600">
                  ₹{receiptRecord.amountPaid.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Date:</span>
                <span className="font-medium text-slate-800">
                  {receiptRecord.lastPaymentDate || new Date().toISOString().split("T")[0]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Gateway:</span>
                <span className="font-medium text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Razorpay Test Gateway Verified
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Edit Fee Modal */}
      {role === "ADMIN" && editingFee && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-4 sm:p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingFee(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0">
                <Pencil className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Student Fee Structure</h3>
                <p className="text-xs text-slate-500">
                  {editingFee.studentName} ({editingFee.studentRoll})
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={editFormData.semester}
                    onChange={(e) => setEditFormData({ ...editFormData, semester: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={editFormData.academicYear}
                    onChange={(e) => setEditFormData({ ...editFormData, academicYear: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Tuition Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.tuitionFee}
                    onChange={(e) => setEditFormData({ ...editFormData, tuitionFee: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Lab Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.labFee}
                    onChange={(e) => setEditFormData({ ...editFormData, labFee: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Library Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.libraryFee}
                    onChange={(e) => setEditFormData({ ...editFormData, libraryFee: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Exam Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.examFee}
                    onChange={(e) => setEditFormData({ ...editFormData, examFee: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Supplementary Exam Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.supplementaryFee}
                    onChange={(e) => setEditFormData({ ...editFormData, supplementaryFee: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Other Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.otherFee}
                    onChange={(e) => setEditFormData({ ...editFormData, otherFee: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Amount Paid (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.amountPaid}
                    onChange={(e) => setEditFormData({ ...editFormData, amountPaid: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editFormData.dueDate}
                    onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Total Calculation Preview */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Calculated Total Fee:</span>
                  <strong className="text-slate-900 font-mono">
                    ₹{(
                      Number(editFormData.tuitionFee) +
                      Number(editFormData.labFee) +
                      Number(editFormData.libraryFee) +
                      Number(editFormData.examFee) +
                      Number(editFormData.supplementaryFee) +
                      Number(editFormData.otherFee)
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Remaining Due Balance:</span>
                  <strong className="text-amber-600 font-mono">
                    ₹{Math.max(
                      0,
                      Number(editFormData.tuitionFee) +
                        Number(editFormData.labFee) +
                        Number(editFormData.libraryFee) +
                        Number(editFormData.examFee) +
                        Number(editFormData.supplementaryFee) +
                        Number(editFormData.otherFee) -
                        Number(editFormData.amountPaid)
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingFee(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isProcessing ? "Saving Changes..." : "Save Fee Record"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Add New Fee Record Modal */}
      {role === "ADMIN" && showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-4 sm:p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Add New Student Fee Record</h3>
                <p className="text-xs text-slate-500">Generate a new fee invoice for a student</p>
              </div>
            </div>

            <form onSubmit={handleSaveCreate} className="space-y-4">
              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">Select Student</label>
                <select
                  value={createFormData.studentId}
                  onChange={(e) => setCreateFormData({ ...createFormData, studentId: e.target.value })}
                  required
                  className="w-full min-w-0 max-w-full truncate bg-slate-50 border border-slate-200 text-slate-900 text-xs p-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.rollNo || s.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={createFormData.semester}
                    onChange={(e) => setCreateFormData({ ...createFormData, semester: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={createFormData.academicYear}
                    onChange={(e) => setCreateFormData({ ...createFormData, academicYear: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Tuition Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={createFormData.tuitionFee}
                    onChange={(e) => setCreateFormData({ ...createFormData, tuitionFee: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Lab Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={createFormData.labFee}
                    onChange={(e) => setCreateFormData({ ...createFormData, labFee: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Library Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={createFormData.libraryFee}
                    onChange={(e) => setCreateFormData({ ...createFormData, libraryFee: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Exam Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={createFormData.examFee}
                    onChange={(e) => setCreateFormData({ ...createFormData, examFee: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Supplementary Exam Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={createFormData.supplementaryFee}
                    onChange={(e) => setCreateFormData({ ...createFormData, supplementaryFee: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Other Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={createFormData.otherFee}
                    onChange={(e) => setCreateFormData({ ...createFormData, otherFee: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">Due Date</label>
                <input
                  type="date"
                  value={createFormData.dueDate}
                  onChange={(e) => setCreateFormData({ ...createFormData, dueDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Total Fee Preview */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center text-slate-700">
                <span className="font-medium">Total New Fee Amount:</span>
                <strong className="text-indigo-600 font-mono text-sm">
                  ₹{(
                    Number(createFormData.tuitionFee || 0) +
                    Number(createFormData.labFee || 0) +
                    Number(createFormData.libraryFee || 0) +
                    Number(createFormData.examFee || 0) +
                    Number(createFormData.supplementaryFee || 0) +
                    Number(createFormData.otherFee || 0)
                  ).toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !createFormData.studentId}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isProcessing ? "Creating Invoice..." : "Create Fee Record"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Razorpay API Key Settings Modal */}
      {showKeyConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-4 text-slate-800">
            <button
              type="button"
              onClick={() => {
                setShowKeyConfigModal(false);
                setKeySavedMessage("");
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Razorpay API Credentials</h3>
                <p className="text-xs text-slate-500">Configure key ID & secret for online payment popups</p>
              </div>
            </div>

            {keySavedMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{keySavedMessage}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                localStorage.setItem("rzp_custom_key_id", customKeyId.trim());
                localStorage.setItem("rzp_custom_key_secret", customKeySecret.trim());
                setKeySavedMessage("API keys saved successfully! Clicking Pay will now invoke Razorpay popup.");
                setTimeout(() => {
                  setShowKeyConfigModal(false);
                  setKeySavedMessage("");
                }, 1500);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Razorpay Key ID (`RAZORPAY_KEY_ID`)
                </label>
                <input
                  type="text"
                  value={customKeyId}
                  onChange={(e) => setCustomKeyId(e.target.value)}
                  placeholder="e.g. rzp_test_1234567890abcdef"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-2.5 rounded-xl font-mono text-xs focus:bg-white focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Find this in your Razorpay Dashboard under Settings → API Keys.
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Razorpay Key Secret (`RAZORPAY_KEY_SECRET`)
                </label>
                <input
                  type="password"
                  value={customKeySecret}
                  onChange={(e) => setCustomKeySecret(e.target.value)}
                  placeholder="e.g. 1a2b3c4d5e6f7g8h9i0j"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-2.5 rounded-xl font-mono text-xs focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <p className="font-bold text-slate-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>How Razorpay Popups Work:</span>
                </p>
                <p>
                  1. Entering a Key ID (`rzp_test_...`) triggers official <code className="bg-slate-200 px-1 rounded">window.Razorpay</code> checkout popup directly in your browser.
                </p>
                <p>
                  2. If keys are omitted, a test key (`rzp_test_1234567890`) opens the test Razorpay popup modal automatically.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                {customKeyId && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomKeyId("");
                      setCustomKeySecret("");
                      localStorage.removeItem("rzp_custom_key_id");
                      localStorage.removeItem("rzp_custom_key_secret");
                      setKeySavedMessage("Cleared custom keys.");
                    }}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                  >
                    Clear Keys
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Key Settings</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

