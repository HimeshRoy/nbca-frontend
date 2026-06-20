"use client";

import { useEffect, useState } from "react";

import { getQuestionBanks } from "@/services/question-bank.service";

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<any[]>([]);

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  const loadQuestions = async () => {
    try {
      const result = await getQuestionBanks();

      setQuestions(result.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Question Bank</h1>

          <p className="text-slate-500">Reusable questions for all tests</p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          Add Question
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-slate-500">Total Questions</p>

          <h2 className="text-3xl font-bold">{questions.length}</h2>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : questions.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          No questions added yet
        </div>
      ) : (
        <div>Questions Loaded</div>
      )}
      {open && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="w-full max-w-3xl rounded-xl bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Add Question To Bank
        </h2>

        <button
          onClick={() => setOpen(false)}
          className="text-xl"
        >
          ✕
        </button>
      </div>

      <div className="rounded-lg border border-dashed p-10 text-center">
        Question Form Coming Next
      </div>
    </div>
  </div>
)}
    </div>
  );
}
