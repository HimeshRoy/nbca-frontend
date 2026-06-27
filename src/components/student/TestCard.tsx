"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface TestCardProps {
  test: any;

  type: "available" | "pending" | "completed";

  onResultAvailable?: () => void;
}

export default function TestCard({
  test,
  type,
  onResultAvailable,
}: TestCardProps) {
  const router = useRouter();
  const [remainingTime, setRemainingTime] = useState("");

  useEffect(() => {
    if (type !== "pending" || !test.endTime) return;

    let interval: NodeJS.Timeout;

    const updateCountdown = () => {
      const diff = new Date(test.endTime).getTime() - Date.now();

      if (diff <= 0) {
        setRemainingTime("Result Available");

        clearInterval(interval);

        onResultAvailable?.();

        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));

      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setRemainingTime(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();

    interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [type, test.endTime, onResultAvailable]);

  return (
    <button
      onClick={() => {
        if (type === "available") {
          router.push(`/student/tests/${test.id}`);
        } else if (type === "completed") {
          router.push(`/student/tests/${test.id}/result`);
        }
      }}
      className={`
  w-full
  rounded-[32px]
  mt-8
  bg-white
  p-5
  text-left
  transition-all
  shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]

  ${
    type !== "pending"
      ? "cursor-pointer hover:-translate-y-1 hover:shadow-2xl"
      : "cursor-default"
  }
`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
            {test.subject.name}
          </span>

          <h2 className="mt-3 text-xl font-bold text-slate-800">
            📝 {test.title}
          </h2>

          <p className="mt-2 line-clamp-2 text-sm text-slate-500">
            {test.description}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Questions</p>

          <p className="mt-1 font-bold">{test.totalQuestions}</p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Duration</p>

          <p className="mt-1 font-bold">{test.duration} mins</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        {type === "available" && (
          <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
            🚀 Start Test
          </span>
        )}

        {type === "pending" && (
          <div className="flex flex-col">
            <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-700">
              ⏳ Result Pending
            </span>

            <span className="mt-2 text-xs text-slate-500">{remainingTime}</span>
          </div>
        )}

        {type === "completed" && (
          <div className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
            🏆 View Result
          </div>
        )}

        {/* {type !== "available" && test.attempt && (
          <span className="text-xl font-bold text-violet-600">
            {test.attempt.score}/{test.totalMarks}
          </span>
        )} */}
      </div>
    </button>
  );
}
