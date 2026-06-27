"use client";

import { useEffect, useState } from "react";

import { getStudentNotices } from "@/services/notice.service";

export default function StudentNoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotices = async () => {
      try {
        const result = await getStudentNotices();

        setNotices(result.data);
      } finally {
        setLoading(false);
      }
    };

    loadNotices();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-24">

      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-slate-800">
  📢 Notices
</h1>

<p className="mt-2 text-slate-500">
  Stay updated with announcements from your teachers and the academy.
</p>

{notices.length === 0 ? (
  <div className="mt-10 rounded-[35px] bg-white p-10 text-center shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">

    <div className="text-6xl">
      📭
    </div>

    <h2 className="mt-5 text-2xl font-bold">
      No Notices Yet
    </h2>

    <p className="mt-3 text-slate-500">
      Your teachers haven't published any notices.
    </p>

  </div>
) : (
  <div className="mt-8 space-y-5">

  {notices.map((notice: any) => (

    <div
      key={notice.id}
      className="rounded-[32px] bg-white p-6 shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]"
    >

      <div className="flex items-start justify-between">

        <div>

          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
            📢 Notice
          </span>

          <h2 className="mt-4 text-2xl font-bold text-slate-800">
            {notice.title}
          </h2>

        </div>

      </div>

      <p className="mt-3 whitespace-pre-line leading-8 text-slate-600">
        {notice.description}
      </p>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">

        <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
          📅 {new Date(notice.createdAt).toLocaleDateString()}
        </div>

      </div>

    </div>

  ))}

</div>
)}

      </div>

    </div>
  );
}