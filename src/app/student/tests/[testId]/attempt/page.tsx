"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { attemptTest } from "@/services/testAttempt.service";
import { toast } from "sonner";
import { getStudentTestById } from "@/services/test.service";
import { useRouter } from "next/navigation";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function AttemptTestPage() {
  const router = useRouter();
  const params = useParams();

  const [test, setTest] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

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

      toast.loading("Submitting test...", {
        id: "submit-test",
      });

      const result = await attemptTest(test.id, payload);

      toast.success("Test submitted successfully!", {
        id: "submit-test",
      });

      localStorage.removeItem(examStorageKey);

      // router.replace(`/student/tests/${test.id}/result`);
    } catch (error) {
      console.error(error);

      toast.error("Failed to submit test.", {
        id: "submit-test",
      });
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
  }, []);

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
    if (submitting) return;

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitting]);

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
      <div className="min-h-screen flex items-center justify-center">
        {" "}
        <DotLottieReact
          src="https://lottie.host/8cc70ce1-7bcb-4492-b978-77cde0aad40a/QnHc4gdlQq.lottie"
          loop
          autoplay
        />
      </div>
    );
  }

  const question = test.questions[currentQuestion];

  const minutes = Math.floor(timeLeft / 60);

  const seconds = timeLeft % 60;

  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
    seconds,
  ).padStart(2, "0")}`;

  return (
    <div className="min-h-screen to-purple-100 p-4">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[35px] bg-white p-6 shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{test.title}</h1>

              <p className="mt-2 text-slate-500">{test.subject.name}</p>
            </div>

            <div className="rounded-2xl bg-red-100 px-5 py-3">
              <p className="text-sm text-red-500">Time Left</p>

              <h2 className="text-2xl font-bold text-red-600">
                {formattedTime}
              </h2>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[30px] bg-white p-5 shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">
          <div className="flex justify-between">
            <span>
              Question {currentQuestion + 1} of {test.questions.length}
            </span>

            <span>
              {Math.round(
                ((currentQuestion + 1) / test.questions.length) * 100,
              )}
              %
            </span>
          </div>

          <div className="mt-3 h-3 rounded-full bg-slate-200">
            <div
              className="h-3 rounded-full bg-violet-600"
              style={{
                width: `${((currentQuestion + 1) / test.questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="mt-6 rounded-[35px] bg-white p-5 shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">
          <h2 className="mb-5 text-lg font-bold">Questions</h2>

          <div className="grid grid-cols-5 gap-3 sm:grid-cols-8 md:grid-cols-10">
            {test.questions.map((q: any, index: number) => {
              const answered = !!answers[q.id];

              const active = currentQuestion === index;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestion(index)}
                  className={`
            h-12
            w-12
            rounded-xl
            font-semibold
            transition-all

            ${
              active
                ? "bg-violet-600 text-white"
                : answered
                  ? "bg-green-500 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }
          `}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 rounded-[35px] bg-white p-6 shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">
          <h2 className="text-xl font-bold leading-8">{question.question}</h2>

          {question.questionImage && (
            <img
              src={question.questionImage}
              alt="Question"
              className="mt-5 w-full rounded-3xl"
            />
          )}
        </div>

        <div className="mt-6 space-y-4">
          {[
            { key: "A", text: question.optionA, image: question.optionAImage },
            { key: "B", text: question.optionB, image: question.optionBImage },
            { key: "C", text: question.optionC, image: question.optionCImage },
            { key: "D", text: question.optionD, image: question.optionDImage },
          ].map((option) => (
            <button
              key={option.key}
              onClick={() =>
                setAnswers({
                  ...answers,
                  [question.id]: option.key,
                })
              }
              className={`
        w-full
        rounded-[30px]
        border-2
        p-5
        text-left
        transition-all

        ${
          answers[question.id] === option.key
            ? "border-violet-600 bg-violet-100 shadow-lg"
            : "border-transparent bg-white shadow-[15px_15px_40px_#d9d9d9,-15px_-15px_40px_#ffffff] hover:border-violet-300"
        }
      `}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            font-bold

            ${
              answers[question.id] === option.key
                ? "bg-violet-600 text-white"
                : "bg-slate-200"
            }
          `}
                >
                  {option.key}
                </div>

                <div className="flex-1">
                  <p className="leading-7">{option.text}</p>

                  {option.image && (
                    <img
                      src={option.image}
                      alt=""
                      className="mt-4 rounded-2xl"
                    />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 flex justify-between gap-4">
          <button
            disabled={currentQuestion === 0}
            onClick={() => setCurrentQuestion(currentQuestion - 1)}
            className="flex-1 rounded-2xl bg-white py-4 font-semibold shadow-lg disabled:opacity-40"
          >
            ← Previous
          </button>

          <button
            disabled={currentQuestion === test.questions.length - 1}
            onClick={() => setCurrentQuestion(currentQuestion + 1)}
            className="flex-1 rounded-2xl bg-violet-600 py-4 font-semibold text-white disabled:opacity-40"
          >
            Next →
          </button>
        </div>
        <button
          onClick={() => {
            const updated = { ...answers };
            delete updated[question.id];
            setAnswers(updated);
          }}
          className="
    mt-5
    w-full
    rounded-2xl
    border
    border-red-300
    py-4
    font-semibold
    text-red-600
    transition
    hover:bg-red-50
  "
        >
          Clear Response
        </button>

        {currentQuestion === test.questions.length - 1 && (
          <button
            onClick={() => setShowSubmitDialog(true)}
            disabled={submitting}
            className="
      mt-6
      w-full
      rounded-[30px]
      bg-green-600
      py-5
      text-lg
      font-bold
      text-white
      transition
      hover:bg-green-700
      disabled:opacity-50
    "
          >
            {submitting ? "Submitting..." : "Submit Test"}
          </button>
        )}

        {showSubmitDialog && (
          <div
            className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50"
            onClick={() => setShowSubmitDialog(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="
        w-full
        max-w-md
        rounded-t-[32px]
        bg-white
        px-6
        pt-4
        pb-8
        shadow-2xl
      "
            >
              {/* Handle */}
              <div className="mb-5 flex justify-center">
                <div className="h-1.5 w-14 rounded-full bg-slate-300" />
              </div>

              <h2 className="text-2xl font-bold">Submit Test?</h2>

              <p className="mt-6 text-slate-600">Answered</p>

              <p className="text-3xl font-bold text-green-600">
                {Object.keys(answers).length}
              </p>

              <p className="mt-5 text-slate-600">Remaining</p>

              <p className="text-3xl font-bold text-orange-500">
                {test.questions.length - Object.keys(answers).length}
              </p>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setShowSubmitDialog(false)}
                  className="flex-1 rounded-2xl bg-slate-200 py-4 font-semibold"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmit}
                  className="flex-1 rounded-2xl bg-green-600 py-4 font-semibold text-white"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {showLeaveDialog && (
          <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50">
            <div className="w-full max-w-md rounded-t-[32px] bg-white p-6">
              <div className="mb-5 flex justify-center">
                <div className="h-1.5 w-14 rounded-full bg-slate-300" />
              </div>

              <h2 className="text-2xl font-bold">Leave Exam?</h2>

              <p className="mt-4 text-slate-600">
                Leaving the exam will submit your current answers. You won't be
                able to continue this attempt.
              </p>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setShowLeaveDialog(false)}
                  className="flex-1 rounded-2xl bg-slate-200 py-4 font-semibold"
                >
                  Continue Exam
                </button>

                <button
                  onClick={handleLeaveExam}
                  className="flex-1 rounded-2xl bg-red-600 py-4 font-semibold text-white"
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
