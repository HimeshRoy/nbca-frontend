import { Users, ClipboardCheck, BarChart3, ShieldCheck } from "lucide-react";

const trustItems = [
  { icon: Users, title: "Expert Faculty", desc: "Learn from dedicated, experienced teachers focused entirely on deep conceptual understanding." },
  { icon: ClipboardCheck, title: "Consistent Testing", desc: "Regular assignments and timed tests help students and parents track learning consistently." },
  { icon: BarChart3, title: "Analytics & Tracking", desc: "Monitor attendance, test scores, and overall academic progress through a modern dashboard." },
  { icon: ShieldCheck, title: "Safe Environment", desc: "A highly structured, distraction-free online learning experience built for student success." },
];

export default function WhyChooseNBCA() {
  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-black text-slate-900 md:text-4xl tracking-tight">Why Choose Us</h2>
          <p className="mt-4 text-lg text-slate-500">
            Built from the ground up to support students with structured learning, constant monitoring, and robust academic guidance.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="rounded-3xl border border-slate-200 bg-white p-8 transition-all hover:shadow-lg hover:-translate-y-1 hover:border-blue-200 group">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}