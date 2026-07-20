"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaBullhorn,
  FaSearch,
  FaFilter,
  FaUsers,
  FaUserGraduate,
  FaChalkboardTeacher
} from "react-icons/fa";

import {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} from "@/services/notice.service";

export default function NoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [filterAudience, setFilterAudience] = useState("");

  const defaultForm = {
    title: "",
    description: "",
    audience: "ALL",
  };
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await fetchNotices();
    } catch (error) {
      toast.error("Failed to load initial data");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotices = async () => {
    const result = await getNotices();
    setNotices(result.data);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(defaultForm);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      toast.error("Please provide both a title and a description.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingId) {
        await updateNotice(editingId, formData);
        toast.success("Notice updated successfully");
      } else {
        await createNotice(formData);
        toast.success("Notice created successfully");
      }
      await fetchNotices();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save notice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (notice: any) => {
    setEditingId(notice.id);
    setFormData({
      title: notice.title || "",
      description: notice.description || "",
      audience: notice.audience || "ALL",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this notice? This action cannot be undone.");
    if (!confirmed) return;

    try {
      await deleteNotice(id);
      toast.success("Notice deleted successfully");
      await fetchNotices();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete notice");
    }
  };

  const filteredNotices = notices.filter((notice: any) => {
    const matchesSearch =
      notice.title?.toLowerCase().includes(search.toLowerCase()) ||
      notice.description?.toLowerCase().includes(search.toLowerCase());
    
    const matchesAudience = filterAudience === "" ? true : notice.audience === filterAudience;

    return matchesSearch && matchesAudience;
  });

  const getAudienceBadge = (audience: string) => {
    switch (audience) {
      case "STUDENTS":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">
            <FaUserGraduate size={10} /> Students
          </span>
        );
      case "TEACHERS":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-100">
            <FaChalkboardTeacher size={10} /> Teachers
          </span>
        );
      case "ALL":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700 border border-purple-100">
            <FaUsers size={10} /> Everyone
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
 
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
            <FaBullhorn />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Notices & Announcements</h1>
            <p className="text-sm font-medium text-slate-500">Broadcast important information to your institution</p>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5"
        >
          <FaPlus /> Add Notice
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
              <FaSearch />
            </div>
            <input
              type="text"
              placeholder="Search notices by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2 md:w-64">
            <div className="flex items-center gap-2 pl-2 text-slate-400">
              <FaFilter size={14} />
            </div>
            <select
              value={filterAudience}
              onChange={(e) => setFilterAudience(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-blue-500 focus:bg-white"
            >
              <option value="">All Audiences</option>
              <option value="ALL">Everyone</option>
              <option value="STUDENTS">Students Only</option>
              <option value="TEACHERS">Teachers Only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/2">Announcement</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Audience</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                      <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div>
                      <p className="text-sm font-medium">Loading notices...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredNotices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                      <FaBullhorn className="text-4xl mb-2 text-slate-300" />
                      <p className="text-base font-semibold text-slate-600">No notices found</p>
                      <p className="text-sm">Try adjusting your filters or create a new announcement.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredNotices.map((notice) => (
                  <tr key={notice.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-800 text-base mb-1">{notice.title}</p>
                        <p className="text-sm font-medium text-slate-500 line-clamp-2 max-w-xl leading-relaxed">
                          {notice.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top pt-5">
                      {getAudienceBadge(notice.audience)}
                    </td>
                    <td className="px-6 py-4 align-top pt-5">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-700">
                          {new Date(notice.createdAt).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </p>
                        <p className="text-xs font-medium text-slate-400">By {notice.createdBy || "Admin"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right align-top pt-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(notice)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                          title="Edit Notice"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(notice.id)}
                          className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                          title="Delete Notice"
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
          <div className="w-full max-w-2xl max-h-full flex flex-col rounded-3xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? "Edit Notice" : "Draft New Notice"}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notice Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Upcoming Semester Holidays"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Audience *</label>
                <select
                  value={formData.audience}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white"
                >
                  <option value="ALL">Everyone (Students & Teachers)</option>
                  <option value="STUDENTS">Students Only</option>
                  <option value="TEACHERS">Teachers Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description / Body *</label>
                <textarea
                  placeholder="Write the full announcement here..."
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white resize-none"
                />
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex gap-3 shrink-0">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Publishing..." : editingId ? "Update Notice" : "Publish Notice"}
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}