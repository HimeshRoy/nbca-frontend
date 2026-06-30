"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getStudentTests } from "@/services/test.service";
import TestCard from "@/components/student/TestCard";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function StudentTestsPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTests = async () => {
    try {
      const result = await getStudentTests();

      setTests(result.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadTests();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const filteredTests = useMemo(() => {
    return tests.filter((test) =>
      test.title.toLowerCase().includes(search.toLowerCase()),
    );
  }, [tests, search]);

  const availableTests = filteredTests.filter((test) => !test.attempted);

  const pendingResults = filteredTests.filter(
    (test) => test.attempted && !test.resultAvailable,
  );

  const completedTests = filteredTests.filter(
    (test) => test.attempted && test.resultAvailable,
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

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold">My Tests</h1>

        <p className="mt-2 text-slate-500">
          Practice, attempt and improve your scores.
        </p>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search test..."
          className="
          mt-6
          w-full
          rounded-3xl
          bg-white
          px-5
          py-4
          outline-none
          shadow-[15px_15px_40px_#d9d9d9,-15px_-15px_40px_#ffffff]
        "
        />

        {availableTests.length === 0 ? (
          <div className="mt-8 rounded-[30px] bg-white p-8 text-center shadow-[15px_15px_40px_#d9d9d9,-15px_-15px_40px_#ffffff]">
            <div className="text-5xl"><DotLottieReact
      src="https://lottie.host/90566b91-0585-4a17-aa1f-d9834142cbb1/CylrBEfNPK.lottie"
      loop
      autoplay
    /></div>

            <h2 className="mt-4 text-xl font-bold">No Available Tests</h2>

            <p className="mt-2 text-slate-500">
              Your teacher hasn't published any tests yet.
            </p>
          </div>
        ) : (
          <>
            <h2 className="mb-4 mt-8 text-2xl font-bold">🚀 Available Tests</h2>

            <div className="space-y-5">
              {availableTests.map((test: any) => (
                <button
                  title="click to start the test"
                  key={test.id}
                  onClick={() => router.push(`/student/tests/${test.id}`)}
                  className="
            w-full
            rounded-[32px]
            bg-white
            p-5
            text-left
            transition-all
            hover:-translate-y-1
            hover:shadow-2xl
            shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]
          "
                >
                  <TestCard key={test.id} test={test} type="available" />
                </button>
              ))}
            </div>
          </>
        )}

        <div className="space-y-5">
          {pendingResults.map((test: any) => (
            <>
              <h2 className="mb-4 mt-10 text-2xl font-bold">
                ✅ Submitted Tests
              </h2>
            <TestCard
              key={test.id}
              test={test}
              type="pending"
              onResultAvailable={loadTests}
            />
            </>
          ))}

          {completedTests.length > 0 && (
            <>
              <h2 className="mb-4 mt-10 text-2xl font-bold">
                🏆 Completed Tests
              </h2>

              <div className="space-y-5">
                {completedTests.map((test: any) => (
                  <TestCard key={test.id} test={test} type="completed" />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
