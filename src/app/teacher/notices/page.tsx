"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaSearch,
  FaBullhorn,
  FaTimes,
  FaCalendarAlt,
  FaUsers,
  FaArrowRight,
  FaBell
} from "react-icons/fa";

import { getNotices } from "@/services/notice.service";

export default function NoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedNotice, setSelectedNotice] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(true);

  const loadNotices = async () => {
    try {
      setIsFetching(true);
      const result = await getNotices();
      setNotices(result.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load notices");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const filteredNotices = notices.filter((notice) =>
    notice.title?.toLowerCase().includes(search.toLowerCase()),
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isFetching) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
          <p className="font-medium">Loading notices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10 max-w-7xl mx-auto space-y-8">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Notice Board</h1>
          <p className="mt-1 text-slate-500">Stay updated with the latest announcements.</p>
        </div>

        <div className="relative w-full md:w-80 shrink-0">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search notices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
          />
        </div>
      </div>

      <div>
        {filteredNotices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
            <div className="p-5 bg-slate-50 rounded-full mb-4 text-slate-400 text-4xl">
              <FaBell />
            </div>
            <h3 className="text-xl font-bold text-slate-700">No Notices Found</h3>
            <p className="mt-2 text-slate-500 max-w-md">There are currently no announcements matching your search criteria.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredNotices.map((notice) => (
              <div 
                key={notice.id} 
                className="group flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-100 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-transparent opacity-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>

                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 text-xl border border-blue-100">
                      <FaBullhorn />
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      <FaUsers className="text-slate-400" /> {notice.audience}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-800 leading-snug line-clamp-2 mb-2">
                    {notice.title}
                  </h2>
                  <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">
                    {notice.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                    <FaCalendarAlt />
                    {formatDate(notice.createdAt)}
                  </div>
                  <button
                    onClick={() => setSelectedNotice(notice)}
                    className="flex items-center gap-2 text-sm font-bold text-blue-600 transition-colors hover:text-blue-700 group-hover:underline"
                  >
                    Read More <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">

            <div className="bg-slate-50 border-b border-slate-100 px-8 py-6 flex items-start justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-bl-full opacity-40 -z-0"></div>
              
              <div className="relative z-10 pr-8">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-100/50 border border-blue-200 px-2.5 py-1 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                    <FaUsers /> {selectedNotice.audience}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    <FaCalendarAlt /> {formatDate(selectedNotice.createdAt)}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 leading-tight">
                  {selectedNotice.title}
                </h2>
              </div>
              
              <button
                onClick={() => setSelectedNotice(null)}
                className="relative z-10 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors bg-white shadow-sm shrink-0"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-8">
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                {selectedNotice.description}
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-100 px-8 py-4 flex justify-end">
              <button
                onClick={() => setSelectedNotice(null)}
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
              >
                Close Notice
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}