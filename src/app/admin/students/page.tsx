"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaUserGraduate,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle
} from "react-icons/fa";

import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "@/services/student.service";

import { getBoards } from "@/services/board.service";
import { getClasses } from "@/services/class.service";
import { getAcademicSessions } from "@/services/academic-session.service";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [boards, setBoards] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const defaultForm = {
    name: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
    guardianName: "",
    guardianPhone: "",
    address: "",
    boardId: "",
    classId: "",
    academicSessionId: "",
    isActive: true,
  };
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStudents(),
        fetchBoards(),
        fetchClasses(),
        fetchSessions()
      ]);
    } catch (error) {
      toast.error("Failed to load initial data");
    } finally {
      setLoading(false);
    }
  };

  const fetchBoards = async () => {
    const result = await getBoards();
    setBoards(result.data);
  };

  const fetchClasses = async () => {
    const result = await getClasses();
    setClasses(result.data);
  };

  const fetchSessions = async () => {
    const result = await getAcademicSessions();
    setSessions(result.data);
  };

  const fetchStudents = async () => {
    const result = await getStudents();
    setStudents(result.data);
  };

  const filteredClasses = formData.boardId
    ? classes.filter((item: any) => item.boardId === formData.boardId)
    : [];

  const filteredStudents = students.filter((student: any) => {
    const matchesSearch =
      student.name?.toLowerCase().includes(search.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(search.toLowerCase()) ||
      student.email?.toLowerCase().includes(search.toLowerCase()) ||
      student.phone?.toLowerCase().includes(search.toLowerCase());
    const matchesBoard = !selectedBoard || student.boardId === selectedBoard;
    const matchesClass = !selectedClass || student.classId === selectedClass;
    const matchesSession = !selectedSession || student.academicSessionId === selectedSession;
    const matchesStatus = selectedStatus === "" ? true : student.isActive === (selectedStatus === "active");

    return matchesSearch && matchesBoard && matchesClass && matchesSession && matchesStatus;
  });

  const handleOpenModal = (student?: any) => {
    if (student) {
      setEditingId(student.id);
      setFormData({
        name: student.name || "",
        email: student.email || "",
        phone: student.phone || "",
        password: "",
        gender: student.gender || "",
        guardianName: student.guardianName || "",
        guardianPhone: student.guardianPhone || "",
        address: student.address || "",
        boardId: student.boardId || "",
        classId: student.classId || "",
        academicSessionId: student.academicSessionId || "",
        isActive: student.isActive,
      });
    } else {
      setEditingId(null);
      setFormData(defaultForm);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(defaultForm);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.boardId || !formData.classId || !formData.academicSessionId) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingId) {
        await updateStudent(editingId, formData);
        toast.success("Student updated successfully");
      } else {
        await createStudent(formData);
        toast.success("Student created successfully");
      }
      await fetchStudents();
      handleCloseModal();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save student");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this student? This action cannot be undone.");
    if (!confirmed) return;

    try {
      await deleteStudent(id);
      toast.success("Student deleted successfully");
      await fetchStudents();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete student");
    }
  };

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
            <FaUserGraduate />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Students</h1>
            <p className="text-sm font-medium text-slate-500">Manage student directory and profiles</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5"
        >
          <FaPlus /> Add Student
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
            <FaSearch />
          </div>
          <input
            type="text"
            placeholder="Search by Name, Student ID, Email or Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex items-center gap-2 pl-2 text-slate-400">
            <FaFilter size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Filters:</span>
          </div>
          <select
            value={selectedBoard}
            onChange={(e) => setSelectedBoard(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-medium text-slate-700 outline-none transition-all focus:border-blue-500 focus:bg-white"
          >
            <option value="">All Boards</option>
            {boards.map((board) => (
              <option key={board.id} value={board.id}>{board.name}</option>
            ))}
          </select>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-medium text-slate-700 outline-none transition-all focus:border-blue-500 focus:bg-white"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>{cls.name} ({cls.board?.name})</option>
            ))}
          </select>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-medium text-slate-700 outline-none transition-all focus:border-blue-500 focus:bg-white"
          >
            <option value="">All Sessions</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>{session.name}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-medium text-slate-700 outline-none transition-all focus:border-blue-500 focus:bg-white"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Info</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Academics</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                      <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                      <p className="text-sm font-medium">Loading students...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                      <FaUserGraduate className="text-4xl mb-2 text-slate-300" />
                      <p className="text-base font-semibold text-slate-600">No students found</p>
                      <p className="text-sm">Try adjusting your filters or search query.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{student.name}</p>
                          <p className="text-xs font-medium text-slate-500">ID: {student.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-700">
                          {student.class?.name || "Unassigned"} <span className="text-slate-400">|</span> {student.board?.name || "N/A"}
                        </p>
                        <p className="text-xs text-slate-500">{student.academicSession?.name || "No Session"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {student.isActive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">
                          <FaCheckCircle size={10} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-100">
                          <FaTimesCircle size={10} /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenModal(student)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                          title="Edit Student"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                          title="Delete Student"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 md:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl max-h-full flex flex-col rounded-3xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
 
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? "Edit Student Profile" : "Register New Student"}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-8 flex-1">

              <div>
                <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b border-indigo-100 pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                    <input
                      type="email"
                      placeholder="student@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+91 00000-00000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Password {editingId && <span className="text-slate-400 font-normal normal-case">(Leave blank to keep current)</span>}
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b border-indigo-100 pb-2">Guardian Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Guardian Name</label>
                    <input
                      type="text"
                      placeholder="Name of parent/guardian"
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Guardian Phone</label>
                    <input
                      type="text"
                      placeholder="Emergency contact number"
                      value={formData.guardianPhone}
                      onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Residential Address</label>
                    <textarea
                      placeholder="Full residential address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={2}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white resize-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b border-indigo-100 pb-2">Academic Placement</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Board *</label>
                    <select
                      value={formData.boardId}
                      onChange={(e) => setFormData({ ...formData, boardId: e.target.value, classId: "" })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white"
                    >
                      <option value="" disabled>Select Board</option>
                      {boards.map((board: any) => (
                        <option key={board.id} value={board.id}>{board.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Class *</label>
                    <select
                      value={formData.classId}
                      onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                      disabled={!formData.boardId}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="" disabled>{formData.boardId ? "Select Class" : "Select Board First"}</option>
                      {filteredClasses.map((item: any) => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Academic Session *</label>
                    <select
                      value={formData.academicSessionId}
                      onChange={(e) => setFormData({ ...formData, academicSessionId: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white"
                    >
                      <option value="" disabled>Select Session</option>
                      {sessions.map((session: any) => (
                        <option key={session.id} value={session.id}>{session.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-start mt-6">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-12 h-6 rounded-full transition-colors relative ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${formData.isActive ? 'left-7' : 'left-1'}`}></div>
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      />
                      <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                        Active Student Profile
                      </span>
                    </label>
                  </div>
                </div>
              </div>

            </div>

            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex gap-3 shrink-0">
              <button
                onClick={handleCloseModal}
                className="flex-1 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : editingId ? "Update Student" : "Register Student"}
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}