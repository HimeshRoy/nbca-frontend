"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaVideo,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaEye,
  FaTimes,
  FaChalkboardTeacher,
  FaBook,
} from "react-icons/fa";

import {
  getLiveClasses,
  getLiveClassStats,
  createLiveClass,
  updateLiveClass,
  deleteLiveClass,
} from "@/services/live-class.service";
import { getMyProfile } from "@/services/teacher.service";

export default function LiveClassPage() {
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [teacher, setTeacher] = useState<any>(null);

  const [open, setOpen] = useState(false);
  const [editingLiveClass, setEditingLiveClass] = useState<any>(null);

  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    classId: "",
    subjectId: "",
    startTime: "",
    endTime: "",
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      classId: "",
      subjectId: "",
      startTime: "",
      endTime: "",
    });
    setEditingLiveClass(null);
  };

  const handleCreateLiveClass = async () => {
    try {
      setIsSaving(true);
      const payload = {
        title: formData.title,
        description: formData.description,
        classId: formData.classId,
        subjectId: formData.subjectId,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
      };

      if (editingLiveClass) {
        await updateLiveClass(editingLiveClass.id, payload);
        toast.success("Live class updated successfully");
      } else {
        await createLiveClass(payload);
        toast.success("Live class scheduled successfully");
      }

      const result = await getLiveClasses();
      setLiveClasses(result.data);

      const statsResult = await getLiveClassStats();
      setStats(statsResult.data);

      resetForm();
      setOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to save live class",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const filteredSubjects =
    teacher?.subjects?.filter(
      (subject: any) => subject.classId === formData.classId,
    ) || [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsFetching(true);
        const [classesResult, statsResult, profileResult] = await Promise.all([
          getLiveClasses(),
          getLiveClassStats(),
          getMyProfile(),
        ]);

        setLiveClasses(classesResult.data);
        setStats(statsResult.data);
        setTeacher(profileResult.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load live classes data");
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (liveClassId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this live class? This action cannot be undone.",
    );
    if (!confirmed) return;

    try {
      await deleteLiveClass(liveClassId);
      setLiveClasses((prev) => prev.filter((item) => item.id !== liveClassId));

      const statsResult = await getLiveClassStats();
      setStats(statsResult.data);

      toast.success("Live class deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete live class");
    }
  };

  if (isFetching) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
          <p className="font-medium">Loading live classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Live Classes</h1>
          <p className="mt-1 text-slate-500">
            Schedule and manage your interactive video sessions.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
        >
          <FaPlus /> Create Live Class
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-blue-50 p-6 border border-blue-100 flex flex-col justify-center transition-transform hover:scale-[1.02]">
          <p className="flex items-center gap-2 text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">
            <FaVideo /> Total Classes
          </p>
          <p className="text-4xl font-black text-blue-700">
            {stats?.totalClasses || 0}
          </p>
        </div>

        <div className="rounded-3xl bg-amber-50 p-6 border border-amber-100 flex flex-col justify-center transition-transform hover:scale-[1.02]">
          <p className="flex items-center gap-2 text-sm font-bold text-amber-600 uppercase tracking-wider mb-2">
            <FaClock /> Upcoming
          </p>
          <p className="text-4xl font-black text-amber-700">
            {stats?.upcomingClasses || 0}
          </p>
        </div>

        <div className="rounded-3xl bg-emerald-50 p-6 border border-emerald-100 flex flex-col justify-center transition-transform hover:scale-[1.02]">
          <p className="flex items-center gap-2 text-sm font-bold text-emerald-600 uppercase tracking-wider mb-2">
            <FaCheckCircle /> Completed Classes
          </p>
          <p className="text-4xl font-black text-emerald-700">
            {stats?.completedClasses || 0}
          </p>
        </div>
      </div>

      {liveClasses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="p-5 bg-blue-50 rounded-full mb-4 text-blue-500 text-3xl">
            <FaVideo />
          </div>
          <h3 className="text-xl font-bold text-slate-700">
            No Live Classes Scheduled
          </h3>
          <p className="mt-2 text-slate-500 max-w-md">
            You don't have any upcoming or past live classes. Click the button
            above to schedule your first session.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {liveClasses.map((cls) => {
            const now = new Date();
            const startTime = new Date(cls.startTime);
            const endTime = new Date(cls.endTime);

            const isUpcoming = now < startTime;
            const isLive = now >= startTime && now <= endTime;
            const isCompleted = now > endTime;

            return (
              <div
                key={cls.id}
                className="group flex flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-100"
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h2 className="text-xl font-bold text-slate-800 leading-snug line-clamp-2">
                      {cls.title}
                    </h2>
                    <span
                      className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        isLive
                          ? "bg-red-50 text-red-600 border border-red-100"
                          : isUpcoming
                            ? "bg-amber-50 text-amber-600 border border-amber-100"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                    >
                      {isLive
                        ? "Live Now"
                        : isUpcoming
                          ? "Upcoming"
                          : "Completed"}
                    </span>
                  </div>

                  <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px] mb-5">
                    {cls.description || "No description provided."}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-100">
                      <FaChalkboardTeacher /> {cls.class?.name}
                    </span>
                    <span className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
                      <FaBook /> {cls.subject?.name}
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 mb-6 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <FaCalendarAlt className="text-slate-400" />
                      <span className="font-semibold text-slate-700">
                        {new Date(cls.startTime).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FaClock className="text-slate-400" />
                      <span className="text-slate-600">
                        {new Date(cls.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" - "}
                        {new Date(cls.endTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100">
                  <Link
                    href={`/teacher/live-classes/${cls.id}/classroom`}
                    className={`col-span-2 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-colors ${
                      isLive
                        ? "bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg"
                        : isUpcoming
                          ? "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                          : "bg-slate-400 hover:bg-slate-500"
                    }`}
                  >
                    <FaVideo />
                    {isLive
                      ? "Enter Live Classroom"
                      : isUpcoming
                        ? "Enter Classroom"
                        : "Open Classroom"}
                  </Link>

                  <Link
                    href={`/teacher/live-classes/${cls.id}`}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200"
                  >
                    <FaEye /> Details
                  </Link>

                  <div className="flex gap-2">
                    <button
                      disabled={isLive}
                      onClick={() => {
                        if (isLive) return;

                        setEditingLiveClass(cls);
                        setFormData({
                          title: cls.title,
                          description: cls.description || "",
                          classId: cls.classId,
                          subjectId: cls.subjectId,
                          startTime: new Date(cls.startTime)
                            .toISOString()
                            .slice(0, 16),
                          endTime: new Date(cls.endTime)
                            .toISOString()
                            .slice(0, 16),
                        });
                        setOpen(true);
                      }}
                      className="flex-1 flex items-center justify-center rounded-xl bg-amber-50 px-3 py-2 text-amber-600 transition-colors hover:bg-amber-500 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Edit Class"
                    >
                      <FaEdit />
                    </button>
                    <button
                      disabled={isLive}
                      onClick={() => {
                        if (isLive) return;
                        handleDelete(cls.id);
                      }}
                      className="flex-1 flex items-center justify-center rounded-xl bg-rose-50 px-3 py-2 text-rose-600 transition-colors hover:bg-rose-600 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Delete Class"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/90 backdrop-blur px-8 py-5 rounded-t-3xl">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {editingLiveClass ? "Edit Live Class" : "Schedule Live Class"}
                </h2>
                <p className="text-sm text-slate-500">
                  Set up the details for your virtual classroom session.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-8 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Class Title
                </label>
                <input
                  placeholder="e.g., Algebra Revision Session"
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-slate-800"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="What will be covered in this session?"
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none text-sm"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Target Class
                  </label>
                  <select
                    title="class"
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white text-sm cursor-pointer"
                    value={formData.classId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        classId: e.target.value,
                        subjectId: "",
                      })
                    }
                  >
                    <option value="">Select Class</option>
                    {teacher?.classes?.map((cls: any) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.board?.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Subject
                  </label>
                  <select
                    title="subject"
                    disabled={!formData.classId}
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white text-sm cursor-pointer disabled:opacity-50 disabled:bg-slate-50"
                    value={formData.subjectId}
                    onChange={(e) =>
                      setFormData({ ...formData, subjectId: e.target.value })
                    }
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

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Start Time
                  </label>
                  <input
                    title="starttime"
                    type="datetime-local"
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    End Time
                  </label>
                  <input
                    title="endtime"
                    type="datetime-local"
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                  />
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
                onClick={handleCreateLiveClass}
                disabled={
                  isSaving ||
                  !formData.title ||
                  !formData.classId ||
                  !formData.subjectId ||
                  !formData.startTime ||
                  !formData.endTime
                }
                className="rounded-xl bg-blue-600 px-8 py-2.5 font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving
                  ? "Saving..."
                  : editingLiveClass
                    ? "Update Session"
                    : "Schedule Session"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
