import { useState } from "react";
import {
  Home,
  Bus,
  Phone,
  Utensils,
  Plus,
  X,
  MapPin,
  CheckCircle
} from "lucide-react";
export const HostelTransportModule = ({
  role,
  selectedStudent,
  students,
  hostelAllocations,
  transportPasses,
  onAddHostel,
  onAddTransport
}) => {
  const [activeTab, setActiveTab] = useState("hostel");
  const [showHostelModal, setShowHostelModal] = useState(false);
  const [showTransportModal, setShowTransportModal] = useState(false);
  const [hostelStudentId, setHostelStudentId] = useState(students[0]?.id || "");
  const [blockName, setBlockName] = useState("Sir M. Visvesvaraya Hall (Block A)");
  const [roomNumber, setRoomNumber] = useState("A-304");
  const [bedNumber, setBedNumber] = useState("Bed 1");
  const [roomType, setRoomType] = useState("Double Sharing");
  const [wardenContact, setWardenContact] = useState("+91 98450 11223");
  const [messPlan, setMessPlan] = useState("Standard Veg & Non-Veg");
  const [transportStudentId, setTransportStudentId] = useState(students[0]?.id || "");
  const [routeNumber, setRouteNumber] = useState("Route 04 - Indiranagar Express");
  const [pickupPoint, setPickupPoint] = useState("100ft Road Metro Junction, Indiranagar, Bengaluru");
  const [busNumber, setBusNumber] = useState("KA-01-F-4201");
  const [driverContact, setDriverContact] = useState("+91 98451 22334");
  const myHostel = selectedStudent ? hostelAllocations.find((h) => h.studentId === selectedStudent.id || h.studentName === selectedStudent.name) : null;
  const myTransport = selectedStudent ? transportPasses.find((t) => t.studentId === selectedStudent.id || t.studentName === selectedStudent.name) : null;

  const displayedHostelAllocations = hostelAllocations.filter((h) => {
    if (role === "STUDENT" && selectedStudent) {
      return h.studentId === selectedStudent.id || h.studentName === selectedStudent.name;
    }
    return true;
  });

  const displayedTransportPasses = transportPasses.filter((tp) => {
    if (role === "STUDENT" && selectedStudent) {
      return tp.studentId === selectedStudent.id || tp.studentName === selectedStudent.name;
    }
    return true;
  });
  const handleCreateHostel = (e) => {
    e.preventDefault();
    const studentObj = students.find((s) => s.id === hostelStudentId);
    const newAlloc = {
      id: `HST-${Date.now().toString().slice(-3)}`,
      studentId: hostelStudentId,
      studentName: studentObj?.name || "Rohan Kulkarni",
      blockName,
      roomNumber,
      bedNumber,
      roomType,
      wardenContact,
      messPlan
    };
    onAddHostel(newAlloc);
    setShowHostelModal(false);
  };
  const handleCreateTransport = (e) => {
    e.preventDefault();
    const studentObj = students.find((s) => s.id === transportStudentId);
    const newPass = {
      id: `TRN-${Date.now().toString().slice(-3)}`,
      studentId: transportStudentId,
      studentName: studentObj?.name || "Rohan Kulkarni",
      routeNumber,
      pickupPoint,
      busNumber,
      driverContact,
      passExpiry: "2025-12-31",
      status: "Active"
    };
    onAddTransport(newPass);
    setShowTransportModal(false);
  };
  return <div className="space-y-6">
      {
    /* Header */
  }
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Home className="w-6 h-6 text-emerald-600 shrink-0" />
            <span>Hostel Residency & Campus Transit Pass</span>
          </h2>

        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 max-w-full">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto max-w-full no-scrollbar shrink-0">
            <button
              onClick={() => setActiveTab("hostel")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "hostel"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Hostel Allotments
            </button>
            <button
              onClick={() => setActiveTab("transport")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "transport"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Transport Bus Passes
            </button>
          </div>

          {role === "ADMIN" && (
            <button
              onClick={() =>
                activeTab === "hostel" ? setShowHostelModal(true) : setShowTransportModal(true)
              }
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{activeTab === "hostel" ? "Assign Room" : "Issue Bus Pass"}</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === "hostel" ? (
    /* Hostel View */
    <div className="space-y-4">
          {role === "STUDENT" && myHostel && <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{myHostel.blockName}</h3>
                    <p className="text-xs text-slate-500">Residential Digital Room Pass</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-mono font-bold">
                  {myHostel.roomNumber} ({myHostel.bedNumber})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                  <span className="text-emerald-800 block text-[10px] uppercase font-bold">Room Category</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">{myHostel.roomType}</span>
                </div>

                <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                  <span className="text-emerald-800 block text-[10px] uppercase font-bold">Warden Helpline</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> {myHostel.wardenContact}
                  </span>
                </div>

                <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                  <span className="text-emerald-800 block text-[10px] uppercase font-bold">Mess Subscription</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block flex items-center gap-1">
                    <Utensils className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> {myHostel.messPlan}
                  </span>
                </div>
              </div>
            </div>}

          {
      /* All Hostel Allocations List */
    }
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {role === "STUDENT"
                  ? "My Residential Room Details"
                  : `Residential Allotments Master Roster (${displayedHostelAllocations.length})`}
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {displayedHostelAllocations.map((h) => <div key={h.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{h.studentName}</span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                        {h.blockName}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      Room No: <strong className="text-slate-800">{h.roomNumber}</strong> ({h.bedNumber}) • Layout: {h.roomType}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Utensils className="w-3.5 h-3.5 text-slate-400" /> {h.messPlan}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-slate-500">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {h.wardenContact}
                    </span>
                  </div>
                </div>)}

              {displayedHostelAllocations.length === 0 && <div className="p-8 text-center text-slate-400 text-xs italic">
                  {role === "STUDENT"
                    ? "No residential room allotment record found for your account."
                    : "No residential room allotments recorded."}
                </div>}
            </div>
          </div>
        </div>
  ) : (
    /* Transport View */
    <div className="space-y-4">
          {role === "STUDENT" && myTransport && <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                    <Bus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{myTransport.routeNumber}</h3>
                    <p className="text-xs text-slate-500">Daily Campus Shuttle Digital Pass</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-mono font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Pass Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100">
                  <span className="text-indigo-800 block text-[10px] uppercase font-bold">Designated Pickup Point</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" /> {myTransport.pickupPoint}
                  </span>
                </div>

                <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100">
                  <span className="text-indigo-800 block text-[10px] uppercase font-bold">Bus Number & Vehicle</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block font-mono">{myTransport.busNumber}</span>
                </div>

                <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100">
                  <span className="text-indigo-800 block text-[10px] uppercase font-bold">Driver Helpline</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-indigo-600 shrink-0" /> {myTransport.driverContact}
                  </span>
                </div>
              </div>
            </div>}

          {
      /* All Transport Passes List */
    }
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {role === "STUDENT"
                  ? "My Campus Transit Pass Details"
                  : `Transit Bus Passes Roster (${displayedTransportPasses.length})`}
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {displayedTransportPasses.map((tp) => <div key={tp.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{tp.studentName}</span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                        {tp.routeNumber}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> Stop: <strong className="text-slate-800">{tp.pickupPoint}</strong> • Bus: {tp.busNumber}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-slate-500 font-mono flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> Driver: {tp.driverContact}
                    </span>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold text-[11px]">
                      Expires: {tp.passExpiry}
                    </span>
                  </div>
                </div>)}

              {displayedTransportPasses.length === 0 && <div className="p-8 text-center text-slate-400 text-xs italic">
                  {role === "STUDENT"
                    ? "No transit bus pass record found for your account."
                    : "No transit passes issued yet."}
                </div>}
            </div>
          </div>
        </div>
  )}

      {
    /* Assign Hostel Room Modal */
  }
      {showHostelModal && <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4">
            <button onClick={() => setShowHostelModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Home className="w-5 h-5 text-emerald-600" />
              <span>Assign Hostel Room Allotment</span>
            </h3>

            <form onSubmit={handleCreateHostel} className="space-y-3">
              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">Select Student *</label>
                <select
                  value={hostelStudentId}
                  onChange={(e) => setHostelStudentId(e.target.value)}
                  className="w-full min-w-0 max-w-full truncate bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                >
                  {students.map((s) => <option key={s.id} value={s.id}>
                      {s.name} ({s.rollNumber})
                    </option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Hostel Block *</label>
                  <input
                    type="text"
                    required
                    value={blockName}
                    onChange={(e) => setBlockName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Room No. & Bed *</label>
                  <input
                    type="text"
                    required
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. B-201 (Bed 2)"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Room Category</label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full min-w-0 max-w-full truncate bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Single Occupancy">Single Occupancy</option>
                    <option value="Double Sharing">Double Sharing</option>
                    <option value="Triple Sharing">Triple Sharing</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Mess Plan</label>
                  <select
                    value={messPlan}
                    onChange={(e) => setMessPlan(e.target.value)}
                    className="w-full min-w-0 max-w-full truncate bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Standard Veg & Non-Veg">Standard Veg & Non-Veg</option>
                    <option value="Special Veg">Special Veg</option>
                    <option value="Basic">Basic</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
    type="button"
    onClick={() => setShowHostelModal(false)}
    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-semibold"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs"
  >
                  Save Allotment
                </button>
              </div>
            </form>
          </div>
        </div>}

      {
    /* Issue Transport Pass Modal */
  }
      {showTransportModal && <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4">
            <button onClick={() => setShowTransportModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Bus className="w-5 h-5 text-blue-600" />
              <span>Issue Shuttle Bus Pass</span>
            </h3>

            <form onSubmit={handleCreateTransport} className="space-y-3">
              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">Select Student *</label>
                <select
                  value={transportStudentId}
                  onChange={(e) => setTransportStudentId(e.target.value)}
                  className="w-full min-w-0 max-w-full truncate bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-blue-500"
                >
                  {students.map((s) => <option key={s.id} value={s.id}>
                      {s.name} ({s.rollNumber})
                    </option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">Bus Route Name *</label>
                <input
    type="text"
    required
    value={routeNumber}
    onChange={(e) => setRouteNumber(e.target.value)}
    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-blue-500"
  />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Pickup Point *</label>
                  <input
    type="text"
    required
    value={pickupPoint}
    onChange={(e) => setPickupPoint(e.target.value)}
    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-blue-500"
  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Bus Vehicle No. *</label>
                  <input
    type="text"
    required
    value={busNumber}
    onChange={(e) => setBusNumber(e.target.value)}
    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-blue-500"
  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
    type="button"
    onClick={() => setShowTransportModal(false)}
    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-semibold"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs"
  >
                  Confirm Bus Pass
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
};
