"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { deleteAssignment, getAssignmentById, updateAssignment } from "@/services/assignment.service";
import { getMyProfile } from "@/services/teacher.service";
import { uploadFile } from "@/services/upload.service";
import { evaluateSubmission } from "@/services/assignment.service"; 
import toast from "react-hot-toast";
import { 
  FaArrowLeft, 
  FaTrash, 
  FaEdit, 
  FaFileDownload, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaBook, 
  FaUserGraduate,
  FaFileAlt,
  FaStar
} from "react-icons/fa";

export default function AssignmentDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [teacher, setTeacher] = useState<any>(null);
  const [filteredSubjects, setFilteredSubjects] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    classId: "",
    subjectId: "",
    dueDate: "",
    maxMarks: 100,
  });

  const [isGrading, setIsGrading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);
  const [gradingData, setGradingData] = useState({
    marks: "",
    remarks: "",
  });

  const fetchAssignmentData = async () => {
    try {
      const result = await getAssignmentById(id);
      setAssignment(result.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load assignment details");
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [assignmentResult, profileResult] = await Promise.all([
          getAssignmentById(id),
          getMyProfile()
        ]);
        setAssignment(assignmentResult.data);
        setTeacher(profileResult.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id]);

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this assignment? This cannot be undone.");
    if (!confirmed) return;
    try {
      await deleteAssignment(assignment.id);
      toast.success("Assignment deleted successfully");
      router.push("/teacher/assignments");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete assignment");
    }
  };

  const handleUpdateAssignment = async () => {
    try {
      setIsSaving(true);
      let fileUrl = assignment.fileUrl; 
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

      await updateAssignment(assignment.id, payload);
      toast.success("Assignment updated successfully");
      await fetchAssignmentData();
      
      setIsEditing(false);
      setSelectedFile(null);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to update assignment");
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = () => {
    setFormData({
      title: assignment.title,
      description: assignment.description || "",
      classId: assignment.classId,
      subjectId: assignment.subjectId,
      dueDate: assignment.dueDate.split("T")[0],
      maxMarks: assignment.maxMarks,
    });
    const subjects = teacher?.subjects?.filter((subject: any) => subject.classId === assignment.classId) || [];
    setFilteredSubjects(subjects);
    setIsEditing(true);
  };

  const openGradeModal = (submission: any) => {
    setSelectedSubmission(submission);
    setGradingData({
      marks: submission.marks !== null ? submission.marks.toString() : "",
      remarks: submission.remarks || "",
    });
    setIsGrading(true);
  };

  const handleEvaluateSubmission = async () => {
    const marksValue = Number(gradingData.marks);

    if (marksValue < 0) {
      toast.error("Marks cannot be negative.");
      return;
    }
    if (marksValue > assignment.maxMarks) {
      toast.error(`Marks cannot exceed the maximum (${assignment.maxMarks}).`);
      return;
    }

    try {
      setIsSubmittingGrade(true);
      
      await evaluateSubmission(selectedSubmission.id, {
        marks: marksValue,
        remarks: gradingData.remarks,
      });

      toast.success("Student graded successfully");
      await fetchAssignmentData();
      setIsGrading(false);
      setSelectedSubmission(null);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to submit grade");
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
          <p className="font-medium">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold text-slate-700">Assignment Not Found</h2>
        <p className="mt-2 text-slate-500">The assignment you are looking for does not exist or was deleted.</p>
        <button onClick={() => router.push("/teacher/assignments")} className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-700">
          Go Back to Assignments
        </button>
      </div>
    );
  }

  const isOverdue = new Date(assignment.dueDate) < new Date();

  return (
    <div className="space-y-6 pb-8 max-w-6xl mx-auto">
      
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.push("/teacher/assignments")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
        >
          <FaArrowLeft /> Back to Assignments
        </button>
      </div>

      <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -z-10 translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-100">
                {assignment.class?.name}
              </span>
              <span className="rounded-lg bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 border border-purple-100">
                {assignment.class?.board?.name}
              </span>
              <span className={`rounded-lg px-3 py-1 text-xs font-bold border ${isOverdue ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>
                {isOverdue ? "Past Due" : "Active"}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-slate-800">{assignment.title}</h1>
            <p className="mt-4 text-slate-600 leading-relaxed max-w-3xl whitespace-pre-wrap">
              {assignment.description || "No description provided."}
            </p>

            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl">
                <FaBook className="text-blue-500 text-xl" />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase">Subject</p>
                  <p className="font-medium">{assignment.subject?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl">
                <FaCalendarAlt className="text-amber-500 text-xl" />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase">Due Date</p>
                  <p className="font-medium">{new Date(assignment.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl">
                <FaCheckCircle className="text-emerald-500 text-xl" />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase">Max Marks</p>
                  <p className="font-medium">{assignment.maxMarks}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl">
                <FaUserGraduate className="text-purple-500 text-xl" />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase">Submissions</p>
                  <p className="font-medium">{assignment.submissions?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 min-w-[200px]">
            {assignment.fileUrl && (
              <a
                href={assignment.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
              >
                <FaFileDownload /> View Attachment
              </a>
            )}
            <button 
              onClick={openEditModal}
              className="flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300"
            >
              <FaEdit className="text-slate-400" /> Edit Details
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center justify-center gap-2 rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 font-semibold text-rose-600 transition-all hover:bg-rose-100 hover:text-rose-700"
            >
              <FaTrash /> Delete 
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-bold text-slate-800">Student Submissions</h2>
          <span className="bg-slate-100 text-slate-600 py-1 px-3 rounded-full text-sm font-semibold">
            {assignment.submissions?.length || 0} Total
          </span>
        </div>

        {!assignment.submissions || assignment.submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <div className="p-4 bg-white rounded-full mb-3 shadow-sm">
              <FaFileAlt className="text-3xl text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">No Submissions Yet</h3>
            <p className="mt-1 text-slate-500">When students upload their work, it will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <div className="col-span-4">Student Name</div>
              <div className="col-span-3">Submitted On</div>
              <div className="col-span-2 text-center">Status/Marks</div>
              <div className="col-span-3 text-right">Action</div>
            </div>

            {assignment.submissions.map((submission: any) => {
              const isGraded = submission.marks !== null && submission.marks !== undefined;

              return (
                <div 
                  key={submission.id} 
                  className="group flex flex-col md:grid md:grid-cols-12 gap-4 items-start md:items-center rounded-2xl border border-slate-100 p-4 transition-all hover:border-blue-200 hover:shadow-sm bg-white"
                >
                  <div className="col-span-4 flex items-center gap-3 w-full">
                    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                      {submission.student?.name?.charAt(0) || "S"}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{submission.student?.name}</h3>
                      <p className="text-xs text-slate-500 md:hidden">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-3 hidden md:block text-sm text-slate-600 font-medium">
                    {new Date(submission.submittedAt).toLocaleDateString()}
                  </div>

                  <div className="col-span-2 md:text-center w-full md:w-auto">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                      isGraded 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                        : "bg-amber-50 text-amber-700 border border-amber-100"
                    }`}>
                      {isGraded ? <FaStar className="text-emerald-500" /> : null}
                      {isGraded ? `${submission.marks} / ${assignment.maxMarks}` : "Pending Review"}
                    </span>
                  </div>

                  <div className="col-span-3 flex items-center gap-2 md:justify-end w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t border-slate-100 md:border-0">
                    {submission.fileUrl && (
                      <a
                        href={submission.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 md:flex-none text-center rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                      >
                        View File
                      </a>
                    )}
                    <button 
                      onClick={() => openGradeModal(submission)}
                      className={`flex-1 md:flex-none rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                        isGraded 
                          ? "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50" 
                          : "bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white"
                      }`}
                    >
                      {isGraded ? "Update Marks" : "Grade Now"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isGrading && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Evaluate Submission</h2>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <div className="h-10 w-10 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center font-bold">
                  {selectedSubmission.student?.name?.charAt(0) || "S"}
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-semibold uppercase tracking-wide">Student</p>
                  <p className="font-bold text-slate-800">{selectedSubmission.student?.name}</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="block text-sm font-medium text-slate-700">Marks Awarded</label>
                  <span className="text-xs font-semibold text-slate-400">Out of {assignment.maxMarks}</span>
                </div>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  max={assignment.maxMarks}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-bold text-lg"
                  value={gradingData.marks}
                  onChange={(e) => setGradingData({ ...gradingData, marks: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Teacher Feedback (Optional)</label>
                <textarea
                  placeholder="Great job on the first section, but review your calculations on question 3..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none text-sm"
                  value={gradingData.remarks}
                  onChange={(e) => setGradingData({ ...gradingData, remarks: e.target.value })}
                />
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => {
                  setIsGrading(false);
                  setSelectedSubmission(null);
                }}
                className="rounded-xl px-5 py-2.5 font-medium text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleEvaluateSubmission}
                disabled={isSubmittingGrade || gradingData.marks === ""}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 font-medium text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingGrade ? "Saving..." : (
                  <>
                    <FaCheckCircle /> Save Grade
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}


      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Edit Assignment</h2>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assignment Title</label>
                <input
                  placeholder="e.g. Algebra Practice Chapter 1"
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description & Instructions</label>
                <textarea
                  placeholder="Provide instructions for the students..."
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                  <select
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
                    value={formData.classId}
                    onChange={(e) => {
                      const classId = e.target.value;
                      setFormData({ ...formData, classId, subjectId: "" });
                      const subjects = teacher?.subjects?.filter((subject: any) => subject.classId === classId) || [];
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                  <select
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    disabled={!formData.classId}
                  >
                    <option value="">Select Subject</option>
                    {filteredSubjects.map((subject: any) => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Max Marks</label>
                  <input
                    type="number"
                    placeholder="100"
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    value={formData.maxMarks}
                    onChange={(e) => setFormData({ ...formData, maxMarks: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Attachment (Optional)</label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 outline-none transition-all"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                  {assignment.fileUrl && !selectedFile && (
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                      <FaCheckCircle className="text-emerald-500" /> Current file will be kept unless you upload a new one.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedFile(null);
                }}
                className="rounded-xl px-5 py-2.5 font-medium text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateAssignment}
                disabled={isSaving || !formData.title || !formData.classId || !formData.subjectId || !formData.dueDate}
                className="rounded-xl bg-blue-600 px-6 py-2.5 font-medium text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}