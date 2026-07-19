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
  FaClock,
  FaUserPlus,
} from "react-icons/fa";

import Link from "next/link";

export default function AdminDashboard() {
  const [date, setDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState<string>("");
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
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
      };
      setCurrentTime(now.toLocaleString('en-US', options).replace(" at ", " | "));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
    <div>
      <div className="bg-blue-950 p-5 rounded-2xl flex items-center justify-between">
        <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>

        <p className="mt-2 text-slate-300">Welcome back Admin</p>
        </div>
        <div>
        {currentTime && (
          <div className="mt-4 flex items-center gap-2 bg-slate-800/60 w-fit px-4 py-2 rounded-full border border-slate-700/50">
            <FaClock className="text-slate-300" />
            <p className=" text-slate-200 font-medium">{currentTime}</p>
          </div>
        )}
        </div>
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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold text-slate-800">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/admin/teachers" className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 mt-0.5">
                <FaChalkboardTeacher size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Add Teacher</h3>
                <p className="text-xs text-slate-500 mt-1">Register new faculty members</p>
              </div>
            </Link>

            <Link href="/admin/classes" className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mt-0.5">
                <FaSchool size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Add Class</h3>
                <p className="text-xs text-slate-500 mt-1">Create new classroom sections</p>
              </div>
            </Link>

            <Link href="/admin/subjects" className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 mt-0.5">
                <FaBook size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Add Subject</h3>
                <p className="text-xs text-slate-500 mt-1">Configure curriculum subjects</p>
              </div>
            </Link>

            <Link href="/admin/notices" className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 mt-0.5">
                <FaBullhorn size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Publish Notice</h3>
                <p className="text-xs text-slate-500 mt-1">Announce updates to everyone</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-1">
          <h2 className="mb-4 text-lg font-bold text-slate-800">Academic Calendar</h2>
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex justify-center items-center">
            <Calendar
              value={date}
              onChange={(value) => setDate(value as Date)}
              className="w-full border-none !font-sans"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
