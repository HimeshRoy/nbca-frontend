import { UserPlus, Video, BookOpen, ClipboardCheck, FileText, TrendingUp } from "lucide-react";

export default function LearningJourney() {
  const steps = [
    { title: "Enroll", desc: "Register and become a part of NBCA.", icon: UserPlus },
    { title: "Attend Classes", desc: "Join live interactive classes with teachers.", icon: Video },
    { title: "Study Materials", desc: "Access notes, videos and learning resources.", icon: BookOpen },
    { title: "Assignments", desc: "Practice concepts through regular assignments.", icon: ClipboardCheck },
    { title: "Online Tests", desc: "Evaluate your understanding and preparation.", icon: FileText },
    { title: "Track Progress", desc: "Monitor attendance, marks and performance.", icon: TrendingUp },
  ];

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-black text-slate-900 md:text-4xl tracking-tight">The Path to Success</h2>
          <p className="mt-4 text-lg text-slate-500">
            A simple, highly structured, and proven path towards achieving academic excellence.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative rounded-3xl border border-slate-100 bg-slate-50/50 p-8 hover:bg-white hover:shadow-xl hover:border-slate-200 transition-all duration-300 group">
                <span className="absolute right-6 top-6 text-5xl font-black text-slate-200 group-hover:text-blue-50 transition-colors">
                  0{index + 1}
                </span>
                <div className="relative z-10">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700 shadow-sm">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm font-medium text-slate-500">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}