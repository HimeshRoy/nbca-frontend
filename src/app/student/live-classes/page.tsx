"use client";

import { useEffect, useState } from "react";
import {
  getStudentLiveClasses,
  joinLiveClass,
} from "@/services/live-class.service";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

import { toast } from "sonner";
import { Calendar, TimerIcon } from "lucide-react";

export default function StudentLiveClassesPage() {
  const [loading, setLoading] = useState(true);
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const handleJoinClass = async (id: string) => {
    try {
      setJoiningId(id);

      const result = await joinLiveClass(id);
      console.log(result);

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

  const liveNow = liveClasses.filter(
    (liveClass) => liveClass.status === "LIVE",
  );

  const upcoming = liveClasses.filter(
    (liveClass) => liveClass.status === "UPCOMING",
  );

  const completed = liveClasses.filter(
    (liveClass) => liveClass.status === "COMPLETED",
  );

  if (loading) {
     return (
      <div className="min-h-screen flex items-center justify-center">
        {" "}
        <DotLottieReact
          src="https://lottie.host/76c6039e-b54f-404a-a86e-c59b4cd8f120/YjiU8gWpwg.lottie"
          loop
          autoplay
        />
      </div>
    );
  }

  const renderSection = (title: string, classes: any[]) => (
    <div className="mt-8">
      <h2 className="mb-5 text-2xl font-bold text-slate-800">{title}</h2>

      {classes.length === 0 ? (
        <div className="rounded-[25px] bg-white p-6 text-center text-slate-500 shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">
          No classes available.
        </div>
      ) : (
        <div className="space-y-5">
          {classes.map((liveClass: any) => (
            <div
              key={liveClass.id}
              className="rounded-[30px] bg-white p-6 shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {liveClass.title}
                  </h2>

                  <p className="mt-2 text-slate-500">{liveClass.description}</p>
                </div>

                <span
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    liveClass.status === "LIVE"
                      ? "bg-green-100 text-green-700"
                      : liveClass.status === "UPCOMING"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {liveClass.status}
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Subject</p>

                  <p className="font-semibold">{liveClass.subject.name}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Teacher</p>

                  <p className="font-semibold">{liveClass.teacher.name}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Starts</p>

                  <p className="mt-2 font-semibold flex items-center justify-around">
                    <Calendar/>{" "} {new Date(liveClass.startTime).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    <TimerIcon/>{" "} {new Date(liveClass.startTime).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Ends</p>

                  <p className="mt-2 font-semibold flex items-center justify-around">
                   <Calendar/> {" "} {new Date(liveClass.endTime).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    <TimerIcon/> {" "} {new Date(liveClass.endTime).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              {liveClass.hasAttended && (
                <span className="mt-4 inline-flex rounded-full bg-green-100 px-3 py-2 text-center text-sm font-semibold text-green-700">
                  ✅ Attended
                </span>
              )}

              <div className="mt-6">
                {liveClass.canJoin ? (
                  <button
                    onClick={() => handleJoinClass(liveClass.id)}
                    disabled={joiningId === liveClass.id}
                    className="w-full rounded-2xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {joiningId === liveClass.id
                      ? "Joining..."
                      : "Join Live Class"}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full cursor-not-allowed rounded-2xl bg-slate-200 px-5 py-3 font-semibold text-slate-500"
                  >
                    {liveClass.status === "UPCOMING"
                      ? "Available 5 Minutes Before"
                      : liveClass.status === "COMPLETED"
                        ? "Class Completed"
                        : "Not Available"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[35px] bg-white p-8 shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">
          <h1 className="text-3xl font-bold text-slate-800">Live Classes</h1>

          <p className="mt-2 text-slate-500">
            Join your scheduled live classes.
          </p>
        </div>

        {renderSection("🔴 Live Classes", liveNow)}

        {renderSection("🟡 Upcoming Classes", upcoming)}

        {renderSection("⚫ Completed Classes", completed)}
      </div>
    </div>
  );
}
