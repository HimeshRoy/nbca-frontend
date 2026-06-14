import {
  UserPlus,
  Video,
  BookOpen,
  ClipboardCheck,
  FileText,
  TrendingUp,
} from "lucide-react";

export default function LearningJourney() {
  const steps = [
    {
      title: "Enroll",
      description: "Register and become a part of NBCA.",
      icon: UserPlus,
    },
    {
      title: "Attend Classes",
      description: "Join live interactive classes with teachers.",
      icon: Video,
    },
    {
      title: "Study Materials",
      description: "Access notes, videos and learning resources.",
      icon: BookOpen,
    },
    {
      title: "Assignments",
      description: "Practice concepts through regular assignments.",
      icon: ClipboardCheck,
    },
    {
      title: "Online Tests",
      description: "Evaluate your understanding and preparation.",
      icon: FileText,
    },
    {
      title: "Track Progress",
      description: "Monitor attendance, marks and performance.",
      icon: TrendingUp,
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Your Learning Journey
          </h2>

          <p className="mt-4 text-gray-600">
            A simple and structured path towards academic success.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.title}
                className="relative rounded-2xl border border-gray-200 p-6"
              >
                <span className="absolute right-4 top-4 text-4xl font-bold text-gray-300">
                  {index + 1}
                </span>

                <div className="mb-4 inline-flex rounded-xl bg-blue-100 p-3">
                  <Icon className="h-6 w-6 text-blue-700" />
                </div>

                <h3 className="text-xl font-semibold text-gray-900">
                  {step.title}
                </h3>

                <p className="mt-3 text-gray-600">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
