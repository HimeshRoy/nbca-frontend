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
  FaChalkboardTeacher,
  FaBookOpen,
  FaUserGraduate,
  FaBroadcastTower,
  FaClock,
} from "react-icons/fa";

export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const result = await getMyProfile();
        setTeacher(result.data);

        const dashboard = await getTeacherDashboard();
        setStats(dashboard.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProfile();

    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime?.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = currentTime?.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="space-y-6 pb-8">
      <div className="p-8 bg-gradient-to-r from-slate-900 to-blue-900 rounded-3xl shadow-lg flex justify-between items-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500 opacity-10 blur-3xl"></div>

        <div className="relative z-10 flex flex-col gap-3">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {teacher?.name || "Teacher"}
          </h1>

          {currentTime && (
            <div className="mt-3 flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20  font-medium backdrop-blur-sm w-fit">
              <FaClock className="text-blue-300" />
              <span className="text-blue-50">{formattedDate}</span>
              <span className="text-blue-300/50">|</span>
              <span className="text-white tracking-wider">{formattedTime}</span>
            </div>
          )}
        </div>

        <div className="relative z-10 hidden sm:block">
          <Link
            href={"/teacher/profile"}
            title="Profile"
            className="block transform transition-transform hover:scale-105"
          >
            <img
              src={teacher?.photo || "/avatar.png"}
              alt="Teacher"
              className="h-20 w-20 rounded-full object-cover border-4 border-white/20 shadow-xl"
            />
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <h2 className="mb-4 text-lg font-bold text-slate-800">My Classes</h2>
          <div className="flex flex-wrap gap-2">
            {teacher?.classes?.length ? (
              teacher.classes.map((cls: any) => (
                <span
                  key={cls.id}
                  className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 border border-blue-100"
                >
                  {cls.name}{" "}
                  <span className="opacity-70 font-normal">
                    ({cls.board?.name})
                  </span>
                </span>
              ))
            ) : (
              <span className="text-slate-400 text-sm">
                No classes assigned yet.
              </span>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <h2 className="mb-4 text-lg font-bold text-slate-800">My Subjects</h2>
          <div className="flex flex-wrap gap-2">
            {teacher?.subjects?.length ? (
              teacher.subjects.map((subject: any) => (
                <span
                  key={subject.id}
                  className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 border border-emerald-100"
                >
                  {subject.name}
                </span>
              ))
            ) : (
              <span className="text-slate-400 text-sm">
                No subjects assigned yet.
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <FaChalkboardTeacher className="text-2xl" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500">
              Total Classes
            </h3>
            <p className="text-2xl font-bold text-slate-800">
              {stats?.classes || 0}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <FaBookOpen className="text-2xl" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500">Subjects</h3>
            <p className="text-2xl font-bold text-slate-800">
              {stats?.subjects || 0}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
            <FaUserGraduate className="text-2xl" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500">Students</h3>
            <p className="text-2xl font-bold text-slate-800">
              {stats?.students || 0}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
            <FaBroadcastTower className="text-2xl" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500">Live Classes</h3>
            <p className="text-2xl font-bold text-slate-800">
              {stats?.liveClasses || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <h2 className="mb-4 text-xl font-bold text-slate-800">
            Quick Actions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 h-full">
            <Link
              href="/teacher/assignments"
              className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-blue-200"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative z-10 flex items-center gap-4">
                <div className="flex-shrink-0 p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 shadow-sm">
                  <FaFileAlt className="text-xl" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                    Create Assignment
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Distribute new homework
                  </p>
                </div>
                <div className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-blue-600 font-bold text-lg">
                  →
                </div>
              </div>
            </Link>

            <Link
              href="/teacher/tests"
              className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-emerald-200"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative z-10 flex items-center gap-4">
                <div className="flex-shrink-0 p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 shadow-sm">
                  <FaClipboardList className="text-xl" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                    Create Test
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Schedule an assessment
                  </p>
                </div>
                <div className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-emerald-600 font-bold text-lg">
                  →
                </div>
              </div>
            </Link>

            <Link
              href="/teacher/live-classes"
              className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-rose-200"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative z-10 flex items-center gap-4">
                <div className="flex-shrink-0 p-3 bg-rose-50 text-rose-600 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 shadow-sm">
                  <FaVideo className="text-xl" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 group-hover:text-rose-700 transition-colors">
                    Live Class
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Set up a video session
                  </p>
                </div>
                <div className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-rose-600 font-bold text-lg">
                  →
                </div>
              </div>
            </Link>

            <Link
              href="/teacher/notices"
              className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-amber-200"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative z-10 flex items-center gap-4">
                <div className="flex-shrink-0 p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 group-hover:scale-110 shadow-sm">
                  <FaBullhorn className="text-xl" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 group-hover:text-amber-700 transition-colors">
                    Publish Notice
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Announce to classes
                  </p>
                </div>
                <div className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-amber-600 font-bold text-lg">
                  →
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">Recent Notices</h2>
            <Link
              href="/teacher/notices"
              className="text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              View All
            </Link>
          </div>
          <div className="rounded-2xl bg-white p-2 shadow-sm border border-slate-100 h-[320px] overflow-y-auto custom-scrollbar">
            <div className="space-y-2 p-2">
              {stats?.recentNotices?.length ? (
                stats.recentNotices.map((notice: any) => (
                  <div
                    key={notice.id}
                    className="group relative p-4 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Link href={"/teacher/notices"}>
                      <h3 className="font-bold text-slate-800 text-md">
                        {notice.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                        {notice.description}
                      </p>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <div className="p-4 bg-slate-50 rounded-full mb-3">
                    <FaBullhorn className="text-2xl text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">
                    No recent notices
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    When admins post updates, they will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
