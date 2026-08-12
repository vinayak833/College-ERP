import { useState } from "react";
import {
  Book,
  Search,
  Plus,
  X,
  BookOpen,
  Filter
} from "lucide-react";
export const LibraryModule = ({
  role,
  selectedStudent,
  students,
  books,
  issuedBooks,
  onAddBook,
  onIssueBook,
  onReturnBook,
  onClearFine
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [activeTab, setActiveTab] = useState("catalog");
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(null);
  const [isbn, setIsbn] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("Computer Science");
  const [totalCopies, setTotalCopies] = useState(5);
  const [locationRack, setLocationRack] = useState("Rack CS-01");
  const [targetStudentId, setTargetStudentId] = useState(students[0]?.id || "");
  const [dueDateInput, setDueDateInput] = useState("2025-11-01");
  const categories = ["ALL", "Computer Science", "Electronics", "Artificial Intelligence", "General Engineering"];
  const filteredBooks = books.filter((b) => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.author.toLowerCase().includes(searchTerm.toLowerCase()) || b.isbn.includes(searchTerm);
    const matchesCategory = selectedCategory === "ALL" || b.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const myIssuedRecords = role === "STUDENT" && selectedStudent ? issuedBooks.filter((i) => i.studentId === selectedStudent.id) : issuedBooks;
  const totalOutstandingFines = myIssuedRecords.filter((i) => i.status === "Overdue").reduce((acc, curr) => acc + curr.fineAmount, 0);
  const handleAddBook = (e) => {
    e.preventDefault();
    const newBk = {
      id: `BK-${Date.now().toString().slice(-3)}`,
      isbn,
      title,
      author,
      category,
      totalCopies: Number(totalCopies),
      availableCopies: Number(totalCopies),
      locationRack
    };
    onAddBook(newBk);
    setShowAddBookModal(false);
    setTitle("");
    setAuthor("");
    setIsbn("");
  };
  const handleIssueBookSubmit = (e) => {
    e.preventDefault();
    if (!showIssueModal) return;
    const studentObj = students.find((s) => s.id === targetStudentId);
    const newRecord = {
      id: `ISS-${Date.now().toString().slice(-3)}`,
      bookId: showIssueModal.id,
      bookTitle: showIssueModal.title,
      studentId: targetStudentId,
      studentName: studentObj?.name || "Rohan Kulkarni",
      issueDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      dueDate: dueDateInput,
      status: "Issued",
      fineAmount: 0
    };
    onIssueBook(newRecord);
    setShowIssueModal(null);
  };
  return <div className="space-y-6">
      {
    /* Header */
  }
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Book className="w-6 h-6 text-cyan-600 shrink-0" />
            <span>Central Campus Library & Book Circulation</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Search academic catalog, manage active borrowings, track due dates, and settle overdue fines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 max-w-full">
          {/* Tab Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto max-w-full no-scrollbar shrink-0">
            <button
              onClick={() => setActiveTab("catalog")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "catalog"
                  ? "bg-cyan-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Book Catalog ({books.length})
            </button>
            <button
              onClick={() => setActiveTab("issued")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "issued"
                  ? "bg-cyan-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {role === "STUDENT" ? "My Borrowed Books" : "Issued Books Log"} ({myIssuedRecords.length})
            </button>
          </div>

          {(role === "ADMIN" || role === "FACULTY") && (
            <button
              onClick={() => setShowAddBookModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl shadow-xs shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Book</span>
            </button>
          )}
        </div>
      </div>

      {
    /* Overview Stats Bar */
  }
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Total Title Catalog</span>
          <div className="text-xl font-bold text-slate-900 mt-0.5">{books.length} Titles</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Currently Borrowed</span>
          <div className="text-xl font-bold text-cyan-600 mt-0.5">{issuedBooks.filter((i) => i.status !== "Returned").length} Books</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Overdue Books</span>
          <div className="text-xl font-bold text-rose-600 mt-0.5">{issuedBooks.filter((i) => i.status === "Overdue").length} Overdue</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Outstanding Fines</span>
          <div className="text-xl font-bold text-amber-600 mt-0.5">₹{totalOutstandingFines.toLocaleString("en-IN")}</div>
        </div>
      </div>

      {activeTab === "catalog" ? <div className="space-y-4">
          {
    /* Search & Filter Bar */
  }
          <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
    type="text"
    placeholder="Search by title, author, or ISBN number..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500"
  />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 font-medium focus:outline-none focus:border-cyan-500 w-full sm:w-auto min-w-0 max-w-full truncate"
              >
                {categories.map((cat) => <option key={cat} value={cat}>
                    {cat}
                  </option>)}
              </select>
            </div>
          </div>

          {
    /* Book Catalog Grid */
  }
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBooks.map((bk) => <div key={bk.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold font-mono rounded bg-cyan-50 text-cyan-800 border border-cyan-200">
                      ISBN: {bk.isbn}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {bk.locationRack}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{bk.title}</h3>
                  <p className="text-xs text-slate-600 font-medium">Author: {bk.author}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <span
    className={`font-bold px-2 py-0.5 rounded ${bk.availableCopies > 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}
  >
                      {bk.availableCopies} / {bk.totalCopies} Copies Available
                    </span>
                  </div>

                  {(role === "ADMIN" || role === "FACULTY") && bk.availableCopies > 0 && <button
    onClick={() => setShowIssueModal(bk)}
    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-xs"
  >
                      Issue Book
                    </button>}
                </div>
              </div>)}

            {filteredBooks.length === 0 && <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs italic">
                No library books match your query.
              </div>}
          </div>
        </div> : (
    /* Issued Books View */
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Circulation Log ({myIssuedRecords.length})
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {myIssuedRecords.map((rec) => <div key={rec.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{rec.bookTitle}</span>
                    <span
      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${rec.status === "Overdue" ? "bg-rose-100 text-rose-800 border border-rose-200" : rec.status === "Returned" ? "bg-slate-100 text-slate-600 border border-slate-200" : "bg-emerald-100 text-emerald-800 border border-emerald-200"}`}
    >
                      {rec.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    Borrower: <strong className="text-slate-800">{rec.studentName}</strong> • Issued: {rec.issueDate} • Due Date:{" "}
                    <strong className={rec.status === "Overdue" ? "text-rose-600" : "text-slate-800"}>{rec.dueDate}</strong>
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  {rec.fineAmount > 0 && <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                      Fine: ₹{rec.fineAmount.toLocaleString("en-IN")}
                    </span>}

                  {rec.status !== "Returned" && (role === "ADMIN" || role === "FACULTY" || role === "STUDENT") && <button
      onClick={() => onReturnBook(rec.id)}
      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg shadow-xs"
    >
                      Return Book
                    </button>}

                  {rec.fineAmount > 0 && role === "ADMIN" && <button
      onClick={() => onClearFine(rec.id)}
      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg shadow-xs"
    >
                      Clear Fine
                    </button>}
                </div>
              </div>)}

            {myIssuedRecords.length === 0 && <div className="p-8 text-center text-slate-400 text-xs italic">
                No active borrowings or overdue records found.
              </div>}
          </div>
        </div>
  )}

      {
    /* Add Book Modal */
  }
      {showAddBookModal && <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4">
            <button onClick={() => setShowAddBookModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Book className="w-5 h-5 text-cyan-600" />
              <span>Add Book to Central Catalog</span>
            </h3>

            <form onSubmit={handleAddBook} className="space-y-3">
              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">Book Title *</label>
                <input
    type="text"
    required
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    placeholder="e.g. Modern Operating Systems"
    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-cyan-500"
  />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Author Name *</label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">ISBN Number *</label>
                  <input
                    type="text"
                    required
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="978-013..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full min-w-0 max-w-full truncate bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="General Engineering">General Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Total Copies</label>
                  <input
    type="number"
    value={totalCopies}
    onChange={(e) => setTotalCopies(Number(e.target.value))}
    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-cyan-500"
  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Shelf / Rack</label>
                  <input
    type="text"
    value={locationRack}
    onChange={(e) => setLocationRack(e.target.value)}
    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-cyan-500"
  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
    type="button"
    onClick={() => setShowAddBookModal(false)}
    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-semibold"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-xs"
  >
                  Save Book
                </button>
              </div>
            </form>
          </div>
        </div>}

      {
    /* Issue Book Modal */
  }
      {showIssueModal && <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-4">
            <button onClick={() => setShowIssueModal(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-600" />
              <span>Issue Book to Student</span>
            </h3>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <p className="font-bold text-slate-900">{showIssueModal.title}</p>
              <p className="text-slate-500">Rack: {showIssueModal.locationRack} • Available: {showIssueModal.availableCopies}</p>
            </div>

            <form onSubmit={handleIssueBookSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">Select Borrower Student *</label>
                <select
                  value={targetStudentId}
                  onChange={(e) => setTargetStudentId(e.target.value)}
                  className="w-full min-w-0 max-w-full truncate bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-cyan-500"
                >
                  {students.map((s) => <option key={s.id} value={s.id}>
                      {s.name} ({s.rollNumber})
                    </option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">Return Due Date *</label>
                <input
    type="date"
    required
    value={dueDateInput}
    onChange={(e) => setDueDateInput(e.target.value)}
    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-cyan-500"
  />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
    type="button"
    onClick={() => setShowIssueModal(null)}
    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-semibold"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-xs"
  >
                  Confirm Issue
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
};
