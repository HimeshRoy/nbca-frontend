"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSchool,
  FaTimes,
  FaLayerGroup
} from "react-icons/fa";

import {
  getBoards,
  createBoard,
  updateBoard,
  deleteBoard,
} from "@/services/board.service";

export default function BoardsPage() {
  const [boards, setBoards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const defaultForm = {
    name: "",
    shortName: "",
    description: "",
  };
  const [formData, setFormData] = useState(defaultForm);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const result = await getBoards();
      setBoards(result.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch boards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleOpenModal = (board?: any) => {
    if (board) {
      setEditingId(board.id);
      setFormData({
        name: board.name,
        shortName: board.shortName,
        description: board.description || "",
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
    if (!formData.name || !formData.shortName) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingId) {
        await updateBoard(editingId, formData);
        toast.success("Board updated successfully");
      } else {
        await createBoard(formData);
        toast.success("Board created successfully");
      }
      await fetchBoards();
      handleCloseModal();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save board");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this board? This action cannot be undone.");
    if (!confirmDelete) return;

    try {
      await deleteBoard(id);
      toast.success("Board deleted successfully");
      await fetchBoards();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete board");
    }
  };

  return (
    <div className="space-y-6">
  
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
            <FaLayerGroup />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Education Boards</h1>
            <p className="text-sm font-medium text-slate-500">Manage curricula and boards</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5"
        >
          <FaPlus /> Add Board
        </button>
      </div>

      <div className="rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Board Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Short Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/2">Description</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                      <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                      <p className="text-sm font-medium">Loading boards...</p>
                    </div>
                  </td>
                </tr>
              ) : boards.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                      <FaSchool className="text-4xl mb-2 text-slate-300" />
                      <p className="text-base font-semibold text-slate-600">No boards found</p>
                      <p className="text-sm">Click 'Add Board' to register your first educational board.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                boards.map((board) => (
                  <tr key={board.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{board.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-100">
                        {board.shortName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-500 line-clamp-2">
                        {board.description || <span className="italic text-slate-400">No description provided</span>}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenModal(board)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                          title="Edit Board"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(board.id)}
                          className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                          title="Delete Board"
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
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
  
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? "Edit Board" : "Create Board"}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Board Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Central Board of Secondary Education"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Short Name</label>
                  <input
                    type="text"
                    placeholder="e.g. CBSE"
                    value={formData.shortName}
                    onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description (Optional)</label>
                <textarea
                  placeholder="Provide any additional details about this board..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 resize-none"
                />
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
                {isSubmitting ? "Saving..." : editingId ? "Update Board" : "Create Board"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}