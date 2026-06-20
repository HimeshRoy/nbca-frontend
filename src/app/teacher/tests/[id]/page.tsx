"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const id = params.id as string;

  const [test, setTest] = useState<any>(null);

  const [questions, setQuestions] = useState<any[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [questionImage, setQuestionImage] = useState<File | null>(null);

  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

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

  const handleSaveQuestion = async () => {
    try {
      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, {
          ...questionForm,
        });
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
      }

      const result = await getQuestions(id);

      setQuestions(result.data || []);

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

      setEditingQuestion(null);

      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleExcelUpload = async () => {
    try {
      if (!excelFile) {
        alert("Please select an Excel file");

        return;
      }

      await uploadQuestionsExcel(excelFile, id);

      const result = await getQuestions(id);

      setQuestions(result.data || []);

      setExcelFile(null);

      alert("Questions imported successfully");
    } catch (error) {
      console.error(error);

      alert("Excel import failed");
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    const confirmed = window.confirm("Delete this question?");

    if (!confirmed) return;

    try {
      await deleteQuestion(questionId);

      const result = await getQuestions(id);

      setQuestions(result.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const testResult = await getTestById(id);

        setTest(testResult.data);

        const questionsResult = await getQuestions(id);

        setQuestions(questionsResult.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!test) {
    return <div className="p-6">Test not found</div>;
  }

  const easyQuestions = questions.filter((q) => q.difficulty === "EASY").length;

  const mediumQuestions = questions.filter(
    (q) => q.difficulty === "MEDIUM",
  ).length;

  const hardQuestions = questions.filter((q) => q.difficulty === "HARD").length;

  const totalQuestionMarks = questions.reduce(
    (sum, q) => sum + (q.marks || 0),
    0,
  );

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.question
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesDifficulty =
      difficultyFilter === "ALL" || q.difficulty === difficultyFilter;

    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{test.title}</h1>

            <p className="mt-2 text-slate-500">{test.description}</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              id="excel-upload"
              className="hidden"
              onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
            />

            <label
              htmlFor="excel-upload"
              className="cursor-pointer rounded-lg bg-green-600 px-4 py-2 text-white"
            >
              Select Excel
            </label>

            {excelFile ? (
              <div className="rounded-lg border bg-green-50 px-3 py-2 text-sm text-green-700">
                📄 {excelFile.name}
              </div>
            ) : (
              <div className="rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate-500">
                No file selected
              </div>
            )}

            <button
              disabled={!excelFile}
              onClick={handleExcelUpload}
              className={`rounded-lg px-4 py-2 text-white ${
                excelFile ? "bg-emerald-600" : "cursor-not-allowed bg-slate-400"
              }`}
            >
              Upload Excel
            </button>

            <button
              onClick={() => setOpen(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white"
            >
              Add Question
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-6">
          <div className="rounded-lg bg-slate-100 p-4">
            <p className="text-sm text-slate-500">Questions</p>

            <p className="text-2xl font-bold">{questions.length}</p>
          </div>

          <div className="rounded-lg bg-slate-100 p-4">
            <p className="text-sm text-slate-500">Question Marks</p>

            <p className="text-2xl font-bold">{totalQuestionMarks}</p>
          </div>

          <div className="rounded-lg bg-green-100 p-4">
            <p className="text-sm text-green-700">Easy</p>

            <p className="text-2xl font-bold text-green-700">{easyQuestions}</p>
          </div>

          <div className="rounded-lg bg-yellow-100 p-4">
            <p className="text-sm text-yellow-700">Medium</p>

            <p className="text-2xl font-bold text-yellow-700">
              {mediumQuestions}
            </p>
          </div>

          <div className="rounded-lg bg-red-100 p-4">
            <p className="text-sm text-red-700">Hard</p>

            <p className="text-2xl font-bold text-red-700">{hardQuestions}</p>
          </div>

          <div className="rounded-lg bg-blue-100 p-4">
            <p className="text-sm text-blue-700">Duration</p>

            <p className="text-2xl font-bold text-blue-700">{test.duration}m</p>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border p-3"
          />

          <select
            title="difficulty"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="rounded-lg border p-3"
          >
            <option value="ALL">All</option>

            <option value="EASY">Easy</option>

            <option value="MEDIUM">Medium</option>

            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Questions</h2>

        {questions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center">
            <p className="text-slate-500">No questions added yet</p>

            <p className="mt-2 text-sm text-slate-400">
              Click "Add Question" to create your first question
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((question: any, index: number) => (
              <div
                key={question.id}
                className="rounded-xl border bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Q{index + 1}. {question.question}
                    </h3>
                    {question.questionImage && (
                      <img
                        src={question.questionImage}
                        alt="Question"
                        className="mt-4 max-h-64 rounded-lg border"
                      />
                    )}

                    <div className="mt-4 space-y-2">
                      <p>
                        <span className="font-medium">A.</span>{" "}
                        {question.optionA}
                      </p>

                      <p>
                        <span className="font-medium">B.</span>{" "}
                        {question.optionB}
                      </p>

                      <p>
                        <span className="font-medium">C.</span>{" "}
                        {question.optionC}
                      </p>

                      <p>
                        <span className="font-medium">D.</span>{" "}
                        {question.optionD}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                        Correct: {question.correctAnswer}
                      </span>

                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                        {question.marks} Marks
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-sm ${
                          question.difficulty === "EASY"
                            ? "bg-green-100 text-green-700"
                            : question.difficulty === "MEDIUM"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {question.difficulty}
                      </span>
                    </div>

                    {question.explanation && (
                      <div className="mt-4 rounded-lg bg-slate-50 p-3">
                        <p className="text-sm font-medium">Explanation</p>

                        <p className="mt-1 text-sm text-slate-600">
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
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
                      className="rounded bg-amber-500 px-3 py-2 text-white"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="rounded bg-red-600 px-3 py-2 text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6">
            <h2 className="mb-6 text-2xl font-bold">Add Question</h2>

            <div className="space-y-4">
              <textarea
                placeholder="Question"
                className="w-full rounded border p-3"
                rows={4}
                value={questionForm.question}
                onChange={(e) =>
                  setQuestionForm({
                    ...questionForm,
                    question: e.target.value,
                  })
                }
              />

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Question Image
                </label>

                <input
                  title="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setQuestionImage(e.target.files?.[0] || null)
                  }
                  className="w-full rounded border p-3"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  placeholder="Option A"
                  className="rounded border p-3"
                  value={questionForm.optionA}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      optionA: e.target.value,
                    })
                  }
                />

                <input
                  placeholder="Option B"
                  className="rounded border p-3"
                  value={questionForm.optionB}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      optionB: e.target.value,
                    })
                  }
                />

                <input
                  placeholder="Option C"
                  className="rounded border p-3"
                  value={questionForm.optionC}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      optionC: e.target.value,
                    })
                  }
                />

                <input
                  placeholder="Option D"
                  className="rounded border p-3"
                  value={questionForm.optionD}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      optionD: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <select
                  title="correctAnswer"
                  value={questionForm.correctAnswer}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      correctAnswer: e.target.value,
                    })
                  }
                  className="rounded border p-3"
                >
                  <option value="A">Answer A</option>
                  <option value="B">Answer B</option>
                  <option value="C">Answer C</option>
                  <option value="D">Answer D</option>
                </select>

                <select
                  title="level"
                  value={questionForm.difficulty}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      difficulty: e.target.value,
                    })
                  }
                  className="rounded border p-3"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>

                <input
                  type="number"
                  placeholder="Marks"
                  className="rounded border p-3"
                  value={questionForm.marks}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      marks: Number(e.target.value),
                    })
                  }
                />
              </div>

              <textarea
                placeholder="Explanation"
                rows={3}
                className="w-full rounded border p-3"
                value={questionForm.explanation}
                onChange={(e) =>
                  setQuestionForm({
                    ...questionForm,
                    explanation: e.target.value,
                  })
                }
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="rounded border px-4 py-2"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveQuestion}
                className="rounded bg-blue-600 px-4 py-2 text-white"
              >
                {editingQuestion ? "Update Question" : "Save Question"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
