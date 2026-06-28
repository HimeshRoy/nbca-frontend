"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getStudentAssignments } from "@/services/assignment.service";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function AssignmentsPage() {
  const router = useRouter();

  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const result = await getStudentAssignments();

        setAssignments(result.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadAssignments();
  }, []);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) =>
      assignment.title.toLowerCase().includes(search.toLowerCase()),
    );
  }, [assignments, search]);

  if (loading) {
     return (
      <div className="min-h-screen flex items-center justify-center">
        {" "}
        <DotLottieReact
          src="https://lottie.host/76c6039e-b54f-404a-a86e-c59b4cd8f120/YjiU8gWpwg.lottie"
          loop
          autoplay
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 p-4 pb-24 md:p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold">Assignments</h1>

        <p className="mt-2 text-slate-500">Complete your pending work</p>

        <input
          type="text"
          placeholder="Search assignment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            mt-6
            w-full
            rounded-3xl
            bg-white
            px-5
            py-4
            outline-none
            shadow-[12px_12px_35px_#d9d9d9,-12px_-12px_35px_#ffffff]
          "
        />

        <div className="mt-8 space-y-5">
          {filteredAssignments.length === 0 ? (
            <div className="rounded-[30px] bg-white p-8 text-center shadow-[15px_15px_40px_#d9d9d9,-15px_-15px_40px_#ffffff]">
              <div className="text-5xl">📝</div>

              <h2 className="mt-4 text-xl font-bold">No Assignments Found</h2>

              <p className="mt-2 text-slate-500">You're all caught up!</p>
            </div>
          ) : (
            filteredAssignments.map((assignment: any) => (
              <button
                key={assignment.id}
                onClick={() =>
                  router.push(`/student/assignments/${assignment.id}`)
                }
                className="
    w-full
    rounded-[32px]
    bg-white
    p-5
    text-left
    transition-all
    duration-300
    hover:-translate-y-1
    hover:shadow-2xl
    shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]
  "
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                      {assignment.subject.name}
                    </span>

                    <h2 className="mt-4 text-xl font-bold text-slate-800">
                      {assignment.title}
                    </h2>
                  </div>

                  <div className="text-4xl">📝</div>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    👨‍🏫
                    <span>{assignment.teacher.name}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    📅
                    <span>
                      Due {new Date(assignment.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <span
                    className={`
        rounded-full
        px-4
        py-2
        text-xs
        font-bold

        ${
          assignment.status === "SUBMITTED"
            ? "bg-green-100 text-green-700"
            : assignment.isOverdue
              ? "bg-red-100 text-red-700"
              : "bg-orange-100 text-orange-700"
        }
      `}
                  >
                    {assignment.status === "SUBMITTED"
                      ? "✅ Submitted"
                      : assignment.isOverdue
                        ? "🔴 Overdue"
                        : "🟠 Pending"}
                  </span>

                  <div className="text-xl">→</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
