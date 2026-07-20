"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  FaVideo,
  FaCalendarAlt,
  FaChevronRight,
  FaBell,
  FaGraduationCap,
  FaChartLine,
  FaClipboardList,
  FaTrophy,
  FaClock,
} from "react-icons/fa";

import { getStudentDashboard } from "@/services/dashboard.service";

export default function StudentDashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const result = await getStudentDashboard();
        setDashboard(result.data);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="w-64 h-64">
          <DotLottieReact
            src="https://lottie.host/8cc70ce1-7bcb-4492-b978-77cde0aad40a/QnHc4gdlQq.lottie"
            loop
            autoplay
          />
        </div>
        <p className="text-slate-500 font-medium animate-pulse mt-4">
          Loading your workspace...
        </p>
      </div>
    );
  }

  if (!dashboard) return null;

  const totalAssignments =
    dashboard.assignmentsSubmitted + dashboard.assignmentsPending;
  const progressPercentage =
    totalAssignments === 0
      ? 0
      : Math.round((dashboard.assignmentsSubmitted / totalAssignments) * 100);

  return (
    <div className="relative min-h-screen pb-10 p-3">
      <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-violet-400/10 blur-[100px] pointer-events-none" />
      <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-blue-400/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Link href="/student/profile" className="lg:col-span-2 block group">
            <div className="h-full rounded-3xl bg-white p-6 md:p-8 border border-slate-100 shadow-sm transition-all group-hover:shadow-md group-hover:border-violet-100 flex items-center justify-between  relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-violet-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 ease-out" />

              <div className="relative z-10">
                <h4 className="text-sm font-bold text-violet-600 uppercase tracking-wider mb-1">
                  {greeting}
                </h4>
                <h1 className="text-3xl font-extrabold text-slate-800 mb-2">
                  {dashboard.student.name}
                </h1>
                <p className="text-sm font-medium text-slate-500 mb-4 flex items-center gap-2">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-700">
                    {dashboard.student.class}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span>{dashboard.student.board}</span>
                </p>
                <div className="inline-flex items-center gap-2 rounded-xl bg-violet-50 border border-violet-100 px-3 py-1.5 text-sm font-bold text-violet-700">
                  <FaGraduationCap /> ID: {dashboard.student.studentId}
                </div>
              </div>
              <div className="relative z-10 flex flex-col items-center shrink-0">
                <div className="relative rounded-full p-1 border-2 border-dashed border-violet-200 group-hover:border-violet-400 transition-colors duration-300">
                  <img
                    src={
                      dashboard.student.photo ||
                      "https://static.vecteezy.com/system/resources/thumbnails/057/743/234/small/blue-user-profile-icon-3d-rendered-person-symbol-png.png"
                    }
                    alt="Student Profile"
                    className="h-20 w-20 rounded-full object-cover shadow-sm"
                  />
                </div>
                <span className="mt-3 text-xs font-bold text-violet-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  View Profile <FaChevronRight size={10} />
                </span>
              </div>
            </div>
          </Link>

          <div className="rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-6 md:p-8 text-white shadow-lg shadow-indigo-200 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full pointer-events-none" />
            <div>
              <div className="flex items-center gap-2 text-violet-100 mb-2">
                <FaChartLine />{" "}
                <span className="text-sm font-bold uppercase tracking-wider">
                  Learning Progress
                </span>
              </div>
              <h2 className="text-2xl font-bold">Keep Going 🚀</h2>
            </div>

            <div className="mt-8">
              <div className="flex justify-between text-sm font-medium mb-3">
                <span className="text-violet-100">Assignments Completed</span>
                <span className="font-bold bg-white/20 px-2 py-0.5 rounded-md">
                  {dashboard.assignmentsSubmitted} / {totalAssignments}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-black/20 overflow-hidden backdrop-blur-sm">
                <div
                  className="h-full rounded-full bg-white transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-right text-xs mt-2 text-violet-200 font-medium">
                {progressPercentage}% Completed
              </p>
            </div>
          </div>
        </div>

        <Link href="/student/live-classes" className="block group">
          <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 flex items-center gap-3 justify-between transition-all hover:bg-blue-600 hover:border-blue-600 group-hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-white/20 group-hover:text-white transition-colors">
                <FaVideo size={18} />
              </div>
              <div>
                <h3 className="font-bold text-blue-900 group-hover:text-white transition-colors">
                  Join Live Classes
                </h3>
                <p className="text-xs text-blue-600 group-hover:text-blue-100 font-medium transition-colors">
                  Check your schedule and connect with teachers
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <FaChevronRight size={12} />
            </div>
          </div>
        </Link>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm hover:-translate-y-1 transition-transform duration-300">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <FaCalendarAlt size={18} />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
              Attendance
            </p>
            <h2 className="text-3xl font-extrabold text-slate-800">
              {dashboard.attendancePercentage}%
            </h2>
          </div>

          <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm hover:-translate-y-1 transition-transform duration-300">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
              <FaClipboardList size={18} />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
              Pending Tasks
            </p>
            <h2 className="text-3xl font-extrabold text-slate-800">
              {dashboard.assignmentsPending}
            </h2>
          </div>

          <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm hover:-translate-y-1 transition-transform duration-300">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <FaTrophy size={18} />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
              Tests Taken
            </p>
            <h2 className="text-3xl font-extrabold text-slate-800">
              {dashboard.testsAttempted}
            </h2>
          </div>

          <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm hover:-translate-y-1 transition-transform duration-300">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <FaChartLine size={18} />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
              Avg Score
            </p>
            <h2 className="text-3xl font-extrabold text-slate-800">
              {dashboard.averageScore}%
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <FaVideo size={14} />
                </div>
                <h2 className="text-lg font-bold text-slate-800">
                  Upcoming Classes
                </h2>
              </div>
              <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md border border-blue-100">
                {dashboard.upcomingClasses.length} Scheduled
              </span>
            </div>

            <div className="p-6 flex-1 bg-white">
              {dashboard.upcomingClasses.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                  <div className="w-32 h-32 mb-4 opacity-70">
                    <DotLottieReact
                      src="https://lottie.host/cdd4c551-8272-448b-a1a0-ceeec3b4c10f/asQLKY49sp.lottie"
                      loop
                      autoplay
                    />
                  </div>
                  <h3 className="text-base font-bold text-slate-700">
                    No Upcoming Classes
                  </h3>
                  <p className="text-sm font-medium text-slate-500 mt-1">
                    You're all caught up for now.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboard.upcomingClasses.map((liveClass: any) => (
                    <Link
                      href="/student/live-classes"
                      key={liveClass.id}
                      className="block group"
                    >
                      <div className="rounded-2xl border border-slate-100 p-4 transition-all hover:border-blue-200 hover:shadow-md hover:bg-blue-50/30">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                            {liveClass.title}
                          </h3>
                          <span className="flex items-center gap-1.5 rounded-full bg-red-50 border border-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>{" "}
                            Live
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-500 line-clamp-1 mb-4">
                          {liveClass.description}
                        </p>
                        <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <FaClock />{" "}
                            {new Date(liveClass.startTime).toLocaleString(
                              undefined,
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                          <span className="text-blue-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Join <FaChevronRight size={10} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                  <FaBell size={14} />
                </div>
                <h2 className="text-lg font-bold text-slate-800">
                  Recent Notices
                </h2>
              </div>
              <span className="text-xs font-bold bg-amber-50 text-amber-600 px-2.5 py-1 rounded-md border border-amber-100">
                {dashboard.recentNotices.length} New
              </span>
            </div>

            <div className="p-6 flex-1 bg-white">
              {dashboard.recentNotices.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                    <FaBell className="text-2xl text-slate-300" />
                  </div>
                  <h3 className="text-base font-bold text-slate-700">
                    No Announcements
                  </h3>
                  <p className="text-sm font-medium text-slate-500 mt-1">
                    Check back later for updates.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboard.recentNotices.map((notice: any) => (
                    <div
                      key={notice.id}
                      className="rounded-2xl border border-slate-100 p-4 transition-all hover:bg-slate-50 relative overflow-hidden group"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-800 mb-1">
                            {notice.title}
                          </h3>
                          <p className="text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed">
                            {notice.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                          <FaCalendarAlt size={10} />
                          {new Date(notice.createdAt).toLocaleDateString(
                            undefined,
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
