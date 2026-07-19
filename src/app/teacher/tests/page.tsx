"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getTests,
  createTest,
  updateTest,
  deleteTest,
} from "@/services/test.service";
import { getBoards } from "@/services/board.service";
import { getClasses } from "@/services/class.service";
import { getSubjects } from "@/services/subject.service";
import { getChaptersBySubject } from "@/services/chapter.service";
import { getMyProfile } from "@/services/teacher.service";
import toast from "react-hot-toast";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaClock, 
  FaCheckCircle, 
  FaQuestionCircle, 
  FaUserGraduate, 
  FaCog,
  FaCalendarAlt,
  FaBook,
} from "react-icons/fa";

export default function TestsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [teacher, setTeacher] = useState<any>(null);
  const [boards, setBoards] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [editingTest, setEditingTest] = useState<any>(null);
  
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    boardId: "",
    classId: "",
    subjectId: "",
    chapterId: "",
    duration: 60,
    totalMarks: 100,
    passingMarks: 33,
    negativeMarks: 0,
    startTime: "",
    endTime: "",
    shuffleQuestions: false,
    shuffleOptions: false,
    isPublished: false,
  });

  const loadTests = async () => {
    try {
      const result = await getTests();
      setTests(result.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load tests");
    }
  };

  const handleSaveTest = async () => {
    try {
      setIsSaving(true);

      if (editingTest) {
        await updateTest(editingTest.id, formData);
        toast.success("Test updated successfully");
      } else {
        await createTest(formData);
        toast.success("Test created successfully");
      }

      await loadTests();
      resetForm();
      setOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to save test");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTest = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this test? This action cannot be undone.");
    if (!confirmed) return;

    try {
      await deleteTest(id);
      toast.success("Test deleted successfully");
      await loadTests();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete test");
    }
  };

  const resetForm = () => {
    setEditingTest(null);
    setFormData({
      title: "",
      description: "",
      boardId: "",
      classId: "",
      subjectId: "",
      chapterId: "",
      duration: 60,
      totalMarks: 100,
      passingMarks: 33,
      negativeMarks: 0,
      startTime: "",
      endTime: "",
      shuffleQuestions: false,
      shuffleOptions: false,
      isPublished: false,
    });
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoadingData(true);
      try {
        const [boardsResult, classesResult, subjectsResult, teacherResult] = await Promise.all([
          getBoards(),
          getClasses(),
          getSubjects(),
          getMyProfile(),
        ]);

        setBoards(boardsResult.data);
        setClasses(classesResult.data);
        setSubjects(subjectsResult.data);
        setTeacher(teacherResult.data);
        
        await loadTests();
      } catch (error) {
        console.error("Failed to load initial data", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!formData.subjectId) {
      setChapters([]);
      return;
    }

    const loadChapters = async () => {
      try {
        const result = await getChaptersBySubject(formData.subjectId);
        setChapters(result.data);
      } catch (error) {
        console.error("Failed to load chapters", error);
      }
    };

    loadChapters();
  }, [formData.subjectId]);

  const filteredSubjects = teacher?.subjects?.filter((subject: any) => subject.classId === formData.classId) || [];

  const teacherBoards = teacher?.classes?.reduce((acc: any[], cls: any) => {
    if (!acc.find((b) => b.id === cls.board.id)) {
      acc.push(cls.board);
    }
    return acc;
  }, []) || [];

  if (isLoadingData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
          <p className="font-medium">Loading tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Tests</h1>
          <p className="mt-1 text-slate-500">Create and manage your assessments.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
        >
          <FaPlus /> Create Test
        </button>
      </div>

      {tests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="p-5 bg-blue-50 rounded-full mb-4 text-blue-500 text-3xl">
            <FaCheckCircle />
          </div>
          <h3 className="text-xl font-bold text-slate-700">No Tests Created Yet</h3>
          <p className="mt-2 text-slate-500 max-w-md">You haven't created any tests. Click the button above to set up your first assessment.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {tests.map((test) => (
            <div
              key={test.id}
              className="group flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-100"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight leading-tight line-clamp-2">
                    {test.title}
                  </h2>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      test.isPublished
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : "bg-amber-50 text-amber-600 border border-amber-100"
                    }`}
                  >
                    {test.isPublished ? "Published" : "Draft"}
                  </span>
                </div>

                <p className="text-sm text-slate-500 line-clamp-2 mb-5 min-h-[40px]">
                  {test.description || "No description provided."}
                </p>

                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm mb-6">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Board / Class</p>
                    <p className="font-medium text-slate-700 truncate">{test.board?.name} • {test.class?.name}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Subject</p>
                    <p className="font-medium text-slate-700 truncate">{test.subject?.name}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Chapter</p>
                    <p className="font-medium text-slate-700 truncate">{test.chapter?.name || "All Chapters"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Schedule</p>
                    <p className="font-medium text-slate-700 truncate">
                      {test.startTime ? new Date(test.startTime).toLocaleDateString() : "Not scheduled"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 border border-slate-100">
                    <FaClock className="text-slate-400" /> {test.duration} mins
                  </span>
                  <span className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 border border-slate-100">
                    <FaCheckCircle className="text-slate-400" /> {test.totalMarks} marks
                  </span>
                  <span className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 border border-slate-100">
                    <FaQuestionCircle className="text-slate-400" /> {test._count?.questions || 0} Qs
                  </span>
                  <span className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 border border-slate-100">
                    <FaUserGraduate className="text-slate-400" /> {test._count?.attempts || 0} Attempts
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-100 mt-auto">
                <Link
                  href={`/teacher/tests/${test.id}`}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-600 hover:text-white"
                >
                  <FaCog /> Manage
                </Link>

                <button
                  onClick={() => {
                    setEditingTest(test);
                    setFormData({
                      title: test.title || "",
                      description: test.description || "",
                      boardId: test.boardId || "",
                      classId: test.classId || "",
                      subjectId: test.subjectId || "",
                      chapterId: test.chapterId || "",
                      duration: test.duration || 60,
                      totalMarks: test.totalMarks || 100,
                      passingMarks: test.passingMarks || 33,
                      negativeMarks: test.negativeMarks || 0,
                      startTime: test.startTime ? test.startTime.slice(0, 16) : "",
                      endTime: test.endTime ? test.endTime.slice(0, 16) : "",
                      shuffleQuestions: test.shuffleQuestions || false,
                      shuffleOptions: test.shuffleOptions || false,
                      isPublished: test.isPublished || false,
                    });
                    setOpen(true);
                  }}
                  className="flex items-center justify-center rounded-xl bg-amber-50 px-4 py-2.5 text-amber-600 transition-colors hover:bg-amber-500 hover:text-white"
                  title="Edit Test"
                >
                  <FaEdit />
                </button>

                <button
                  onClick={() => handleDeleteTest(test.id)}
                  className="flex items-center justify-center rounded-xl bg-rose-50 px-4 py-2.5 text-rose-600 transition-colors hover:bg-rose-600 hover:text-white"
                  title="Delete Test"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/90 backdrop-blur px-8 py-5 rounded-t-3xl">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {editingTest ? "Edit Test" : "Create New Test"}
                </h2>
                <p className="text-sm text-slate-500">Configure your exam details, schedule, and settings.</p>
              </div>
              <button 
                onClick={() => setOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">

              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
                  <FaBook className="text-blue-500" /> Test Information
                </h3>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Test Title</label>
                  <input
                    placeholder="e.g., Mid-Term Mathematics Assessment"
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-slate-800"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Description & Instructions</label>
                  <textarea
                    placeholder="Provide specific instructions for the students..."
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none text-sm"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
                  <FaUserGraduate className="text-blue-500" /> Academic Details
                </h3>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Board</label>
                    <select
                      className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white text-sm"
                      value={formData.boardId}
                      onChange={(e) => setFormData({ ...formData, boardId: e.target.value })}
                    >
                      <option value="">Select Board</option>
                      {teacherBoards.map((board: any) => (
                        <option key={board.id} value={board.id}>{board.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Class</label>
                    <select
                      className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white text-sm"
                      value={formData.classId}
                      onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    >
                      <option value="">Select Class</option>
                      {teacher?.classes?.map((cls: any) => (
                        <option key={cls.id} value={cls.id}>{cls.name} ({cls.board?.name})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Subject</label>
                    <select
                      className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white text-sm"
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

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Chapter (Optional)</label>
                    <select
                      className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white text-sm"
                      value={formData.chapterId}
                      onChange={(e) => setFormData({ ...formData, chapterId: e.target.value })}
                      disabled={!formData.subjectId}
                    >
                      <option value="">All Chapters</option>
                      {chapters.map((chapter) => (
                        <option key={chapter.id} value={chapter.id}>{chapter.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
                  <FaCog className="text-blue-500" /> Exam Settings
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Mins)</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Total Marks</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                      value={formData.totalMarks}
                      onChange={(e) => setFormData({ ...formData, totalMarks: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Passing Marks</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                      value={formData.passingMarks}
                      onChange={(e) => setFormData({ ...formData, passingMarks: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Negative Marks</label>
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                      value={formData.negativeMarks}
                      onChange={(e) => setFormData({ ...formData, negativeMarks: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={formData.shuffleQuestions}
                        onChange={(e) => setFormData({ ...formData, shuffleQuestions: e.target.checked })}
                      />
                      <div className="h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-blue-600 transition-colors after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full"></div>
                    </div>
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">Shuffle Questions</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={formData.shuffleOptions}
                        onChange={(e) => setFormData({ ...formData, shuffleOptions: e.target.checked })}
                      />
                      <div className="h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-blue-600 transition-colors after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full"></div>
                    </div>
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">Shuffle Options</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={formData.isPublished}
                        onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      />
                      <div className="h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-emerald-500 transition-colors after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full"></div>
                    </div>
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors">Publish Test Immediately</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
                  <FaCalendarAlt className="text-blue-500" /> Schedule
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Start Date & Time (Optional)</label>
                    <input
                      type="datetime-local"
                      className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">End Date & Time (Optional)</label>
                    <input
                      type="datetime-local"
                      className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-8 py-4 rounded-b-3xl">
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl px-5 py-2.5 font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={isSaving || !formData.title || !formData.boardId || !formData.classId || !formData.subjectId}
                onClick={handleSaveTest}
                className="rounded-xl bg-blue-600 px-8 py-2.5 font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : (editingTest ? "Update Test" : "Create Test")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}