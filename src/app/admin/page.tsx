"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/services/dashboard.service";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaSchool,
  FaBook,
  FaClipboardList,
  FaBullhorn,
  FaVideo,
  FaFileAlt,
  FaUserPlus,
} from "react-icons/fa";

import Link from "next/link";

export default function AdminDashboard() {
  const [date, setDate] = useState(new Date());
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalSubjects: 0,
    totalAssignments: 0,
    totalTests: 0,
    totalNotices: 0,
    upcomingLiveClasses: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await getDashboardStats();

        setStats(result.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-5">
      <div className="bg-blue-950 p-5 rounded-2xl">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>

        <p className="mt-2 text-slate-300">Welcome back Admin</p>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow">
          <FaUserGraduate className="mb-3 text-3xl text-blue-600" />
          <h3 className="text-sm text-slate-500">Students</h3>
          <p className="mt-2 text-3xl font-bold">{stats.totalStudents}</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <FaChalkboardTeacher className="mb-3 text-3xl text-green-600" />
          <h3 className="text-sm text-slate-500">Teachers</h3>
          <p className="mt-2 text-3xl font-bold">{stats.totalTeachers}</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <FaSchool className="mb-3 text-3xl text-purple-600" />
          <h3 className="text-sm text-slate-500">Classes</h3>
          <p className="mt-2 text-3xl font-bold">{stats.totalClasses}</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <FaBook className="mb-3 text-3xl text-orange-600" />
          <h3 className="text-sm text-slate-500">Subjects</h3>
          <p className="mt-2 text-3xl font-bold">{stats.totalSubjects}</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <FaClipboardList className="mb-3 text-3xl text-pink-600" />
          <h3 className="text-sm text-slate-500">Tests</h3>
          <p className="mt-2 text-3xl font-bold">{stats.totalTests}</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <FaFileAlt className="mb-3 text-3xl text-cyan-600" />
          <h3 className="text-sm text-slate-500">Assignments</h3>
          <p className="mt-2 text-3xl font-bold">{stats.totalAssignments}</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <FaBullhorn className="mb-3 text-3xl text-red-600" />
          <h3 className="text-sm text-slate-500">Notices</h3>
          <p className="mt-2 text-3xl font-bold">{stats.totalNotices}</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <FaVideo className="mb-3 text-3xl text-indigo-600" />
          <h3 className="text-sm text-slate-500">Live Classes</h3>
          <p className="mt-2 text-3xl font-bold">{stats.upcomingLiveClasses}</p>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">Quick Actions</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/admin/teachers"
              className="rounded-xl bg-white p-5 shadow transition hover:shadow-lg flex flex-col justify-center items-center border border-blue-300"
            >
              <FaChalkboardTeacher className="mb-3 text-3xl text-green-600" />
              <h3 className="font-semibold">Add Teacher</h3>
            </Link>

            <Link
              href="/admin/classes"
              className="rounded-xl bg-white p-5 shadow transition hover:shadow-lg flex flex-col justify-center items-center border border-blue-300"
            >
              <FaSchool className="mb-3 text-3xl text-purple-600" />
              <h3 className="font-semibold">Add Class</h3>
            </Link>

            <Link
              href="/admin/subjects"
              className="rounded-xl bg-white p-5 shadow transition hover:shadow-lg flex flex-col justify-center items-center border border-blue-300"
            >
              <FaBook className="mb-3 text-3xl text-orange-600" />
              <h3 className="font-semibold">Add Subject</h3>
            </Link>

            <Link
              href="/admin/notices"
              className="rounded-xl bg-white p-5 shadow transition hover:shadow-lg flex flex-col justify-center items-center border border-blue-300"
            >
              <FaBullhorn className="mb-3 text-3xl text-red-600" />
              <h3 className="font-semibold">Create Notice</h3>
            </Link>
          </div>
        </div>

        {/* Calendar */}
        <div className="rounded-xl bg-white p-4 shadow">
          <h2 className="mb-4 text-2xl font-bold">Academic Calendar</h2>

          <div className="flex justify-center w-full">
            <Calendar
              value={date}
              onChange={(value) => setDate(value as Date)}
              className={"w-full rounded-xl p-4"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
