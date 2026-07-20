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

  const statCards = [
    { label: "Students", val: stats.totalStudents, icon: FaUserGraduate, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Teachers", val: stats.totalTeachers, icon: FaChalkboardTeacher, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Classes", val: stats.totalClasses, icon: FaSchool, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Subjects", val: stats.totalSubjects, icon: FaBook, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Tests", val: stats.totalTests, icon: FaClipboardList, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Assignments", val: stats.totalAssignments, icon: FaFileAlt, color: "text-cyan-600", bg: "bg-cyan-50" },
    { label: "Notices", val: stats.totalNotices, icon: FaBullhorn, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Live Classes", val: stats.upcomingLiveClasses, icon: FaVideo, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <div className="space-y-8">

      <div className="bg-gradient-to-r from-slate-900 to-blue-900 p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Admin Dashboard</h1>
          <p className="mt-2 text-blue-200 font-medium">Welcome back. Here is your institutional snapshot.</p>
        </div>
        
        {currentTime && (
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 shadow-inner">
            <FaClock className="text-blue-300 text-lg" />
            <p className="text-white font-semibold text-sm tracking-wide">{currentTime}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {statCards.map((c, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className={`p-3 w-14 h-14 rounded-2xl ${c.bg} ${c.color} flex items-center justify-center mb-4`}>
              <c.icon className="text-2xl" />
            </div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{c.label}</p>
            <p className="text-3xl font-black text-slate-800 mt-1">{c.val || 0}</p>
          </div>
        ))}
      </div>


      <div className="grid lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-slate-800">Quick Administrative Actions</h2>
          <div className="grid gap-5 md:grid-cols-2">
            
            <Link href="/admin/teachers" className="group rounded-2xl bg-slate-50 p-5 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 hover:shadow-md transition-all flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <FaChalkboardTeacher size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Add Teacher</h3>
                <p className="text-sm text-slate-500 mt-1 font-medium">Register new faculty members</p>
              </div>
            </Link>

            <Link href="/admin/classes" className="group rounded-2xl bg-slate-50 p-5 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-md transition-all flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <FaSchool size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Add Class</h3>
                <p className="text-sm text-slate-500 mt-1 font-medium">Create new classroom sections</p>
              </div>
            </Link>

            <Link href="/admin/subjects" className="group rounded-2xl bg-slate-50 p-5 border border-slate-100 hover:border-orange-200 hover:bg-orange-50/50 hover:shadow-md transition-all flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-orange-600 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all">
                <FaBook size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Add Subject</h3>
                <p className="text-sm text-slate-500 mt-1 font-medium">Configure curriculum subjects</p>
              </div>
            </Link>

            <Link href="/admin/notices" className="group rounded-2xl bg-slate-50 p-5 border border-slate-100 hover:border-amber-200 hover:bg-amber-50/50 hover:shadow-md transition-all flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-amber-600 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all">
                <FaBullhorn size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Publish Notice</h3>
                <p className="text-sm text-slate-500 mt-1 font-medium">Announce updates to everyone</p>
              </div>
            </Link>

          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <h2 className="mb-6 text-xl font-bold text-slate-800">Academic Calendar</h2>
          <div className="flex-1 flex justify-center items-center">
            <Calendar
              value={date}
              onChange={(value) => setDate(value as Date)}
              className="w-full border-none !font-sans !text-slate-700 shadow-sm rounded-2xl p-2"
            />
          </div>
        </div>

      </div>
    </div>
  );
}