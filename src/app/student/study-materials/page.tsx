"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { getStudentSubjects } from "@/services/subject.service";
import {
  FlaskConical,
  Calculator,
  BookOpen,
  Library,
  ChevronRight,
} from "lucide-react";

export default function StudyMaterialsPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const result = await getStudentSubjects();
        setSubjects(result.data || []);
      } catch (error) {
        console.error("Failed to load subjects:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="w-64 h-64">
          <DotLottieReact
            src="https://lottie.host/3e9542f0-9dcf-4057-ba4a-543b364545b4/ZkzyPoL8r1.lottie"
            loop
            autoplay
          />
        </div>
        <p className="text-slate-500 font-medium animate-pulse mt-4">
          Loading your subjects...
        </p>
      </div>
    );
  }

  const getSubjectIcon = (name: string) => {
    const lowerName = name.trim().toLowerCase();
    if (
      lowerName.includes("science") ||
      lowerName.includes("physics") ||
      lowerName.includes("chemistry")
    ) {
      return <FlaskConical size={32} className="text-emerald-600" />;
    }
    if (lowerName.includes("math")) {
      return <Calculator size={32} className="text-blue-600" />;
    }
    if (lowerName.includes("english") || lowerName.includes("language")) {
      return <BookOpen size={32} className="text-violet-600" />;
    }
    return <Library size={32} className="text-amber-600" />;
  };

  const getSubjectColor = (name: string) => {
    const lowerName = name.trim().toLowerCase();
    if (
      lowerName.includes("science") ||
      lowerName.includes("physics") ||
      lowerName.includes("chemistry")
    ) {
      return "bg-emerald-50 group-hover:bg-emerald-100 border-emerald-100";
    }
    if (lowerName.includes("math")) {
      return "bg-blue-50 group-hover:bg-blue-100 border-blue-100";
    }
    if (lowerName.includes("english") || lowerName.includes("language")) {
      return "bg-violet-50 group-hover:bg-violet-100 border-violet-100";
    }
    return "bg-amber-50 group-hover:bg-amber-100 border-amber-100";
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center">
              <Library size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">
                Study Materials
              </h1>
              <p className="text-sm font-medium text-slate-500">
                Select a subject to access your resources
              </p>
            </div>
          </div>
        </div>

        {subjects.length === 0 ? (
          <div className="rounded-3xl bg-white border border-slate-100 p-12 text-center shadow-sm">
            <div className="w-20 h-20 rounded-full bg-slate-50 mx-auto flex items-center justify-center mb-4">
              <BookOpen size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">
              No Subjects Found
            </h3>
            <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">
              It looks like you aren't enrolled in any subjects yet. Please
              contact your administrator if you believe this is a mistake.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {subjects.map((subject: any) => (
              <button
                key={subject.id}
                onClick={() =>
                  router.push(`/student/study-materials/${subject.id}`)
                }
                className="group relative flex flex-col items-center p-6 bg-white border border-slate-100 rounded-3xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-violet-200 w-full text-center overflow-hidden"
              >
                <div
                  className={`absolute -right-8 -top-8 w-24 h-24 rounded-full opacity-20 transition-transform duration-500 group-hover:scale-150 ${getSubjectColor(subject.name).split(" ")[0]}`}
                />

                <div
                  className={`relative z-10 w-16 h-16 mb-4 rounded-2xl flex items-center justify-center border transition-colors duration-300 ${getSubjectColor(subject.name)}`}
                >
                  <div className="transition-transform duration-300 group-hover:scale-110">
                    {getSubjectIcon(subject.name)}
                  </div>
                </div>

                <div className="relative z-10 flex flex-col items-center w-full">
                  <h2 className="text-base md:text-lg font-bold text-slate-800 line-clamp-1 w-full px-2">
                    {subject.name}
                  </h2>
                  <p className="mt-2 flex items-center justify-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-violet-600 transition-colors">
                    Open{" "}
                    <ChevronRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
