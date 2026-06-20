"use client";

import { useEffect, useState } from "react";

import { getNotices } from "@/services/notice.service";

export default function NoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);

  const [search, setSearch] = useState("");

  const [selectedNotice, setSelectedNotice] = useState<any>(null);

  const loadNotices = async () => {
    const result = await getNotices();

    setNotices(result.data || []);
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const filteredNotices = notices.filter((notice) =>
    notice.title?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notices</h1>

          <p className="text-slate-500">Latest announcements</p>
        </div>

        <input
          type="text"
          placeholder="Search notice..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border px-4 py-2"
        />
      </div>

      <div className="grid gap-4">
        {filteredNotices.map((notice) => (
          <div key={notice.id} className="rounded-xl bg-white p-5 shadow">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{notice.title}</h2>

              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700">
                {notice.audience}
              </span>
            </div>

            <p className="mt-3 text-slate-600">{notice.description}</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedNotice(notice)}
                className="rounded bg-blue-600 px-4 py-2 text-white"
              >
                Read More
              </button>
            </div>
          </div>
        ))}
      </div>
      {selectedNotice && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

    <div className="w-full max-w-2xl rounded-xl bg-white p-6">

      <div className="mb-4 flex items-center justify-between">

        <h2 className="text-2xl font-bold">
          {selectedNotice.title}
        </h2>

        <button
          onClick={() =>
            setSelectedNotice(null)
          }
          className="text-xl"
        >
          ✕
        </button>

      </div>

      <div className="mb-4 flex gap-3">

        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
          {selectedNotice.audience}
        </span>

        <span className="text-sm text-slate-500">
          {new Date(
            selectedNotice.createdAt
          ).toLocaleDateString()}
        </span>

      </div>

      <div className="whitespace-pre-wrap text-slate-700">
        {selectedNotice.description}
      </div>

    </div>

  </div>
)}
    </div>
  );
}
