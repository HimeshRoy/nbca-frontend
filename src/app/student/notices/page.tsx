"use client";

import { useEffect, useState } from "react";
import { getStudentNotices } from "@/services/notice.service";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { 
  BellRing, 
  BellOff, 
  Megaphone, 
  Calendar 
} from "lucide-react";

export default function StudentNoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotices = async () => {
      try {
        const result = await getStudentNotices();
        setNotices(result.data);
      } catch (error) {
        console.error("Failed to load notices:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNotices();
  }, []);

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
        <p className="mt-4 animate-pulse font-medium text-slate-500">Loading notices...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
 
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 shadow-sm">
            <BellRing size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">Notices</h1>
            <p className="text-sm font-medium text-slate-500">
              Stay updated with announcements from your teachers and the academy
            </p>
          </div>
        </div>

        {notices.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-sm">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">
              <BellOff size={36} className="text-slate-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-700">No Notices Yet</h2>
            <p className="mt-2 max-w-md text-sm text-slate-500">
              Your teachers haven't published any notices. We'll let you know when something new arrives.
            </p>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {notices.map((notice: any) => (
              <div
                key={notice.id}
                className="group rounded-3xl border border-slate-100 bg-white p-6 md:p-8 shadow-sm transition-all duration-300 hover:border-violet-200 hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
                    <Megaphone size={14} /> Notice
                  </span>
                  
                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
                    <Calendar size={14} /> 
                    {new Date(notice.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                <h2 className="mb-3 text-xl font-bold text-slate-800 transition-colors group-hover:text-violet-700">
                  {notice.title}
                </h2>

                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600 md:text-base">
                  {notice.description}
                </p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}