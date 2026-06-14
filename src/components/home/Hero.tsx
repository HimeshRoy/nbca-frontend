import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-linear-to-b from-blue-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-24 md:py-36">
        <div className="text-center">
          <span className="inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
  CBSE • ICSE • WBBSE
</span>

<h1 className="mt-6 text-4xl font-bold text-gray-900 md:text-6xl">
  Online Coaching For
  <span className="block text-blue-700">
    English, Mathematics & Science
  </span>
</h1>

<p className="mx-auto mt-6 max-w-3xl text-lg text-gray-600">
  Learn from experienced teachers through live classes,
  study materials, assignments, online tests and
  performance tracking.
</p>

<div className="mt-8 flex flex-wrap justify-center gap-3">

  <div className="rounded-full bg-white px-5 text-blue-600 py-3 shadow">
    📹 Live Classes
  </div>

  <div className="rounded-full bg-white px-5 text-blue-600 py-3 shadow">
    📚 Study Materials
  </div>

  <div className="rounded-full bg-white px-5 py-3 text-blue-600 shadow">
    📝 Assignments
  </div>

  <div className="rounded-full bg-white px-5 py-3 text-blue-600 shadow">
    📊 Progress Reports
  </div>

</div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="rounded-xl bg-blue-700 px-8 py-4 font-semibold text-white hover:bg-blue-800 transition"
            >
              Enroll Now
            </Link>

            <Link
              href="/courses"
              className="rounded-xl border border-gray-300 px-8 py-4 font-semibold text-gray-700 hover:bg-gray-100 transition"
            >
              Explore Courses
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
