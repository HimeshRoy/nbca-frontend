"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { getStudentChapters } from "@/services/chapter.service";
import { BookOpen, ChevronRight, Layers } from "lucide-react";

export default function ChaptersPage() {
  const router = useRouter();
  const params = useParams();
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChapters = async () => {
      try {
        const result = await getStudentChapters(params.subjectId as string);
        setChapters(result.data || []);
      } catch (error) {
        console.error("Failed to load chapters:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChapters();
  }, [params.subjectId]);

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
        <p className="text-slate-500 font-medium animate-pulse mt-4">Loading chapters...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
 
        <div className="mb-8 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Layers size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">Chapters</h1>
              <p className="text-sm font-medium text-slate-500">Select a chapter to view its resources</p>
            </div>
          </div>
        </div>

        {chapters.length === 0 ? (
          <div className="rounded-3xl bg-white border border-slate-100 p-12 text-center shadow-sm flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <BookOpen size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">No Chapters Available</h3>
            <p className="text-slate-500 mt-2 text-sm max-w-md">
              There are currently no chapters uploaded for this subject. Check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {chapters.map((chapter: any) => (
              <button
                key={chapter.id}
                onClick={() =>
                  router.push(
                    `/student/study-materials/${params.subjectId}/${chapter.id}`
                  )
                }
                className="group w-full flex flex-col text-left rounded-3xl bg-white p-6 border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-blue-200"
              >
                <div className="flex items-start justify-between gap-4 w-full">
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg mb-3">
                      Chapter {chapter.chapterNo}
                    </span>
                    <h2 className="text-lg font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                      {chapter.name}
                    </h2>
                    {chapter.description && (
                      <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                        {chapter.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}