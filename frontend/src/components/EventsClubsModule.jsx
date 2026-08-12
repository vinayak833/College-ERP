import { useState } from "react";
import {
  Sparkles,
  Calendar,
  MapPin,
  Plus,
  CheckCircle,
  X,
  Trophy,
  Ticket
} from "lucide-react";
export const EventsClubsModule = ({
  role,
  selectedStudent,
  events,
  onAddEvent,
  onRegisterEvent
}) => {
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [organizer, setOrganizer] = useState("StudyNet Student Council");
  const [category, setCategory] = useState("Hackathon");
  const [date, setDate] = useState("2025-11-20");
  const [time, setTime] = useState("10:00 AM");
  const [venue, setVenue] = useState("Central Campus Grounds");
  const [description, setDescription] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(100);
  const categories = ["ALL", "Hackathon", "Technical", "Cultural", "Sports"];
  const filteredEvents = events.filter((e) => {
    if (filterCategory === "ALL") return true;
    return e.category === filterCategory;
  });
  const handleCreateEvent = (e) => {
    e.preventDefault();
    const newEvt = {
      id: `EVT-${Date.now().toString().slice(-3)}`,
      title,
      organizer,
      category,
      date,
      time,
      venue,
      description,
      registeredStudentIds: [],
      maxParticipants: Number(maxParticipants),
      status: "Upcoming"
    };
    onAddEvent(newEvt);
    setShowAddModal(false);
    setTitle("");
    setDescription("");
  };
  return <div className="space-y-6">
      {
    /* Header */
  }
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600 shrink-0" />
            <span>Campus Events, Hackathons & Club Hub</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Discover hackathons, technical symposiums, student societies, and register for campus activities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 max-w-full">
          {/* Category Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto max-w-full no-scrollbar shrink-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  filterCategory === cat
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {(role === "ADMIN" || role === "FACULTY") && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl shadow-xs shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Host Event</span>
            </button>
          )}
        </div>
      </div>

      {
    /* Events Grid */
  }
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map((evt) => {
    const isRegistered = selectedStudent ? evt.registeredStudentIds.includes(selectedStudent.id) : false;
    const slotsLeft = evt.maxParticipants - evt.registeredStudentIds.length;
    return <div key={evt.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-purple-600" /> {evt.category}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    {evt.organizer}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{evt.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{evt.description}</p>

                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{evt.date} ({evt.time})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{evt.venue}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  <strong>{evt.registeredStudentIds.length}</strong> / {evt.maxParticipants} Registered ({slotsLeft} slots left)
                </span>

                {role === "STUDENT" && selectedStudent && <div>
                    {isRegistered ? <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" /> RSVP Confirmed
                      </span> : <button
      onClick={() => onRegisterEvent(evt.id, selectedStudent.id)}
      disabled={slotsLeft <= 0}
      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 disabled:opacity-50"
    >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Register Now</span>
                      </button>}
                  </div>}
              </div>
            </div>;
  })}

        {filteredEvents.length === 0 && <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs italic">
            No campus events listed under this category.
          </div>}
      </div>

      {
    /* Host Event Modal */
  }
      {showAddModal && <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4">
            <button onClick={() => setShowAddModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span>Host New Campus Event or Club Activity</span>
            </h3>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">Event Title *</label>
                <input
    type="text"
    required
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    placeholder="e.g. AI & Robotics National Symposium"
    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-purple-500"
  />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Organizing Society *</label>
                  <input
                    type="text"
                    required
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full min-w-0 max-w-full truncate bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-purple-500"
                  >
                    <option value="Hackathon">Hackathon</option>
                    <option value="Technical">Technical</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Date *</label>
                  <input
    type="date"
    required
    value={date}
    onChange={(e) => setDate(e.target.value)}
    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-purple-500"
  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Time *</label>
                  <input
    type="text"
    required
    value={time}
    onChange={(e) => setTime(e.target.value)}
    placeholder="10:00 AM"
    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-purple-500"
  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Max Capacity</label>
                  <input
    type="number"
    value={maxParticipants}
    onChange={(e) => setMaxParticipants(Number(e.target.value))}
    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-purple-500"
  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">Venue Location *</label>
                <input
    type="text"
    required
    value={venue}
    onChange={(e) => setVenue(e.target.value)}
    placeholder="e.g. Main Auditorium"
    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-purple-500"
  />
              </div>

              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">Event Overview & Agenda *</label>
                <textarea
    required
    rows={3}
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    placeholder="Describe activities, rules, and rewards..."
    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-purple-500"
  />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
    type="button"
    onClick={() => setShowAddModal(false)}
    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-semibold"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-xs"
  >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
};
