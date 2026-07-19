import { CheckCircle2 } from "lucide-react";

export default function BoardsSection() {
  const boards = [
    {
      name: "CBSE",
      subtitle: "Central Board of Secondary Education",
      color: "blue",
      points: ["NCERT Based Learning", "Class 9 & 10 Support", "Board Exam Preparation"],
    },
    {
      name: "ICSE",
      subtitle: "Indian Certificate of Secondary Education",
      color: "indigo",
      points: ["Concept Focused Learning", "Detailed Subject Coverage", "Regular Assessments"],
    },
    {
      name: "WBBSE",
      subtitle: "West Bengal Board of Secondary Education",
      color: "emerald",
      points: ["Board Syllabus Coverage", "Exam Oriented Preparation", "Structured Learning"],
    },
  ];

  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-slate-900 md:text-4xl tracking-tight">Tailored to Your Board</h2>
          <p className="mt-4 text-lg text-slate-500">
            Dedicated preparation designed meticulously according to the curriculum and examination pattern of each specific board.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {boards.map((board) => (
            <div
              key={board.name}
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-blue-200"
            >
              <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-slate-50 transition-transform duration-500 group-hover:scale-150 group-hover:bg-blue-50/50 -z-10"></div>
              
              <h3 className="text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{board.name}</h3>
              <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-400 h-10">
                {board.subtitle}
              </p>

              <div className="mt-8 space-y-4">
                {board.points.map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle2 className={`h-5 w-5 shrink-0 text-${board.color}-500`} />
                    <span className="text-sm font-semibold text-slate-600">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}