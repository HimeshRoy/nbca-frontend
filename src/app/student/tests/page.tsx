"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

import { getStudentTests } from "@/services/test.service";
import TestCard from "@/components/student/TestCard";
import { 
  Search, 
  ClipboardEdit, 
  PlayCircle, 
  Clock, 
  Award, 
  FileQuestion
} from "lucide-react";

export default function StudentTestsPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTests = async () => {
    try {
      const result = await getStudentTests();
      setTests(result.data);
    } catch (error) {
      console.error("Failed to load tests:", error);
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
      test.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [tests, search]);

  const availableTests = filteredTests.filter((test) => !test.attempted);
  const pendingResults = filteredTests.filter((test) => test.attempted && !test.resultAvailable);
  const completedTests = filteredTests.filter((test) => test.attempted && test.resultAvailable);

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
        <p className="text-slate-500 font-medium animate-pulse mt-4">Loading your tests...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        
        <div className="mb-6 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center shadow-sm">
              <ClipboardEdit size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">My Tests</h1>
              <p className="text-sm font-medium text-slate-500">Practice, attempt, and improve your scores</p>
            </div>
          </div>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tests by title..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm font-medium text-slate-700 outline-none transition-all focus:border-violet-500 focus:ring-1 focus:ring-violet-500 shadow-sm"
          />
        </div>

        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <PlayCircle size={24} className="text-blue-600" />
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">Available Tests</h2>
          </div>

          {availableTests.length === 0 ? (
            <div className="rounded-3xl bg-white border border-slate-100 p-8 md:p-12 text-center shadow-sm flex flex-col items-center">
              <div className="w-48 h-48 mb-2">
                <DotLottieReact
                  src="https://lottie.host/90566b91-0585-4a17-aa1f-d9834142cbb1/CylrBEfNPK.lottie"
                  loop
                  autoplay
                />
              </div>
              <h3 className="text-lg font-bold text-slate-700">No Tests Available</h3>
              <p className="text-slate-500 mt-2 text-sm max-w-md">
                Your teachers haven't published any new tests for you yet. Check back later!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {availableTests.map((test: any) => (
                <button
                  title="Click to start the test"
                  key={test.id}
                  onClick={() => router.push(`/student/tests/${test.id}`)}
                  className="group block w-full text-left rounded-3xl bg-white p-5 border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-blue-200"
                >
                  <TestCard test={test} type="available" />
                </button>
              ))}
            </div>
          )}
        </div>

        {pendingResults.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={24} className="text-amber-500" />
              <h2 className="text-xl md:text-2xl font-bold text-slate-800">Submitted Tests</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {pendingResults.map((test: any) => (
                <div key={test.id} className="rounded-3xl bg-white p-5 border border-slate-100 shadow-sm transition-all hover:border-amber-200">
                  <TestCard
                    test={test}
                    type="pending"
                    onResultAvailable={loadTests}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {completedTests.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Award size={24} className="text-emerald-500" />
              <h2 className="text-xl md:text-2xl font-bold text-slate-800">Completed Tests</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {completedTests.map((test: any) => (
                <div key={test.id} className="rounded-3xl bg-white p-5 border border-slate-100 shadow-sm transition-all hover:border-emerald-200">
                  <TestCard test={test} type="completed" />
                </div>
              ))}
            </div>
          </div>
        )}

        {tests.length > 0 && availableTests.length === 0 && pendingResults.length === 0 && completedTests.length === 0 && (
          <div className="rounded-3xl bg-white border border-slate-100 p-12 text-center shadow-sm flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <FileQuestion size={36} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">No matching tests</h3>
            <p className="text-slate-500 mt-2 text-sm max-w-md">
              We couldn't find any tests matching "{search}". Try adjusting your search.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}