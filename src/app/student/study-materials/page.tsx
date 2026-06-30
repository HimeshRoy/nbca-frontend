"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { getStudentSubjects } from "@/services/subject.service";
import Image from "next/image";
import { FlaskConical, Calculator, BookOpen } from "lucide-react";

export default function StudyMaterialsPage() {
  const router = useRouter();

  const [subjects, setSubjects] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const result = await getStudentSubjects();

        setSubjects(result.data || []);
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
          src="https://lottie.host/3e9542f0-9dcf-4057-ba4a-543b364545b4/ZkzyPoL8r1.lottie"
          loop
          autoplay
        />
      </div>
    );
  }

  const subjectIcons: Record<string, React.ReactNode> = {
    science: <FlaskConical size={48} className="text-violet-600" />,
    mathematics: <Calculator size={48} className="text-violet-600" />,
    maths: <Calculator size={48} className="text-violet-600" />,
    english: <BookOpen size={48} className="text-violet-600" />,
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold">Study Materials</h1>

        <p className="mt-2 text-slate-500">Choose a subject</p>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {subjects.map((subject: any) => (
            <button
              key={subject.id}
              onClick={() =>
                router.push(`/student/study-materials/${subject.id}`)
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
              <div className="text-5xl text-center">
                <div className="flex justify-center">
                  {subjectIcons[subject.name.trim().toLowerCase()] || (
                    <BookOpen size={48} className="text-violet-600" />
                  )}
                </div>
              </div>

              <h2 className="mt-4 text-lg font-bold text-center">
                {subject.name}
              </h2>

              <p className="mt-1 text-sm text-slate-500 text-center">
                Open Subject
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
