"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { getStudentAssignments } from "@/services/assignment.service";
import { 
  Search, 
  FileText, 
  User, 
  Calendar, 
  ChevronRight, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ClipboardCheck 
} from "lucide-react";

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
        console.error("Failed to load assignments", error);
      } finally {
        setLoading(false);
      }
    };

    loadAssignments();
  }, []);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) =>
      assignment.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [assignments, search]);

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
        <p className="text-slate-500 font-medium animate-pulse mt-4">Loading your assignments...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center shadow-sm">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">Assignments</h1>
              <p className="text-sm font-medium text-slate-500">Track and complete your pending work</p>
            </div>
          </div>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Search assignments by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm font-medium text-slate-700 outline-none transition-all focus:border-violet-500 focus:ring-1 focus:ring-violet-500 shadow-sm"
          />
        </div>

        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 gap-4 md:gap-6">
          {filteredAssignments.length === 0 ? (
            <div className="col-span-full rounded-3xl bg-white border border-slate-100 p-12 text-center shadow-sm flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                <ClipboardCheck size={36} className="text-slate-300" />
              </div>
              <h2 className="text-lg font-bold text-slate-700">No Assignments Found</h2>
              <p className="text-slate-500 mt-2 text-sm max-w-md">
                {search ? "No assignments match your search query." : "You're all caught up! Enjoy your free time."}
              </p>
            </div>
          ) : (
            filteredAssignments.map((assignment: any) => (
              <button
                key={assignment.id}
                onClick={() => router.push(`/student/assignments/${assignment.id}`)}
                className="group flex flex-col w-full text-left rounded-3xl bg-white p-5 md:p-6 border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-violet-200"
              >
                <div className="flex items-start justify-between w-full mb-4">
                  <span className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {assignment.subject.name}
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-violet-50 group-hover:text-violet-600 transition-colors shrink-0">
                    <FileText size={20} />
                  </div>
                </div>

                <div className="flex-1 w-full">
                  <h2 className="text-lg md:text-xl font-bold text-slate-800 group-hover:text-violet-700 transition-colors line-clamp-2">
                    {assignment.title}
                  </h2>
                  
                  <div className="mt-4 space-y-2.5">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <User size={16} className="text-slate-400" />
                      <span className="line-clamp-1">{assignment.teacher.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <Calendar size={16} className="text-slate-400" />
                      <span>Due {new Date(assignment.dueDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 w-full flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border
                      ${
                        assignment.status === "SUBMITTED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : assignment.isOverdue
                            ? "bg-rose-50 text-rose-700 border-rose-100"
                            : "bg-amber-50 text-amber-700 border-amber-100"
                      }
                    `}
                  >
                    {assignment.status === "SUBMITTED" ? (
                      <><CheckCircle2 size={14} /> Submitted</>
                    ) : assignment.isOverdue ? (
                      <><AlertCircle size={14} /> Overdue</>
                    ) : (
                      <><Clock size={14} /> Pending</>
                    )}
                  </span>
                  
                  <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-colors">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}