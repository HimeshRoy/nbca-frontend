"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { attemptTest } from "@/services/testAttempt.service";
import { toast } from "sonner";
import { getStudentTestById } from "@/services/test.service";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  Timer,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Eraser,
  Send,
  BookOpen,
  LayoutGrid,
} from "lucide-react";

export default function AttemptTestPage() {
  const router = useRouter();
  const params = useParams();

  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const examStorageKey = `exam-${params.testId}`;

  const handleLeaveExam = async () => {
    await handleSubmit();
    router.replace("/student/tests");
  };

  const handleSubmit = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);

      const payload = Object.entries(answers).map(
        ([questionId, selectedAnswer]) => ({
          questionId,
          selectedAnswer,
        }),
      );

      toast.loading("Submitting test...", { id: "submit-test" });

      await attemptTest(test.id, payload);

      toast.success("Test submitted successfully!", { id: "submit-test" });

      localStorage.removeItem(examStorageKey);

      router.replace(`/student/tests`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit test.", { id: "submit-test" });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const loadTest = async () => {
      try {
        const result = await getStudentTestById(params.testId as string);

        if (result.data.attempted) {
          router.replace(`/student/tests`);
          return;
        }

        setTest(result.data);
      } finally {
        setLoading(false);
      }
    };
    loadTest();
  }, [params.testId, router]);

  useEffect(() => {
    if (!test) return;

    const saved = localStorage.getItem(examStorageKey);

    if (saved) {
      const data = JSON.parse(saved);
      setAnswers(data.answers || {});
      setCurrentQuestion(data.currentQuestion || 0);

      const elapsedSeconds = Math.floor((Date.now() - data.startTime) / 1000);
      const remaining = test.duration * 60 - elapsedSeconds;

      setTimeLeft(Math.max(remaining, 0));
    } else {
      const startTime = Date.now();
      localStorage.setItem(
        examStorageKey,
        JSON.stringify({
          startTime,
          answers: {},
          currentQuestion: 0,
        }),
      );
      setTimeLeft(test.duration * 60);
    }
  }, [test, examStorageKey]);

  useEffect(() => {
    if (submitting || timeLeft === null) return;

    if (timeLeft <= 0 && test) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitting, test]);

  useEffect(() => {
    if (!test) return;

    const existing = localStorage.getItem(examStorageKey);
    let startTime = Date.now();

    if (existing) {
      startTime = JSON.parse(existing).startTime;
    }

    localStorage.setItem(
      examStorageKey,
      JSON.stringify({
        startTime,
        answers,
        currentQuestion,
      }),
    );
  }, [answers, currentQuestion, test, examStorageKey]);

  useEffect(() => {
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      setShowLeaveDialog(true);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-64 h-64">
          <DotLottieReact
            src="https://lottie.host/8cc70ce1-7bcb-4492-b978-77cde0aad40a/QnHc4gdlQq.lottie"
            loop
            autoplay
          />
        </div>
        <p className="mt-4 animate-pulse font-medium text-slate-500">
          Preparing your test...
        </p>
      </div>
    );
  }

  const question = test.questions[currentQuestion];
  const safeTimeLeft = timeLeft ?? 0;
  const minutes = Math.floor(safeTimeLeft / 60);
  const seconds = safeTimeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const isTimeLow = safeTimeLeft < 300 && safeTimeLeft > 0;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 pb-24 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:p-8">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-violet-700 border border-violet-100">
              <BookOpen size={14} /> {test.subject.name}
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">
              {test.title}
            </h1>
          </div>

          <div
            className={`flex items-center gap-4 rounded-2xl border px-6 py-4 transition-colors ${
              isTimeLow
                ? "border-rose-200 bg-rose-50 animate-pulse"
                : "border-slate-100 bg-slate-50"
            }`}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                isTimeLow
                  ? "bg-rose-100 text-rose-600"
                  : "bg-white text-slate-500 shadow-sm"
              }`}
            >
              <Timer size={20} />
            </div>
            <div>
              <p
                className={`text-xs font-bold uppercase tracking-wider ${isTimeLow ? "text-rose-500" : "text-slate-400"}`}
              >
                Time Left
              </p>
              <h2
                className={`text-2xl font-extrabold font-mono tracking-tight ${isTimeLow ? "text-rose-600" : "text-slate-700"}`}
              >
                {formattedTime}
              </h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Progress
                  </p>
                  <p className="font-semibold text-slate-700 mt-1">
                    Question {currentQuestion + 1} of {test.questions.length}
                  </p>
                </div>
                <span className="text-sm font-extrabold text-violet-600">
                  {Math.round(
                    ((currentQuestion + 1) / test.questions.length) * 100,
                  )}
                  %
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-violet-600 transition-all duration-300 ease-out"
                  style={{
                    width: `${((currentQuestion + 1) / test.questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
                <LayoutGrid size={18} className="text-slate-400" /> Question
                Navigator
              </h2>

              <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-5 gap-2.5">
                {test.questions.map((q: any, index: number) => {
                  const answered = !!answers[q.id];
                  const active = currentQuestion === index;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestion(index)}
                      className={`
                        flex h-11 w-full items-center justify-center rounded-xl text-sm font-bold transition-all duration-200
                        ${
                          active
                            ? "bg-violet-600 text-white shadow-md ring-4 ring-violet-100 scale-105"
                            : answered
                              ? "bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                              : "bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                        }
                      `}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-violet-600" /> Current
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-200" />{" "}
                  Answered
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border border-slate-300 bg-slate-50" />{" "}
                  Pending
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 md:p-8 shadow-sm">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-500">
                  Q{currentQuestion + 1}
                </div>
                <h2 className="text-xl font-bold leading-relaxed text-slate-800 pt-1.5">
                  {question.question}
                </h2>
              </div>

              {question.questionImage && (
                <div className="mt-6 rounded-2xl border border-slate-100 overflow-hidden bg-slate-50 p-2">
                  <img
                    src={question.questionImage}
                    alt="Question visual"
                    className="w-full rounded-xl object-contain max-h-96"
                  />
                </div>
              )}
            </div>
            <div className="space-y-4">
              {[
                {
                  key: "A",
                  text: question.optionA,
                  image: question.optionAImage,
                },
                {
                  key: "B",
                  text: question.optionB,
                  image: question.optionBImage,
                },
                {
                  key: "C",
                  text: question.optionC,
                  image: question.optionCImage,
                },
                {
                  key: "D",
                  text: question.optionD,
                  image: question.optionDImage,
                },
              ].map((option) => {
                const isSelected = answers[question.id] === option.key;

                return (
                  <button
                    key={option.key}
                    onClick={() =>
                      setAnswers({
                        ...answers,
                        [question.id]: option.key,
                      })
                    }
                    className={`
                      w-full rounded-2xl border-2 p-5 text-left transition-all duration-200 group relative overflow-hidden
                      ${
                        isSelected
                          ? "border-violet-600 bg-violet-50/50 shadow-sm"
                          : "border-slate-100 bg-white hover:border-violet-200 hover:bg-slate-50"
                      }
                    `}
                  >
                    <div className="flex items-start gap-4 z-10 relative">
                      <div
                        className={`
                        flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors
                        ${isSelected ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-violet-100 group-hover:text-violet-600"}
                      `}
                      >
                        {option.key}
                      </div>

                      <div className="flex-1 pt-1">
                        <p
                          className={`font-medium leading-relaxed ${isSelected ? "text-violet-900" : "text-slate-700"}`}
                        >
                          {option.text}
                        </p>

                        {option.image && (
                          <img
                            src={option.image}
                            alt={`Option ${option.key}`}
                            className="mt-4 rounded-xl max-h-48 border border-slate-100 object-contain bg-white p-1"
                          />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
              <button
                onClick={() => {
                  const updated = { ...answers };
                  delete updated[question.id];
                  setAnswers(updated);
                }}
                disabled={!answers[question.id]}
                className="flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <Eraser size={18} /> Clear Selection
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  disabled={currentQuestion === 0}
                  onClick={() => setCurrentQuestion(currentQuestion - 1)}
                  className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40"
                >
                  <ArrowLeft size={18} /> Previous
                </button>

                {currentQuestion === test.questions.length - 1 ? (
                  <button
                    onClick={() => setShowSubmitDialog(true)}
                    disabled={submitting}
                    className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 py-3.5 font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md disabled:opacity-50"
                  >
                    <Send size={18} />{" "}
                    {submitting ? "Submitting..." : "Submit Test"}
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestion(currentQuestion + 1)}
                    className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-2xl bg-violet-600 px-8 py-3.5 font-bold text-white shadow-sm transition-all hover:bg-violet-700 hover:shadow-md"
                  >
                    Next <ArrowRight size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        {showSubmitDialog && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 sm:p-0"
            onClick={() => setShowSubmitDialog(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-[32px] bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
            >
              <div className="mb-6 flex justify-center sm:hidden">
                <div className="h-1.5 w-12 rounded-full bg-slate-200" />
              </div>

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                <CheckCircle2 size={32} />
              </div>

              <h2 className="text-center text-2xl font-bold text-slate-800">
                Submit Test?
              </h2>
              <p className="mt-2 text-center text-sm text-slate-500">
                Are you sure you want to submit your test? You cannot change
                your answers after submission.
              </p>

              <div className="mt-8 flex gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <div className="flex-1 text-center border-r border-slate-200">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Answered
                  </p>
                  <p className="mt-1 text-3xl font-bold text-emerald-600">
                    {Object.keys(answers).length}
                  </p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Remaining
                  </p>
                  <p className="mt-1 text-3xl font-bold text-amber-500">
                    {test.questions.length - Object.keys(answers).length}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3">
                <button
                  onClick={() => setShowSubmitDialog(false)}
                  className="flex-1 rounded-2xl bg-slate-100 py-4 font-bold text-slate-600 transition-colors hover:bg-slate-200"
                >
                  Review Answers
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 rounded-2xl bg-violet-600 py-4 font-bold text-white shadow-sm transition-colors hover:bg-violet-700 disabled:opacity-50"
                >
                  Confirm Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {showLeaveDialog && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 sm:p-0">
            <div className="w-full max-w-md rounded-[32px] bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
              <div className="mb-6 flex justify-center sm:hidden">
                <div className="h-1.5 w-12 rounded-full bg-slate-200" />
              </div>

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <AlertTriangle size={32} />
              </div>

              <h2 className="text-center text-2xl font-bold text-slate-800">
                Leave Exam?
              </h2>

              <p className="mt-3 text-center text-slate-600 leading-relaxed">
                Leaving now will automatically{" "}
                <strong className="text-slate-800">
                  submit your current answers
                </strong>
                . You will not be able to continue or restart this attempt.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowLeaveDialog(false)}
                  className="flex-1 rounded-2xl bg-slate-100 py-4 font-bold text-slate-700 transition-colors hover:bg-slate-200"
                >
                  Stay & Continue
                </button>
                <button
                  onClick={handleLeaveExam}
                  className="flex-1 rounded-2xl bg-rose-600 py-4 font-bold text-white shadow-sm transition-colors hover:bg-rose-700"
                >
                  Leave & Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
