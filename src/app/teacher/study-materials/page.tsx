"use client";

import { useEffect, useState } from "react";

import { getMyProfile } from "@/services/teacher.service";

import {
  getChaptersBySubject,
  createChapter,
  updateChapter,
  deleteChapter,
} from "@/services/chapter.service";

import {
  getContentsByChapter,
  createContent,
  updateContent,
  deleteContent,
} from "@/services/content.service";

import {
  getResources,
  createResource,
  updateResource,
  deleteResource,
  uploadResourceFile,
} from "@/services/resource.service";

export default function studyMaterialsPage() {
  const [teacher, setTeacher] = useState<any>(null);

  const [chapterOpen, setChapterOpen] = useState(false);

  const [editingChapter, setEditingChapter] = useState<any>(null);

  const [chapterForm, setChapterForm] = useState({
    name: "",
    description: "",
    chapterNo: 1,
  });

  const [selectedClass, setSelectedClass] = useState("");

  const [selectedSubject, setSelectedSubject] = useState("");

  const [chapters, setChapters] = useState<any[]>([]);

  const [resources, setResources] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  console.log("TEACHER SUBJECTS", teacher?.subjects);
  console.log("SELECTED SUBJECT", selectedSubject);

  const handleSaveChapter = async () => {
    try {
      setLoading(true);
      console.log("TEACHER SUBJECTS", teacher?.subjects);
      const payload = {
        name: chapterForm.name,

        description: chapterForm.description,

        chapterNo: chapterForm.chapterNo,

        subjectId: selectedSubject,
      };

      if (editingChapter) {
        await updateChapter(editingChapter.id, payload);
      } else {
        console.log("CHAPTER PAYLOAD", payload);
        console.log("SELECTED SUBJECT", selectedSubject);
        await createChapter(payload);
      }

      const result = await getChaptersBySubject(selectedSubject);

      setChapters(result.data);

      setChapterOpen(false);

      setEditingChapter(null);

      setChapterForm({
        name: "",
        description: "",
        chapterNo: 1,
      });
    } catch (error: any) {
      console.error(error);

      console.log("BACKEND ERROR:", error?.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChapter = async (id: string) => {
    const confirmed = window.confirm("Delete chapter?");

    if (!confirmed) return;

    try {
      await deleteChapter(id);

      setChapters((prev) => prev.filter((chapter) => chapter.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const result = await getMyProfile();

        setTeacher(result.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTeacher();
  }, []);

  useEffect(() => {
    if (!selectedSubject) return;

    const fetchChapters = async () => {
      const result = await getChaptersBySubject(selectedSubject);

      setChapters(result.data);
    };

    fetchChapters();
  }, [selectedSubject]);

  useEffect(() => {
    const fetchResources = async () => {
      const result = await getResources();

      setResources(result.data);
    };

    fetchResources();
  }, []);

  const filteredSubjects =
    teacher?.subjects?.filter(
      (subject: any) => subject.classId === selectedClass,
    ) || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Study Materials</h1>

        <p className="mt-2 text-slate-500">
          Manage Chapters, Contents and Resources
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <select
          title="class"
          className="rounded border p-3"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">Select Class</option>

          {teacher?.classes?.map((cls: any) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
              {" • "}
              {cls.board?.name}
            </option>
          ))}
        </select>

        <select
          title="subject"
          className="rounded border p-3"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="">Select Subject</option>

          {filteredSubjects.map((subject: any) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6 flex justify-start">
        <button
          onClick={() => {
            setEditingChapter(null);

            setChapterForm({
              name: "",
              description: "",
              chapterNo: 1,
            });

            setChapterOpen(true);
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          Create Chapter
        </button>
      </div>

      <div className="space-y-4">
        {chapters.map((chapter) => (
          <div key={chapter.id} className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold">{chapter.name}</h2>

            <p className="mt-2 text-slate-500">
              Chapter No: {chapter.chapterNo}
            </p>

            <div className="mt-4 flex gap-2">
              <button className="rounded bg-blue-600 px-3 py-2 text-white">
                Add Content
              </button>

              <button
                className="rounded bg-amber-500 px-3 py-2 text-white"
                onClick={() => {
                  setEditingChapter(chapter);

                  setChapterForm({
                    name: chapter.name,
                    description: chapter.description,
                    chapterNo: chapter.chapterNo,
                  });

                  setChapterOpen(true);
                }}
              >
                Edit
              </button>

              <button
                onClick={() => handleDeleteChapter(chapter.id)}
                className="rounded bg-red-600 px-3 py-2 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {chapterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white p-6">
            <h2 className="mb-4 text-2xl font-bold">
              {editingChapter ? "Edit Chapter" : "Create Chapter"}
            </h2>

            <div className="space-y-4">
              <input
                placeholder="Chapter Title"
                className="w-full rounded border p-3"
                value={chapterForm.name}
                onChange={(e) =>
                  setChapterForm({
                    ...chapterForm,
                    name: e.target.value,
                  })
                }
              />

              <textarea
                placeholder="Description"
                className="w-full rounded border p-3"
                value={chapterForm.description}
                onChange={(e) =>
                  setChapterForm({
                    ...chapterForm,
                    description: e.target.value,
                  })
                }
              />
              <input
                type="number"
                placeholder="Chapter No"
                className="w-full rounded border p-3"
                value={chapterForm.chapterNo}
                onChange={(e) =>
                  setChapterForm({
                    ...chapterForm,
                    chapterNo: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setChapterOpen(false)}
                className="rounded border px-4 py-2"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveChapter}
                className="rounded bg-blue-600 px-4 py-2 text-white"
              >
                {editingChapter ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
