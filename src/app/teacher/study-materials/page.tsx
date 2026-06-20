"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [chapterOpen, setChapterOpen] = useState(false);

  const [editingChapter, setEditingChapter] = useState<any>(null);

  const [chapterForm, setChapterForm] = useState({
    name: "",
    description: "",
    chapterNo: 1,
  });

  const [stats, setStats] = useState({
    chapters: 0,
    contents: 0,
    resources: 0,
  });

  const [selectedClass, setSelectedClass] = useState("");

  const [selectedSubject, setSelectedSubject] = useState("");

  const [chapters, setChapters] = useState<any[]>([]);

  const [contentOpen, setContentOpen] = useState(false);

  const [selectedChapter, setSelectedChapter] = useState<any>(null);

  const [contentForm, setContentForm] = useState({
    title: "",
    description: "",
    orderNo: 1,
  });

  const [contentsMap, setContentsMap] = useState<Record<string, any[]>>({});

  const [resources, setResources] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const handleSaveChapter = async () => {
    try {
      setLoading(true);
      const payload = {
        name: chapterForm.name,

        description: chapterForm.description,

        chapterNo: chapterForm.chapterNo,

        subjectId: selectedSubject,
      };

      if (editingChapter) {
        await updateChapter(editingChapter.id, payload);
      } else {
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

  const handleCreateContent = async () => {
    try {
      await createContent({
        title: contentForm.title,

        description: contentForm.description,

        orderNo: contentForm.orderNo,

        chapterId: selectedChapter.id,
      });
      await loadContents(selectedChapter.id);
      alert("Content created");

      setContentOpen(false);

      setContentForm({
        title: "",
        description: "",
        orderNo: 1,
      });
    } catch (error) {
      console.error(error);
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

  const loadContents = async (chapterId: string) => {
    try {
      const result = await getContentsByChapter(chapterId);

      setContentsMap((prev) => ({
        ...prev,
        [chapterId]: result.data,
      }));
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
      const totalContents = Object.values(contentsMap).flat().length;

      const resourcesResult = await getResources();

      setStats({
        chapters: result.data.length,

        contents: totalContents,

        resources: resourcesResult.data.length,
      });

      for (const chapter of result.data) {
        await loadContents(chapter.id);
      }
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

  useEffect(() => {
    if (!teacher) return;

    if (teacher.classes?.length > 0 && !selectedClass) {
      setSelectedClass(teacher.classes[0].id);
    }
  }, [teacher]);

  useEffect(() => {
    const totalContents = Object.values(contentsMap).flat().length;

    setStats((prev) => ({
      ...prev,
      contents: totalContents,
    }));
  }, [contentsMap]);

  useEffect(() => {
    if (!teacher || !selectedClass) return;

    const firstSubject = teacher.subjects?.find(
      (subject: any) => subject.classId === selectedClass,
    );

    if (firstSubject && !selectedSubject) {
      setSelectedSubject(firstSubject.id);
    }
  }, [teacher, selectedClass]);

  const filteredSubjects =
    teacher?.subjects?.filter(
      (subject: any) => subject.classId === selectedClass,
    ) || [];

  return (
    <div>
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-slate-500">Chapters</p>

          <p className="text-3xl font-bold">{stats.chapters}</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-slate-500">Contents</p>

          <p className="text-3xl font-bold">{stats.contents}</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-slate-500">Resources</p>

          <p className="text-3xl font-bold">{stats.resources}</p>
        </div>
      </div>
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
        {chapters.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow">
            <h3 className="text-xl font-semibold">No Chapters Found</h3>

            <p className="mt-2 text-slate-500">
              Create your first chapter to start building study materials.
            </p>
          </div>
        ) : (
          chapters.map((chapter) => (
            <div key={chapter.id} className="rounded-xl bg-white p-6 shadow">
              <h2 className="text-xl font-bold">{chapter.name}</h2>

              <p className="mt-2 text-slate-500">
                Chapter No: {chapter.chapterNo}
              </p>

              <div className="mt-4">
                <p className="text-sm text-slate-500">
                  Contents: {contentsMap[chapter.id]?.length || 0}
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() =>
                    router.push(
                      `/teacher/study-materials/chapter/${chapter.id}`,
                    )
                  }
                  className="rounded bg-blue-600 px-3 py-2 text-white"
                >
                  Manage
                </button>

                <button
                  onClick={() => {
                    setEditingChapter(chapter);

                    setChapterForm({
                      name: chapter.name,
                      description: chapter.description || "",
                      chapterNo: chapter.chapterNo,
                    });

                    setChapterOpen(true);
                  }}
                  className="rounded bg-amber-500 px-3 py-2 text-white"
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
          ))
        )}
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

      {contentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white p-6">
            <h2 className="mb-4 text-2xl font-bold">Create Content</h2>

            <div className="space-y-4">
              <input
                placeholder="Content Title"
                className="w-full rounded border p-3"
                value={contentForm.title}
                onChange={(e) =>
                  setContentForm({
                    ...contentForm,
                    title: e.target.value,
                  })
                }
              />

              <textarea
                placeholder="Description"
                className="w-full rounded border p-3"
                value={contentForm.description}
                onChange={(e) =>
                  setContentForm({
                    ...contentForm,
                    description: e.target.value,
                  })
                }
              />

              <input
                type="number"
                placeholder="Order No"
                className="w-full rounded border p-3"
                value={contentForm.orderNo}
                onChange={(e) =>
                  setContentForm({
                    ...contentForm,
                    orderNo: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setContentOpen(false)}
                className="rounded border px-4 py-2"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateContent}
                className="rounded bg-blue-600 px-4 py-2 text-white"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
