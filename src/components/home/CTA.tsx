import Link from "next/link";

export default function CTA() {
  return (
    <section className="bg-blue-700 py-20">
      <div className="mx-auto max-w-4xl px-4 text-center">

        <h2 className="text-3xl font-bold text-white md:text-5xl">
          Start Your Learning Journey Today
        </h2>

        <p className="mt-6 text-lg text-blue-100">
          Join NBCA and learn English, Mathematics and Science
          through structured lessons, assignments and live classes.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">

          <Link
            href="/register"
            className="rounded-xl bg-white px-6 py-3 font-semibold text-blue-700"
          >
            Enroll Now
          </Link>

          <Link
            href="/contact"
            className="rounded-xl border border-white px-6 py-3 font-semibold text-white"
          >
            Contact Us
          </Link>

        </div>

      </div>
    </section>
  );
}