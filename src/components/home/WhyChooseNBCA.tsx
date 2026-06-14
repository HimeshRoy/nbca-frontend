import {
  Users,
  ClipboardCheck,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

const trustItems = [
  {
    icon: Users,
    title: "Experienced Teachers",
    description:
      "Learn from dedicated teachers focused on conceptual understanding.",
  },
  {
    icon: ClipboardCheck,
    title: "Regular Assessments",
    description:
      "Assignments and tests help students track learning consistently.",
  },
  {
    icon: BarChart3,
    title: "Performance Tracking",
    description:
      "Monitor attendance, test scores and academic progress easily.",
  },
  {
    icon: ShieldCheck,
    title: "Safe Learning Environment",
    description:
      "Structured and distraction-free online learning experience.",
  },
];

export default function WhyParentsTrust() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4">

        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Why To Trust NBCA
          </h2>

          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Built to support students with structured learning,
            progress monitoring and consistent academic guidance.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-blue-700" />
                </div>

                <h3 className="mt-5 text-xl font-semibold text-gray-900">
                  {item.title}
                </h3>

                <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}