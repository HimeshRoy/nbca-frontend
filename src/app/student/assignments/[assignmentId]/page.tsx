"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { getStudentAssignmentById } from "@/services/assignment.service";
import { submitAssignment } from "@/services/submission.service";
import { uploadFile } from "@/services/upload.service";
import { toast } from "sonner";

import {
  FileText,
  Upload,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Paperclip,
} from "lucide-react";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AssignmentDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [assignment, setAssignment] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadAssignment = async () => {
      try {
        const result = await getStudentAssignmentById(
          params.assignmentId as string,
        );

        setAssignment(result.data);
      } finally {
        setLoading(false);
      }
    };

    loadAssignment();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!selectedFile) return;

    try {
      setSubmitting(true);

      toast.loading("Uploading assignment...", {
        id: "upload",
      });

      const uploadResult = await uploadFile(selectedFile);

      const fileUrl = uploadResult.data.fileUrl;

      await submitAssignment(assignment.id, {
        fileUrl,
      });

      toast.success("Assignment submitted successfully!", {
        id: "upload",
      });

      const result = await getStudentAssignmentById(
        params.assignmentId as string,
      );

      setAssignment(result.data);
    } catch (error) {
      console.error(error);

      toast.error("Submission failed", {
        id: "upload",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!assignment) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <button
          onClick={() => router.back()}
          className="mb-5 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-md"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        Assignment not found
      </div>
    );
  }

  const dueDate = new Date(assignment.dueDate);

  const today = new Date();

  const diffTime = dueDate.getTime() - today.getTime();

  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 p-4 pb-24">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => router.back()}
          className="mb-5 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-md"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <div className="rounded-[35px] bg-white p-6 shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">
          <div className="flex items-start justify-between">
            <div>
              <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700">
                {assignment.subject.name}
              </span>

              <h1 className="mt-4 text-3xl font-bold text-slate-800">
                {assignment.title}
              </h1>

              <p className="mt-3 text-slate-500">
                Created by {assignment.teacher.name}
              </p>
            </div>

            <div className="text-6xl">📝</div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-2xl bg-slate-100 px-4 py-3">
              <p className="text-xs text-slate-500">Due Date</p>

              <p className="font-semibold">{dueDate.toLocaleDateString()}</p>

              <p
                className={`mt-2 text-sm font-semibold

      ${
        diffDays < 0
          ? "text-red-600"
          : diffDays === 0
            ? "text-orange-600"
            : "text-green-600"
      }`}
              >
                {diffDays < 0
                  ? `🔴 Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? "s" : ""}`
                  : diffDays === 0
                    ? "⚠️ Due Today"
                    : `⏳ Due in ${diffDays} day${diffDays > 1 ? "s" : ""}`}
              </p>
            </div>

            <div
              className={`rounded-2xl px-4 py-3 font-semibold text-center

      ${
        assignment.status === "SUBMITTED"
          ? "bg-green-100 text-green-700"
          : assignment.isOverdue
            ? "bg-red-100 text-red-700"
            : "bg-orange-100 text-orange-700"
      }`}
            >
              {assignment.status === "SUBMITTED"
                ? "✅ Submitted"
                : assignment.isOverdue
                  ? "🔴 Overdue"
                  : "🟠 Pending"}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[35px] bg-white p-6 shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">
          <h2 className="text-xl font-bold">📖 Description</h2>

          <p className="mt-4 whitespace-pre-line text-slate-600 leading-8">
            {assignment.description || "No description provided."}
          </p>
        </div>

        <div className="mt-6 rounded-[35px] bg-white p-6 shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">
          <h2 className="text-xl font-bold">📎 Assignment Attachment</h2>

          {assignment.fileUrl ? (
            <a
              href={assignment.fileUrl}
              target="_blank"
              className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 p-4"
            >
              <div>
                <h3 className="font-semibold">Assignment File</h3>

                <p className="text-sm text-slate-500">Open or Download</p>
              </div>

              <span className="text-3xl">📄</span>
            </a>
          ) : (
            <p className="mt-4 text-slate-500">No attachment uploaded.</p>
          )}
        </div>

        <div className="mt-6 rounded-[35px] bg-white p-6 shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">
          <h2 className="text-xl font-bold">📤 Submit Assignment</h2>

          {assignment.status === "SUBMITTED" ? (
            <div className="mt-6 rounded-3xl bg-green-100 p-6">
              <h3 className="text-lg font-bold text-green-700">
                ✅ Assignment Submitted
              </h3>

              <p className="mt-2 text-green-700">
                You have already submitted this assignment.
              </p>

              {assignment.submission?.createdAt && (
                <p className="mt-3 text-sm text-green-700">
                  Submitted on{" "}
                  {new Date(assignment.submission.createdAt).toLocaleString()}
                </p>
              )}

              <a
                href={assignment.submission.fileUrl}
                target="_blank"
                className="mt-5 inline-block rounded-2xl bg-green-600 px-5 py-3 text-white"
              >
                View Submission
              </a>
            </div>
          ) : (
            <>
              <label
                className="
          mt-6
          flex
          cursor-pointer
          flex-col
          items-center
          justify-center
          rounded-[30px]
          border-2
          border-dashed
          border-violet-300
          p-10
          transition
          hover:bg-violet-50
        "
              >
                <div className="text-6xl">📂</div>

                <h3 className="mt-4 text-md font-bold">
                  Choose Assignment File
                </h3>

                <p className="mt-2 text-slate-500 text-center">
                  PDF, DOCX, JPG, PNG
                </p>

                <input
                  hidden
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                />
              </label>

              {selectedFile && (
                <div className="mt-5 flex items-center justify-between rounded-2xl bg-violet-50 gap-2 p-4 text-sm">
                  <div>
                    <p className="font-semibold text-sm">
                      📄 {selectedFile.name}
                    </p>

                    <p className="text-sm text-slate-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="rounded-full text-sm bg-red-100 px-3 py-2 text-red-600 transition hover:bg-red-200"
                  >
                    ✕
                  </button>
                </div>
              )}
              <button
                onClick={handleSubmit}
                disabled={!selectedFile || submitting}
                className="
    mt-6
    w-full
    rounded-2xl
    bg-gradient-to-r
    from-violet-600
    to-indigo-600
    py-4
    font-semibold
    text-white
    disabled:cursor-not-allowed
    disabled:opacity-50
  "
              >
                {submitting ? "Submitting..." : "Submit Assignment"}
              </button>
            </>
          )}
        </div>
        {assignment.submission?.marks != null && (
          <div className="mt-6 rounded-[35px] bg-white p-6 shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">
            <h2 className="text-xl font-bold">⭐ Teacher Feedback</h2>

            <div className="mt-5">
              <p className="text-3xl font-bold text-green-600">
                {assignment.submission.marks} Marks
              </p>

              <p className="mt-4 text-slate-600">
                {assignment.submission.remarks || "No remarks available."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
