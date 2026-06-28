"use client";

import { getStudentDashboard } from "@/services/dashboard.service";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function StudentDashboard() {
  const [dashboard, setDashboard] = useState<any>(null);

  const router = useRouter();

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const result = await getStudentDashboard();

        setDashboard(result.data);
        console.log(result.data);
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
    return <div className="min-h-screen">Loading...</div>;
  }
  return (
    <div className="relative min-h-screen overflow-hidden p-4 pb-10 md:pb-8">
      <div className="absolute left-10 top-20 h-40 w-40 rounded-full bg-violet-300/20 blur-3xl" />

      <div className="absolute right-10 top-40 h-52 w-52 rounded-full bg-blue-300/20 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="rounded-[35px] bg-white p-6 shadow-[20px_20px_60px_#d9d9d9,-20px_-20px_60px_#ffffff]">
          <Link href={"/student/profile"}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-slate-500">{greeting}</h4>

              <h1 className="mt-1 text-3xl font-bold">
                {dashboard.student.name}
              </h1>

              <p className="mt-2 text-slate-500">
                {dashboard.student.class}
                {" • "}
                {dashboard.student.board}
              </p>

              <div className="mt-3 inline-flex rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700">
                🎓 {dashboard.student.studentId}
              </div>
            </div>
            <div>
            <img
              src={
                dashboard.student.photo ||
                "https://static.vecteezy.com/system/resources/thumbnails/057/743/234/small/blue-user-profile-icon-3d-rendered-person-symbol-png.png"
              }
              alt="Student"
              className="h-16 w-16 rounded-full border-4 border-violet-300 object-cover"
            />
            <span className="text-sm text-blue-600">View Profile</span>
            </div>
          </div>
          </Link>
        </div>

        <div className="mt-8">
          <div className="rounded-[35px] bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white shadow-xl">
            <p className="text-violet-100">Learning Progress</p>

            <h2 className="mt-2 text-2xl font-bold">Keep Going 🚀</h2>

            <div className="mt-6">
              <div className="flex justify-between text-sm">
                <span>Assignments</span>

                <span>
                  {dashboard.assignmentsSubmitted}/
                  {dashboard.assignmentsSubmitted +
                    dashboard.assignmentsPending}
                </span>
              </div>

              <div className="mt-2 h-3 rounded-full bg-white/20">
                <div
                  className="h-3 rounded-full bg-white"
                  style={{
                    width: `${
                      dashboard.assignmentsSubmitted +
                        dashboard.assignmentsPending ===
                      0
                        ? 0
                        : (dashboard.assignmentsSubmitted /
                            (dashboard.assignmentsSubmitted +
                              dashboard.assignmentsPending)) *
                          100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-[28px] bg-white p-5 shadow-[15px_15px_40px_#d9d9d9,-15px_-15px_40px_#ffffff]">
            <p className="text-sm text-slate-500">Attendance</p>

            <h2 className="mt-2 text-3xl font-bold text-violet-600">
              {dashboard.attendancePercentage}%
            </h2>
          </div>

          <div className="rounded-[28px] bg-white p-5 shadow-[15px_15px_40px_#d9d9d9,-15px_-15px_40px_#ffffff]">
            <p className="text-sm text-slate-500">Pending Tasks</p>

            <h2 className="mt-2 text-3xl font-bold text-orange-500">
              {dashboard.assignmentsPending}
            </h2>
          </div>

          <div className="rounded-[28px] bg-white p-5 shadow-[15px_15px_40px_#d9d9d9,-15px_-15px_40px_#ffffff]">
            <p className="text-sm text-slate-500">Tests Attempted</p>

            <h2 className="mt-2 text-3xl font-bold text-blue-500">
              {dashboard.testsAttempted}
            </h2>
          </div>

          <div className="rounded-[28px] bg-white p-5 shadow-[15px_15px_40px_#d9d9d9,-15px_-15px_40px_#ffffff]">
            <p className="text-sm text-slate-500">Avg Score</p>

            <h2 className="mt-2 text-3xl font-bold text-green-500">
              {dashboard.averageScore}%
            </h2>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Upcoming Classes</h2>

            <span className="text-sm text-violet-600">
              {dashboard.upcomingClasses.length} Upcoming
            </span>
          </div>

          {dashboard.upcomingClasses.length === 0 ? (
            <div className="rounded-[30px] bg-white p-8 text-center shadow-[15px_15px_40px_#d9d9d9,-15px_-15px_40px_#ffffff]">
              <div className="text-5xl">🎥</div>

              <h3 className="mt-4 text-lg font-semibold">
                No Upcoming Classes
              </h3>

              <p className="mt-2 text-slate-500">
                You're all caught up for now.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboard.upcomingClasses.map((liveClass: any) => (
                <div
                  key={liveClass.id}
                  className="rounded-[30px] bg-white p-5 shadow-[15px_15px_40px_#d9d9d9,-15px_-15px_40px_#ffffff]"
                >
                  <h3 className="font-bold text-lg">{liveClass.title}</h3>

                  <p className="mt-1 text-slate-500">{liveClass.description}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="rounded-full bg-violet-100 px-3 py-1 text-sm text-violet-700">
                      Live Class
                    </span>

                    <span className="text-sm text-slate-500">
                      {new Date(liveClass.startTime).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Notices</h2>

            <span className="text-sm text-violet-600">
              {dashboard.recentNotices.length} New
            </span>
          </div>

          {dashboard.recentNotices.length === 0 ? (
            <div className="rounded-[30px] bg-white p-8 text-center shadow-[15px_15px_40px_#d9d9d9,-15px_-15px_40px_#ffffff]">
              <div className="text-5xl">🔔</div>

              <h3 className="mt-4 text-lg font-semibold">
                No Notices Available
              </h3>

              <p className="mt-2 text-slate-500">No recent announcements.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboard.recentNotices.map((notice: any) => (
                <div
                  key={notice.id}
                  className="rounded-[30px] bg-white p-5 shadow-[15px_15px_40px_#d9d9d9,-15px_-15px_40px_#ffffff]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold">{notice.title}</h3>

                      <p className="mt-2 text-slate-500 line-clamp-2">
                        {notice.description}
                      </p>
                    </div>

                    <div className="h-3 w-3 rounded-full bg-red-500" />
                  </div>

                  <p className="mt-4 text-xs text-slate-400">
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
