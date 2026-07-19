"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from "@/services/assignment.service";
import { uploadFile } from "@/services/upload.service";
import { getClasses } from "@/services/class.service";
import { getMyProfile } from "@/services/teacher.service";
import toast from "react-hot-toast";
import {
  FaPlus,
  FaFileAlt,
  FaCheckCircle,
  FaClock,
  FaUsers,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaBook,
  FaFileDownload,
} from "react-icons/fa";

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [teacher, setTeacher] = useState<any>(null);
  const [filteredSubjects, setFilteredSubjects] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    classId: "",
    subjectId: "",
    dueDate: "",
    maxMarks: 100,
  });

  const handleCreateAssignment = async () => {
    try {
      setLoading(true);
      let fileUrl = "";

      if (selectedFile) {
        const uploadResult = await uploadFile(selectedFile);
        fileUrl = uploadResult.data.fileUrl;
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        classId: formData.classId,
        subjectId: formData.subjectId,
        dueDate: new Date(formData.dueDate).toISOString(),
        maxMarks: formData.maxMarks,
        ...(fileUrl && { fileUrl }),
      };

      if (editingAssignment) {
        await updateAssignment(editingAssignment.id, payload);
        toast.success("Assignment updated successfully");
      } else {
        await createAssignment(payload);
        toast.success("Assignment created successfully");
      }

      const result = await getAssignments();
      setAssignments(result.data);

      setFormData({
        title: "",
        description: "",
        classId: "",
        subjectId: "",
        dueDate: "",
        maxMarks: 100,
      });
      setSelectedFile(null);
      setEditingAssignment(null);
      setOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assignmentId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this assignment?",
    );
    if (!confirmed) return;

    try {
      await deleteAssignment(assignmentId);
      setAssignments((prev) => prev.filter((item) => item.id !== assignmentId));
      toast.success("Assignment deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete assignment");
    }
  };

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const result = await getAssignments();
        setAssignments(result.data);

        await getClasses();
        const profile = await getMyProfile();
        setTeacher(profile.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAssignments();
  }, []);

   if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
          <p className="font-medium">Loading Assigenments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Assignments</h1>
          <p className="mt-2 text-slate-500">
            Manage and grade all student homework
          </p>
        </div>

        <button
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5"
          onClick={() => {
            setEditingAssignment(null);
            setFormData({
              title: "",
              description: "",
              classId: "",
              subjectId: "",
              dueDate: "",
              maxMarks: 100,
            });
            setOpen(true);
          }}
        >
          <FaPlus className="text-sm" /> Create Assignment
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <FaFileAlt className="text-2xl" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500">
              Total Assignments
            </h3>
            <p className="text-2xl font-bold text-slate-800">
              {assignments.length}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <FaCheckCircle className="text-2xl" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500">Active</h3>
            <p className="text-2xl font-bold text-slate-800">
              {
                assignments.filter((a) => new Date(a.dueDate) > new Date())
                  .length
              }
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
            <FaUsers className="text-2xl" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500">Submissions</h3>
            <p className="text-2xl font-bold text-slate-800">
              {assignments.reduce(
                (total, assignment) =>
                  total + (assignment.submissions?.length || 0),
                0,
              )}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
            <FaClock className="text-2xl" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500">
              Pending Review
            </h3>
            <p className="text-2xl font-bold text-slate-800">
              {assignments.reduce(
                (total, assignment) =>
                  total +
                  (assignment.submissions?.filter((s: any) => s.marks === null)
                    .length || 0),
                0,
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {assignments.map((assignment) => {
          const isOverdue = new Date(assignment.dueDate) < new Date();

          return (
            <div
              key={assignment.id}
              className="group flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-blue-200"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-2 mb-2">
                    <span className="inline-block rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                      {assignment.class?.name} • {assignment.class?.board?.name}
                    </span>
                    <span
                      className={`inline-block rounded-md px-2 py-1 text-xs font-semibold ${isOverdue ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}
                    >
                      {isOverdue ? "Past Due" : "Active"}
                    </span>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingAssignment(assignment);
                        setFormData({
                          title: assignment.title,
                          description: assignment.description || "",
                          classId: assignment.classId,
                          subjectId: assignment.subjectId,
                          dueDate: assignment.dueDate.split("T")[0],
                          maxMarks: assignment.maxMarks,
                        });
                        setOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Assignment"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(assignment.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Assignment"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-slate-800 leading-tight mb-2">
                  {assignment.title}
                </h2>
                <p className="line-clamp-2 text-sm text-slate-500 mb-5">
                  {assignment.description}
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <FaBook className="text-slate-400" />
                    <span>
                      Subject:{" "}
                      <span className="font-medium text-slate-800">
                        {assignment.subject?.name}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <FaCalendarAlt className="text-slate-400" />
                    <span>
                      Due:{" "}
                      <span className="font-medium text-slate-800">
                        {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <FaUsers className="text-slate-400" />
                    <span>
                      Submissions:{" "}
                      <span className="font-medium text-slate-800">
                        {assignment.submissions?.length || 0}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <FaCheckCircle className="text-slate-400" />
                    <span>
                      Max Marks:{" "}
                      <span className="font-medium text-slate-800">
                        {assignment.maxMarks}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100 mt-auto">
                <Link
                  href={`/teacher/assignments/${assignment.id}`}
                  className="flex-1 text-center rounded-xl bg-blue-50 text-blue-700 font-semibold py-2.5 transition-colors hover:bg-blue-600 hover:text-white"
                >
                  View Details
                </Link>

                {assignment.fileUrl && (
                  <a
                    href={assignment.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="Download File"
                    className="flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800"
                  >
                    <FaFileDownload className="text-lg" />
                  </a>
                )}
              </div>
            </div>
          );
        })}

        {assignments.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="p-4 bg-slate-50 rounded-full mb-3">
              <FaFileAlt className="text-3xl text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">
              No Assignments Found
            </h3>
            <p className="text-slate-500 mt-1">
              Click "Create Assignment" to get started.
            </p>
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">
                {editingAssignment
                  ? "Edit Assignment"
                  : "Create New Assignment"}
              </h2>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Assignment Title
                </label>
                <input
                  placeholder="e.g. Algebra Practice Chapter 1"
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description & Instructions
                </label>
                <textarea
                  placeholder="Provide instructions for the students..."
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Class
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
                    value={formData.classId}
                    onChange={(e) => {
                      const classId = e.target.value;
                      setFormData({ ...formData, classId, subjectId: "" });
                      const subjects =
                        teacher?.subjects?.filter(
                          (subject: any) => subject.classId === classId,
                        ) || [];
                      setFilteredSubjects(subjects);
                    }}
                  >
                    <option value="">Select Class</option>
                    {teacher?.classes?.map((cls: any) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} - {cls.board?.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Subject
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
                    value={formData.subjectId}
                    onChange={(e) =>
                      setFormData({ ...formData, subjectId: e.target.value })
                    }
                    disabled={!formData.classId}
                  >
                    <option value="">Select Subject</option>
                    {filteredSubjects.map((subject: any) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Max Marks
                  </label>
                  <input
                    type="number"
                    placeholder="100"
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    value={formData.maxMarks}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxMarks: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Attachment (Optional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 outline-none transition-all"
                    onChange={(e) =>
                      setSelectedFile(e.target.files?.[0] || null)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => {
                  setOpen(false);
                  setEditingAssignment(null);
                }}
                className="rounded-xl px-5 py-2.5 font-medium text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateAssignment}
                disabled={
                  loading ||
                  !formData.title ||
                  !formData.classId ||
                  !formData.subjectId ||
                  !formData.dueDate
                }
                className="rounded-xl bg-blue-600 px-6 py-2.5 font-medium text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Saving..."
                  : editingAssignment
                    ? "Update Assignment"
                    : "Publish Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
