"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaBookOpen,
  FaLayerGroup,
  FaChalkboard
} from "react-icons/fa";

import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "@/services/subject.service";

import { getBoards } from "@/services/board.service";
import { getClasses } from "@/services/class.service";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [boards, setBoards] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const defaultForm = {
    name: "",
    boardId: "",
    classId: "",
  };
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    fetchSubjects();
    fetchBoards();
    fetchClasses();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const result = await getSubjects();
      setSubjects(result.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch subjects");
    } finally {
      setLoading(false);
    }
  };

  const fetchBoards = async () => {
    try {
      const result = await getBoards();
      setBoards(result.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch boards");
    }
  };

  const fetchClasses = async () => {
    try {
      const result = await getClasses();
      setClasses(result.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch classes");
    }
  };

  const handleOpenModal = (subject?: any) => {
    if (subject) {
      setEditingId(subject.id);
      setFormData({
        name: subject.name,
        boardId: subject.boardId || "",
        classId: subject.classId || "",
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
    if (!formData.name || !formData.boardId || !formData.classId) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingId) {
        await updateSubject(editingId, formData);
        toast.success("Subject updated successfully");
      } else {
        await createSubject(formData);
        toast.success("Subject created successfully");
      }
      
      await fetchSubjects();
      handleCloseModal();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save subject");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this subject? This action cannot be undone.");
    if (!confirmed) return;

    try {
      await deleteSubject(id);
      toast.success("Subject deleted successfully");
      await fetchSubjects();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete subject");
    }
  };

  const filteredClasses = formData.boardId
    ? classes.filter((item) => item.boardId === formData.boardId)
    : classes;

  return (
    <div className="space-y-6">
 
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
            <FaBookOpen />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Subjects</h1>
            <p className="text-sm font-medium text-slate-500">Manage curriculum and subjects</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5"
        >
          <FaPlus /> Add Subject
        </button>
      </div>

      <div className="rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">Subject Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Board</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                      <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                      <p className="text-sm font-medium">Loading subjects...</p>
                    </div>
                  </td>
                </tr>
              ) : subjects.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                      <FaBookOpen className="text-4xl mb-2 text-slate-300" />
                      <p className="text-base font-semibold text-slate-600">No subjects found</p>
                      <p className="text-sm">Click 'Add Subject' to register a new course.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                subjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 text-lg">{subject.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      {subject.board?.name ? (
                        <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-200">
                          <FaLayerGroup className="text-slate-400" />
                          {subject.board.name}
                        </span>
                      ) : (
                        <span className="text-sm italic text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {subject.class?.name ? (
                        <span className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 border border-blue-100">
                          <FaChalkboard className="text-blue-400" />
                          {subject.class.name}
                        </span>
                      ) : (
                        <span className="text-sm italic text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenModal(subject)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                          title="Edit Subject"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(subject.id)}
                          className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                          title="Delete Subject"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
 
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? "Edit Subject" : "Create Subject"}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics, Physics..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Educational Board</label>
                <select
                  value={formData.boardId}
                  onChange={(e) => setFormData({ ...formData, boardId: e.target.value, classId: "" })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 appearance-none"
                >
                  <option value="" disabled>Select a Board...</option>
                  {boards.map((board: any) => (
                    <option key={board.id} value={board.id}>
                      {board.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Class</label>
                <select
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  disabled={!formData.boardId}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>
                    {formData.boardId ? "Select a Class..." : "Select a Board first"}
                  </option>
                  {filteredClasses.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex gap-3">
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
                {isSubmitting ? "Saving..." : editingId ? "Update Subject" : "Create Subject"}
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}