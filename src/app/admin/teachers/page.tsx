"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaChalkboardTeacher,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaBookReader
} from "react-icons/fa";

import {
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  assignClassesToTeacher
} from "@/services/teacher.service";

import { getClasses } from "@/services/class.service";
import { getSubjects } from "@/services/subject.service";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const defaultForm = {
    name: "",
    email: "",
    phone: "",
    password: "",
    qualification: "",
    experience: 0,
    bio: "",
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
        fetchTeachers(),
        fetchClasses(),
        fetchSubjects()
      ]);
    } catch (error) {
      toast.error("Failed to load initial data");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    const result = await getTeachers();
    setTeachers(result.data);
  };

  const fetchClasses = async () => {
    const result = await getClasses();
    setClasses(result.data);
  };

  const fetchSubjects = async () => {
    const result = await getSubjects();
    setSubjects(result.data);
  };

  const resetForm = () => {
    setEditingId(null);
    setSelectedClasses([]);
    setSelectedSubjects([]);
    setFormData(defaultForm);
  };

  const openClassAssignment = (teacher: any) => {
    setSelectedTeacher(teacher);
    setSelectedClasses(teacher.classes?.map((item: any) => item.id) || []);
    setShowClassModal(true);
  };

  const handleAssignClasses = async () => {
    if (!selectedTeacher) return;

    try {
      setIsSubmitting(true);
      await assignClassesToTeacher(selectedTeacher.id, selectedClasses);
      toast.success("Classes assigned successfully");
      setShowClassModal(false);
      await fetchTeachers();
    } catch (error) {
      console.error(error);
      toast.error("Failed to assign classes");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Please fill in the required fields (Name, Email)");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        classIds: selectedClasses,
        subjectIds: selectedSubjects,
      };

      if (editingId) {
        await updateTeacher(editingId, payload);
        toast.success("Teacher updated successfully");
      } else {
        await createTeacher(payload);
        toast.success("Teacher created successfully");
      }

      await fetchTeachers();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save teacher");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (teacher: any) => {
    setEditingId(teacher.id);
    setFormData({
      name: teacher.name || "",
      email: teacher.email || "",
      phone: teacher.phone || "",
      password: "",
      qualification: teacher.qualification || "",
      experience: teacher.experience || 0,
      bio: teacher.bio || "",
      isActive: teacher.isActive,
    });
    setSelectedClasses(teacher.classes?.map((item: any) => item.id) || []);
    setSelectedSubjects(teacher.subjects?.map((item: any) => item.id) || []);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this teacher? This action cannot be undone.");
    if (!confirmed) return;

    try {
      await deleteTeacher(id);
      toast.success("Teacher deleted successfully");
      await fetchTeachers();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete teacher");
    }
  };

  const filteredSubjects = subjects.filter((subject: any) =>
    selectedClasses.includes(subject.classId)
  );

  const filteredTeachers = teachers.filter((teacher: any) => {
    const matchesSearch =
      teacher.name?.toLowerCase().includes(search.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(search.toLowerCase()) ||
      teacher.phone?.toLowerCase().includes(search.toLowerCase()) ||
      teacher.qualification?.toLowerCase().includes(search.toLowerCase());

    const matchesClass = !selectedClass || teacher.classes?.some((cls: any) => cls.id === selectedClass);
    const matchesSubject = !selectedSubject || teacher.subjects?.some((subject: any) => subject.id === selectedSubject);
    const matchesStatus = selectedStatus === "" ? true : teacher.isActive === (selectedStatus === "active");

    return matchesSearch && matchesClass && matchesSubject && matchesStatus;
  });

  return (
    <div className="space-y-6">
 
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center text-xl">
            <FaChalkboardTeacher />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Teachers</h1>
            <p className="text-sm font-medium text-slate-500">Manage faculty directory and assignments</p>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5"
        >
          <FaPlus /> Add Teacher
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
            <FaSearch />
          </div>
          <input
            type="text"
            placeholder="Search by Name, Email, Phone, or Qualification..."
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
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-medium text-slate-700 outline-none transition-all focus:border-blue-500 focus:bg-white"
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>{subject.name}</option>
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
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Teacher Info</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Experience</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                      <div className="w-8 h-8 border-4 border-slate-200 border-t-violet-600 rounded-full animate-spin"></div>
                      <p className="text-sm font-medium">Loading faculty...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                      <FaChalkboardTeacher className="text-4xl mb-2 text-slate-300" />
                      <p className="text-base font-semibold text-slate-600">No teachers found</p>
                      <p className="text-sm">Try adjusting your filters or search query.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-sm shrink-0">
                          {teacher.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{teacher.name}</p>
                          <p className="text-xs font-medium text-slate-500 truncate max-w-[150px]" title={teacher.qualification}>
                            {teacher.qualification || "No qualification listed"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm">
                        <p className="text-slate-700">{teacher.email}</p>
                        <p className="text-slate-500 text-xs">{teacher.phone || "N/A"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 border border-slate-200">
                        {teacher.experience} Years
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {teacher.isActive ? (
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
                          onClick={() => openClassAssignment(teacher)}
                          className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors"
                          title="Quick Assign Classes"
                        >
                          <FaBookReader size={14} />
                        </button>
                        <button
                          onClick={() => handleEdit(teacher)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                          title="Edit Teacher"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(teacher.id)}
                          className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                          title="Delete Teacher"
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
          <div className="w-full max-w-4xl max-h-full flex flex-col rounded-3xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? "Edit Teacher Profile" : "Register New Teacher"}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-8 flex-1">
              <div>
                <h3 className="text-sm font-bold text-violet-600 uppercase tracking-wider mb-4 border-b border-violet-100 pb-2">Profile Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address *</label>
                    <input
                      type="email"
                      placeholder="teacher@example.com"
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
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Qualification</label>
                    <input
                      type="text"
                      placeholder="e.g. M.Sc. Mathematics, B.Ed."
                      value={formData.qualification}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Years of Experience</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Short Bio</label>
                    <textarea
                      placeholder="Brief background about the teacher..."
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white resize-none"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="flex items-center gap-3 cursor-pointer w-max group">
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
                      Active Teacher Profile
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t border-slate-100 pt-8">   
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Assign Classes</h3>
                    <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-1 rounded-md">{selectedClasses.length} Selected</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {classes.map((item: any) => (
                      <label key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${selectedClasses.includes(item.id) ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedClasses.includes(item.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedClasses([...selectedClasses, item.id]);
                            else setSelectedClasses(selectedClasses.filter((id) => id !== item.id));
                          }}
                        />
                        <span className="text-sm font-medium text-slate-700">
                          {item.name} <span className="text-slate-400">({item.board?.shortName || item.board?.name})</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-amber-600 uppercase tracking-wider">Assign Subjects</h3>
                    <span className="text-xs font-semibold bg-amber-50 text-amber-600 px-2 py-1 rounded-md">{selectedSubjects.length} Selected</span>
                  </div>
                  {selectedClasses.length === 0 ? (
                    <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 text-sm text-amber-600 font-medium text-center">
                      Select classes first to view available subjects.
                    </div>
                  ) : filteredSubjects.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-500 font-medium text-center">
                      No subjects found for the selected classes.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                      {filteredSubjects.map((subject: any) => (
                        <label key={subject.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${selectedSubjects.includes(subject.id) ? 'border-amber-500 bg-amber-50/50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                            checked={selectedSubjects.includes(subject.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedSubjects([...selectedSubjects, subject.id]);
                              else setSelectedSubjects(selectedSubjects.filter((id) => id !== subject.id));
                            }}
                          />
                          <span className="text-sm font-medium text-slate-700">{subject.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
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
                {isSubmitting ? "Saving..." : editingId ? "Update Profile" : "Register Teacher"}
              </button>
            </div>
            
          </div>
        </div>
      )}

      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Assign Classes</h2>
                <p className="text-xs text-slate-500 font-medium">For {selectedTeacher?.name}</p>
              </div>
              <button 
                onClick={() => setShowClassModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-2 custom-scrollbar">
              {classes.length === 0 ? (
                <p className="text-center text-slate-500 text-sm">No classes available.</p>
              ) : (
                classes.map((item: any) => (
                  <label key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${selectedClasses.includes(item.id) ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      checked={selectedClasses.includes(item.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedClasses([...selectedClasses, item.id]);
                        else setSelectedClasses(selectedClasses.filter((id) => id !== item.id));
                      }}
                    />
                    <span className="text-sm font-medium text-slate-700">
                      {item.name} <span className="text-slate-400">({item.board?.shortName || item.board?.name})</span>
                    </span>
                  </label>
                ))
              )}
            </div>

            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex gap-3">
              <button
                onClick={() => setShowClassModal(false)}
                className="flex-1 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleAssignClasses}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : "Save Assignments"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}