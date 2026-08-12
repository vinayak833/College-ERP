import { useState } from "react";
import {
  Bell,
  Plus,
  AlertCircle,
  Megaphone,
  X,
  Calendar,
  UserCheck
} from "lucide-react";
export const NoticeBoardModule = ({
  role,
  notices,
  readNoticeIds = [],
  onCreateNotice
}) => {
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Academic");
  const [postedBy, setPostedBy] = useState("Office of the Dean");
  const [urgent, setUrgent] = useState(false);
  const filteredNotices = notices.filter((n) => {
    if (filterCategory === "ALL") return true;
    return n.category === filterCategory;
  });
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) return;
    await onCreateNotice({
      title,
      content,
      category,
      postedBy,
      urgent,
      targetRole: "ALL"
    });
    setShowAddModal(false);
    setTitle("");
    setContent("");
  };
  return <div className="space-y-6">
      {
    /* Header */
  }
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-600 shrink-0" />
            <span>Campus Notice Board & Announcements</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Official announcements regarding exams, academic circulars, fee deadlines, and college events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 max-w-full">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto max-w-full no-scrollbar shrink-0">
            {["ALL", "Academic", "Exam", "Event", "Admin", "Fee"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  filterCategory === cat
                    ? "bg-amber-600 text-white shadow-xs"
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
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl shadow-xs shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Post Notice</span>
            </button>
          )}
        </div>
      </div>

      {
    /* Notice List */
  }
      <div className="space-y-4">
        {filteredNotices.map((n) => {
          const isUnread = !readNoticeIds.includes(n.id);
          return (
            <div
              key={n.id}
              className={`p-5 rounded-2xl border transition-all ${
                n.urgent
                  ? "bg-rose-50 border-rose-200 shadow-xs"
                  : isUnread
                  ? "bg-amber-50/40 border-amber-300 shadow-xs ring-1 ring-amber-400/30"
                  : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {n.urgent && (
                    <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-rose-600 text-white rounded-md flex items-center gap-1 animate-pulse">
                      <AlertCircle className="w-3 h-3" /> Urgent
                    </span>
                  )}
                  {isUnread && (
                    <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-indigo-600 text-white rounded-md">
                      New
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                    {n.category}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1 font-mono font-medium">
                    <Calendar className="w-3 h-3 text-slate-400" /> {n.postedDate}
                  </span>
                </div>

              <div className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Posted by: <strong className="text-slate-800">{n.postedBy}</strong></span>
              </div>
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-2">{n.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{n.content}</p>
          </div>
        );
      })}
      </div>

      {
    /* Add Notice Modal */
  }
      {showAddModal && <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4">
            <button
    onClick={() => setShowAddModal(false)}
    className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
  >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-amber-600" />
              <span>Broadcast Campus Announcement</span>
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">Notice Title *</label>
                <input
    type="text"
    required
    placeholder="e.g. Schedule for Mid-Term Exams"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white"
  />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full min-w-0 max-w-full truncate bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Exam">Exam</option>
                    <option value="Event">Event</option>
                    <option value="Admin">Admin</option>
                    <option value="Fee">Fee</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Issuing Authority</label>
                  <input
    type="text"
    value={postedBy}
    onChange={(e) => setPostedBy(e.target.value)}
    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white"
  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">Announcement Body *</label>
                <textarea
    required
    rows={4}
    value={content}
    onChange={(e) => setContent(e.target.value)}
    placeholder="Detailed circular content..."
    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white"
  />
              </div>

              <div className="flex items-center gap-2">
                <input
    type="checkbox"
    id="urgentFlag"
    checked={urgent}
    onChange={(e) => setUrgent(e.target.checked)}
    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
  />
                <label htmlFor="urgentFlag" className="text-xs text-rose-700 font-semibold cursor-pointer">
                  Mark as High Priority / Urgent Broadcast
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
    type="button"
    onClick={() => setShowAddModal(false)}
    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-semibold"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-xs"
  >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
};
