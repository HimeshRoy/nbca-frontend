"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getStudentTestById } from "@/services/test.service";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

import { 
  BookOpen, 
  FileQuestion, 
  Timer, 
  Trophy, 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  Wifi, 
  PlayCircle,
  FileText
} from "lucide-react";

export default function StudentTestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTest = async () => {
      try {
        const result = await getStudentTestById(params.testId as string);
        setTest(result.data);
      } finally {
        setLoading(false);
      }
    };
    loadTest();
  }, [params.testId]);

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
        <p className="mt-4 animate-pulse font-medium text-slate-500">Loading test details...</p>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center text-slate-500">
        <AlertTriangle size={48} className="mb-4 text-slate-300" />
        <h2 className="text-xl font-bold text-slate-700">Test Not Found</h2>
        <p className="mt-2 text-sm">The test you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-24 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
 
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-full blur-3xl opacity-60 -z-10" />
          
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-violet-700 border border-violet-100">
            <BookOpen size={14} /> {test.subject.name}
          </div>

          <h1 className="mt-5 text-2xl md:text-3xl font-extrabold text-slate-800">
            {test.title}
          </h1>

          <p className="mt-3 leading-relaxed text-slate-500">
            {test.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-transform hover:-translate-y-1">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <FileQuestion size={16} className="text-violet-500" /> Questions
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-800">
              {test.questions.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-transform hover:-translate-y-1">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Timer size={16} className="text-blue-500" /> Duration
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-800">
              {test.duration}<span className="text-xl text-slate-400">m</span>
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-transform hover:-translate-y-1">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Trophy size={16} className="text-emerald-500" /> Total Marks
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-800">
              {test.totalMarks}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-transform hover:-translate-y-1">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Target size={16} className="text-orange-500" /> Pass Marks
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-800">
              {test.passingMarks}
            </h2>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <FileText className="text-slate-400" /> Exam Instructions
          </h2>

          <div className="mt-6 space-y-4">
            <div className="flex gap-4 items-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <CheckCircle2 size={18} />
              </div>
              <p className="pt-1 text-slate-600 leading-relaxed">
                Read every question carefully before selecting your answer.
              </p>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <Timer size={18} />
              </div>
              <p className="pt-1 text-slate-600 leading-relaxed">
                You have <strong className="text-slate-800">{test.duration} minutes</strong> to complete this test. The timer cannot be paused.
              </p>
            </div>

            {test.negativeMarks > 0 && (
              <div className="flex gap-4 items-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                  <AlertTriangle size={18} />
                </div>
                <p className="pt-1 text-slate-600 leading-relaxed">
                  Negative Marking is enabled:
                  <strong className="text-slate-800"> {test.negativeMarks} mark(s)</strong> will be deducted per incorrect answer.
                </p>
              </div>
            )}

            <div className="flex gap-4 items-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Wifi size={18} />
              </div>
              <p className="pt-1 text-slate-600 leading-relaxed">
                Ensure you have a stable internet connection before starting.
              </p>
            </div>
          </div>
        </div>

        {test.attempted ? (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-bold text-emerald-800">
              Test Completed
            </h2>
            <p className="mt-2 text-emerald-600 font-medium">
              You have already completed this test. Here is your score:
            </p>
            <div className="mt-6 inline-block rounded-2xl bg-white px-8 py-4 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Your Score</p>
              <p className="mt-1 text-4xl font-extrabold text-slate-800">
                {test.attempt?.score} <span className="text-xl text-slate-400">/ {test.totalMarks}</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="pt-2">
            <button
              onClick={() => router.push(`/student/tests/${test.id}/attempt`)}
              className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-violet-600 px-8 py-5 text-lg font-bold text-white shadow-sm transition-all hover:-translate-y-1 hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-200"
            >
              <PlayCircle size={24} className="transition-transform group-hover:scale-110" />
              Start Test Now
            </button>
          </div>
        )}

      </div>
    </div>
  );
}