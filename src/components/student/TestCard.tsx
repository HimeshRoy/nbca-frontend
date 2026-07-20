"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  PlayCircle, 
  Clock, 
  Award, 
  HelpCircle, 
  Timer,
  ChevronRight,
  Hourglass
} from "lucide-react";

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

  const handleClick = () => {
    if (type === "available") {
      router.push(`/student/tests/${test.id}`);
    } else if (type === "completed") {
      router.push(`/student/tests/${test.id}/result`);
    }
  };
  
  const isClickable = type !== "pending";
  const typeConfig = {
    available: {
      hoverBorder: "hover:border-blue-300",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      actionBg: "bg-blue-600",
      actionText: "text-white",
      actionIcon: <PlayCircle size={16} />,
      actionLabel: "Start Test",
    },
    pending: {
      hoverBorder: "hover:border-amber-200",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      actionBg: "bg-amber-100",
      actionText: "text-amber-700",
      actionIcon: <Hourglass size={16} className="animate-pulse" />,
      actionLabel: "Result Pending",
    },
    completed: {
      hoverBorder: "hover:border-emerald-300",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      actionBg: "bg-emerald-100",
      actionText: "text-emerald-700",
      actionIcon: <Award size={16} />,
      actionLabel: "View Result",
    }
  };

  const config = typeConfig[type];

  return (
    <div
      onClick={isClickable ? handleClick : undefined}
      className={`
        w-full group
        rounded-3xl bg-white p-5 md:p-6
        border border-slate-100 shadow-sm
        transition-all duration-300
        ${isClickable ? `cursor-pointer hover:shadow-md hover:-translate-y-1 ${config.hoverBorder}` : "cursor-default"}
      `}
    >

      <div className="flex items-start justify-between mb-4">
        <span className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
          {test.subject.name}
        </span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${config.iconBg} ${config.iconColor}`}>
          <FileText size={20} />
        </div>
      </div>

      <div className="mb-6">
        <h2 className={`text-lg md:text-xl font-bold text-slate-800 mb-2 transition-colors ${isClickable && `group-hover:${config.iconColor}`}`}>
          {test.title}
        </h2>
        {test.description && (
          <p className="line-clamp-2 text-sm font-medium text-slate-500 leading-relaxed">
            {test.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            <HelpCircle size={14} /> Questions
          </div>
          <p className="text-lg font-extrabold text-slate-700">{test.totalQuestions}</p>
        </div>

        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Timer size={14} /> Duration
          </div>
          <p className="text-lg font-extrabold text-slate-700">{test.duration} <span className="text-sm font-semibold text-slate-500">mins</span></p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex flex-col">
          <div className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${config.actionBg} ${config.actionText} ${type === 'available' ? 'shadow-md shadow-blue-200 group-hover:bg-blue-700' : ''}`}>
            {config.actionIcon}
            {config.actionLabel}
          </div>
          {type === "pending" && remainingTime && (
            <span className="mt-2 text-xs font-bold text-amber-500 flex items-center gap-1">
              <Clock size={12} /> {remainingTime}
            </span>
          )}
        </div>

        {isClickable && (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 ${config.iconBg} ${config.iconColor}`}>
            <ChevronRight size={16} />
          </div>
        )}
      </div>
    </div>
  );
}