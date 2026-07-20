"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

import { getStudentTestResult } from "@/services/testResult.service";
import { 
  Trophy, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  Percent,
  ArrowLeft,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Medal,
  ThumbsUp,
  Target
} from "lucide-react";

export default function TestResultPage() {
  const params = useParams();
  const router = useRouter();

  const [result, setResult] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResult = async () => {
      try {
        const response = await getStudentTestResult(params.testId as string);
        setResult(response.data);
      } catch (error) {
        console.error("Failed to load result", error);
      } finally {
        setLoading(false);
      }
    };

    loadResult();
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
        <p className="text-slate-500 font-medium animate-pulse mt-4">Loading your results...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col min-h-[80vh] items-center justify-center p-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
          <Target size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-700">Result not found</h2>
        <button
          onClick={() => router.back()}
          className="mt-6 flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-bold text-white transition-all hover:bg-violet-700 shadow-md"
        >
          <ArrowLeft size={18} /> Go Back
        </button>
      </div>
    );
  }

  const question = result.questions[currentQuestion];
  const studentAnswer = result.answers.find(
    (answer: any) => answer.questionId === question.id,
  );

  const options = [
    { key: "A", value: question.optionA },
    { key: "B", value: question.optionB },
    { key: "C", value: question.optionC },
    { key: "D", value: question.optionD },
  ];

  const percentage = result.percentage;
  const isPassing = result.score >= result.test.passingMarks;
  let performance = {
    icon: <BookOpen size={28} className="text-blue-600" />,
    bg: "bg-blue-50 border-blue-100",
    text: "text-blue-800",
    title: "Keep Learning!",
    message: "Revise the chapter and try again. Every test is a chance to improve.",
  };

  if (percentage >= 90) {
    performance = {
      icon: <Trophy size={28} className="text-yellow-600" />,
      bg: "bg-yellow-50 border-yellow-100",
      text: "text-yellow-800",
      title: "Outstanding!",
      message: "Excellent work! You're performing at an exceptional level.",
    };
  } else if (percentage >= 75) {
    performance = {
      icon: <Medal size={28} className="text-violet-600" />,
      bg: "bg-violet-50 border-violet-100",
      text: "text-violet-800",
      title: "Great Job!",
      message: "You're doing really well. A little more practice will make you even stronger.",
    };
  } else if (percentage >= 50) {
    performance = {
      icon: <ThumbsUp size={28} className="text-emerald-600" />,
      bg: "bg-emerald-50 border-emerald-100",
      text: "text-emerald-800",
      title: "Good Effort!",
      message: "You're on the right track. Keep practicing to improve your score.",
    };
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">

        <button
          onClick={() => router.push("/student/tests")}
          className="group flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-violet-600 mb-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm transition-all group-hover:border-violet-200 group-hover:bg-violet-50">
            <ArrowLeft size={16} />
          </div>
          Back to Tests
        </button>

        <div className="rounded-3xl bg-white p-8 md:p-10 border border-slate-100 shadow-sm text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50 rounded-bl-[100px] -z-10 opacity-50 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-50 rounded-tr-[80px] -z-10 opacity-50 pointer-events-none" />
          
          <div className="relative z-10">
            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center shadow-md mb-6
              ${isPassing ? 'bg-emerald-100 text-emerald-600 shadow-emerald-200/50' : 'bg-rose-100 text-rose-600 shadow-rose-200/50'}`}
            >
              {isPassing ? <Trophy size={40} /> : <BookOpen size={40} />}
            </div>

            <span className="inline-block rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 mb-3">
              {result.test.subject.name}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-6">
              {result.test.title}
            </h1>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Total Score</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-6xl md:text-7xl font-black text-violet-600 tracking-tighter">
                  {result.score}
                </span>
                <span className="text-3xl md:text-4xl font-bold text-slate-300">
                  /{result.test.totalMarks}
                </span>
              </div>
            </div>

            <div className="mt-8">
              <span className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold border shadow-sm
                ${isPassing ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}
              >
                {isPassing ? (
                  <><CheckCircle2 size={18} /> PASSED</>
                ) : (
                  <><XCircle size={18} /> NEEDS IMPROVEMENT</>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-3xl bg-white p-5 border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3">
              <Percent size={20} />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-800">{result.percentage}%</h3>
            <p className="text-xs font-bold text-slate-400 uppercase mt-1">Accuracy</p>
          </div>

          <div className="rounded-3xl bg-white p-5 border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-800">{result.correctAnswers}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase mt-1">Correct</p>
          </div>

          <div className="rounded-3xl bg-white p-5 border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <XCircle size={20} />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-800">{result.wrongAnswers}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase mt-1">Wrong</p>
          </div>

          <div className="rounded-3xl bg-white p-5 border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-3">
              <MinusCircle size={20} />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-800">{result.unanswered}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase mt-1">Skipped</p>
          </div>
        </div>

        <div className={`rounded-3xl p-6 md:p-8 flex items-start sm:items-center gap-5 border shadow-sm ${performance.bg}`}>
          <div className="shrink-0 w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm">
            {performance.icon}
          </div>
          <div>
            <h2 className={`text-lg md:text-xl font-bold mb-1 ${performance.text}`}>
              {performance.title}
            </h2>
            <p className={`text-sm font-medium opacity-80 ${performance.text}`}>
              {performance.message}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl bg-white p-6 md:p-8 border border-slate-100 shadow-sm">

              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                <span className="inline-flex items-center rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                  Question {currentQuestion + 1} of {result.questions.length}
                </span>

                {studentAnswer ? (
                  studentAnswer.selectedAnswer === question.correctAnswer ? (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
                      <CheckCircle2 size={14} /> Correct
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 border border-rose-100 px-3 py-1.5 text-xs font-bold text-rose-700">
                      <XCircle size={14} /> Incorrect
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">
                    <MinusCircle size={14} /> Not Attempted
                  </span>
                )}
              </div>
              
              <h2 className="text-lg md:text-xl font-bold text-slate-800 leading-relaxed mb-8">
                {question.question}
              </h2>

              <div className="space-y-3">
                {options.map((option) => {
                  const isCorrect = option.key === question.correctAnswer;
                  const isSelected = studentAnswer?.selectedAnswer === option.key;

                  let borderStyle = "border-slate-200 bg-white opacity-60";
                  if (isCorrect) {
                    borderStyle = "border-emerald-500 bg-emerald-50 shadow-sm ring-1 ring-emerald-500";
                  } else if (isSelected) {
                    borderStyle = "border-rose-300 bg-rose-50 opacity-80";
                  }

                  return (
                    <div
                      key={option.key}
                      className={`flex items-start gap-4 rounded-2xl border-2 p-4 transition-all duration-300 ${borderStyle}`}
                    >
                      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2
                        ${isCorrect ? 'border-emerald-500 bg-emerald-500 text-white' : 
                          isSelected ? 'border-rose-400 bg-rose-100 text-rose-600' : 
                          'border-slate-300 bg-slate-50 text-slate-500'}`}
                      >
                        {option.key}
                      </div>
                      
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                        <p className={`text-sm md:text-base font-semibold ${isCorrect ? 'text-emerald-900' : isSelected ? 'text-rose-900' : 'text-slate-600'}`}>
                          {option.value}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {isSelected && !isCorrect && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-rose-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-600">
                              <XCircle size={12} /> Your Answer
                            </span>
                          )}
                          {isCorrect && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                              <CheckCircle2 size={12} /> {isSelected ? "Your Answer (Correct)" : "Correct Answer"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {question.explanation && (
                <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
                  <h3 className="font-bold text-blue-800 flex items-center gap-2 mb-2">
                    <Lightbulb size={18} className="text-blue-600" /> Explanation
                  </h3>
                  <p className="text-sm text-blue-900/80 leading-relaxed whitespace-pre-line">
                    {question.explanation}
                  </p>
                </div>
              )}

              <div className="mt-8 flex items-center gap-4">
                <button
                  disabled={currentQuestion === 0}
                  onClick={() => setCurrentQuestion((prev) => prev - 1)}
                  className="flex-1 flex justify-center items-center gap-2 rounded-2xl bg-slate-100 py-3.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} /> Previous
                </button>

                <button
                  disabled={currentQuestion === result.questions.length - 1}
                  onClick={() => setCurrentQuestion((prev) => prev + 1)}
                  className="flex-1 flex justify-center items-center gap-2 rounded-2xl bg-violet-600 py-3.5 text-sm font-bold text-white transition-all hover:bg-violet-700 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                  Next <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm sticky top-6">
              <h3 className="mb-4 text-sm font-bold text-slate-800 uppercase tracking-wider">Question Palette</h3>

              <div className="flex flex-wrap gap-3 mb-6 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <div className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-300" /> Correct
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <div className="w-3 h-3 rounded-full bg-rose-100 border border-rose-300" /> Incorrect
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <div className="w-3 h-3 rounded-full bg-slate-100 border border-slate-200" /> Skipped
                </div>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-4 gap-2.5">
                {result.questions.map((q: any, index: number) => {
                  const answer = result.answers.find(
                    (a: any) => a.questionId === q.id,
                  );
                  const isCorrect = answer && answer.selectedAnswer === q.correctAnswer;
                  const isActive = currentQuestion === index;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestion(index)}
                      className={`
                        h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center border
                        ${isActive ? "ring-2 ring-violet-500 ring-offset-2 scale-105" : "hover:scale-105"}
                        ${
                          !answer
                            ? "bg-slate-50 text-slate-500 border-slate-200"
                            : isCorrect
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
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
    </div>
  );
}