"use client";

import { useEffect, useState } from "react";

import {
  getLiveClasses,
  getLiveClassStats,
  createLiveClass,
  updateLiveClass,
  deleteLiveClass,
} from "@/services/live-class.service";

import { getMyProfile } from "@/services/teacher.service";
import Link from "next/link";

export default function liveclassPage() {
  const [liveClasses, setLiveClasses] = useState<any[]>([]);

  const [stats, setStats] = useState<any>(null);

  const [teacher, setTeacher] = useState<any>(null);

  const [open, setOpen] = useState(false);

  const [editingLiveClass, setEditingLiveClass] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    meetingLink: "",
    classId: "",
    subjectId: "",
    startTime: "",
    endTime: "",
  });

  const handleCreateLiveClass = async () => {
    try {
      setLoading(true);

      const payload = {
        title: formData.title,
        description: formData.description,
        meetingLink: formData.meetingLink,

        classId: formData.classId,
        subjectId: formData.subjectId,

        startTime: new Date(formData.startTime).toISOString(),

        endTime: new Date(formData.endTime).toISOString(),
      };

      if (editingLiveClass) {
        await updateLiveClass(editingLiveClass.id, payload);
      } else {
        await createLiveClass(payload);
      }

      const result = await getLiveClasses();

      setLiveClasses(result.data);

      setFormData({
        title: "",
        description: "",
        meetingLink: "",
        classId: "",
        subjectId: "",
        startTime: "",
        endTime: "",
      });

      setEditingLiveClass(null);

      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects =
    teacher?.subjects?.filter(
      (subject: any) => subject.classId === formData.classId,
    ) || [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classesResult = await getLiveClasses();

        setLiveClasses(classesResult.data);

        const statsResult = await getLiveClassStats();

        setStats(statsResult.data);

        const profile = await getMyProfile();

        setTeacher(profile.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (liveClassId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this live class?",
    );

    if (!confirmed) return;

    try {
      await deleteLiveClass(liveClassId);

      setLiveClasses((prev) => prev.filter((item) => item.id !== liveClassId));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Classes</h1>

          <p className="mt-2 text-slate-500">Manage all live classes</p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          Create Live Class
        </button>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="text-sm text-slate-500">Total Classes</h3>

          <p className="mt-2 text-3xl font-bold">{stats?.totalClasses || 0}</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="text-sm text-slate-500">Upcoming</h3>

          <p className="mt-2 text-3xl font-bold">
            {stats?.upcomingClasses || 0}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="text-sm text-slate-500">Compeleted Class</h3>

          <p className="mt-2 text-3xl font-bold">
            {stats?.completedClasses || 0}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {liveClasses.map((cls) => (
          <div className="grid md:grid-cols-2 gap-4" key={null}>
            <div key={cls.id} className="rounded-xl bg-white p-6 shadow">
              <h2 className="text-xl font-semibold">{cls.title}</h2>

              <p className="mt-2 text-slate-600">{cls.description}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
                  {cls.class?.name}
                </span>

                <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
                  {cls.subject?.name}
                </span>
              </div>

              <div className="mt-4 text-sm text-slate-500">
                <p>Start: {new Date(cls.startTime).toLocaleString()}</p>

                <p>End: {new Date(cls.endTime).toLocaleString()}</p>
              </div>

              <div className="mt-6 flex gap-3">
                <a
                  href={cls.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white"
                >
                  Join
                </a>

                <button
                  onClick={() => {
                    setEditingLiveClass(cls);

                    setFormData({
                      title: cls.title,
                      description: cls.description || "",
                      meetingLink: cls.meetingLink || "",

                      classId: cls.classId,

                      subjectId: cls.subjectId,

                      startTime: new Date(cls.startTime)
                        .toISOString()
                        .slice(0, 16),

                      endTime: new Date(cls.endTime).toISOString().slice(0, 16),
                    });

                    setOpen(true);
                  }}
                  className="rounded-lg bg-amber-500 px-4 py-2 text-white"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(cls.id)}
                  className="rounded-lg bg-red-600 px-4 py-2 text-white"
                >
                  Delete
                </button>

                <Link
                  href={`/teacher/live-classes/${cls.id}`}
                  className="rounded-lg bg-green-600 px-4 py-2 text-white"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6">
            <h2 className="mb-4 text-2xl font-bold">
              {editingLiveClass ? "Edit Live Class" : "Create Live Class"}
            </h2>

            <div className="space-y-4">
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

              <input
                placeholder="Google Meet / Zoom Link"
                className="w-full rounded border p-3"
                value={formData.meetingLink}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    meetingLink: e.target.value,
                  })
                }
              />

              <select
                title="class"
                className="w-full rounded border p-3"
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
                    {cls.name}
                    {" • "}
                    {cls.board?.name}
                  </option>
                ))}
              </select>

              <select
                title="subject"
                className="w-full rounded border p-3"
                value={formData.subjectId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subjectId: e.target.value,
                  })
                }
              >
                <option value="">Select Subject</option>

                {filteredSubjects.map((subject: any) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>

              <input
                title="starttime"
                type="datetime-local"
                className="w-full rounded border p-3"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    startTime: e.target.value,
                  })
                }
              />

              <input
                title="endtime"
                type="datetime-local"
                className="w-full rounded border p-3"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    endTime: e.target.value,
                  })
                }
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border px-4 py-2"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateLiveClass}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white"
              >
                {loading
                  ? editingLiveClass
                    ? "Updating..."
                    : "Creating..."
                  : editingLiveClass
                    ? "Update"
                    : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
