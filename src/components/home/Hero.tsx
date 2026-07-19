import Link from "next/link";
import { Video, BookOpen, PenTool, TrendingUp, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white pt-24 pb-32 md:pt-36 md:pb-40">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-100/60 blur-3xl"></div>
        <div className="absolute top-32 -right-24 w-96 h-96 rounded-full bg-indigo-100/60 blur-3xl"></div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            CBSE • ICSE • WBBSE
          </span>
        </div>

        <h1 className="mt-8 text-5xl font-black tracking-tight text-slate-900 md:text-7xl animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
          Master the Core of <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Your Education
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-slate-500 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          Interactive online coaching for English, Mathematics, & Science. Experience live classes, curated study materials, and real-time performance tracking.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-7 duration-700 delay-300">
          <Link
            href="/signup"
            className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5"
          >
            Start Learning Today <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/courses"
            className="flex w-full sm:w-auto items-center justify-center rounded-2xl border-2 border-slate-200 bg-white px-8 py-4 text-sm font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
          >
            Explore Curriculum
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="mt-16 flex flex-wrap justify-center gap-3 md:gap-4 animate-in fade-in duration-1000 delay-500">
          {[
            { icon: Video, label: "Live Classes" },
            { icon: BookOpen, label: "Study Materials" },
            { icon: PenTool, label: "Assignments" },
            { icon: TrendingUp, label: "Progress Reports" },
          ].map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2 rounded-full bg-white border border-slate-100 px-5 py-2.5 text-sm font-bold text-slate-600 shadow-sm hover:shadow-md hover:border-blue-100 transition-all cursor-default">
              <feature.icon className="h-4 w-4 text-blue-600" /> {feature.label}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}