"use client";

import Link from "next/link";
import { 
  FaBullseye, 
  FaEye, 
  FaHistory, 
  FaCheckCircle, 
  FaVideo, 
  FaBookOpen, 
  FaPenNib, 
  FaClipboardList, 
  FaChartLine, 
  FaChalkboardTeacher,
  FaArrowRight
} from "react-icons/fa";

export default function AboutPage() {
  return (
    <main className="bg-white">

      <section className="relative overflow-hidden bg-slate-50 py-24">
        <div className="absolute inset-0 bg-blue-600/5 -z-0"></div>
        <div className="mx-auto max-w-5xl px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
            About NBCA
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg font-medium text-slate-500 leading-relaxed">
            North Bengal Cloud Academy is an online learning platform dedicated to helping students succeed through quality education, structured learning, and expert guidance.
          </p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl mb-6">
              <FaBullseye />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Our Mission</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              To make quality education accessible, affordable and engaging through technology-driven learning experiences that help students achieve their academic goals.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mb-6">
              <FaEye />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Our Vision</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              To become a trusted learning platform that empowers students with knowledge, confidence and skills for lifelong success.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-950 text-slate-200">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="flex justify-center mb-6 text-blue-500 text-3xl">
            <FaHistory />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white">Our Story</h2>
          <p className="mt-8 text-lg leading-relaxed max-w-3xl mx-auto">
            North Bengal Cloud Academy was created with a simple goal: make quality education accessible to students through structured online learning. We focus on board-based education for CBSE, ICSE and WBBSE students, helping them learn English, Mathematics and Science through live classes, study materials, assignments and assessments.
          </p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-black text-slate-900">Boards We Support</h2>
          <p className="mt-4 text-slate-500">Learning designed according to board-specific curriculum.</p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {["CBSE", "ICSE", "WBBSE"].map((board) => (
              <div key={board} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-lg transition-all hover:border-blue-200">
                <h3 className="text-2xl font-black text-blue-700">{board}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 bg-slate-50 px-4">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-black text-slate-900 text-center mb-12">Why Learn With NBCA?</h2>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: "Live Classes", icon: FaVideo },
              { title: "Study Materials", icon: FaBookOpen },
              { title: "Assignments", icon: FaPenNib },
              { title: "Online Tests", icon: FaClipboardList },
              { title: "Performance Tracking", icon: FaChartLine },
              { title: "Teacher Guidance", icon: FaChalkboardTeacher },
            ].map((feature, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 flex items-center gap-4 hover:border-blue-300 transition-colors">
                <div className="text-blue-600 text-xl"><feature.icon /></div>
                <h3 className="font-bold text-slate-800">{feature.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-black text-slate-900 text-center mb-12">Subjects We Teach</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { title: "English", desc: "Grammar, writing, comprehension and board preparation." },
              { title: "Mathematics", desc: "Concept building, practice and problem solving." },
              { title: "Science", desc: "Physics, Chemistry and Biology with clarity and depth." }
            ].map((sub, i) => (
              <div key={i} className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm hover:shadow-xl transition-shadow">
                <h3 className="text-2xl font-bold text-blue-700">{sub.title}</h3>
                <p className="mt-3 text-slate-600 text-sm leading-relaxed">{sub.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-blue-700 py-20 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white">Ready To Start Learning?</h2>
          <p className="mt-4 text-blue-100">Join NBCA and take the next step in your learning journey.</p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/register" className="rounded-2xl bg-white px-8 py-4 font-bold text-blue-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              Enroll Now <FaArrowRight />
            </Link>
            <Link href="/contact" className="rounded-2xl border-2 border-blue-400 px-8 py-4 font-bold text-white hover:bg-blue-800 transition-all">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}