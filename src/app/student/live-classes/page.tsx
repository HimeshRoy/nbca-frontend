"use client";

import { useEffect, useState } from "react";
import {
  getStudentLiveClasses,
  joinLiveClass,
} from "@/services/live-class.service";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { toast } from "sonner";
import {
  Video,
  CalendarClock,
  Radio,
  Clock,
  CheckCircle2,
  BookOpen,
  User,
  Calendar,
  Check,
  VideoOff,
  ExternalLink,
  Loader2,
} from "lucide-react";

export default function StudentLiveClassesPage() {
  const [loading, setLoading] = useState(true);
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const handleJoinClass = async (id: string) => {
    try {
      setJoiningId(id);
      const result = await joinLiveClass(id);

      toast.success(result.data.message);
      window.open(result.data.meetingLink, "_blank");

      const refreshed = await getStudentLiveClasses();
      setLiveClasses(refreshed.data);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Unable to join live class.",
      );
    } finally {
      setJoiningId(null);
    }
  };

  useEffect(() => {
    const loadLiveClasses = async () => {
      try {
        const result = await getStudentLiveClasses();
        setLiveClasses(result.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadLiveClasses();
  }, []);

  const liveNow = liveClasses.filter((c) => c.status === "LIVE");
  const upcoming = liveClasses.filter((c) => c.status === "UPCOMING");
  const completed = liveClasses.filter((c) => c.status === "COMPLETED");

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
        <p className="mt-4 animate-pulse font-medium text-slate-500">
          Loading live classes...
        </p>
      </div>
    );
  }

  const renderSection = (
    title: string,
    icon: React.ReactNode,
    classes: any[],
    theme: "live" | "upcoming" | "completed",
  ) => {
    const themes = {
      live: {
        text: "text-rose-600",
        badge: "bg-rose-100 text-rose-700 border-rose-200",
        emptyIcon: <VideoOff size={32} className="text-rose-300" />,
      },
      upcoming: {
        text: "text-amber-600",
        badge: "bg-amber-100 text-amber-700 border-amber-200",
        emptyIcon: <CalendarClock size={32} className="text-amber-300" />,
      },
      completed: {
        text: "text-slate-600",
        badge: "bg-slate-100 text-slate-600 border-slate-200",
        emptyIcon: <CheckCircle2 size={32} className="text-slate-300" />,
      },
    };

    const currentTheme = themes[theme];

    return (
      <div className="mt-10 first:mt-8">
        <h2 className="mb-5 flex items-center gap-2 text-xl md:text-2xl font-bold text-slate-800">
          <span className={currentTheme.text}>{icon}</span> {title}
        </h2>

        {classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
              {currentTheme.emptyIcon}
            </div>
            <p className="font-medium text-slate-500">
              No {title.toLowerCase()} available.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {classes.map((liveClass: any) => (
              <div
                key={liveClass.id}
                className="group rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:border-violet-200 hover:shadow-md md:p-8"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-violet-700 transition-colors">
                      {liveClass.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500 max-w-2xl">
                      {liveClass.description}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${currentTheme.badge}`}
                    >
                      {theme === "live" && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                        </span>
                      )}
                      {liveClass.status}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                  <div>
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <BookOpen size={14} /> Subject
                    </p>
                    <p className="font-semibold text-slate-700">
                      {liveClass.subject.name}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <User size={14} /> Teacher
                    </p>
                    <p className="font-semibold text-slate-700">
                      {liveClass.teacher.name}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <Calendar size={14} /> Starts
                    </p>
                    <div className="font-semibold text-slate-700 text-sm">
                      {new Date(liveClass.startTime).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                        },
                      )}
                      <span className="mx-1.5 text-slate-300">•</span>
                      {new Date(liveClass.startTime).toLocaleTimeString(
                        "en-IN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <Clock size={14} /> Ends
                    </p>
                    <div className="font-semibold text-slate-700 text-sm">
                      {new Date(liveClass.endTime).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                      <span className="mx-1.5 text-slate-300">•</span>
                      {new Date(liveClass.endTime).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    {liveClass.hasAttended && (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-100">
                        <Check size={14} /> Attended
                      </span>
                    )}
                  </div>

                  <div className="w-full sm:w-auto">
                    {liveClass.canJoin ? (
                      <button
                        onClick={() => handleJoinClass(liveClass.id)}
                        disabled={joiningId === liveClass.id}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-8 py-3.5 font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                      >
                        {joiningId === liveClass.id ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />{" "}
                            Joining...
                          </>
                        ) : (
                          <>
                            Join Class <ExternalLink size={18} />
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-8 py-3.5 font-bold text-slate-400 cursor-not-allowed"
                      >
                        {liveClass.status === "UPCOMING"
                          ? "Available 5 Mins Before"
                          : liveClass.status === "COMPLETED"
                            ? "Class Completed"
                            : "Not Available"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 pb-24 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 shadow-sm">
            <Video size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">
              Live Classes
            </h1>
            <p className="text-sm font-medium text-slate-500">
              Join your scheduled live classes
            </p>
          </div>
        </div>

        {renderSection(
          "Live Now",
          <Radio className="animate-pulse" />,
          liveNow,
          "live",
        )}
        {renderSection(
          "Upcoming Classes",
          <CalendarClock />,
          upcoming,
          "upcoming",
        )}
        {renderSection(
          "Completed Classes",
          <CheckCircle2 />,
          completed,
          "completed",
        )}
      </div>
    </div>
  );
}
