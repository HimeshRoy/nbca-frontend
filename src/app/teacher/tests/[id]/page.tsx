"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaFileExcel,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaTimes,
  FaCloudUploadAlt,
  FaLayerGroup,
  FaQuestionCircle,
  FaClock,
  FaImage
} from "react-icons/fa";

import { getTestById } from "@/services/test.service";
import {
  getQuestions,
  updateQuestion,
  createQuestion,
  deleteQuestion,
  uploadQuestionImage,
  uploadQuestionsExcel,
} from "@/services/question.service";

export default function TestDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [questionImage, setQuestionImage] = useState<File | null>(null);
  const [excelFile, setExcelFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [questionForm, setQuestionForm] = useState({
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
    explanation: "",
    difficulty: "EASY",
    marks: 1,
  });

  const resetForm = () => {
    setQuestionForm({
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "A",
      explanation: "",
      difficulty: "EASY",
      marks: 1,
    });
    setQuestionImage(null);
    setEditingQuestion(null);
  };

  const handleSaveQuestion = async () => {
    try {
      setIsSaving(true);
      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, {
          ...questionForm,
        });
        toast.success("Question updated successfully");
      } else {
        let imageUrl = "";

        if (questionImage) {
          const uploadResult = await uploadQuestionImage(questionImage);
          imageUrl = uploadResult.data.fileUrl;
        }
        await createQuestion({
          ...questionForm,
          questionImage: imageUrl,
          testId: id,
        });
        toast.success("Question added successfully");
      }

      const result = await getQuestions(id);
      setQuestions(result.data || []);
      
      resetForm();
      setOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to save question");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExcelUpload = async () => {
    try {
      if (!excelFile) {
        toast.error("Please select an Excel file first");
        return;
      }

      setIsUploading(true);
      await uploadQuestionsExcel(excelFile, id);
      const result = await getQuestions(id);
      setQuestions(result.data || []);
      setExcelFile(null);
      toast.success("Questions imported successfully");

      const fileInput = document.getElementById('excel-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Excel import failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this question?");
    if (!confirmed) return;

    try {
      await deleteQuestion(questionId);
      toast.success("Question deleted successfully");
      const result = await getQuestions(id);
      setQuestions(result.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete question");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const testResult = await getTestById(id);
        setTest(testResult.data);

        const questionsResult = await getQuestions(id);
        setQuestions(questionsResult.data || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load test details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
          <p className="font-medium">Loading test details...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="p-5 bg-slate-100 rounded-full mb-4 text-slate-400 text-4xl">
          <FaQuestionCircle />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Test Not Found</h2>
        <p className="text-slate-500 mt-2">The test you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  const easyQuestions = questions.filter((q) => q.difficulty === "EASY").length;
  const mediumQuestions = questions.filter((q) => q.difficulty === "MEDIUM").length;
  const hardQuestions = questions.filter((q) => q.difficulty === "HARD").length;
  const totalQuestionMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = difficultyFilter === "ALL" || q.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="pb-10 max-w-7xl mx-auto space-y-6">

      <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-800">{test.title}</h1>
            <p className="mt-2 text-slate-500 max-w-2xl leading-relaxed">{test.description || "No description provided."}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                id="excel-upload"
                className="hidden"
                onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
              />
              <label
                htmlFor="excel-upload"
                className="cursor-pointer flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm border border-slate-200 transition-colors hover:bg-slate-50 hover:text-blue-600"
              >
                <FaFileExcel className="text-emerald-500" /> 
                {excelFile ? 'Change File' : 'Select Excel'}
              </label>

              {excelFile && (
                <div className="flex items-center gap-2 px-3">
                  <span className="text-xs font-medium text-slate-600 truncate max-w-[120px]">
                    {excelFile.name}
                  </span>
                  <button
                    disabled={isUploading}
                    onClick={handleExcelUpload}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <FaCloudUploadAlt /> {isUploading ? "Uploading..." : "Upload"}
                  </button>
                  <button 
                    onClick={() => {
                      setExcelFile(null);
                      const fileInput = document.getElementById('excel-upload') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                resetForm();
                setOpen(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
            >
              <FaPlus /> Add Question
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 flex flex-col justify-center">
            <p className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              <FaLayerGroup /> Questions
            </p>
            <p className="text-2xl font-black text-slate-800">{questions.length}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 flex flex-col justify-center">
            <p className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              <FaCheckCircle /> Total Marks
            </p>
            <p className="text-2xl font-black text-slate-800">{totalQuestionMarks}</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100 flex flex-col justify-center">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Easy</p>
            <p className="text-2xl font-black text-emerald-700">{easyQuestions}</p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-4 border border-amber-100 flex flex-col justify-center">
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Medium</p>
            <p className="text-2xl font-black text-amber-700">{mediumQuestions}</p>
          </div>
          <div className="rounded-2xl bg-rose-50 p-4 border border-rose-100 flex flex-col justify-center">
            <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">Hard</p>
            <p className="text-2xl font-black text-rose-700">{hardQuestions}</p>
          </div>
          <div className="rounded-2xl bg-blue-50 p-4 border border-blue-100 flex flex-col justify-center">
            <p className="flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              <FaClock /> Duration
            </p>
            <p className="text-2xl font-black text-blue-700">{test.duration}m</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="relative min-w-[200px]">
            <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              title="difficulty"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="p-5 bg-blue-50 rounded-full mb-4 text-blue-500 text-3xl">
              <FaLayerGroup />
            </div>
            <h3 className="text-xl font-bold text-slate-700">No Questions Added</h3>
            <p className="mt-2 text-slate-500 max-w-md">You haven't added any questions to this test yet. Click the "Add Question" button or upload an Excel file to get started.</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
           <div className="py-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
             <p className="text-slate-500">No questions match your current search or filter criteria.</p>
           </div>
        ) : (
          filteredQuestions.map((question: any, index: number) => (
            <div
              key={question.id}
              className="group flex flex-col md:flex-row gap-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-100"
            >
  
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-700">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800 leading-snug whitespace-pre-wrap">
                      {question.question}
                    </h3>
                    
                    {question.questionImage && (
                      <div className="mt-4 overflow-hidden rounded-xl border border-slate-100 max-w-lg">
                        <img
                          src={question.questionImage}
                          alt="Question reference"
                          className="w-full object-cover"
                        />
                      </div>
                    )}

                    <div className="mt-5 grid sm:grid-cols-2 gap-3">
                      {['A', 'B', 'C', 'D'].map((opt) => (
                        <div 
                          key={opt}
                          className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                            question.correctAnswer === opt 
                              ? "bg-emerald-50 border-emerald-200" 
                              : "bg-slate-50 border-slate-100"
                          }`}
                        >
                          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                            question.correctAnswer === opt 
                              ? "bg-emerald-500 text-white" 
                              : "bg-white text-slate-500 border border-slate-200"
                          }`}>
                            {opt}
                          </span>
                          <span className={`text-sm font-medium ${
                            question.correctAnswer === opt ? "text-emerald-900" : "text-slate-700"
                          }`}>
                            {question[`option${opt}` as keyof typeof question]}
                          </span>
                        </div>
                      ))}
                    </div>

                    {question.explanation && (
                      <div className="mt-5 rounded-xl bg-blue-50/50 p-4 border border-blue-100">
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Explanation</p>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 md:w-48 shrink-0">
                
                <div className="flex flex-row md:flex-col gap-2 w-full">
                  <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                    {question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}
                  </span>
                  <span
                    className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-bold ${
                      question.difficulty === "EASY"
                        ? "bg-emerald-50 text-emerald-700"
                        : question.difficulty === "MEDIUM"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {question.difficulty}
                  </span>
                </div>

                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => {
                      setEditingQuestion(question);
                      setQuestionForm({
                        question: question.question,
                        optionA: question.optionA,
                        optionB: question.optionB,
                        optionC: question.optionC,
                        optionD: question.optionD,
                        correctAnswer: question.correctAnswer,
                        explanation: question.explanation || "",
                        difficulty: question.difficulty || "EASY",
                        marks: question.marks || 1,
                      });
                      setOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-600 transition-colors hover:bg-amber-500 hover:text-white"
                  >
                    <FaEdit /> <span className="hidden md:inline">Edit</span>
                  </button>

                  <button
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-600 hover:text-white"
                  >
                    <FaTrash /> <span className="hidden md:inline">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/90 backdrop-blur px-8 py-5 rounded-t-3xl">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {editingQuestion ? "Edit Question" : "Add New Question"}
                </h2>
                <p className="text-sm text-slate-500">Formulate the question and provide multiple-choice options.</p>
              </div>
              <button 
                onClick={() => {
                  resetForm();
                  setOpen(false);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Question Text</label>
                <textarea
                  placeholder="Type the question here..."
                  className="w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-800 font-medium resize-none min-h-[100px]"
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <FaImage className="text-slate-400" /> Reference Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setQuestionImage(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="block text-sm font-semibold text-slate-700 mb-4">Answer Options</label>
                <div className="grid md:grid-cols-2 gap-4">
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <div key={opt} className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                        {opt}
                      </span>
                      <input
                        placeholder={`Option ${opt}`}
                        className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                        value={questionForm[`option${opt}` as keyof typeof questionForm] as string}
                        onChange={(e) => setQuestionForm({ ...questionForm, [`option${opt}`]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Correct Answer</label>
                  <select
                    value={questionForm.correctAnswer}
                    onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm font-bold text-emerald-700 bg-emerald-50/30"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Difficulty</label>
                  <select
                    value={questionForm.difficulty}
                    onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Marks</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Marks"
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                    value={questionForm.marks}
                    onChange={(e) => setQuestionForm({ ...questionForm, marks: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Explanation (Optional)</label>
                <textarea
                  placeholder="Explain why the correct answer is right..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm resize-none"
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                />
              </div>
            </div>

            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-8 py-4 rounded-b-3xl">
              <button
                onClick={() => {
                  resetForm();
                  setOpen(false);
                }}
                className="rounded-xl px-5 py-2.5 font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={
                  isSaving || 
                  !questionForm.question || 
                  !questionForm.optionA || 
                  !questionForm.optionB || 
                  !questionForm.optionC || 
                  !questionForm.optionD
                }
                onClick={handleSaveQuestion}
                className="rounded-xl bg-blue-600 px-8 py-2.5 font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : (editingQuestion ? "Update Question" : "Save Question")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}