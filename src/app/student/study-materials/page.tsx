"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  getStudentSubjects,
} from "@/services/subject.service";

export default function StudyMaterialsPage() {
  const router = useRouter();

  const [subjects, setSubjects] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadSubjects =
      async () => {
        try {
          const result =
            await getStudentSubjects();

          setSubjects(
            result.data || []
          );
        } finally {
          setLoading(false);
        }
      };

    loadSubjects();
  }, []);

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

  const subjectIcons: Record<string, string> = {
  Physics: "⚛️",
  Chemistry: "🧪",
  Biology: "🧬",
  Mathematics: "📐",
  English: "📖",
  History: "🏛️",
  Geography: "🌍",
};

  return (
    <div className="min-h-screen p-4 md:p-8">

      <div className="mx-auto max-w-7xl">

        <h1 className="text-3xl font-bold">
          Study Materials
        </h1>

        <p className="mt-2 text-slate-500">
          Choose a subject
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">

          {subjects.map(
            (subject: any) => (
              <button
                key={subject.id}
                onClick={() =>
                  router.push(
                    `/student/study-materials/${subject.id}`
                  )
                }
                className="
                rounded-[30px]
                bg-white
                p-6
                text-left
                shadow-[15px_15px_40px_#d9d9d9,-15px_-15px_40px_#ffffff]
                transition
                hover:scale-105
              "
              >
                <div className="text-5xl">
                  {subjectIcons[subject.name] || "📚"}
                </div>

                <h2 className="mt-4 text-lg font-bold">
                  {subject.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Open Subject
                </p>

              </button>
            )
          )}

        </div>

      </div>

    </div>
  );
}