"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { getStudentChapterResources } from "@/services/resource.service";
import { Video, FileText, FolderOpen, ExternalLink, Link as LinkIcon } from "lucide-react";

export default function ResourcesPage() {
  const params = useParams();
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResources = async () => {
      try {
        const result = await getStudentChapterResources(
          params.chapterId as string
        );
        setResources(result.data || []);
      } catch (error) {
        console.error("Failed to load resources:", error);
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, [params.chapterId]);

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
        <p className="text-slate-500 font-medium animate-pulse mt-4">Loading resources...</p>
      </div>
    );
  }

  const getResourceIcon = (type: string) => {
    if (type === "VIDEO") return <Video size={24} className="text-rose-600" />;
    if (type === "LINK") return <LinkIcon size={24} className="text-blue-600" />;
    return <FileText size={24} className="text-violet-600" />;
  };

  const getResourceBadge = (type: string) => {
    if (type === "VIDEO") return "bg-rose-50 text-rose-700 border-rose-100";
    if (type === "LINK") return "bg-blue-50 text-blue-700 border-blue-100";
    return "bg-violet-50 text-violet-700 border-violet-100";
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
 
        <div className="mb-8 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <FolderOpen size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">Study Materials</h1>
              <p className="text-sm font-medium text-slate-500">Access documents, videos, and links</p>
            </div>
          </div>
        </div>
        {resources.length === 0 ? (
          <div className="rounded-3xl bg-white border border-slate-100 p-12 text-center shadow-sm flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <FileText size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">No Resources Found</h3>
            <p className="text-slate-500 mt-2 text-sm max-w-md">
              There are currently no materials available for this chapter. Check back later.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {resources.map((resource: any) => (
              <div
                key={resource.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-6 rounded-3xl bg-white p-5 md:p-6 border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center border ${getResourceBadge(resource.type)}`}>
                    {getResourceIcon(resource.type)}
                  </div>
       
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 line-clamp-2">
                      {resource.title}
                    </h2>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${getResourceBadge(resource.type)}`}>
                        {resource.type || "Document"}
                      </span>
                      {resource.description && (
                        <span className="text-sm text-slate-500 line-clamp-1">
                          • {resource.description}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <a
                  href={resource.fileUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:-translate-y-0.5 shadow-md shadow-slate-200 shrink-0"
                >
                  Open Resource <ExternalLink size={16} />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}