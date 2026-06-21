"use client";

import { getStudentDashboard } from "@/services/dashboard.service";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
  <div className="min-h-screen p-4">

    <div className="mx-auto max-w-7xl">

      <div className="rounded-[35px] bg-white p-6 shadow-[20px_20px_60px_#d9d9d9,-20px_-20px_60px_#ffffff]">

        <h4 className="text-xl font-bold">
          {dashboard.student.name}
        </h4>

        <p className=" text-slate-500">
          {dashboard.student.class}
          {" • "}
          {dashboard.student.board}
        </p>

        <p className=" text-violet-600 font-semibold">
          ID:
          {" "}
          {dashboard.student.studentId}
        </p>

      </div>

      <div className="mt-8">

  <div className="rounded-[35px] bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white shadow-xl">

    <p className="text-violet-100">
      Learning Progress
    </p>

    <h2 className="mt-2 text-2xl font-bold">
      Keep Going 🚀
    </h2>

    <div className="mt-6">

      <div className="flex justify-between text-sm">

        <span>
          Assignments
        </span>

        <span>
          {dashboard.assignmentsSubmitted}
          /
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

    <p className="text-sm text-slate-500">
      Attendance
    </p>

    <h2 className="mt-2 text-3xl font-bold text-violet-600">
      {dashboard.attendancePercentage}%
    </h2>

  </div>

  <div className="rounded-[28px] bg-white p-5 shadow-[15px_15px_40px_#d9d9d9,-15px_-15px_40px_#ffffff]">

    <p className="text-sm text-slate-500">
      Pending Tasks
    </p>

    <h2 className="mt-2 text-3xl font-bold text-orange-500">
      {dashboard.assignmentsPending}
    </h2>

  </div>

  <div className="rounded-[28px] bg-white p-5 shadow-[15px_15px_40px_#d9d9d9,-15px_-15px_40px_#ffffff]">

    <p className="text-sm text-slate-500">
      Tests Attempted
    </p>

    <h2 className="mt-2 text-3xl font-bold text-blue-500">
      {dashboard.testsAttempted}
    </h2>

  </div>

  <div className="rounded-[28px] bg-white p-5 shadow-[15px_15px_40px_#d9d9d9,-15px_-15px_40px_#ffffff]">

    <p className="text-sm text-slate-500">
      Avg Score
    </p>

    <h2 className="mt-2 text-3xl font-bold text-green-500">
      {dashboard.averageScore}%
    </h2>

  </div>

</div>

<div className="mt-8">

  <div className="mb-4 flex items-center justify-between">

    <h2 className="text-xl font-bold">
      Upcoming Classes
    </h2>

    <span className="text-sm text-violet-600">
      {dashboard.upcomingClasses.length}
      {" "}Upcoming
    </span>

  </div>

  {dashboard.upcomingClasses.length === 0 ? (

    <div className="rounded-[30px] bg-white p-8 text-center shadow-[15px_15px_40px_#d9d9d9,-15px_-15px_40px_#ffffff]">

      <div className="text-5xl">
        🎥
      </div>

      <h3 className="mt-4 text-lg font-semibold">
        No Upcoming Classes
      </h3>

      <p className="mt-2 text-slate-500">
        You're all caught up for now.
      </p>

    </div>

  ) : (

    <div className="space-y-4">

      {dashboard.upcomingClasses.map(
        (liveClass: any) => (
          <div
            key={liveClass.id}
            className="rounded-[30px] bg-white p-5 shadow-[15px_15px_40px_#d9d9d9,-15px_-15px_40px_#ffffff]"
          >

            <h3 className="font-bold text-lg">
              {liveClass.title}
            </h3>

            <p className="mt-1 text-slate-500">
              {liveClass.description}
            </p>

            <div className="mt-4 flex items-center justify-between">

              <span className="rounded-full bg-violet-100 px-3 py-1 text-sm text-violet-700">
                Live Class
              </span>

              <span className="text-sm text-slate-500">
                {new Date(
                  liveClass.startTime
                ).toLocaleString()}
              </span>

            </div>

          </div>
        )
      )}

    </div>

  )}

</div>

<div className="mt-8">

  <div className="mb-4 flex items-center justify-between">

    <h2 className="text-xl font-bold">
      Recent Notices
    </h2>

    <span className="text-sm text-violet-600">
      {dashboard.recentNotices.length}
      {" "}New
    </span>

  </div>

  {dashboard.recentNotices.length === 0 ? (

    <div className="rounded-[30px] bg-white p-8 text-center shadow-[15px_15px_40px_#d9d9d9,-15px_-15px_40px_#ffffff]">

      <div className="text-5xl">
        🔔
      </div>

      <h3 className="mt-4 text-lg font-semibold">
        No Notices Available
      </h3>

      <p className="mt-2 text-slate-500">
        No recent announcements.
      </p>

    </div>

  ) : (

    <div className="space-y-4">

      {dashboard.recentNotices.map(
        (notice: any) => (
          <div
            key={notice.id}
            className="rounded-[30px] bg-white p-5 shadow-[15px_15px_40px_#d9d9d9,-15px_-15px_40px_#ffffff]"
          >

            <div className="flex items-start justify-between">

              <div>

                <h3 className="font-bold">
                  {notice.title}
                </h3>

                <p className="mt-2 text-slate-500 line-clamp-2">
                  {notice.description}
                </p>

              </div>

              <div className="h-3 w-3 rounded-full bg-red-500" />

            </div>

            <p className="mt-4 text-xs text-slate-400">
              {new Date(
                notice.createdAt
              ).toLocaleDateString()}
            </p>

          </div>
        )
      )}

    </div>

  )}

</div>

    </div>

  </div>
);
}
