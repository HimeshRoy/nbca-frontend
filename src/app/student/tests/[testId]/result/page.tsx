"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { getStudentTestResult } from "@/services/testResult.service";

export default function TestResultPage() {
  const params = useParams();

  const [result, setResult] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResult = async () => {
      try {
        const response = await getStudentTestResult(params.testId as string);

        setResult(response.data);
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Result not found
      </div>
    );
  }

  const question = result.questions[currentQuestion];

  const studentAnswer = result.answers.find(
    (answer: any) => answer.questionId === question.id,
  );

  const getStudentAnswer = (questionId: string) => {
    return result.answers.find(
      (answer: any) => answer.questionId === questionId,
    );
  };

  const options = [
    {
      key: "A",
      value: question.optionA,
    },
    {
      key: "B",
      value: question.optionB,
    },
    {
      key: "C",
      value: question.optionC,
    },
    {
      key: "D",
      value: question.optionD,
    },
  ];

  const percentage = result.percentage;

  let performance = {
    emoji: "📚",
    title: "Keep Learning!",
    message:
      "Revise the chapter and try again. Every test is a chance to improve.",
  };

  if (percentage >= 90) {
    performance = {
      emoji: "🏆",
      title: "Outstanding!",
      message: "Excellent work! You're performing at an exceptional level.",
    };
  } else if (percentage >= 75) {
    performance = {
      emoji: "🎉",
      title: "Great Job!",
      message:
        "You're doing really well. A little more practice will make you even stronger.",
    };
  } else if (percentage >= 50) {
    performance = {
      emoji: "👏",
      title: "Good Effort!",
      message:
        "You're on the right track. Keep practicing to improve your score.",
    };
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[35px] bg-white p-8 shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">
          <div className="text-center">
            <div className="text-7xl">
              {result.score >= result.test.passingMarks ? "🏆" : "📚"}
            </div>

            <h1 className="mt-5 text-xl font-bold text-slate-800">
              {result.test.title}
            </h1>

            <p className="mt-2 text-slate-500">{result.test.subject.name}</p>

            <div className="mt-8">
              <p className="text-sm uppercase tracking-wider text-slate-500">
                Your Score
              </p>

              <h2 className="mt-2 text-6xl font-extrabold text-violet-600">
                {result.score}
                <span className="text-3xl text-slate-400">
                  /{result.test.totalMarks}
                </span>
              </h2>
            </div>

            <div
              className={`mt-8 inline-flex rounded-full px-6 py-3 font-bold ${
                result.score >= result.test.passingMarks
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {result.score >= result.test.passingMarks ? "PASS" : "FAIL"}
            </div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-[28px] bg-white p-5 text-center shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">
            <h3 className="mt-3 text-3xl font-bold text-violet-600">
              {result.percentage}%
            </h3>

            <p className="mt-1 text-slate-500">Percentage</p>
          </div>

          <div className="rounded-[28px] bg-white p-5 text-center shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">
            <h3 className="mt-3 text-3xl font-bold text-green-600">
              {result.correctAnswers}
            </h3>

            <p className="mt-1 text-slate-500">Correct</p>
          </div>

          <div className="rounded-[28px] bg-white p-5 text-center shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">
            <h3 className="mt-3 text-3xl font-bold text-red-600">
              {result.wrongAnswers}
            </h3>

            <p className="mt-1 text-slate-500">Wrong</p>
          </div>

          <div className="rounded-[28px] bg-white p-5 text-center shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">
            <h3 className="mt-3 text-3xl font-bold text-orange-500">
              {result.unanswered}
            </h3>

            <p className="mt-1 text-slate-500">Unanswered</p>
          </div>
        </div>

        <div className="mt-6 rounded-[35px] bg-white p-8 text-center shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">
          <div className="text-7xl">{performance.emoji}</div>

          <h2 className="mt-5 text-3xl font-bold text-slate-800">
            {performance.title}
          </h2>

          <p className="mx-auto mt-4 max-w-lg leading-8 text-slate-500">
            {performance.message}
          </p>
        </div>

        <div className="mt-8 rounded-[35px] bg-white p-6 shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Review Question</h2>

            <span className="rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">
              {currentQuestion + 1} / {result.questions.length}
            </span>
          </div>
          <div className="mt-6 rounded-[35px] bg-white p-6 shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">
                Qs. {currentQuestion + 1}
              </span>

              {studentAnswer ? (
                studentAnswer.selectedAnswer === question.correctAnswer ? (
                  <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                    Correct
                  </span>
                ) : (
                  <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">
                    Wrong
                  </span>
                )
              ) : (
                <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
                  Not Attempted
                </span>
              )}
            </div>

            <h2 className="mt-6 text-xl font-semibold leading-9 text-slate-800">
              {question.question}
            </h2>

            <div className="mt-8 space-y-4">
              {options.map((option) => {
                const isCorrect = option.key === question.correctAnswer;

                const isSelected = studentAnswer?.selectedAnswer === option.key;

                return (
                  <div
                    key={option.key}
                    className={`
          rounded-2xl
          border-2
          p-4
          transition

          ${
            isCorrect
              ? "border-green-500 bg-green-50"
              : isSelected
                ? "border-red-500 bg-red-50"
                : "border-slate-200 bg-white"
          }
        `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          {option.key}. {option.value}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {isSelected && (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                            Your Answer
                          </span>
                        )}

                        {isCorrect && (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Correct
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {question.explanation && (
                <div className="mt-6 rounded-3xl border border-blue-200 bg-blue-50 p-5">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-bold text-blue-800">
                        💡 Explanation
                      </h3>

                      <p className="mt-2 whitespace-pre-line leading-7 text-blue-700">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-8 flex gap-4">
              <button
                disabled={currentQuestion === 0}
                onClick={() => setCurrentQuestion((prev) => prev - 1)}
                className="flex-1 rounded-2xl bg-slate-200 py-4 font-semibold disabled:opacity-40"
              >
                ← Previous
              </button>

              <button
                disabled={currentQuestion === result.questions.length - 1}
                onClick={() => setCurrentQuestion((prev) => prev + 1)}
                className="flex-1 rounded-2xl bg-violet-600 py-4 font-semibold text-white disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
          <div className="mt-8 rounded-[35px] bg-white p-6 shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">
            <h3 className="mb-5 text-lg font-bold">Question Palette</h3>

            <div className="grid grid-cols-5 gap-3">
              {result.questions.map((q: any, index: number) => {
                const answer = result.answers.find(
                  (a: any) => a.questionId === q.id,
                );

                const isCorrect =
                  answer && answer.selectedAnswer === q.correctAnswer;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(index)}
                    className={`
              h-12
              rounded-xl
              font-bold

              ${currentQuestion === index ? "ring-4 ring-violet-300" : ""}

              ${
                !answer
                  ? "bg-gray-200 text-orange-500"
                  : isCorrect
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
              }
            `}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
