"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getStudentTestById } from "@/services/test.service";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

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
  }, []);

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

  if (!test) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Test not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[35px] bg-white p-6 shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">
          <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700">
            {test.subject.name}
          </span>

          <h1 className="mt-4 text-3xl font-bold">{test.title}</h1>

          <p className="mt-4 text-slate-500">{test.description}</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-[28px] bg-white p-5 shadow-[15px_15px_40px_#d9d9d9,-15px_-15px_40px_#ffffff]">
            <p className="text-sm text-slate-500">Questions</p>

            <h2 className="mt-2 text-3xl font-bold text-violet-600">
              {test.questions.length}
            </h2>
          </div>

          <div className="rounded-[28px] bg-white p-5 shadow-[15px_15px_40px_#d9d9d9,-15px_-15px_40px_#ffffff]">
            <p className="text-sm text-slate-500">Duration</p>

            <h2 className="mt-2 text-3xl font-bold text-blue-600">
              {test.duration}m
            </h2>
          </div>

          <div className="rounded-[28px] bg-white p-5 shadow-[15px_15px_40px_#d9d9d9,-15px_-15px_40px_#ffffff]">
            <p className="text-sm text-slate-500">Total Marks</p>

            <h2 className="mt-2 text-3xl font-bold text-green-600">
              {test.totalMarks}
            </h2>
          </div>

          <div className="rounded-[28px] bg-white p-5 shadow-[15px_15px_40px_#d9d9d9,-15px_-15px_40px_#ffffff]">
            <p className="text-sm text-slate-500">Pass Marks</p>

            <h2 className="mt-2 text-3xl font-bold text-orange-500">
              {test.passingMarks}
            </h2>
          </div>
        </div>
        <div className="mt-6 rounded-[35px] bg-white p-6 shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">

  <h2 className="text-2xl font-bold">
    📋 Exam Instructions
  </h2>

  <div className="mt-6 space-y-4">

    <div className="flex gap-3">
      <span>✅</span>
      <p>
        Read every question carefully before selecting your answer.
      </p>
    </div>

    <div className="flex gap-3">
      <span>⏱</span>
      <p>
        You have <strong>{test.duration} minutes</strong> to complete this test.
      </p>
    </div>

    <div className="flex gap-3">
      <span>📝</span>
      <p>
        Total Questions: <strong>{test.questions.length}</strong>
      </p>
    </div>

    <div className="flex gap-3">
      <span>🎯</span>
      <p>
        Total Marks: <strong>{test.totalMarks}</strong>
      </p>
    </div>

    <div className="flex gap-3">
      <span>🏆</span>
      <p>
        Passing Marks: <strong>{test.passingMarks}</strong>
      </p>
    </div>

    {test.negativeMarks > 0 && (
      <div className="flex gap-3">
        <span>⚠️</span>
        <p>
          Negative Marking:
          <strong> {test.negativeMarks} mark(s)</strong>
          per incorrect answer.
        </p>
      </div>
    )}

    <div className="flex gap-3">
      <span>📡</span>
      <p>
        Ensure you have a stable internet connection before starting.
      </p>
    </div>

  </div>

</div>

{test.attempted ? (

  <div className="mt-6 rounded-[35px] bg-green-100 p-6 text-center">

    <h2 className="text-2xl font-bold text-green-700">
      ✅ Test Already Attempted
    </h2>

    <p className="mt-3 text-green-700">
      You have already completed this test.
    </p>

    <p className="mt-5 text-4xl font-bold">
      {test.attempt?.score}/{test.totalMarks}
    </p>

  </div>

) : ( <div className="mt-6">

  <button
    onClick={() =>
      router.push(
        `/student/tests/${test.id}/attempt`
      )
    }
    className="
      w-full
      rounded-[30px]
      bg-gradient-to-r
      from-violet-600
      to-indigo-600
      py-5
      text-xl
      font-bold
      text-white
      transition
      hover:scale-[1.01]
    "
  >
    🚀 Start Test
  </button>

</div>)}

      </div>
    </div>
  );
}
