import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="mx-auto max-w-6xl relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 px-6 py-20 text-center shadow-2xl shadow-blue-900/20 md:px-12 md:py-24">
        
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl"></div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-white md:text-5xl tracking-tight leading-tight">
            Ready to Accelerate Your Learning Journey?
          </h2>
          
          <p className="mt-6 text-lg font-medium text-blue-100 leading-relaxed">
            Join NBCA today. Master English, Mathematics, and Science through structured lessons, assignments, and interactive live classes.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="group flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-bold text-blue-700 transition-all hover:bg-slate-50 hover:shadow-lg hover:scale-105"
            >
              Enroll Now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/contact"
              className="flex items-center justify-center rounded-2xl border-2 border-blue-400/30 bg-blue-800/20 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-blue-800/40 hover:border-blue-400/50 backdrop-blur-sm"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}