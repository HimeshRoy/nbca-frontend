"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

import { getStudentChapters } from "@/services/chapter.service";

export default function ChaptersPage() {
  const router = useRouter();

  const params = useParams();

  const [chapters, setChapters] = useState<any[]>([]);

  useEffect(() => {
    const loadChapters = async () => {
      const result = await getStudentChapters(params.subjectId as string);

      setChapters(result.data || []);
    };

    loadChapters();
  }, []);

  return (
    <div className="min-h-screen p-4 pb-24 md:p-8">
      <h1 className="text-3xl font-bold">Chapters</h1>

      <div className="mt-8 space-y-4">
        {chapters.map((chapter: any) => (
          <button
            key={chapter.id}
            onClick={() =>
              router.push(
                `/student/study-materials/${params.subjectId}/${chapter.id}`,
              )
            }
            className="
              w-full
              rounded-[30px]
              bg-white
              p-5
              text-left
              shadow-[15px_15px_40px_#d9d9d9,-15px_-15px_40px_#ffffff]
            "
          >
            <h2 className="font-bold">
              Chapter {chapter.chapterNo}
              {" - "}
              {chapter.name}
            </h2>
            <p>{chapter.description}</p>

            <p className="mt-1 text-sm text-slate-500">Open Chapter</p>
          </button>
        ))}
      </div>
    </div>
  );
}
