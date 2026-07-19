"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  FaBookOpen, 
  FaCalculator, 
  FaFlask, 
  FaVideo, 
  FaClipboardList, 
  FaChartLine, 
  FaCheckCircle 
} from "react-icons/fa";

export default function CoursesPage() {
  const [activeBoard, setActiveBoard] = useState("CBSE");
  const boards = ["CBSE", "ICSE", "WBBSE"];

  const subjects = [
    { title: "English", icon: FaBookOpen, desc: "Grammar, writing skills, and board-level literature analysis." },
    { title: "Mathematics", desc: "Step-by-step concept building and intensive problem-solving." },
    { title: "Science", desc: "Physics, Chemistry, and Biology made easy with practical examples." }
  ];

  return (
    <main className="bg-slate-50 min-h-screen pb-20">

      <section className="bg-white py-20 border-b border-slate-100">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Comprehensive Courses
          </h1>
          <p className="mt-4 text-slate-500 text-lg">
            Structured learning paths designed for Class 10.
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto max-w-3xl px-4 flex justify-center gap-4">
          {boards.map((board) => (
            <button
              key={board}
              onClick={() => setActiveBoard(board)}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
                activeBoard === board 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                  : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
              }`}
            >
              {board} Board
            </button>
          ))}
        </div>
      </section>

      <section className="py-10 px-4">
        <div className="mx-auto max-w-6xl grid md:grid-cols-3 gap-8">
          {subjects.map((subject, i) => (
            <div key={i} className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-black text-slate-800 mb-4">{subject.title}</h3>
              <p className="text-sm text-slate-500 mb-6">{subject.desc}</p>
              <div className="space-y-3">
                {["Live Sessions", "Study Materials", "Assignments"].map(feature => (
                  <div key={feature} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <FaCheckCircle className="text-emerald-500" /> {feature}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-12 shadow-sm border border-slate-100 text-center">
          <h2 className="text-2xl font-bold mb-10">What's Included in Every Course</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: FaVideo, label: "Live Interactive Classes" },
              { icon: FaBookOpen, label: "Detailed Study Notes" },
              { icon: FaClipboardList, label: "Regular Assignments" },
              { icon: FaChartLine, label: "Progress Tracking" }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                  <item.icon />
                </div>
                <p className="font-bold text-sm text-slate-800">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}