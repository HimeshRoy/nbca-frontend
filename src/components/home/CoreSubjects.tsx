import { BookOpen, Calculator, FlaskConical } from "lucide-react";

const subjects = [
  {
    title: "English",
    icon: BookOpen,
    color: "from-blue-500 to-cyan-500",
    bgLight: "bg-blue-50",
    textLight: "text-blue-600",
    points: ["Grammar Mastery", "Writing Skills", "Reading Comprehension", "Board Preparation"],
  },
  {
    title: "Mathematics",
    icon: Calculator,
    color: "from-indigo-500 to-purple-500",
    bgLight: "bg-indigo-50",
    textLight: "text-indigo-600",
    points: ["Concept Building", "Problem Solving", "Practice Sessions", "Exam Strategies"],
  },
  {
    title: "Science",
    icon: FlaskConical,
    color: "from-emerald-500 to-teal-500",
    bgLight: "bg-emerald-50",
    textLight: "text-emerald-600",
    points: ["Physics Foundations", "Chemistry Principles", "Biology Deep-dives", "Practical Application"],
  },
];

export default function CoreSubjects() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-black text-slate-900 md:text-4xl tracking-tight">
            Core Subjects Mastery
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Comprehensive, structured learning paths designed explicitly around board requirements to ensure top performance.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {subjects.map((subject) => {
            const Icon = subject.icon;
            return (
              <div
                key={subject.title}
                className="group rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-1.5 hover:shadow-xl hover:border-slate-200"
              >
                <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${subject.bgLight} ${subject.textLight} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className="h-7 w-7" />
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-6 relative inline-block">
                  {subject.title}
                  <span className={`absolute -bottom-2 left-0 h-1 w-12 rounded-full bg-gradient-to-r ${subject.color}`}></span>
                </h3>

                <ul className="space-y-3">
                  {subject.points.map((point) => (
                    <li key={point} className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                      <div className={`h-1.5 w-1.5 rounded-full ${subject.bgLight.replace('bg-', 'bg-').replace('50', '400')}`}></div>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}