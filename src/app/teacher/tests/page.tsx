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
import { _isoDateTime } from "zod/v4/core";

export default function TestsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [teacher, setTeacher] = useState<any>(null);

  const [boards, setBoards] = useState<any[]>([]);

  const [classes, setClasses] = useState<any[]>([]);

  const [subjects, setSubjects] = useState<any[]>([]);

  const [chapters, setChapters] = useState<any[]>([]);

  const [editingTest, setEditingTest] = useState<any>(null);

  const [loading, setLoading] = useState(false);

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
    const result = await getTests();

    setTests(result.data);
  };

  const handleSaveTest = async () => {
    try {
      setLoading(true);

      if (editingTest) {
        await updateTest(editingTest.id, formData);
      } else {
        await createTest(formData);
      }

      await loadTests();

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

      setEditingTest(null);

      setOpen(false);
    } catch (error: any) {
      console.error(error);

      console.log("BACKEND ERROR:", error?.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (id: string) => {
    const confirmed = window.confirm("Delete test?");

    if (!confirmed) return;

    try {
      await deleteTest(id);

      await loadTests();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const boardsResult = await getBoards();

      const classesResult = await getClasses();

      const subjectsResult = await getSubjects();

      setBoards(boardsResult.data);

      setClasses(classesResult.data);

      setSubjects(subjectsResult.data);
    };

    loadData();
  }, []);

  useEffect(() => {
    const loadTeacher = async () => {
      const result = await getMyProfile();

      setTeacher(result.data);
    };

    loadTeacher();
  }, []);

  useEffect(() => {
    if (!formData.subjectId) return;

    const loadChapters = async () => {
      const result = await getChaptersBySubject(formData.subjectId);

      setChapters(result.data);
    };

    loadChapters();
  }, [formData.subjectId]);

  useEffect(() => {
    loadTests();
  }, []);

  const filteredSubjects =
    teacher?.subjects?.filter(
      (subject: any) => subject.classId === formData.classId,
    ) || [];

  const teacherBoards =
    teacher?.classes?.reduce((acc: any[], cls: any) => {
      if (!acc.find((b) => b.id === cls.board.id)) {
        acc.push(cls.board);
      }

      return acc;
    }, []) || [];

  return (
    <div>
      <div className="mb-6 flex justify-between">
      <h1 className="mb-6 text-3xl font-bold">Tests</h1>
      <div>
        <button
          onClick={() => {
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

            setOpen(true);
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white cursor-pointer"
        >
          Create Test
        </button>
        </div>
      </div>
      <div className="space-y-4 grid md:grid-cols-2">
        {tests.map((test) => (
          <div
            key={test.id}
            className="rounded-2xl border bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">{test.title}</h2>

                <p className="mt-1 text-sm text-slate-500">
                  {test.description}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  test.isPublished
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {test.isPublished ? "Published" : "Draft"}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-500">Board</span>
                <p>{test.board?.name}</p>
              </div>

              <div>
                <span className="text-slate-500">Class</span>
                <p>{test.class?.name}</p>
              </div>

              <div>
                <span className="text-slate-500">Subject</span>
                <p>{test.subject?.name}</p>
              </div>

              <div>
                <span className="text-slate-500">Chapter</span>
                <p>{test.chapter?.name || "All Chapters"}</p>
              </div>

              <div>
                <span className="text-slate-500">Start Time</span>
                <p>
                  {test.startTime
                      ? new Date(
                          test.startTime,
                        ).toLocaleString()
                      : "-"}
                </p>
              </div>
              <div>
                <span className="text-slate-500">End Time</span>
                <p>{test.endTime
                      ? new Date(
                          test.endTime,
                        ).toLocaleString()
                      : "-"} 
                  </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded bg-slate-100 px-3 py-1 text-sm">
                ⏱ {test.duration} mins
              </span>

              <span className="rounded bg-slate-100 px-3 py-1 text-sm">
                📝 {test.totalMarks} marks
              </span>

              <span className="rounded bg-slate-100 px-3 py-1 text-sm">
                ❓ {test._count?.questions || 0} Questions
              </span>

              <span className="rounded bg-slate-100 px-3 py-1 text-sm">
                👨‍🎓 {test._count?.attempts || 0} Attempts
              </span>
            </div>

            <div className="mt-4 flex gap-2">
              <Link
                href={`/teacher/tests/${test.id}`}
                className="rounded bg-blue-600 px-3 py-2 text-white"
              >
                Manage Questions
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

                    startTime: test.startTime
                      ? test.startTime.slice(0, 16)
                      : "",

                    endTime: test.endTime ? test.endTime.slice(0, 16) : "",

                    shuffleQuestions: test.shuffleQuestions || false,

                    shuffleOptions: test.shuffleOptions || false,

                    isPublished: test.isPublished || false,
                  });

                  setOpen(true);
                }}
                className="rounded bg-amber-500 px-3 py-2 text-white"
              >
                Edit
              </button>

              <button
                onClick={() => handleDeleteTest(test.id)}
                className="rounded bg-red-600 px-3 py-2 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
          <div className="min-h-screen p-6 flex items-start justify-center">
            <div className="w-full max-w-xl rounded-2xl p-4 bg-white shadow-xl">
              <div className="sticky top-0 z-10 border-b border-black/10 bg-white px-8 py-5">
                <h2 className="text-3xl font-bold">
                  {editingTest ? "Edit Test" : "Create Test"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Configure your exam details, schedule and settings
                </p>
              </div>

              <div className="p-4 space-y-8">
                <div className="rounded-xl border p-6 space-y-4">
                  <h3 className="mb-4 text-lg font-semibold">
                    📘 Test Information
                  </h3>

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
                </div>

                <div className="rounded-xl border p-6 space-y-4">
                  <h3 className="mb-4 text-lg font-semibold">
                    🎓 Academic Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      title="board"
                      className="w-full rounded border p-3"
                      value={formData.boardId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          boardId: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Board</option>
                      {teacherBoards.map((board: any) => (
                        <option key={board.id} value={board.id}>
                          {board.name}
                        </option>
                      ))}
                    </select>

                    <select
                      title="class"
                      value={formData.classId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          classId: e.target.value,
                        })
                      }
                      className="w-full rounded border p-3"
                    >
                      <option value="">Select Class</option>

                      {teacher?.classes?.map((cls: any) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name} ({cls.board?.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <select
                    title="subject"
                    value={formData.subjectId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        subjectId: e.target.value,
                      })
                    }
                    className="w-full rounded border p-3"
                  >
                    <option value="">Select Subject</option>

                    {filteredSubjects.map((subject: any) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>

                  <select
                    title="chapter"
                    value={formData.chapterId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        chapterId: e.target.value,
                      })
                    }
                    className="w-full rounded border p-3"
                  >
                    <option value="">Select Chapter</option>

                    {chapters.map((chapter) => (
                      <option key={chapter.id} value={chapter.id}>
                        {chapter.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-xl border p-6">
                  <h3 className="mb-4 text-lg font-semibold">
                    ⚙️ Exam Settings
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="mb-1 block text-sm font-medium">
                      Duration (Minutes)
                      <input
                        type="number"
                        placeholder="Duration"
                        className="w-full rounded border p-3"
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            duration: Number(e.target.value),
                          })
                        }
                      />
                    </label>

                    <label className="mb-1 block text-sm font-medium">
                      Total Marks
                      <input
                        type="number"
                        placeholder="Total Marks"
                        className="w-full rounded border p-3"
                        value={formData.totalMarks}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            totalMarks: Number(e.target.value),
                          })
                        }
                      />
                    </label>

                    <label className="mb-1 block text-sm font-medium">
                      Passing Makrs
                      <input
                        type="number"
                        placeholder="Passing Marks"
                        className="w-full rounded border p-3"
                        value={formData.passingMarks}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            passingMarks: Number(e.target.value),
                          })
                        }
                      />
                    </label>

                    <label className="mb-1 block text-sm font-medium">
                      Negative Marks
                      <input
                        type="number"
                        placeholder="Negative Marks"
                        className="w-full rounded border p-3"
                        value={formData.negativeMarks}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            negativeMarks: Number(e.target.value),
                          })
                        }
                      />
                    </label>
                  </div>
                </div>

                <div className="rounded-xl border p-6">
                  <h3 className="mb-4 text-lg font-semibold">📅 Schedule</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="mb-1 block text-sm font-medium">
                      Start Date & Time
                      <input
                        title="time"
                        type="datetime-local"
                        value={formData.startTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startTime: e.target.value,
                          })
                        }
                        className="w-full rounded border p-3"
                      />
                    </label>

                    <label className="mb-1 block text-sm font-medium">
                      End Date & Time
                      <input
                        title="time"
                        type="datetime-local"
                        value={formData.endTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            endTime: e.target.value,
                          })
                        }
                        className="w-full rounded border p-3"
                      />
                    </label>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold mb-4">Test Options</h3>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.shuffleQuestions}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            shuffleQuestions: e.target.checked,
                          })
                        }
                      />
                      Shuffle Questions
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.shuffleOptions}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            shuffleOptions: e.target.checked,
                          })
                        }
                      />
                      Shuffle Options
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.isPublished}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isPublished: e.target.checked,
                          })
                        }
                      />
                      Publish Test
                    </label>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 flex justify-end gap-3 border-t border-black/10 bg-white px-8 py-4">
                <button
                  onClick={() => setOpen(false)}
                  className="rounded border px-4 py-2"
                >
                  Cancel
                </button>

                <button
                  disabled={loading}
                  onClick={handleSaveTest}
                  className="rounded bg-blue-600 px-4 py-2 text-white"
                >
                  {editingTest ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
