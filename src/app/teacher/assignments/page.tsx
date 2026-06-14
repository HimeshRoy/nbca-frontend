"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAssignments } from "@/services/assignment.service";
import { uploadFile } from "@/services/upload.service";
import { getClasses } from "@/services/class.service";
import {
  createAssignment,
  updateAssignment,
} from "@/services/assignment.service";
import { getMyProfile } from "@/services/teacher.service";
import { deleteAssignment } from "@/services/assignment.service";
import toast from "react-hot-toast/headless";

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

      // console.log("ASSIGNMENT PAYLOAD", {
      //   title: formData.title,
      //   description: formData.description,
      //   dueDate: formData.dueDate,
      //   maxMarks: formData.maxMarks,
      //   fileUrl,
      // });

      const payload = {
        title: formData.title,

        description: formData.description,

        classId: formData.classId,

        subjectId: formData.subjectId,

        dueDate: new Date(formData.dueDate).toISOString(),

        maxMarks: formData.maxMarks,

        ...(fileUrl && {
          fileUrl,
        }),
      };

      if (editingAssignment) {
        await updateAssignment(editingAssignment.id, payload);
      } else {
        await createAssignment(payload);
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

      console.log("BACKEND ERROR:", error?.response?.data);
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
        const classesResult = await getClasses();

        const profile = await getMyProfile();

        setTeacher(profile.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAssignments();
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assignments</h1>

          <p className="mt-2 text-slate-500">Manage all assignments</p>
        </div>

        <button
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
          onClick={() => setOpen(true)}
        >
          Create Assignment
        </button>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
  <div className="rounded-xl bg-white p-6 shadow">
    <h3 className="text-sm text-slate-500">
      Assignments
    </h3>

    <p className="mt-2 text-3xl font-bold">
      {assignments.length}
    </p>
  </div>

  <div className="rounded-xl bg-white p-6 shadow">
    <h3 className="text-sm text-slate-500">
      Active
    </h3>

    <p className="mt-2 text-3xl font-bold">
      {
        assignments.filter(
          (a) =>
            new Date(a.dueDate) >
            new Date()
        ).length
      }
    </p>
  </div>

  <div className="rounded-xl bg-white p-6 shadow">
    <h3 className="text-sm text-slate-500">
      Submissions
    </h3>

    <p className="mt-2 text-3xl font-bold">
      {assignments.reduce(
        (total, assignment) =>
          total +
          (assignment.submissions
            ?.length || 0),
        0
      )}
    </p>
  </div>

  <div className="rounded-xl bg-white p-6 shadow">
    <h3 className="text-sm text-slate-500">
      Pending Review
    </h3>

    <p className="mt-2 text-3xl font-bold">
      {assignments.reduce(
        (total, assignment) =>
          total +
          (assignment.submissions?.filter(
            (s: any) =>
              s.marks === null
          ).length || 0),
        0
      )}
    </p>
  </div>
</div>

      <div className="space-y-4">
        {assignments.map((assignment) => (
          <div className="grid md:grid-cols-3 gap-4" key={null}>
            <div key={assignment.id} className="rounded-xl bg-white p-6 shadow">
              <h2 className="text-xl font-semibold">{assignment.title}</h2>

              <p className="line-clamp-3 text-slate-600">
                {assignment.description}
              </p>

              <div className="mt-4 space-y-2">
                <p className="text-sm text-slate-600">
                  <span className="font-medium">
                    {assignment.class?.name}
                    {" • "}
                    {assignment.class?.board?.name}
                    {" • "}
                    {assignment.subject?.name}
                  </span>
                </p>

                <p className="text-sm text-slate-600">
                  Max Marks: {assignment.maxMarks}
                </p>

                <p className="text-sm text-slate-600">
                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </p>

                <p className="text-sm text-slate-600">
                  Submissions: {assignment.submissions?.length || 0}
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                {assignment.fileUrl && (
                  <a
                    href={assignment.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
                  >
                    View File
                  </a>
                )}

                <Link
                  href={`/teacher/assignments/${assignment.id}`}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white"
                >
                  View Details
                </Link>

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
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm text-white"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(assignment.id)}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white p-6">
            <h2 className="mb-4 text-2xl font-bold">
              {editingAssignment ? "Edit Assignment" : "Create Assignment"}
            </h2>

            <div className="space-y-4">
              <input
                placeholder="Title"
                className="w-full rounded border p-3"
                value={formData.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title: e.target.value,
                  })
                }
              />

              <textarea
                placeholder="Description"
                className="w-full rounded border p-3"
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
              />

              <select
                title="class"
                className="w-full rounded border p-3"
                value={formData.classId}
                onChange={(e) => {
                  const classId = e.target.value;

                  setFormData({
                    ...formData,
                    classId,
                    subjectId: "",
                  });

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

              <select
                title="subject"
                className="w-full rounded border p-3"
                value={formData.subjectId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subjectId: e.target.value,
                  })
                }
              >
                <option value="">Select Subject</option>

                {filteredSubjects.map((subject: any) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>

              <input
                title="date"
                type="date"
                className="w-full rounded border p-3"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dueDate: e.target.value,
                  })
                }
              />

              <input
                type="number"
                placeholder="Max Marks"
                className="w-full rounded border p-3"
                value={formData.maxMarks}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxMarks: Number(e.target.value),
                  })
                }
              />

              <input
                title="file"
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                className="w-full rounded border p-3"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border px-4 py-2"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateAssignment}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white"
              >
                {loading
                  ? editingAssignment
                    ? "Updating..."
                    : "Creating..."
                  : editingAssignment
                    ? "Update"
                    : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
