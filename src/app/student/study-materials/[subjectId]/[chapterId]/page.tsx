"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { getStudentChapterResources } from "@/services/resource.service";

export default function ResourcesPage() {
  const params = useParams();

  const [resources, setResources] = useState<any[]>([]);

  useEffect(() => {
    const loadResources = async () => {
      const result = await getStudentChapterResources(
        params.chapterId as string,
      );

      setResources(result.data || []);
    };

    loadResources();
  }, []);

  return (
    <div className="min-h-screen p-4 pb-24 md:p-8">
      <h1 className="text-3xl font-bold">Resources</h1>

      <div className="mt-8 space-y-4">
        {resources.map((resource: any) => (
          <div
            key={resource.id}
            className="
              rounded-[30px]
              bg-white
              p-5
              shadow-[15px_15px_40px_#d9d9d9,-15px_-15px_40px_#ffffff]
            "
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-bold">{resource.title}</h2>

                <p className="mt-1 text-sm text-slate-500">{resource.type}</p>
              </div>

              <div className="text-4xl">
                {resource.type === "VIDEO" ? "🎥" : "📄"}
              </div>
            </div>

            <a
              href={resource.fileUrl}
              target="_blank"
              className="
                  mt-4
                  inline-block
                  rounded-xl
                  bg-violet-600
                  px-4
                  py-2
                  text-white
                "
            >
              Open Resource
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
