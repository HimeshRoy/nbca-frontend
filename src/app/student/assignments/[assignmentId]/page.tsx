"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

import { getStudentAssignmentById } from "@/services/assignment.service";
import { submitAssignment } from "@/services/submission.service";
import { uploadFile } from "@/services/upload.service";

import {
  FileText,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  UploadCloud,
  ArrowLeft,
  X,
  File,
  MessageSquare,
  Award,
  Info
} from "lucide-react";

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
          params.assignmentId as string
        );
        setAssignment(result.data);
      } catch (error) {
        console.error("Failed to load assignment:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAssignment();
  }, [params.assignmentId]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="w-64 h-64">
          <DotLottieReact
            src="https://lottie.host/8cc70ce1-7bcb-4492-b978-77cde0aad40a/QnHc4gdlQq.lottie"
            loop
            autoplay
          />
        </div>
        <p className="text-slate-500 font-medium animate-pulse mt-4">Loading assignment details...</p>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!selectedFile) return;

    try {
      setSubmitting(true);
      toast.loading("Uploading assignment...", { id: "upload" });

      const uploadResult = await uploadFile(selectedFile);
      const fileUrl = uploadResult.data.fileUrl;

      await submitAssignment(assignment.id, { fileUrl });

      toast.success("Assignment submitted successfully!", { id: "upload" });

      // Refresh assignment data
      const result = await getStudentAssignmentById(params.assignmentId as string);
      setAssignment(result.data);
      setSelectedFile(null); // Clear selection after success
    } catch (error) {
      console.error(error);
      toast.error("Submission failed. Please try again.", { id: "upload" });
    } finally {
      setSubmitting(false);
    }
  };

  if (!assignment) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
          <FileText size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-700">Assignment not found</h2>
        <button
          onClick={() => router.back()}
          className="mt-6 flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-bold text-white transition-all hover:bg-violet-700 shadow-md"
        >
          <ArrowLeft size={18} /> Go Back
        </button>
      </div>
    );
  }

  const dueDate = new Date(assignment.dueDate);
  const today = new Date();
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const showDueStatus = assignment.status !== "SUBMITTED";

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        
        {/* Top Navigation */}
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-violet-600 mb-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm transition-all group-hover:border-violet-200 group-hover:bg-violet-50">
            <ArrowLeft size={16} />
          </div>
          Back to Assignments
        </button>

        {/* Main Header Card */}
        <div className="rounded-3xl bg-white p-6 md:p-8 border border-slate-100 shadow-sm relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-violet-50 rounded-full opacity-50 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <span className="inline-block rounded-lg bg-violet-100 border border-violet-200 px-3 py-1.5 text-xs font-bold text-violet-700 mb-4">
                {assignment.subject.name}
              </span>
              
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 leading-tight">
                {assignment.title}
              </h1>
              
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <User size={16} className="text-slate-400" /> 
                  {assignment.teacher.name}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <Calendar size={16} className="text-slate-400" /> 
                  Due: {dueDate.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-start md:items-end gap-3">
              <div
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold border shadow-sm
                  ${
                    assignment.status === "SUBMITTED"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : assignment.isOverdue
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                  }
                `}
              >
                {assignment.status === "SUBMITTED" ? (
                  <><CheckCircle2 size={18} /> Submitted</>
                ) : assignment.isOverdue ? (
                  <><AlertCircle size={18} /> Overdue</>
                ) : (
                  <><Clock size={18} /> Pending</>
                )}
              </div>

              {showDueStatus && (
                <div className={`text-sm font-bold flex items-center gap-1.5 px-1
                  ${diffDays < 0 ? "text-rose-600" : diffDays === 0 ? "text-amber-600" : "text-slate-500"}`}
                >
                  {diffDays < 0 ? (
                    <>Overdue by {Math.abs(diffDays)} day{Math.abs(diffDays) > 1 ? "s" : ""}</>
                  ) : diffDays === 0 ? (
                    <>Due Today</>
                  ) : (
                    <>Due in {diffDays} day{diffDays > 1 ? "s" : ""}</>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Tabs (Description & Attachment) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="md:col-span-2 space-y-6">
            {/* Description Card */}
            <div className="rounded-3xl bg-white p-6 md:p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-slate-800">
                <Info size={20} className="text-violet-600" />
                <h2 className="text-lg font-bold">Instructions</h2>
              </div>
              <div className="prose prose-slate max-w-none text-slate-600 text-sm md:text-base leading-relaxed whitespace-pre-line">
                {assignment.description || "No specific instructions provided for this assignment."}
              </div>
            </div>

            {/* Teacher Feedback Card (If graded) */}
            {assignment.submission?.marks != null && (
              <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 p-6 md:p-8 border border-emerald-100 shadow-sm">
                <div className="flex items-center gap-2 mb-6 text-emerald-800">
                  <Award size={20} className="text-emerald-600" />
                  <h2 className="text-lg font-bold">Teacher Feedback</h2>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  <div className="shrink-0 bg-white border border-emerald-100 rounded-2xl p-4 text-center min-w-[120px] shadow-sm">
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Score</span>
                    <span className="text-3xl font-extrabold text-emerald-600">{assignment.submission.marks}</span>
                  </div>
                  
                  <div className="flex-1 bg-white border border-emerald-100 rounded-2xl p-4 shadow-sm relative">
                    <MessageSquare size={16} className="absolute top-4 left-4 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600 pl-8 leading-relaxed">
                      {assignment.submission.remarks || "Great job! No additional remarks provided."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Reference File Card */}
            <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-slate-800">
                <FileText size={20} className="text-blue-600" />
                <h2 className="text-lg font-bold">Resource File</h2>
              </div>
              
              {assignment.fileUrl ? (
                <a
                  href={assignment.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl transition-all hover:border-blue-200 hover:bg-blue-50/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <File size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">Reference</p>
                      <p className="text-xs font-medium text-slate-500">View Document</p>
                    </div>
                  </div>
                  <Download size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                </a>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                  <p className="text-sm font-medium text-slate-500">No reference file attached.</p>
                </div>
              )}
            </div>

            {/* Submission Area */}
            <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <UploadCloud size={20} className="text-violet-600" /> My Work
              </h2>

              {assignment.status === "SUBMITTED" ? (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="font-bold text-emerald-800 mb-1">Successfully Submitted</h3>
                  {assignment.submission?.createdAt && (
                    <p className="text-xs font-medium text-emerald-600 mb-4">
                      On {new Date(assignment.submission.createdAt).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  )}
                  <a
                    href={assignment.submission.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
                  >
                    View Submission <Download size={16} />
                  </a>
                </div>
              ) : assignment.isOverdue ? (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5 text-center">
                  <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertCircle size={24} />
                  </div>
                  <h3 className="font-bold text-rose-800 mb-1">Submission Closed</h3>
                  <p className="text-sm font-medium text-rose-600">
                    The deadline for this assignment has passed.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {!selectedFile ? (
                    <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 transition-all hover:border-violet-300 hover:bg-violet-50/50">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm text-slate-400 group-hover:text-violet-600 transition-colors">
                        <UploadCloud size={24} />
                      </div>
                      <span className="text-sm font-bold text-slate-700 text-center">Tap to upload file</span>
                      <span className="mt-1 text-xs font-medium text-slate-400 text-center">PDF, DOCX, JPG, PNG</span>
                      
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
                  ) : (
                    <div className="flex items-center justify-between rounded-2xl border border-violet-200 bg-violet-50 p-4">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                          <File size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-700">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs font-medium text-slate-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="shrink-0 ml-2 rounded-full bg-white p-2 text-slate-400 shadow-sm transition-colors hover:bg-rose-50 hover:text-rose-600"
                        title="Remove file"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={!selectedFile || submitting}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-slate-200"
                  >
                    {submitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-white" />
                        Uploading...
                      </>
                    ) : (
                      "Submit Assignment"
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}