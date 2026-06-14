"use client";

import { useEffect, useState } from "react";

import { getMyProfile } from "@/services/teacher.service";
import { getTeacherDashboard } from "@/services/dashboard.service";
import Link from "next/link";

import {
  FaClipboardList,
  FaFileAlt,
  FaVideo,
  FaBullhorn,
} from "react-icons/fa";

export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const result = await getMyProfile();

        setTeacher(result.data);

        const dashboard = await getTeacherDashboard();

        console.log("Dashboard API:", dashboard);

        setStats(dashboard.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    console.log("Stats Updated:", stats);
  }, [stats]);

  return (
    <div>
      <div className="p-6 bg-blue-950 rounded-2xl">
        <h1 className="text-3xl font-bold text-white">
          Welcome,
          {teacher?.name}
          👋
        </h1>

        <p className="mt-2 text-slate-300">Teacher Dashboard</p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">My Classes</h2>

          <div className="flex flex-wrap gap-3">
            {teacher?.classes?.map((cls: any) => (
              <div
                key={cls.id}
                className="rounded-full bg-blue-100 px-4 py-2 text-blue-700"
              >
                {cls.name} ({cls.board?.name})
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">My Subjects</h2>

          <div className="flex flex-wrap gap-3">
            {teacher?.subjects?.map((subject: any) => (
              <div
                key={subject.id}
                className="rounded-full bg-green-100 px-4 py-2 text-green-700"
              >
                {subject.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-4 xl:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="text-sm text-slate-500">Classes</h3>

          <p className="mt-2 text-3xl font-bold">{stats?.classes || 0}</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="text-sm text-slate-500">Subjects</h3>

          <p className="mt-2 text-3xl font-bold">{stats?.subjects || 0}</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="text-sm text-slate-500">Students</h3>

          <p className="mt-2 text-3xl font-bold">{stats?.students || 0}</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="text-sm text-slate-500">Live Classes</h3>

          <p className="mt-2 text-3xl font-bold">{stats?.liveClasses || 0}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div>
          <h2 className="mb-4 text-2xl font-bold">Quick Actions</h2>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Link
              href="/teacher/assignments"
              className="rounded-xl bg-white p-6 shadow transition hover:shadow-lg"
            >
              <FaFileAlt className="mb-3 text-3xl text-blue-600" />

              <h3 className="font-semibold">Create Assignment</h3>
            </Link>

            <Link
              href="/teacher/tests"
              className="rounded-xl bg-white p-6 shadow transition hover:shadow-lg"
            >
              <FaClipboardList className="mb-3 text-3xl text-green-600" />

              <h3 className="font-semibold">Create Test</h3>
            </Link>

            <Link
              href="/teacher/live-classes"
              className="rounded-xl bg-white p-6 shadow transition hover:shadow-lg"
            >
              <FaVideo className="mb-3 text-3xl text-red-600" />

              <h3 className="font-semibold">Schedule Live Class</h3>
            </Link>

            <Link
              href="/teacher/notices"
              className="rounded-xl bg-white p-6 shadow transition hover:shadow-lg"
            >
              <FaBullhorn className="mb-3 text-3xl text-orange-600" />

              <h3 className="font-semibold">View Notices</h3>
            </Link>
          </div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">Recent Notices</h2>

          <div className="space-y-4 overflow-y-scroll">
            {stats?.recentNotices?.length ? (
              stats.recentNotices.map((notice: any) => (
                <div key={notice.id} className="bg-blue-100 p-4 rounded-xl mb-4">
                  <h3 className="font-semibold">{notice.title}</h3>

                  <p className="mt-1 text-sm text-slate-600">
                    {notice.description}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-500">No notices available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
