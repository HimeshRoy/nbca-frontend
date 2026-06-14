import {
  BookOpen,
  Calculator,
  FlaskConical,
} from "lucide-react";

const subjects = [
  {
    title: "English",
    icon: BookOpen,
    points: [
      "Grammar",
      "Writing Skills",
      "Reading Comprehension",
      "Board Preparation",
    ],
  },
  {
    title: "Mathematics",
    icon: Calculator,
    points: [
      "Concept Building",
      "Problem Solving",
      "Practice Sessions",
      "Exam Preparation",
    ],
  },
  {
    title: "Science",
    icon: FlaskConical,
    points: [
      "Physics",
      "Chemistry",
      "Biology",
      "Practical Understanding",
    ],
  },
];

export default function CoreSubjects() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4">

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Core Subjects
          </h2>

          <p className="mt-4 text-gray-600">
            Comprehensive learning designed around board requirements.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">

          {subjects.map((subject) => {
            const Icon = subject.icon;

            return (
              <div
                key={subject.title}
                className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="mb-5 inline-flex rounded-xl bg-blue-100 p-3">
                  <Icon className="h-6 w-6 text-blue-700" />
                </div>

                <h3 className="text-2xl font-semibold text-gray-900">
                  {subject.title}
                </h3>

                <div className="mt-5 space-y-2">
                  {subject.points.map((point) => (
                    <div
                      key={point}
                      className="flex items-center gap-2"
                    >
                      <span className="text-green-600">
                        ✓
                      </span>

                      <span className="text-gray-500">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}