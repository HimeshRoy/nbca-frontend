"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  FaBook,
  FaFileAlt,
  FaLayerGroup,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCog,
  FaTimes,
  FaFilter,
  FaChalkboardTeacher,
  FaFolderOpen
} from "react-icons/fa";

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
} from "@/services/content.service";
import {
  getResources,
} from "@/services/resource.service";

export default function StudyMaterialsPage() {
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
  const [isFetching, setIsFetching] = useState(true);

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
        toast.success("Chapter updated successfully");
      } else {
        await createChapter(payload);
        toast.success("Chapter created successfully");
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
      toast.error(error?.response?.data?.message || "Failed to save chapter");
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
      
      toast.success("Content created successfully");
      setContentOpen(false);
      setContentForm({
        title: "",
        description: "",
        orderNo: 1,
      });
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to create content");
    }
  };

  const handleDeleteChapter = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this chapter? This action cannot be undone.");
    if (!confirmed) return;

    try {
      await deleteChapter(id);
      setChapters((prev) => prev.filter((chapter) => chapter.id !== id));
      toast.success("Chapter deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete chapter");
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
        toast.error("Failed to load profile");
      } finally {
        setIsFetching(false);
      }
    };
    fetchTeacher();
  }, []);

  useEffect(() => {
    if (!selectedSubject) return;

    const fetchChapters = async () => {
      try {
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
      } catch (error) {
        console.error("Error fetching chapters:", error);
      }
    };

    fetchChapters();
  }, [selectedSubject]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const result = await getResources();
        setResources(result.data);
      } catch (error) {
        console.error("Error fetching resources", error);
      }
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

  const filteredSubjects = teacher?.subjects?.filter(
    (subject: any) => subject.classId === selectedClass,
  ) || [];

  if (isFetching) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
          <p className="font-medium">Loading study materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10 max-w-7xl mx-auto space-y-8">
    
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Study Materials</h1>
          <p className="mt-1 text-slate-500">Manage Chapters, Contents and Resources.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-blue-50 p-6 border border-blue-100 flex flex-col justify-center transition-transform hover:scale-[1.02]">
          <p className="flex items-center gap-2 text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">
            <FaFolderOpen /> Total Chapters
          </p>
          <p className="text-4xl font-black text-blue-700">{stats.chapters}</p>
        </div>

        <div className="rounded-3xl bg-amber-50 p-6 border border-amber-100 flex flex-col justify-center transition-transform hover:scale-[1.02]">
          <p className="flex items-center gap-2 text-sm font-bold text-amber-600 uppercase tracking-wider mb-2">
            <FaLayerGroup /> Total Contents
          </p>
          <p className="text-4xl font-black text-amber-700">{stats.contents}</p>
        </div>

        <div className="rounded-3xl bg-emerald-50 p-6 border border-emerald-100 flex flex-col justify-center transition-transform hover:scale-[1.02]">
          <p className="flex items-center gap-2 text-sm font-bold text-emerald-600 uppercase tracking-wider mb-2">
            <FaFileAlt /> Total Resources
          </p>
          <p className="text-4xl font-black text-emerald-700">{stats.resources}</p>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 items-end">
        <div className="flex-1 w-full grid sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <FaChalkboardTeacher className="text-slate-400" /> Target Class
            </label>
            <select
              title="class"
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 cursor-pointer text-sm"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Select Class</option>
              {teacher?.classes?.map((cls: any) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} • {cls.board?.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <FaBook className="text-slate-400" /> Subject
            </label>
            <select
              title="subject"
              disabled={!selectedClass}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
        </div>

        <button
          onClick={() => {
            if (!selectedSubject) {
              toast.error("Please select a subject first");
              return;
            }
            setEditingChapter(null);
            setChapterForm({ name: "", description: "", chapterNo: chapters.length + 1 });
            setChapterOpen(true);
          }}
          className="w-full md:w-auto flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg whitespace-nowrap"
        >
          <FaPlus /> Create Chapter
        </button>
      </div>

      <div className="space-y-4">
        {!selectedSubject ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="p-5 bg-slate-100 rounded-full mb-4 text-slate-400 text-3xl">
              <FaFilter />
            </div>
            <h3 className="text-xl font-bold text-slate-700">Select a Subject</h3>
            <p className="mt-2 text-slate-500 max-w-md">Please select a class and subject above to view or manage chapters.</p>
          </div>
        ) : chapters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="p-5 bg-blue-50 rounded-full mb-4 text-blue-500 text-3xl">
              <FaFolderOpen />
            </div>
            <h3 className="text-xl font-bold text-slate-700">No Chapters Found</h3>
            <p className="mt-2 text-slate-500 max-w-md">You haven't created any chapters for this subject yet. Click the "Create Chapter" button to get started.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {chapters.map((chapter) => (
              <div key={chapter.id} className="group flex flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-100 relative overflow-hidden">

                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-transparent opacity-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-700 border border-blue-100">
                      {chapter.chapterNo}
                    </span>
                    <h2 className="text-xl font-bold text-slate-800 leading-snug line-clamp-2">
                      {chapter.name}
                    </h2>
                  </div>

                  <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px] mb-6">
                    {chapter.description || "No description provided."}
                  </p>

                  <div className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-100">
                    <FaLayerGroup className="text-slate-400" />
                    Contents: <span className="text-slate-800 font-bold">{contentsMap[chapter.id]?.length || 0}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-6 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => router.push(`/teacher/study-materials/chapter/${chapter.id}`)}
                    className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-blue-50 px-2 py-2.5 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
                  >
                    <FaCog className="text-lg" /> Manage
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
                    className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-amber-50 px-2 py-2.5 text-xs font-bold text-amber-600 transition-colors hover:bg-amber-500 hover:text-white"
                  >
                    <FaEdit className="text-lg" /> Edit
                  </button>

                  <button
                    onClick={() => handleDeleteChapter(chapter.id)}
                    className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-rose-50 px-2 py-2.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-600 hover:text-white"
                  >
                    <FaTrash className="text-lg" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {chapterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 px-8 py-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {editingChapter ? "Edit Chapter" : "Create Chapter"}
                </h2>
                <p className="text-sm text-slate-500 mt-1">Organize your study materials effectively.</p>
              </div>
              <button 
                onClick={() => setChapterOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Chapter Title</label>
                <input
                  placeholder="e.g., Real Numbers"
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-slate-800"
                  value={chapterForm.name}
                  onChange={(e) => setChapterForm({ ...chapterForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description (Optional)</label>
                <textarea
                  placeholder="What is this chapter about?"
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none text-sm"
                  value={chapterForm.description}
                  onChange={(e) => setChapterForm({ ...chapterForm, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Chapter Number</label>
                <input
                  type="number"
                  min="1"
                  placeholder="1"
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                  value={chapterForm.chapterNo}
                  onChange={(e) => setChapterForm({ ...chapterForm, chapterNo: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-8 py-4 rounded-b-3xl">
              <button
                onClick={() => setChapterOpen(false)}
                className="rounded-xl px-5 py-2.5 font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChapter}
                disabled={loading || !chapterForm.name}
                className="rounded-xl bg-blue-600 px-8 py-2.5 font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : (editingChapter ? "Update Chapter" : "Create Chapter")}
              </button>
            </div>
          </div>
        </div>
      )}

      {contentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-8 py-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Add Content</h2>
                <p className="text-sm text-slate-500 mt-1">Add material to {selectedChapter?.name || 'this chapter'}</p>
              </div>
              <button 
                onClick={() => setContentOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Content Title</label>
                <input
                  placeholder="Title of the content"
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-slate-800"
                  value={contentForm.title}
                  onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                <textarea
                  placeholder="Description of the content"
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none text-sm"
                  value={contentForm.description}
                  onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Order / Sequence Number</label>
                <input
                  type="number"
                  min="1"
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                  value={contentForm.orderNo}
                  onChange={(e) => setContentForm({ ...contentForm, orderNo: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-8 py-4 rounded-b-3xl">
              <button
                onClick={() => setContentOpen(false)}
                className="rounded-xl px-5 py-2.5 font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateContent}
                disabled={!contentForm.title}
                className="rounded-xl bg-blue-600 px-8 py-2.5 font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Content
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}